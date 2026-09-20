/**
 * Realistic network latency simulator: 250ms - 700ms
 */
export async function simulateLatency(minMs: number = 250, maxMs: number = 700): Promise<void> {
  const duration = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, duration));
}
