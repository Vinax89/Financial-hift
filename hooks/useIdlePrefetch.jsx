import { useEffect } from "react";

function runWhenIdle(fn) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(fn, { timeout: 3000 });
  }
  return window.setTimeout(fn, 1500);
}

export function useIdlePrefetch(importFns = [], deps = []) {
  useEffect(() => {
    if (!Array.isArray(importFns) || importFns.length === 0) return;

    const timeouts = [];
    const schedule = () => {
      importFns.forEach((imp, idx) => {
        if (typeof imp === "function") {
          const h = setTimeout(() => {
            try { imp(); } catch { /* ignore */ }
          }, 120 * idx);
          timeouts.push(h);
        }
      });
    };

    const idleHandle = runWhenIdle(schedule);

    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        try { window.cancelIdleCallback(idleHandle); } catch { /* ignore */ }
      } else {
        clearTimeout(idleHandle);
      }
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}