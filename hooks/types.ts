/**
 * @fileoverview Shared TypeScript types and interfaces for hooks
 * @description Centralized type definitions for better maintainability and consistency
 */

/**
 * Generic fetch state interface for async data loading
 */
export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Filter and sort state for data management
 */
export interface FilterSortState {
  filters: Record<string, any>;
  sorting: Record<string, "asc" | "desc">;
  search?: string;
}

/**
 * Modal/Dialog state interface
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  description?: string;
}

/**
 * Generic async operation state
 */
export interface AsyncOperationState {
  isLoading: boolean;
  error: Error | null;
  success: boolean;
  data?: any;
}

/**
 * Table state with all related data
 */
export interface TableState<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationState;
  filters: Record<string, any>;
  sorting: Record<string, "asc" | "desc">;
}

/**
 * Common callback type definitions
 */
export type ChangeHandler = (value: any) => void;
export type SubmitHandler = (data: any) => Promise<void> | void;
export type ErrorHandler = (error: Error) => void;
export type SuccessHandler = (data?: any) => void;
