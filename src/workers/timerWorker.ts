// Dedicated Web Worker for Drift-Free High-Accuracy Delta Timing
// Operates on a detached thread immune to browser tab throttling, UI freezes, and background sleep.

import { TimerWorkerMessage, TimerWorkerResponse } from '../types/timer';

let intervalId: ReturnType<typeof setInterval> | null = null;
let tickIntervalMs: number = 100; // 100ms precision ticks

let sessionStartPerf: number = 0;
let sessionStartDate: number = 0;
let accumulatedPausedMs: number = 0;
let isRunning: boolean = false;

function emitTick() {
  const perfNow = performance.now();
  const dateNow = Date.now();

  let workerElapsedMs = accumulatedPausedMs;
  if (isRunning && sessionStartPerf > 0) {
    const perfDelta = Math.max(0, perfNow - sessionStartPerf);
    const dateDelta = Math.max(0, dateNow - sessionStartDate);
    // Use maximum delta to account for system clock continuity & OS sleep recovery
    workerElapsedMs += Math.max(perfDelta, dateDelta);
  }

  const message: TimerWorkerResponse = {
    type: 'TICK',
    timestamp: perfNow,
    dateTimestamp: dateNow,
    workerElapsedMs: Math.round(workerElapsedMs),
  };

  self.postMessage(message);
}

function startTimer(intervalMs?: number, startPerf?: number, startDate?: number) {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (intervalMs && intervalMs > 0) {
    tickIntervalMs = intervalMs;
  }

  isRunning = true;
  sessionStartPerf = startPerf || performance.now();
  sessionStartDate = startDate || Date.now();

  // Send an immediate initial tick
  emitTick();

  // High-frequency tick loop unthrottled in Web Worker context
  intervalId = setInterval(() => {
    emitTick();
  }, tickIntervalMs);
}

function pauseTimer() {
  if (isRunning) {
    const perfNow = performance.now();
    const dateNow = Date.now();
    const perfDelta = Math.max(0, perfNow - sessionStartPerf);
    const dateDelta = Math.max(0, dateNow - sessionStartDate);
    accumulatedPausedMs += Math.max(perfDelta, dateDelta);
  }

  isRunning = false;
  sessionStartPerf = 0;
  sessionStartDate = 0;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Emit final paused tick to guarantee final synchronization
  emitTick();
}

function resetTimer() {
  isRunning = false;
  sessionStartPerf = 0;
  sessionStartDate = 0;
  accumulatedPausedMs = 0;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

self.onmessage = (event: MessageEvent<TimerWorkerMessage>) => {
  const { type, intervalMs, startTimePerf, startTimeDate } = event.data;

  switch (type) {
    case 'START':
      startTimer(intervalMs, startTimePerf, startTimeDate);
      break;

    case 'PAUSE':
      pauseTimer();
      break;

    case 'RESET':
      resetTimer();
      break;

    case 'SYNC':
      emitTick();
      break;

    case 'SET_INTERVAL':
      if (intervalMs && intervalMs > 0) {
        tickIntervalMs = intervalMs;
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = setInterval(() => {
            emitTick();
          }, tickIntervalMs);
        }
      }
      break;

    default:
      break;
  }
};

export {};
