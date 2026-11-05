export interface TaskTag {
  id: string;
  label: string;
  color: string; // Hex color code for accent dot
  icon?: string;
}

export interface DailyGoalConfig {
  targetMinutes: number; // e.g. 240 min (4h)
  completedSecondsToday: number;
}

export interface SessionRecord {
  id: string;
  tagId: string;
  mode: string;
  durationSeconds: number;
  completedAt: string; // ISO string
}

