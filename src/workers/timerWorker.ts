// Web Worker for drift-free background timer execution
// Web Workers run in an isolated thread unaffected by browser tab throttling or background sleep

let intervalId: ReturnType<typeof setInterval> | null = null;
let tickIntervalMs = 100; // 100ms precision ticks

self.onmessage = (event: MessageEvent) => {
  const { type, intervalMs } = event.data;

  switch (type) {
    case 'START':
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
      if (intervalMs && intervalMs > 0) {
        tickIntervalMs = intervalMs;
      }
      // Send initial tick immediately
      self.postMessage({ type: 'TICK', timestamp: performance.now() });

      intervalId = setInterval(() => {
        self.postMessage({ type: 'TICK', timestamp: performance.now() });
      }, tickIntervalMs);
      break;

    case 'PAUSE':
    case 'RESET':
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      break;

    case 'SET_INTERVAL':
      if (intervalMs && intervalMs > 0) {
        tickIntervalMs = intervalMs;
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = setInterval(() => {
            self.postMessage({ type: 'TICK', timestamp: performance.now() });
          }, tickIntervalMs);
        }
      }
      break;

    default:
      break;
  }
};

export {};

