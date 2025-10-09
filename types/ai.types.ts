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

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO date string
  description?: string;
  category?: string;
}

export interface Shift {
  id: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  description?: string;
  payRate?: number;
}

export interface Bill {
  id: string;
  dueDate: string; // ISO date string
  amount: number;
  description?: string;
  isRecurring?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string; // ISO date string
  description?: string;
}

export interface FinancialContext {
  recent_transactions: Transaction[];
  active_shifts: Shift[];
  upcoming_bills: Bill[];
  active_goals: Goal[];
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
