const conversations = new Map();
const subscribers = new Map();

function normalizeConversation(conversation) {
  if (!conversation) {
    return undefined;
  }
  if (typeof conversation === "string") {
    return conversations.get(conversation);
  }
  if (typeof conversation === "object" && conversation.id) {
    return conversations.get(conversation.id) ?? conversation;
  }
  return undefined;
}

function ensureConversation(conversation, fallbackAgent = "general") {
  const existing = normalizeConversation(conversation);
  if (existing) {
    return existing;
  }
  const id = `${fallbackAgent}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const convo = { id, agent_name: fallbackAgent, messages: [] };
  conversations.set(id, convo);
  subscribers.set(id, new Set());
  return convo;
}

export const agentSDK = {
  async createConversation({ agent_name = "general", metadata } = {}) {
    const id = `${agent_name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const conversation = { id, agent_name, metadata: metadata ?? {}, messages: [] };
    conversations.set(id, conversation);
    subscribers.set(id, new Set());
    return conversation;
  },
  async addMessage(conversationLike, message) {
    const base = ensureConversation(conversationLike, message?.agent_name ?? "general");
    const entry = {
      id: `${base.id}-${base.messages.length}-${Date.now()}`,
      role: message?.role ?? "user",
      content: message?.content ?? "",
      createdAt: new Date().toISOString()
    };
    base.messages.push(entry);
    const subs = subscribers.get(base.id);
    if (subs) {
      subs.forEach((callback) => {
        try {
          callback({ conversation: base, message: entry });
        } catch (error) {
          console.error("agentSDK subscriber error", error);
        }
      });
    }
    return entry;
  },
  async listConversations() {
    return Array.from(conversations.values());
  },
  subscribeToConversation(conversationId, callback) {
    const existing = subscribers.get(conversationId) ?? new Set();
    existing.add(callback);
    subscribers.set(conversationId, existing);
    return () => {
      const next = subscribers.get(conversationId);
      if (next) {
        next.delete(callback);
      }
    };
  }
};

export default agentSDK;
