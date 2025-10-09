export async function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

interface RetryOptions {
  retries?: number;
  baseDelay?: number;
  factor?: number;
  jitter?: boolean;
  isRetryable?: (error: any) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  options: RetryOptions = {}
): Promise<T> {
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
