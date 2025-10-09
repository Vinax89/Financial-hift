/**
 * Type definitions for Virtual Scroll utilities
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Scroll data from react-window
 */
export interface ScrollData {
  scrollDirection: 'forward' | 'backward';
  scrollOffset: number;
  scrollUpdateWasRequested: boolean;
}

/**
 * Scroll restoration hook return type
 */
export interface UseScrollRestorationReturn {
  listRef: React.RefObject<any>;
  scrollOffset: number;
  handleScroll: (data: ScrollData) => void;
  clearScrollPosition: () => void;
}

/**
 * Props for VirtualList component
 */
export interface VirtualListProps<T = any> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight?: number;
  height?: number;
  listId?: string;
  overscanCount?: number;
  onScroll?: (data: ScrollData) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Props for AutoSizedVirtualList component
 */
export interface AutoSizedVirtualListProps<T = any> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight?: number;
  listId?: string;
  overscanCount?: number;
  minHeight?: number;
  onScroll?: (data: ScrollData) => void;
  className?: string;
}

/**
 * Props for VariableVirtualList component
 */
export interface VariableVirtualListProps<T = any> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemSize: (item: T, index: number) => number;
  listId?: string;
  height?: number;
  overscanCount?: number;
  estimatedItemSize?: number;
  onScroll?: (data: ScrollData) => void;
  className?: string;
}

/**
 * Props for VirtualTable component
 */
export interface VirtualTableProps<T = any> {
  items: T[];
  renderRow: (item: T, index: number) => ReactNode;
  renderHeader?: () => ReactNode;
  rowHeight?: number;
  headerHeight?: number;
  listId?: string;
  overscanCount?: number;
  className?: string;
}

/**
 * Virtual list performance metrics
 */
export interface VirtualListMetrics {
  itemCount: number;
  totalHeight: number;
  memoryWithoutVirtualization: number;
  memoryWithVirtualization: number;
  memorySavings: number;
  savingsPercentage: string;
  recommendVirtualization: boolean;
}

/**
 * Near bottom detection hook return type
 */
export interface UseNearBottomReturn {
  isNearBottom: boolean;
  handleScroll: (data: ScrollData) => void;
}

/**
 * Row render props from react-window
 */
export interface RowRenderProps {
  index: number;
  style: CSSProperties;
}

/**
 * AutoSizer render props
 */
export interface AutoSizerRenderProps {
  height: number;
  width: number;
}
