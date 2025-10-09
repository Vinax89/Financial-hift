/**
 * @fileoverview Enhanced virtual scrolling utilities with scroll restoration
 * @description Provides optimized virtual list components for large datasets
 * with automatic scroll position restoration and performance optimizations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

/**
 * Scroll position storage key generator
 * @param {string} listId - Unique identifier for the list
 * @returns {string} Storage key
 */
const getScrollKey = (listId) => `scroll-position-${listId}`;

/**
 * Hook for managing scroll position restoration
 * @param {string} listId - Unique identifier for the list
 * @returns {Object} Scroll management functions
 */
export function useScrollRestoration(listId) {
  const listRef = useRef(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const saveTimeoutRef = useRef(null);

  // Load saved scroll position on mount
  useEffect(() => {
    if (!listId) return;
    
    const savedScroll = sessionStorage.getItem(getScrollKey(listId));
    if (savedScroll && listRef.current) {
      const offset = parseInt(savedScroll, 10);
      if (!isNaN(offset)) {
        // Delay restoration to ensure list is fully rendered
        setTimeout(() => {
          listRef.current?.scrollTo(offset);
        }, 100);
      }
    }
  }, [listId]);

  // Save scroll position on change
  const handleScroll = useCallback(({ scrollOffset }) => {
    setScrollOffset(scrollOffset);
    
    // Debounce saving to sessionStorage
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (listId) {
        sessionStorage.setItem(getScrollKey(listId), scrollOffset.toString());
      }
    }, 300);
  }, [listId]);

  // Clear saved position
  const clearScrollPosition = useCallback(() => {
    if (listId) {
      sessionStorage.removeItem(getScrollKey(listId));
    }
  }, [listId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    listRef,
    scrollOffset,
    handleScroll,
    clearScrollPosition,
  };
}

/**
 * Enhanced virtual list with scroll restoration
 * @param {Object} props - Component props
 * @param {Array} props.items - List items to render
 * @param {Function} props.renderItem - Render function for each item
 * @param {number} [props.itemHeight=60] - Height of each item in pixels
 * @param {number} [props.height=400] - List container height
 * @param {string} [props.listId] - Unique ID for scroll restoration
 * @param {number} [props.overscanCount=5] - Number of items to render outside visible area
 * @param {Function} [props.onScroll] - Custom scroll handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @returns {JSX.Element} Virtual list component
 */
export function VirtualList({
  items = [],
  renderItem,
  itemHeight = 60,
  height = 400,
  listId,
  overscanCount = 5,
  onScroll,
  className = '',
  style = {},
}) {
  const { listRef, handleScroll } = useScrollRestoration(listId);

  const Row = useCallback(
    ({ index, style }) => {
      const item = items[index];
      return <div style={style}>{renderItem(item, index)}</div>;
    },
    [items, renderItem]
  );

  const combinedScrollHandler = useCallback(
    (scrollData) => {
      handleScroll(scrollData);
      onScroll?.(scrollData);
    },
    [handleScroll, onScroll]
  );

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <List
      ref={listRef}
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      overscanCount={overscanCount}
      onScroll={combinedScrollHandler}
      className={className}
      style={style}
    >
      {Row}
    </List>
  );
}

/**
 * Auto-sized virtual list that fills available space
 * @param {Object} props - Component props
 * @param {Array} props.items - List items to render
 * @param {Function} props.renderItem - Render function for each item
 * @param {number} [props.itemHeight=60] - Height of each item in pixels
 * @param {string} [props.listId] - Unique ID for scroll restoration
 * @param {number} [props.overscanCount=5] - Number of items to render outside visible area
 * @param {number} [props.minHeight=300] - Minimum height in pixels
 * @param {Function} [props.onScroll] - Custom scroll handler
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Auto-sized virtual list
 */
