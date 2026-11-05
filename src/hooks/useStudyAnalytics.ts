import { useState, useEffect, useCallback, useMemo } from 'react';
import { CompletedSession, DayHeatmapData, StudyAnalyticsHook } from '../types/analytics';
import { triggerMilestoneConfetti, triggerSessionCompleteConfetti } from '../utils/confetti';

const STORAGE_KEY = 'study_timer_session_logs';

function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate demo initial data if storage is completely empty
function getInitialSeedSessions(): CompletedSession[] {
  const today = new Date();
  const todayStr = getLocalDateString(today);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const twoDaysAgoStr = getLocalDateString(twoDaysAgo);

  return [
    {
      id: 'demo-1',
      timestamp: new Date(twoDaysAgo.setHours(10, 0)).toISOString(),
      date: twoDaysAgoStr,
      durationSeconds: 1500, // 25m
      tagId: 'deep-work',
      tagLabel: 'Deep Work',
      tagColor: '#6366F1',
      mode: 'pomodoro',
    },
    {
      id: 'demo-2',
      timestamp: new Date(twoDaysAgo.setHours(14, 30)).toISOString(),
      date: twoDaysAgoStr,
      durationSeconds: 1500,
      tagId: 'coding',
      tagLabel: 'Coding',
      tagColor: '#06B6D4',
      mode: 'pomodoro',
    },
    {
      id: 'demo-3',
      timestamp: new Date(yesterday.setHours(11, 15)).toISOString(),
      date: yesterdayStr,
      durationSeconds: 3000, // 50m
      tagId: 'reading',
      tagLabel: 'Reading',
      tagColor: '#10B981',
      mode: 'custom',
    },
    {
      id: 'demo-4',
      timestamp: new Date(yesterday.setHours(16, 0)).toISOString(),
      date: yesterdayStr,
      durationSeconds: 1500,
      tagId: 'deep-work',
      tagLabel: 'Deep Work',
      tagColor: '#6366F1',
      mode: 'pomodoro',
    },
    {
      id: 'demo-5',
      timestamp: new Date(today.setHours(9, 30)).toISOString(),
      date: todayStr,
      durationSeconds: 1500,
      tagId: 'deep-work',
      tagLabel: 'Deep Work',
      tagColor: '#6366F1',
      mode: 'pomodoro',
    },
  ];
}

