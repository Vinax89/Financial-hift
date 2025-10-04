const STORAGE_KEY = "apex-finance:agent-conversations";
const emitter = typeof window !== "undefined" ? new EventTarget() : null;
const memoryStore = new Map();

function loadStore() {
  if (typeof window === "undefined") return memoryStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryStore;
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([id, convo]) => {
      memoryStore.set(id, convo);
    });
  } catch {
    // ignore corrupted storage
  }
  return memoryStore;
}

function persistStore() {
  if (typeof window === "undefined") return;
  const serializable = {};
  memoryStore.forEach((value, key) => {
    serializable[key] = value;
  });
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // ignore quota errors
  }
}

function getConversation(id) {
  return memoryStore.get(id);
}

function notify(id) {
  if (!emitter) return;
  const detail = getConversation(id);
  emitter.dispatchEvent(new CustomEvent(`conversation:${id}`, { detail }));
}

function simulateAssistantResponse(conversation, userMessage) {
  const content = userMessage.content || "";
  const preview = content.slice(0, 120) || "your request";
  const reply = {
    role: "assistant",
    content: `I noted ${preview}. I'll provide a follow-up plan shortly.`,
    created_at: new Date().toISOString(),
  };
  conversation.messages.push(reply);
  conversation.status = "idle";
}

export const agentSDK = {
  async listConversations({ agent_name } = {}) {
    loadStore();
    const items = Array.from(memoryStore.values());
    return agent_name ? items.filter((item) => item.agent_name === agent_name) : items;
  },

  async createConversation({ agent_name }) {
    loadStore();
    const id = `${agent_name || "agent"}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const conversation = {
      id,
      agent_name,
      created_at: new Date().toISOString(),
      status: "idle",
      messages: [
        {
          role: "assistant",
          content: `Hello! I'm ${agent_name?.replace(/_/g, " ") || "your assistant"}. How can I help today?`,
          created_at: new Date().toISOString(),
        },
      ],
    };
    memoryStore.set(id, conversation);
    persistStore();
    notify(id);
    return conversation;
  },

  async addMessage(conversationOrId, message) {
    loadStore();
    const id = typeof conversationOrId === "string" ? conversationOrId : conversationOrId.id;
    const conversation = getConversation(id);
    if (!conversation) throw new Error("Conversation not found");

    conversation.status = "running";
    conversation.messages.push({
      ...message,
      created_at: new Date().toISOString(),
    });
    notify(id);

    await new Promise((resolve) => setTimeout(resolve, 300));
    simulateAssistantResponse(conversation, message);
    persistStore();
    notify(id);
    return conversation;
  },

  subscribeToConversation(id, handler) {
    loadStore();
    if (!emitter) {
      handler(getConversation(id));
      return () => {};
    }
    const eventName = `conversation:${id}`;
    const listener = (event) => handler(event.detail);
    emitter.addEventListener(eventName, listener);
    const snapshot = getConversation(id);
    if (snapshot) handler(snapshot);
    return () => emitter.removeEventListener(eventName, listener);
  },
};

export default agentSDK;