export function AutoSizedVirtualList({
  items = [],
  renderItem,
  itemHeight = 60,
  listId,
  overscanCount = 5,
  minHeight = 300,
  onScroll,
  className = '',
}) {
  const { listRef, handleScroll } = useScrollRestoration(listId);

  const Row = useCallback(
    ({ index, style }) => {
      const item = items[index];
      return <div style={style}>{renderItem(item, index)}</div>;
    },
    [items, renderItem]
  );

  const combinedScrollHandler = useCallback(
    (scrollData) => {
      handleScroll(scrollData);
      onScroll?.(scrollData);
    },
    [handleScroll, onScroll]
  );

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div style={{ height: '100%', minHeight: `${minHeight}px` }} className={className}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
            overscanCount={overscanCount}
            onScroll={combinedScrollHandler}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

/**
 * Variable-sized virtual list for items with different heights
 * @param {Object} props - Component props
 * @param {Array} props.items - List items to render
 * @param {Function} props.renderItem - Render function for each item
 * @param {Function} props.getItemSize - Function to get size of each item
 * @param {string} [props.listId] - Unique ID for scroll restoration
 * @param {number} [props.height=400] - List container height
 * @param {number} [props.overscanCount=3] - Number of items to render outside visible area
 * @param {number} [props.estimatedItemSize=60] - Estimated item size for initial render
 * @param {Function} [props.onScroll] - Custom scroll handler
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Variable-sized virtual list
 */
export function VariableVirtualList({
  items = [],
  renderItem,
  getItemSize,
  listId,
  height = 400,
  overscanCount = 3,
  estimatedItemSize = 60,
  onScroll,
  className = '',
}) {
  const { listRef, handleScroll } = useScrollRestoration(listId);
  const sizeMapRef = useRef({});

  const Row = useCallback(
    ({ index, style }) => {
      const item = items[index];
      return <div style={style}>{renderItem(item, index)}</div>;
    },
    [items, renderItem]
  );

  const getSize = useCallback(
    (index) => {
      // Cache size calculations
      if (sizeMapRef.current[index] !== undefined) {
        return sizeMapRef.current[index];
      }
      
      const size = getItemSize(items[index], index);
      sizeMapRef.current[index] = size;
      return size;
    },
    [items, getItemSize]
  );

  const combinedScrollHandler = useCallback(
    (scrollData) => {
      handleScroll(scrollData);
      onScroll?.(scrollData);
    },
    [handleScroll, onScroll]
  );

  // Clear size cache when items change
  useEffect(() => {
    sizeMapRef.current = {};
  }, [items]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <VariableSizeList
      ref={listRef}
      height={height}
      width="100%"
      itemCount={items.length}
      itemSize={getSize}
      overscanCount={overscanCount}
      estimatedItemSize={estimatedItemSize}
      onScroll={combinedScrollHandler}
      className={className}
    >
      {Row}
    </VariableSizeList>
  );
}

/**
 * Virtual table component for tabular data
 * @param {Object} props - Component props
 * @param {Array} props.items - Table rows data
 * @param {Function} props.renderRow - Render function for each row
 * @param {Function} props.renderHeader - Render function for table header
 * @param {number} [props.rowHeight=60] - Height of each row in pixels
 * @param {number} [props.headerHeight=48] - Height of header in pixels
 * @param {string} [props.listId] - Unique ID for scroll restoration
 * @param {number} [props.overscanCount=5] - Number of rows to render outside visible area
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Virtual table component
 */
export function VirtualTable({
  items = [],
  renderRow,
  renderHeader,
  rowHeight = 60,
  headerHeight = 48,
  listId,
  overscanCount = 5,
  className = '',
}) {
  const { listRef, handleScroll } = useScrollRestoration(listId);

  const Row = useCallback(
    ({ index, style }) => {
      const item = items[index];
      return <div style={style}>{renderRow(item, index)}</div>;
    },
    [items, renderRow]
  );

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`virtual-table ${className}`}>
      {/* Fixed header */}
      {renderHeader && (
        <div
          className="virtual-table-header"
          style={{
            height: `${headerHeight}px`,
            overflow: 'hidden',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          {renderHeader()}
        </div>
      )}

      {/* Scrollable body */}
      <div style={{ height: '100%', minHeight: '300px' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={listRef}
              height={height - (renderHeader ? headerHeight : 0)}
              width={width}
              itemCount={items.length}
              itemSize={rowHeight}
              overscanCount={overscanCount}
              onScroll={handleScroll}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}

/**
 * Performance metrics for virtual list
 * @param {Array} items - List items
 * @param {number} itemHeight - Height of each item
 * @returns {Object} Performance metrics
 */
export function getVirtualListMetrics(items, itemHeight) {
  const itemCount = items?.length || 0;
  const totalHeight = itemCount * itemHeight;
  const memoryWithoutVirtualization = itemCount * 5000; // Approx 5KB per rendered item
  const memoryWithVirtualization = 50 * 5000; // Only ~50 items rendered at once
  const memorySavings = memoryWithoutVirtualization - memoryWithVirtualization;
  const savingsPercentage = itemCount > 0 
    ? ((memorySavings / memoryWithoutVirtualization) * 100).toFixed(1)
    : 0;

  return {
    itemCount,
    totalHeight,
    memoryWithoutVirtualization,
    memoryWithVirtualization,
    memorySavings,
    savingsPercentage,
    recommendVirtualization: itemCount > 100,
  };
}

/**
 * Hook to detect when user is near bottom of list
 * @param {number} [threshold=0.8] - Threshold percentage (0-1)
 * @returns {Object} Near bottom detection
 */
export function useNearBottom(threshold = 0.8) {
  const [isNearBottom, setIsNearBottom] = useState(false);

  const handleScroll = useCallback(
    ({ scrollOffset, scrollUpdateWasRequested }) => {
      if (scrollUpdateWasRequested) return; // Ignore programmatic scrolls
      
      const container = document.querySelector('[data-virtual-list]');
      if (!container) return;

      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollTop = scrollOffset;

      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      setIsNearBottom(scrollPercentage >= threshold);
    },
    [threshold]
  );

  return { isNearBottom, handleScroll };
}

export default {
  VirtualList,
  AutoSizedVirtualList,
  VariableVirtualList,
  VirtualTable,
  useScrollRestoration,
  getVirtualListMetrics,
  useNearBottom,
};