export function useStudyAnalytics(): StudyAnalyticsHook {
  const [sessions, setSessions] = useState<CompletedSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const seed = getInitialSeedSessions();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    } catch {}
    return seed;
  });

  // Save to localStorage whenever sessions change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to persist study sessions to localStorage:', e);
    }
  }, [sessions]);

  // Calculate Streak
  const streakDays = useMemo(() => {
    const datesWithSessions = new Set(sessions.map((s) => s.date));
    const today = new Date();
    const todayStr = getLocalDateString(today);

    let streak = 0;
    const checkDate = new Date(today);

    // If no session today yet, check if there was one yesterday to maintain active streak
    if (!datesWithSessions.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = getLocalDateString(checkDate);
      if (!datesWithSessions.has(yesterdayStr)) {
        return 0; // Streak broken
      }
    }

    // Count backwards continuous days
    while (true) {
      const dateStr = getLocalDateString(checkDate);
      if (datesWithSessions.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return Math.max(1, streak);
  }, [sessions]);

  // Total and weekly focus time
  const { totalFocusSeconds, weeklyFocusSeconds, completedTodayCount, completedTodaySeconds } = useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = getLocalDateString(sevenDaysAgo);

    let total = 0;
    let weekly = 0;
    let todayCount = 0;
    let todaySeconds = 0;

    sessions.forEach((s) => {
      // Exclude break modes from focus time totals
      if (s.mode !== 'shortBreak' && s.mode !== 'longBreak') {
        total += s.durationSeconds;
        if (s.date >= sevenDaysAgoStr) {
          weekly += s.durationSeconds;
        }
        if (s.date === todayStr) {
          todayCount++;
          todaySeconds += s.durationSeconds;
        }
      }
    });

    return {
      totalFocusSeconds: total,
      weeklyFocusSeconds: weekly,
      completedTodayCount: todayCount,
      completedTodaySeconds: todaySeconds,
    };
  }, [sessions]);

  // Generate GitHub-like 28-day contribution heatmap
  const heatmapDays = useMemo<DayHeatmapData[]>(() => {
    const dayMap = new Map<string, { totalSeconds: number; sessionCount: number }>();
    sessions.forEach((s) => {
      if (s.mode !== 'shortBreak' && s.mode !== 'longBreak') {
        const cur = dayMap.get(s.date) || { totalSeconds: 0, sessionCount: 0 };
        dayMap.set(s.date, {
          totalSeconds: cur.totalSeconds + s.durationSeconds,
          sessionCount: cur.sessionCount + 1,
        });
      }
    });

    const days: DayHeatmapData[] = [];
    const today = new Date();

    // 28 days back up to today
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayData = dayMap.get(dateStr) || { totalSeconds: 0, sessionCount: 0 };
      const minutes = Math.floor(dayData.totalSeconds / 60);

      // GitHub-like activity levels
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (minutes > 120) level = 4;
      else if (minutes >= 60) level = 3;
      else if (minutes >= 30) level = 2;
      else if (minutes > 0) level = 1;

      days.push({
        date: dateStr,
        dayOfWeek: d.toLocaleDateString([], { weekday: 'short' }),
        totalMinutes: minutes,
        sessionCount: dayData.sessionCount,
        level,
      });
    }

    return days;
  }, [sessions]);

  // Log a new completed session
  const logSession = useCallback(
    (newSession: Omit<CompletedSession, 'id' | 'timestamp' | 'date'>) => {
      const now = new Date();
      const sessionObj: CompletedSession = {
        ...newSession,
        id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: now.toISOString(),
        date: getLocalDateString(now),
      };

      setSessions((prev) => {
        const updated = [...prev, sessionObj];

        // Milestone reward check: Trigger grand confetti celebration on 4-session streak milestone
        const todaySessions = updated.filter(
          (s) => s.date === sessionObj.date && s.mode !== 'shortBreak' && s.mode !== 'longBreak'
        );
        const focusSessions = updated.filter((s) => s.mode !== 'shortBreak' && s.mode !== 'longBreak');

        if (todaySessions.length === 4 || (focusSessions.length > 0 && focusSessions.length % 4 === 0)) {
          triggerMilestoneConfetti();
        } else {
          triggerSessionCompleteConfetti();
        }

        return updated;
      });
    },
    []
  );

  // Trigger manual milestone reward
  const triggerMilestoneReward = useCallback(() => {
    triggerMilestoneConfetti();
  }, []);

  // Quick JSON export
  const exportDataJson = useCallback(() => {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        totalSessions: sessions.length,
        sessions,
      },
      null,
      2
    );
  }, [sessions]);

  // Download Backup File
  const downloadBackupFile = useCallback(() => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_timer_backup_${getLocalDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportDataJson]);

  // Import JSON Backup
  const importDataJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const importedSessions = Array.isArray(parsed) ? parsed : parsed.sessions;

      if (!Array.isArray(importedSessions)) {
        return { success: false, count: 0, error: 'Invalid file format: sessions list missing.' };
      }

      // Merge and deduplicate by session id
      setSessions((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newOnes = importedSessions.filter((s: CompletedSession) => s && s.id && !existingIds.has(s.id));
        return [...prev, ...newOnes];
      });

      return { success: true, count: importedSessions.length };
    } catch (err) {
      return { success: false, count: 0, error: 'Failed to parse JSON file.' };
    }
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return {
    sessions,
    streakDays,
    totalFocusSeconds,
    weeklyFocusSeconds,
    completedTodayCount,
    completedTodaySeconds,
    heatmapDays,
    logSession,
    exportDataJson,
    downloadBackupFile,
    importDataJson,
    clearHistory,
    triggerMilestoneReward,
  };
}

