import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AriaHelper } from '@/utils/accessibility';

/**
 * Enhanced Virtualized List Component
 * 
 * Features:
 * - Variable height items support
 * - Smooth scrolling with overscan
 * - Keyboard navigation
 * - Accessibility features
 * - Performance optimizations
 * - Loading states
 * - Empty states
 * - Sticky headers
 */
export function VirtualizedList({
  items,
  renderItem,
  itemHeight,
  containerHeight = '60vh',
  overscan = 3,
  onLoadMore = null,
  loading = false,
  emptyMessage = 'No items to display',
  stickyHeader = null,
  keyExtractor = (item, index) => item.id || index,
  estimatedItemHeight = null,
  enableKeyboardNavigation = true,
  className = '',
  role = 'list',
  ariaLabel = 'Scrollable list',
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const itemHeightsRef = useRef(new Map());
  const observerRef = useRef(null);

  // Calculate dynamic height if estimatedItemHeight is provided
  const getItemHeight = useCallback((index) => {
    if (estimatedItemHeight) {
      return itemHeightsRef.current.get(index) || estimatedItemHeight;
    }
    return itemHeight;
  }, [itemHeight, estimatedItemHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (!estimatedItemHeight) {
      return items.length * itemHeight;
    }
    
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += getItemHeight(i);
    }
    return height;
  }, [items.length, itemHeight, estimatedItemHeight, getItemHeight]);

  // Calculate visible range with overscan
  const getVisibleRange = useCallback(() => {
    if (!containerRef.current) return { startIndex: 0, endIndex: 0 };

    const containerHeight = containerRef.current.clientHeight;
    let currentHeight = 0;
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (currentHeight + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      currentHeight += height;
    }

    // Find end index
    currentHeight = 0;
    for (let i = startIndex; i < items.length; i++) {
      currentHeight += getItemHeight(i);
      if (currentHeight > scrollTop + containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { startIndex, endIndex };
  }, [scrollTop, items.length, overscan, getItemHeight]);

  const { startIndex, endIndex } = getVisibleRange();

  // Handle scroll with throttling
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);

    // Load more if near bottom
    if (onLoadMore && !loading) {
      const scrollHeight = e.currentTarget.scrollHeight;
      const clientHeight = e.currentTarget.clientHeight;
      const threshold = scrollHeight - clientHeight - 200;

      if (newScrollTop > threshold) {
        onLoadMore();
      }
    }
  }, [onLoadMore, loading]);

  // Calculate offset for each item
  const getItemOffset = useCallback((index) => {
    if (!estimatedItemHeight) {
      return index * itemHeight;
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  }, [itemHeight, estimatedItemHeight, getItemHeight]);

  // Measure item heights dynamically
  const measureItemHeight = useCallback((index, element) => {
    if (!element || !estimatedItemHeight) return;

    const height = element.getBoundingClientRect().height;
    if (itemHeightsRef.current.get(index) !== height) {
      itemHeightsRef.current.set(index, height);
    }
  }, [estimatedItemHeight]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!enableKeyboardNavigation) return;

    const maxIndex = items.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(maxIndex, prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(0, prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(maxIndex);
        break;
      case 'PageDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(maxIndex, prev + 10));
        break;
      case 'PageUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(0, prev - 10));
        break;
    }
  }, [enableKeyboardNavigation, items.length]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex === -1 || !containerRef.current) return;

    const offset = getItemOffset(focusedIndex);
    const itemHeight = getItemHeight(focusedIndex);
    const containerHeight = containerRef.current.clientHeight;

    if (offset < scrollTop) {
      containerRef.current.scrollTop = offset;
    } else if (offset + itemHeight > scrollTop + containerHeight) {
      containerRef.current.scrollTop = offset + itemHeight - containerHeight;
    }
  }, [focusedIndex, getItemOffset, getItemHeight, scrollTop]);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_slice = items.slice(startIndex, endIndex + 1);
    return items_slice.map((item, index) => {
      const actualIndex = startIndex + index;
      const offset = getItemOffset(actualIndex);
      const key = keyExtractor(item, actualIndex);

      return (
        <div
          key={key}
          ref={(el) => measureItemHeight(actualIndex, el)}
          style={{
            position: 'absolute',
            top: `${offset}px`,
            width: '100%',
            minHeight: `${getItemHeight(actualIndex)}px`,
          }}
          role="listitem"
          aria-setsize={items.length}
          aria-posinset={actualIndex + 1}
          tabIndex={enableKeyboardNavigation ? 0 : -1}
          onFocus={() => setFocusedIndex(actualIndex)}
          className={focusedIndex === actualIndex ? 'ring-2 ring-primary' : ''}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [
    items,
    startIndex,
    endIndex,
    getItemOffset,
    getItemHeight,
    keyExtractor,
    renderItem,
    measureItemHeight,
    focusedIndex,
    enableKeyboardNavigation,
  ]);

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <div
        style={{ height: containerHeight }}
        className={`flex items-center justify-center ${className}`}
      >
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      style={{ height: containerHeight, overflowY: 'auto' }}
      className={`w-full relative ${className}`}
      role={role}
      aria-label={ariaLabel}
      tabIndex={enableKeyboardNavigation ? 0 : -1}
    >
      {/* Sticky header */}
      {stickyHeader && (
        <div className="sticky top-0 z-10 bg-background">
          {stickyHeader}
        </div>
      )}

      {/* Virtual scroll content */}
      <div
        style={{
          position: 'relative',
          height: `${totalHeight}px`,
        }}
      >
        {visibleItems}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Grid virtualization component
 */
export function VirtualizedGrid({
  items,
  renderItem,
  itemHeight,
  itemWidth,
  columns = 'auto',
  gap = 16,
  containerHeight = '60vh',
  overscan = 2,
  loading = false,
  emptyMessage = 'No items to display',
  className = '',
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate columns
  const columnCount = useMemo(() => {
    if (typeof columns === 'number') return columns;
    if (!containerRef.current) return 1;

    const containerWidth = containerRef.current.clientWidth;
    return Math.floor((containerWidth + gap) / (itemWidth + gap));
  }, [columns, itemWidth, gap]);

  // Calculate row count
  const rowCount = Math.ceil(items.length / columnCount);

  // Calculate visible range
  const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
  const endRow = Math.min(
    rowCount - 1,
    Math.floor((scrollTop + (containerRef.current?.clientHeight || 0)) / (itemHeight + gap)) + overscan
  );

  // Get visible items
  const visibleItems = useMemo(() => {
    const result = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columnCount; col++) {
        const index = row * columnCount + col;
        if (index >= items.length) break;
        result.push({
          item: items[index],
          row,
          col,
          index,
        });
      }
    }
    return result;
  }, [startRow, endRow, columnCount, items]);

  if (items.length === 0 && !loading) {
    return (
      <div
        style={{ height: containerHeight }}
        className={`flex items-center justify-center ${className}`}
      >
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight, overflowY: 'auto' }}
      className={`w-full ${className}`}
      role="grid"
    >
      <div
        style={{
          position: 'relative',
          height: `${rowCount * (itemHeight + gap)}px`,
        }}
      >
        {visibleItems.map(({ item, row, col, index }) => (
          <div
            key={item.id || index}
            style={{
              position: 'absolute',
              top: `${row * (itemHeight + gap)}px`,
              left: `${col * (itemWidth + gap)}px`,
              width: `${itemWidth}px`,
              height: `${itemHeight}px`,
            }}
            role="gridcell"
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

export default VirtualizedList;
