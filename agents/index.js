const conversations = new Map();
const listeners = new Map();
let conversationCounter = 1;
let messageCounter = 1;

const AGENT_RESPONSES = {
  financial_orchestrator: {
    greeting: "I'm here to coordinate your financial strategy. Let's break the work into manageable steps.",
  },
  financial_advisor: {
    greeting: "Great to connect! I'll translate your questions into actionable financial insights.",
  },
  data_parser: {
    greeting: "Upload data whenever you're ready. I'll synthesize the key takeaways.",
  },
  error_corrector: {
    greeting: "I'll keep an eye on potential data anomalies or compliance risks.",
  },
};

function createMessage({ role, content, status }) {
  return {
    id: `msg-${messageCounter++}`,
    role,
    content,
    status,
    created_at: new Date().toISOString(),
  };
}

function notify(conversationId, status) {
  const conversation = conversations.get(conversationId);
  if (!conversation) return;
  const payload = {
    ...conversation,
    messages: [...conversation.messages],
    status: status || conversation.status || 'idle',
  };
  const subs = listeners.get(conversationId);
  if (!subs) return;
  subs.forEach((callback) => {
    try {
      callback(payload);
    } catch (error) {
      console.error('agentSDK subscriber error', error);
    }
  });
}

function simulateAssistantResponse(conversation, latestUserMessage) {
  const agent = conversation.agent_name;
  const hints = AGENT_RESPONSES[agent] || {};
  const intro = hints.greeting || "Thanks for the update. Here's what I'm thinking.";
  const summary = latestUserMessage?.content
    ? `You mentioned: "${latestUserMessage.content.slice(0, 140)}${
        latestUserMessage.content.length > 140 ? '…' : ''
      }"`
    : 'Let’s map out the next actionable step.';

  return createMessage({
    role: 'assistant',
    content: `${intro}\n\n${summary}\n\nI'll keep iterating on this as you share more context.`,
  });
}

export const agentSDK = {
  async listConversations({ agent_name } = {}) {
    return Array.from(conversations.values())
      .filter((conversation) => !agent_name || conversation.agent_name === agent_name)
      .map((conversation) => ({ ...conversation, messages: [...conversation.messages] }))
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
  },

  async createConversation({ agent_name, metadata } = {}) {
    const id = `conv-${conversationCounter++}`;
    const baseConversation = {
      id,
      agent_name: agent_name || 'financial_advisor',
      metadata: metadata || {},
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const agentInfo = AGENT_RESPONSES[baseConversation.agent_name];
    if (agentInfo?.greeting) {
      baseConversation.messages.push(
        createMessage({ role: 'assistant', content: agentInfo.greeting })
      );
    }

    conversations.set(id, baseConversation);
    notify(id, 'idle');
    return { ...baseConversation, messages: [...baseConversation.messages] };
  },

  async addMessage(conversationRef, message) {
    const existing = conversationRef?.id ? conversations.get(conversationRef.id) : null;
    if (!existing) {
      throw new Error('Conversation not found');
    }

    const userMessage = createMessage({ role: message.role || 'user', content: message.content });
    existing.messages.push(userMessage);
    existing.updated_at = new Date().toISOString();
    notify(existing.id, 'running');

    const assistantMessage = simulateAssistantResponse(existing, userMessage);
    existing.messages.push(assistantMessage);
    existing.updated_at = new Date().toISOString();

    notify(existing.id, 'completed');
    return { ...existing, messages: [...existing.messages] };
  },

  subscribeToConversation(conversationId, callback) {
    if (!listeners.has(conversationId)) {
      listeners.set(conversationId, new Set());
    }
    const subs = listeners.get(conversationId);
    subs.add(callback);

    const existing = conversations.get(conversationId);
    if (existing) {
      callback({ ...existing, messages: [...existing.messages], status: existing.status || 'idle' });
    }

    return () => {
      const set = listeners.get(conversationId);
      if (!set) return;
      set.delete(callback);
      if (set.size === 0) {
        listeners.delete(conversationId);
      }
    };
  },
};

export default agentSDK;
