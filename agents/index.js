const listeners = new Map();
const conversations = new Map();

const generateId = () => `conv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const cloneConversation = (conversation) => JSON.parse(JSON.stringify(conversation));

const ensureConversation = (conversation) => {
  if (!conversation || !conversation.id) {
    throw new Error('Conversation not found');
  }
  if (!conversations.has(conversation.id)) {
    conversations.set(conversation.id, cloneConversation(conversation));
  }
  return conversations.get(conversation.id);
};

const resolveConversation = async (conversationOrId) => {
  const maybePromise = await Promise.resolve(conversationOrId);
  if (!maybePromise) {
    return null;
  }
  if (typeof maybePromise === 'string') {
    return conversations.get(maybePromise) || null;
  }
  return ensureConversation(maybePromise);
};

const notifyListeners = (conversation) => {
  const callbacks = listeners.get(conversation.id);
  if (!callbacks) {
    return;
  }
  const snapshot = cloneConversation(conversation);
  callbacks.forEach((callback) => {
    try {
      callback(snapshot);
    } catch (error) {
      console.error('agentSDK listener error', error);
    }
  });
};

const generateAssistantReply = (conversation, lastUserMessage) => {
  const prompt = lastUserMessage?.content || '';

  if (!prompt.trim()) {
    return 'I received your message. How can I help you explore your finances today?';
  }

  if (/budget/i.test(prompt)) {
    return 'Consider setting aside categories for essentials, savings, and goals. I can help you break them down further.';
  }

  if (/debt|loan|credit/i.test(prompt)) {
    return 'Let\'s review your debts and prioritize high-interest balances first. I can outline a payoff strategy if you\'d like.';
  }

  if (/invest|retire|growth/i.test(prompt)) {
    return 'Diversifying across tax-advantaged accounts and recurring contributions can accelerate progress. Want a tailored plan?';
  }

  return `Thanks for the insight! I\'ll analyze: "${prompt.slice(0, 160)}" and follow up with actionable suggestions.`;
};

const agentSDK = {
  async createConversation({ agent_name, metadata = {} } = {}) {
    const id = generateId();
    const now = new Date().toISOString();
    const conversation = {
      id,
      agent_name: agent_name || 'financial_advisor',
      metadata: {
        ...metadata,
        created_at: metadata.created_at || now,
      },
      created_at: now,
      updated_at: now,
      messages: [],
    };

    conversations.set(id, cloneConversation(conversation));
    notifyListeners(conversation);
    return cloneConversation(conversation);
  },

  async listConversations({ agent_name } = {}) {
    const results = Array.from(conversations.values())
      .filter((conversation) => {
        if (!agent_name) return true;
        return conversation.agent_name === agent_name;
      })
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      .map((conversation) => cloneConversation(conversation));

    return results;
  },

  async addMessage(conversationOrId, message) {
    const conversation = await resolveConversation(conversationOrId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const now = new Date().toISOString();
    const normalizedMessage = {
      id: message.id || generateMessageId(),
      role: message.role || 'user',
      content: message.content || '',
      created_at: now,
      tool_calls: message.tool_calls,
      metadata: message.metadata,
    };

    // Read latest state from Map to avoid race
    const latest = conversations.get(conversation.id);
    const updated = {
      ...latest,
      messages: [...(latest.messages || []), normalizedMessage],
      updated_at: now,
    };
    conversations.set(conversation.id, cloneConversation(updated));
    notifyListeners(updated);

    if (normalizedMessage.role === 'user') {
      const assistantMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: generateAssistantReply(updated, normalizedMessage),
        created_at: new Date().toISOString(),
      };

      // Read latest state again
      const latest2 = conversations.get(updated.id);
      const updated2 = {
        ...latest2,
        messages: [...latest2.messages, assistantMessage],
        updated_at: new Date().toISOString(),
      };
      conversations.set(updated2.id, cloneConversation(updated2));
      notifyListeners(updated2);
    }

    return cloneConversation(conversations.get(conversation.id));
  },

  subscribeToConversation(conversationId, callback) {
    if (!listeners.has(conversationId)) {
      listeners.set(conversationId, new Set());
    }

    const callbacks = listeners.get(conversationId);
    callbacks.add(callback);

    const currentConversation = conversations.get(conversationId);
    if (currentConversation) {
      callback(cloneConversation(currentConversation));
    }

    return () => {
      const current = listeners.get(conversationId);
      if (!current) return;
      current.delete(callback);
      if (current.size === 0) {
        listeners.delete(conversationId);
      }
    };
  },
};

export { agentSDK };
export default agentSDK;
