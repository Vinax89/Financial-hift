import { nanoid } from "nanoid";

const store = {
  conversations: [],
};

const subscribers = new Map();

function emit(conversation) {
  const listeners = subscribers.get(conversation.id);
  if (!listeners) return;
  listeners.forEach((listener) => {
    try {
      listener(conversation);
    } catch (error) {
      console.error("agentSDK subscriber error", error);
    }
  });
}

export const agentSDK = {
  async listConversations({ agent_name } = {}) {
    if (!agent_name) return [...store.conversations];
    return store.conversations.filter((conversation) => conversation.agent_name === agent_name);
  },

  async createConversation({ agent_name, title } = {}) {
    const conversation = {
      id: nanoid(),
      agent_name: agent_name ?? "generalist",
      title: title ?? `Conversation ${store.conversations.length + 1}`,
      created_at: new Date().toISOString(),
      messages: [],
    };
    store.conversations = [conversation, ...store.conversations];
    emit(conversation);
    return conversation;
  },

  async addMessage(conversationOrId, message) {
    const id = typeof conversationOrId === "string" ? conversationOrId : conversationOrId?.id;
    if (!id) throw new Error("Conversation id is required");
    const conversation = store.conversations.find((item) => item.id === id);
    if (!conversation) throw new Error("Conversation not found");

    const payload = {
      id: nanoid(),
      role: message.role ?? "user",
      content: message.content ?? "",
      created_at: new Date().toISOString(),
      metadata: message.metadata ?? {},
    };
    conversation.messages = [...conversation.messages, payload];
    emit(conversation);
    return payload;
  },

  subscribeToConversation(conversationId, callback) {
    const listeners = subscribers.get(conversationId) ?? new Set();
    listeners.add(callback);
    subscribers.set(conversationId, listeners);

    return () => {
      const current = subscribers.get(conversationId);
      if (!current) return;
      current.delete(callback);
      if (current.size === 0) {
        subscribers.delete(conversationId);
      }
    };
  },
};

export default agentSDK;
