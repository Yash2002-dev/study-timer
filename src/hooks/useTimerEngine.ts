import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, TimerConfig, TimerEngine } from '../types/timer';
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

  // References to guarantee drift-free delta calculation and avoid stale closures
  const workerRef = useRef<Worker | null>(null);
  const fallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const modeRef = useRef<TimerMode>(initialMode);
  const configRef = useRef<TimerConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const extensionSecondsRef = useRef<number>(0);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const enableChimeRef = useRef(enableChime);

  // Always keep refs up to date
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

  // Update document title with remaining time and status
  useEffect(() => {
    const formatted = formatTime(timeLeft);
    const modeLabel = mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : mode === 'longBreak' ? 'Long Break' : mode === 'flowmodoro' ? 'Flow' : 'Custom';
    const stateSymbol = isRunning ? '▶' : '⏸';
    document.title = `${stateSymbol} ${formatted} • ${modeLabel} | Masterpiece Study Timer`;
  }, [timeLeft, mode, isRunning]);

  // Core tick processor
  const processTick = useCallback((now: number) => {
    if (!isRunningRef.current) return;

    if (lastTimestampRef.current === 0) {
      lastTimestampRef.current = now;
      return;
    }

    const deltaMs = Math.max(0, now - lastTimestampRef.current);
    lastTimestampRef.current = now;
    accumulatedMsRef.current += deltaMs;

    const currentMode = modeRef.current;
    const currentConfig = configRef.current;
    const currentExtensions = extensionSecondsRef.current;
    const currentBase = currentMode === 'flowmodoro' ? 0 : (currentConfig[currentMode as keyof TimerConfig] || 1500);
    const currentTotal = currentBase + currentExtensions;
    const totalElapsedSecs = Math.floor(accumulatedMsRef.current / 1000);

    setElapsedTime(totalElapsedSecs);

    if (currentMode === 'flowmodoro') {
      // Stopwatch mode: count upwards
      setTimeLeft(totalElapsedSecs);
      setProgressRatio(Math.min(1, (totalElapsedSecs % 3600) / 3600));
    } else {
      // Countdown modes
      const remainingSecs = Math.max(0, currentTotal - totalElapsedSecs);
      setTimeLeft(remainingSecs);

      const ratio = currentTotal > 0 ? Math.min(1, Math.max(0, (currentTotal - remainingSecs) / currentTotal)) : 1;
      setProgressRatio(ratio);

      // Check for completion
      if (remainingSecs <= 0 && accumulatedMsRef.current >= currentTotal * 1000) {
        setIsRunning(false);
        isRunningRef.current = false;
        lastTimestampRef.current = 0;

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
          onSessionCompleteRef.current(currentMode, currentTotal);
        }
      }
    }
  }, []);

  const processTickRef = useRef(processTick);
  processTickRef.current = processTick;

  // Initialize Web Worker once on mount
  useEffect(() => {
    let worker: Worker | null = null;

    try {
      worker = new Worker(new URL('../workers/timerWorker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (event: MessageEvent) => {
        if (event.data?.type === 'TICK') {
          processTickRef.current(performance.now());
        }
      };

      workerRef.current = worker;
    } catch (err) {
      console.warn('Worker initialization failed, fallback will be used on start:', err);
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

  // Guarantee instant re-sync with zero lag whenever the tab regains focus or visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunningRef.current) {
        processTickRef.current(performance.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // Controls
  const start = useCallback(() => {
    if (isRunningRef.current) return;

    lastTimestampRef.current = performance.now();
    setIsRunning(true);
    isRunningRef.current = true;

    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'START', intervalMs: 100 });
    } else {
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = setInterval(() => {
        processTickRef.current(performance.now());
      }, 100);
    }
  }, []);

  const pause = useCallback(() => {
    if (!isRunningRef.current) return;

    setIsRunning(false);
    isRunningRef.current = false;
    lastTimestampRef.current = 0;

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
    lastTimestampRef.current = 0;
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
    lastTimestampRef.current = 0;
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
