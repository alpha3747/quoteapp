import { config } from '../constants/config';

/** fetch() with a timeout and JSON parsing; throws on non-2xx responses. */
export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = config.requestTimeoutMs,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
