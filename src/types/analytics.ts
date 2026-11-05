import { TimerMode } from './timer';

export interface CompletedSession {
  id: string;
  timestamp: string; // ISO string
  date: string;      // YYYY-MM-DD
  durationSeconds: number;
  tagId: string;
  tagLabel: string;
  tagColor: string;
  mode: TimerMode;
}

export interface DayHeatmapData {
  date: string;        // YYYY-MM-DD
  dayOfWeek: string;   // Mon, Tue, etc.
  totalMinutes: number;
  sessionCount: number;
  level: 0 | 1 | 2 | 3 | 4; // GitHub-like intensity
}

export interface StudyAnalyticsState {
  sessions: CompletedSession[];
  streakDays: number;
  totalFocusSeconds: number;
  weeklyFocusSeconds: number;
  completedTodayCount: number;
  completedTodaySeconds: number;
  heatmapDays: DayHeatmapData[];
}

export interface StudyAnalyticsControls {
  logSession: (session: Omit<CompletedSession, 'id' | 'timestamp' | 'date'>) => void;
  exportDataJson: () => string;
  downloadBackupFile: () => void;
  importDataJson: (jsonString: string) => { success: boolean; count: number; error?: string };
  clearHistory: () => void;
  triggerMilestoneReward: () => void;
}

export type StudyAnalyticsHook = StudyAnalyticsState & StudyAnalyticsControls;

