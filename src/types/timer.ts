export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'flowmodoro' | 'custom';

export interface TimerConfig {
  pomodoro: number;    // seconds (default 25 * 60)
  shortBreak: number;  // seconds (default 5 * 60)
  longBreak: number;   // seconds (default 15 * 60)
  custom: number;      // seconds (default 45 * 60)
}

export interface TimerWorkerMessage {
  type: 'START' | 'PAUSE' | 'RESET' | 'SYNC' | 'SET_INTERVAL';
  intervalMs?: number;
}

export interface TimerWorkerResponse {
  type: 'TICK';
  timestamp: number;
}

export interface TimerEngineState {
  mode: TimerMode;
  timeLeft: number;        // seconds remaining (or elapsed in flowmodoro)
  totalDuration: number;   // target duration in seconds for current mode
  elapsedTime: number;     // seconds elapsed since current session started
  isRunning: boolean;
  progressRatio: number;   // 0.0 to 1.0
  completedSessions: number;
  config: TimerConfig;
}

export interface TimerEngineControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  extendFiveMinutes: () => void;
  setMode: (mode: TimerMode) => void;
  setCustomMinutes: (minutes: number) => void;
  skip: () => void;
  formattedTime: string;
}

export type TimerEngine = TimerEngineState & TimerEngineControls;

