import React, { useState, useEffect, useRef, useCallback } from 'react';

export function VirtualizedList({
  items,
  renderItem,
  itemHeight,
  containerHeight = '60vh'
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerRef.current?.clientHeight) / itemHeight)
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight, overflowY: 'auto' }}
      className="w-full"
    >
      <div
        style={{
          position: 'relative',
          height: `${items.length * itemHeight}px`,
        }}
      >
        {visibleItems.map((item, index) => (
          <div
            key={item.id || index}
            style={{
              position: 'absolute',
              top: `${(startIndex + index) * itemHeight}px`,
              width: '100%',
              height: `${itemHeight}px`,
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}