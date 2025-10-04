const conversations = new Map()
const subscribers = new Map()

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function getConversationById(id) {
  if (!conversations.has(id)) {
    conversations.set(id, { id, agent_name: 'general', messages: [] })
  }
  return conversations.get(id)
}

function notify(conversation) {
  const listeners = subscribers.get(conversation.id)
  if (!listeners) return
  for (const listener of listeners) {
    try {
      listener(conversation)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('agentSDK subscriber error', error)
    }
  }
}

function synthesizeReply(message, agentName) {
  const trimmed = (message?.content || '').slice(0, 280)
  return [
    `Agent ${agentName || 'assistant'} received: "${trimmed}"`,
    'This is a demo response that mimics an AI assistant.',
    'Connect a real backend integration to replace this placeholder.',
  ].join('\n\n')
}

export const agentSDK = {
  async createConversation(options = {}) {
    const conversation = {
      id: generateId('conv'),
      agent_name: options.agent_name || 'generalist',
      title: options.title || 'New conversation',
      createdAt: new Date().toISOString(),
      messages: [],
    }
    conversations.set(conversation.id, conversation)
    notify(conversation)
    return conversation
  },

  async addMessage(conversationOrId, message = {}) {
    const id = typeof conversationOrId === 'string' ? conversationOrId : conversationOrId?.id
    if (!id) throw new Error('Conversation id is required')
    const conversation = getConversationById(id)

    if (message.role && !conversation.agent_name && message.agent_name) {
      conversation.agent_name = message.agent_name
    }

    const entry = {
      id: generateId('msg'),
      role: message.role || 'user',
      content: message.content || '',
      createdAt: new Date().toISOString(),
      metadata: message.metadata || null,
    }
    conversation.messages.push(entry)

    if (entry.role === 'user') {
      conversation.messages.push({
        id: generateId('msg'),
        role: 'assistant',
        content: synthesizeReply(entry, conversation.agent_name),
        createdAt: new Date().toISOString(),
      })
    }

    notify(conversation)
    return conversation
  },

  async listConversations(filter = {}) {
    const values = Array.from(conversations.values())
    if (filter.agent_name) {
      return values.filter((conv) => conv.agent_name === filter.agent_name)
    }
    return values
  },

  subscribeToConversation(conversationOrId, callback) {
    const id = typeof conversationOrId === 'string' ? conversationOrId : conversationOrId?.id
    if (!id || typeof callback !== 'function') {
      return () => {}
    }
    if (!subscribers.has(id)) {
      subscribers.set(id, new Set())
    }
    const set = subscribers.get(id)
    set.add(callback)

    const conversation = conversations.get(id)
    if (conversation) {
      callback(conversation)
    }

    return () => {
      const listeners = subscribers.get(id)
      if (!listeners) return
      listeners.delete(callback)
      if (!listeners.size) {
        subscribers.delete(id)
      }
    }
  },
}

export default agentSDK
