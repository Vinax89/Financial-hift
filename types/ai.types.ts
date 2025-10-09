/**
 * Type definitions for AI Assistant components
 */

/**
 * Message role types
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: string;
}

/**
 * Financial context for AI advisor
 */
export interface FinancialContext {
  recent_transactions: any[];
  active_shifts: any[];
  upcoming_bills: any[];
  active_goals: any[];
}

/**
 * Agent task status
 */
export type AgentTaskStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Agent task interface matching backend schema
 */
export interface AgentTaskData {
  id?: number;
  agent_name: string;
  task_input: string;
  status: AgentTaskStatus;
  result_summary?: string;
  completed_at?: string;
  created_at?: string;
}

/**
 * Available agent types
 */
export type AgentType = 
  | 'financial_orchestrator'
  | 'data_analyst' 
  | 'budget_advisor'
  | 'bill_tracker'
  | 'savings_coach';
