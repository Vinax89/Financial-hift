const subscribers = new Map();
const conversations = new Map();
let counter = 1;

const cloneConversation = (conversation) => ({
    ...conversation,
    messages: [...conversation.messages]
});

const notify = (conversation) => {
    const subs = subscribers.get(conversation.id);
    if (!subs) return;
    const snapshot = cloneConversation(conversation);
    subs.forEach((callback) => {
        try {
            callback(snapshot);
        } catch (error) {
            console.error('agentSDK subscriber error', error);
        }
    });
};

const createAssistantReply = (message, agentName) => {
    const prompt = message?.content || '';
    const preface = agentName ? `${agentName.replace(/_/g, ' ')} agent` : 'Assistant';
    if (!prompt) {
        return `${preface} is ready to help. Ask a question to get started.`;
    }
    if (/save|budget|spend/i.test(prompt)) {
        return `${preface} recommends reviewing discretionary expenses and setting aside 10% for savings.`;
    }
    if (/forecast|income|revenue/i.test(prompt)) {
        return `${preface} projects steady growth assuming your historical average continues.`;
    }
    return `${preface} heard: "${prompt}". Here's a summarized response to keep momentum going.`;
};

export const agentSDK = {
    async listConversations({ agent_name } = {}) {
        const all = Array.from(conversations.values());
        return all
            .filter((conversation) => !agent_name || conversation.agent_name === agent_name)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map(cloneConversation);
    },

    async createConversation({ agent_name, metadata } = {}) {
        const id = `conv-${Date.now()}-${counter++}`;
        const conversation = {
            id,
            agent_name: agent_name || 'assistant',
            status: 'ready',
            created_at: new Date().toISOString(),
            metadata: metadata || {},
            messages: []
        };
        conversations.set(id, conversation);
        notify(conversation);
        return cloneConversation(conversation);
    },

    async addMessage(conversationLike, message) {
        const id = typeof conversationLike === 'string' ? conversationLike : conversationLike?.id;
        if (!id || !conversations.has(id)) {
            throw new Error('Conversation not found');
        }
        const conversation = conversations.get(id);
        const entry = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            created_at: new Date().toISOString()
        };
        conversation.messages = [...conversation.messages, entry];
        conversation.status = 'running';
        notify(conversation);

        const replyContent = createAssistantReply(message, conversation.agent_name);

        await new Promise((resolve) => {
            setTimeout(() => {
                const assistantMessage = {
                    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    role: 'assistant',
                    content: replyContent,
                    created_at: new Date().toISOString()
                };
                conversation.messages = [...conversation.messages, assistantMessage];
                conversation.status = 'completed';
                notify(conversation);
                resolve();
            }, 400);
        });

        return cloneConversation(conversation);
    },

    subscribeToConversation(conversationId, callback) {
        if (!subscribers.has(conversationId)) {
            subscribers.set(conversationId, new Set());
        }
        const subs = subscribers.get(conversationId);
        subs.add(callback);
        if (conversations.has(conversationId)) {
            callback(cloneConversation(conversations.get(conversationId)));
        }
        return () => {
            const set = subscribers.get(conversationId);
            if (!set) return;
            set.delete(callback);
            if (set.size === 0) {
                subscribers.delete(conversationId);
            }
        };
    }
};

export default agentSDK;
