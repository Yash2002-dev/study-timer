import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, TimerConfig, TimerEngine, TimerWorkerResponse } from '../types/timer';
import { playCompletionChime } from '../audio/chime';
import { formatTime } from '../utils/formatTime';

const DEFAULT_CONFIG: TimerConfig = {
  pomodoro: 25 * 60,   // 25 minutes
  shortBreak: 5 * 60,  // 5 minutes
  longBreak: 15 * 60,  // 15 minutes
  custom: 45 * 60,     // 45 minutes
};

interface UseTimerEngineProps {
  initialMode?: TimerMode;
  initialConfig?: Partial<TimerConfig>;
  onSessionComplete?: (mode: TimerMode, durationSeconds: number) => void;
  enableChime?: boolean;
}

export function useTimerEngine({
  initialMode = 'pomodoro',
  initialConfig = {},
  onSessionComplete,
  enableChime = true,
}: UseTimerEngineProps = {}): TimerEngine {
  const [config, setConfig] = useState<TimerConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const [mode, setModeState] = useState<TimerMode>(initialMode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [extensionSeconds, setExtensionSeconds] = useState<number>(0);

  // High-accuracy delta timestamp anchors (guarantees zero drift across background tab sleep)
  const workerRef = useRef<Worker | null>(null);
  const fallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartPerfRef = useRef<number>(0);
  const sessionStartDateRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);

  const isRunningRef = useRef<boolean>(false);
  const modeRef = useRef<TimerMode>(initialMode);
  const configRef = useRef<TimerConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const extensionSecondsRef = useRef<number>(0);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const enableChimeRef = useRef(enableChime);

  // Synchronize mutable refs on every render
  isRunningRef.current = isRunning;
  modeRef.current = mode;
  configRef.current = config;
  extensionSecondsRef.current = extensionSeconds;
  onSessionCompleteRef.current = onSessionComplete;
  enableChimeRef.current = enableChime;

  const getBaseDuration = useCallback((targetMode: TimerMode, targetConfig: TimerConfig): number => {
    switch (targetMode) {
      case 'pomodoro':
        return targetConfig.pomodoro;
      case 'shortBreak':
        return targetConfig.shortBreak;
      case 'longBreak':
        return targetConfig.longBreak;
      case 'custom':
        return targetConfig.custom;
      case 'flowmodoro':
        return 0;
    }
  }, []);

  const totalDuration = getBaseDuration(mode, config) + extensionSeconds;

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (initialMode === 'flowmodoro') return 0;
    return (config[initialMode as keyof TimerConfig] || DEFAULT_CONFIG.pomodoro);
  });

  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Keep document title updated with live status
  useEffect(() => {
    const formatted = formatTime(timeLeft);
    const modeLabel =
      mode === 'pomodoro'
        ? 'Focus'
        : mode === 'shortBreak'
        ? 'Short Break'
        : mode === 'longBreak'
        ? 'Long Break'
        : mode === 'flowmodoro'
        ? 'Flow'
        : 'Custom';
    const stateSymbol = isRunning ? '▶' : '⏸';
    document.title = `${stateSymbol} ${formatted} • ${modeLabel} | Masterpiece Study Timer`;
  }, [timeLeft, mode, isRunning]);

  /**
   * Core High-Accuracy Delta Processor
   * Calculates true elapsed time using dual monotonic performance.now() and Date.now() anchors.
   * Completely immune to timer throttling or background suspension.
   */
  const processTick = useCallback((perfNow: number, dateNow: number = Date.now()) => {
    if (!isRunningRef.current) return;

    if (sessionStartPerfRef.current === 0) {
      sessionStartPerfRef.current = perfNow;
      sessionStartDateRef.current = dateNow;
      return;
    }

    // High-precision delta calculation: combines monotonic performance.now() and epoch Date.now()
    const perfDelta = Math.max(0, perfNow - sessionStartPerfRef.current);
    const dateDelta = Math.max(0, dateNow - sessionStartDateRef.current);
    const currentSegmentDeltaMs = Math.max(perfDelta, dateDelta);

    const totalElapsedMs = accumulatedMsRef.current + currentSegmentDeltaMs;
    const totalElapsedSecs = Math.floor(totalElapsedMs / 1000);

    setElapsedTime(totalElapsedSecs);

    const currentMode = modeRef.current;
    const currentConfig = configRef.current;
    const currentExtensions = extensionSecondsRef.current;
    const currentBase = currentMode === 'flowmodoro' ? 0 : (currentConfig[currentMode as keyof TimerConfig] || 1500);
    const currentTotalSecs = currentBase + currentExtensions;

    if (currentMode === 'flowmodoro') {
      // Stopwatch mode: count upwards
      setTimeLeft(totalElapsedSecs);
      setProgressRatio(Math.min(1, (totalElapsedSecs % 3600) / 3600));
    } else {
      // Countdown modes: pomodoro, breaks, custom
      const remainingSecs = Math.max(0, currentTotalSecs - totalElapsedSecs);
      setTimeLeft(remainingSecs);

      const ratio = currentTotalSecs > 0
        ? Math.min(1, Math.max(0, totalElapsedMs / (currentTotalSecs * 1000)))
        : 1;
      setProgressRatio(ratio);

      // Session completion boundary check
      if (remainingSecs <= 0 && totalElapsedMs >= currentTotalSecs * 1000) {
        setIsRunning(false);
        isRunningRef.current = false;
        sessionStartPerfRef.current = 0;
        sessionStartDateRef.current = 0;
        accumulatedMsRef.current = 0;

        if (workerRef.current) {
          workerRef.current.postMessage({ type: 'PAUSE' });
        }
        if (fallbackIntervalRef.current) {
          clearInterval(fallbackIntervalRef.current);
          fallbackIntervalRef.current = null;
        }

        if (enableChimeRef.current) {
          playCompletionChime();
        }

        setCompletedSessions((prev) => prev + 1);
        if (onSessionCompleteRef.current) {
          onSessionCompleteRef.current(currentMode, currentTotalSecs);
        }
      }
    }
  }, []);

  const processTickRef = useRef(processTick);
  processTickRef.current = processTick;

  // Initialize Dedicated Web Worker on mount
  useEffect(() => {
    let worker: Worker | null = null;

    try {
      worker = new Worker(new URL('../workers/timerWorker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (event: MessageEvent<TimerWorkerResponse>) => {
        if (event.data?.type === 'TICK') {
          processTickRef.current(event.data.timestamp, event.data.dateTimestamp || Date.now());
        }
      };

      workerRef.current = worker;
    } catch (err) {
      console.warn('Dedicated Web Worker initialization failed; delta fallback will be used:', err);
    }

    return () => {
      if (worker) {
        worker.postMessage({ type: 'RESET' });
        worker.terminate();
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, []);

  // Background tab visibility & window focus re-synchronization
  useEffect(() => {
    const handleImmediateResync = () => {
      if (isRunningRef.current) {
        processTickRef.current(performance.now(), Date.now());
        if (workerRef.current) {
          workerRef.current.postMessage({ type: 'SYNC' });
        }
      }
    };

    document.addEventListener('visibilitychange', handleImmediateResync);
    window.addEventListener('focus', handleImmediateResync);

    return () => {
      document.removeEventListener('visibilitychange', handleImmediateResync);
      window.removeEventListener('focus', handleImmediateResync);
    };
  }, []);

  // Controls
  const start = useCallback(() => {
    if (isRunningRef.current) return;

    const nowPerf = performance.now();
    const nowDate = Date.now();
    sessionStartPerfRef.current = nowPerf;
    sessionStartDateRef.current = nowDate;

    setIsRunning(true);
    isRunningRef.current = true;

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'START',
        intervalMs: 100,
        startTimePerf: nowPerf,
        startTimeDate: nowDate,
      });
    } else {
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = setInterval(() => {
        processTickRef.current(performance.now(), Date.now());
      }, 100);
    }
  }, []);

  const pause = useCallback(() => {
    if (!isRunningRef.current) return;

    // Freeze and commit current segment elapsed duration to accumulatedMs
    const nowPerf = performance.now();
    const nowDate = Date.now();
    const perfDelta = Math.max(0, nowPerf - sessionStartPerfRef.current);
    const dateDelta = Math.max(0, nowDate - sessionStartDateRef.current);
    accumulatedMsRef.current += Math.max(perfDelta, dateDelta);

    sessionStartPerfRef.current = 0;
    sessionStartDateRef.current = 0;
    setIsRunning(false);
    isRunningRef.current = false;

    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'PAUSE' });
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    isRunningRef.current = false;
    sessionStartPerfRef.current = 0;
    sessionStartDateRef.current = 0;
    accumulatedMsRef.current = 0;
    setExtensionSeconds(0);
    extensionSecondsRef.current = 0;
    setElapsedTime(0);

    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET' });
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }

    const currentMode = modeRef.current;
    if (currentMode === 'flowmodoro') {
      setTimeLeft(0);
      setProgressRatio(0);
    } else {
      const base = configRef.current[currentMode as keyof TimerConfig] || 1500;
      setTimeLeft(base);
      setProgressRatio(0);
    }
  }, []);

  const extendFiveMinutes = useCallback(() => {
    setExtensionSeconds((prev) => {
      const updated = prev + 300;
      extensionSecondsRef.current = updated;
      return updated;
    });

    setTimeLeft((prev) => prev + 300);
  }, []);

  const setMode = useCallback((newMode: TimerMode) => {
    if (newMode === modeRef.current) return;

    setIsRunning(false);
    isRunningRef.current = false;
    sessionStartPerfRef.current = 0;
    sessionStartDateRef.current = 0;
    accumulatedMsRef.current = 0;
    setExtensionSeconds(0);
    extensionSecondsRef.current = 0;
    setElapsedTime(0);

    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET' });
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }

    setModeState(newMode);
    modeRef.current = newMode;

    if (newMode === 'flowmodoro') {
      setTimeLeft(0);
      setProgressRatio(0);
    } else {
      const duration = configRef.current[newMode as keyof TimerConfig] || 1500;
      setTimeLeft(duration);
      setProgressRatio(0);
    }
  }, []);

  const setCustomMinutes = useCallback((minutes: number) => {
    const safeSecs = Math.max(60, Math.floor(minutes * 60));
    setConfig((prev) => {
      const updated = { ...prev, custom: safeSecs };
      configRef.current = updated;
      return updated;
    });

    if (modeRef.current === 'custom' && !isRunningRef.current) {
      setTimeLeft(safeSecs);
      setProgressRatio(0);
      accumulatedMsRef.current = 0;
    }
  }, []);

  const skip = useCallback(() => {
    pause();
    if (mode === 'pomodoro') {
      const nextMode = (completedSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
    } else {
      setMode('pomodoro');
    }
  }, [mode, completedSessions, pause, setMode]);

  return {
    mode,
    timeLeft,
    totalDuration,
    elapsedTime,
    isRunning,
    progressRatio,
    completedSessions,
    config,
    start,
    pause,
    reset,
    extendFiveMinutes,
    setMode,
    setCustomMinutes,
    skip,
    formattedTime: formatTime(timeLeft, mode === 'flowmodoro' && timeLeft >= 3600),
  };
}
