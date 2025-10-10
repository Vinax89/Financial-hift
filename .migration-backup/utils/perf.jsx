export function perfEnabled() {
  try {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("apex-finance:perf-logs") === "true";
  } catch {
    return false;
  }
}

export function perfLog(label, ms) {
  if (!perfEnabled()) return;
  try {
    // eslint-disable-next-line no-console
    console.log(`[perf] ${label}: ${typeof ms === "number" ? ms.toFixed(1) : ms}ms`);
  } catch {
    // noop
  }
}
