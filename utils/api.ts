export async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function retryWithBackoff(fn, options = {}) {
  const {
    retries = 3,
    baseDelay = 300,
    factor = 2,
    jitter = true,
    isRetryable = () => true,
  } = options;

  let attempt = 0;
  let delay = baseDelay;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt > retries || !isRetryable(err)) {
        throw err;
      }
      const jitterAmount = jitter ? Math.random() * 100 : 0;
      await sleep(delay + jitterAmount);
      delay *= factor;
    }
  }
}