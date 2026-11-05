import React, { useRef, useState } from 'react';
import { useStudyAnalytics } from '../../hooks/useStudyAnalytics';
import { 
  BarChart3, 
  Flame, 
  Download, 
  Upload, 
  Sparkles, 
  Calendar,
  Clock,
  Award
} from 'lucide-react';

interface AnalyticsTileProps {
  analytics: ReturnType<typeof useStudyAnalytics>;
}

export const AnalyticsTile: React.FC<AnalyticsTileProps> = ({ analytics }) => {
  const {
    streakDays,
    totalFocusSeconds,
    weeklyFocusSeconds,
    heatmapDays,
    downloadBackupFile,
    importDataJson,
    triggerMilestoneReward,
    sessions,
  } = analytics;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const [hoveredDay, setHoveredDay] = useState<{ date: string; minutes: number; sessions: number } | null>(null);

  const totalHours = (totalFocusSeconds / 3600).toFixed(1);
  const weeklyHours = (weeklyFocusSeconds / 3600).toFixed(1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importDataJson(content);
        if (res.success) {
          setImportStatus(`✅ Successfully restored ${res.count} sessions!`);
        } else {
          setImportStatus(`❌ Import failed: ${res.error || 'Invalid file'}`);
        }
        setTimeout(() => setImportStatus(''), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 3:
        return 'bg-emerald-600/90 border-emerald-500/60';
      case 2:
        return 'bg-indigo-500/80 border-indigo-400/50';
      case 1:
        return 'bg-indigo-950 border-indigo-800/40 text-indigo-400';
      case 0:
      default:
        return 'bg-obsidian-900 border-white/5';
    }
  };

  return (
    <div className="bento-card rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Weekly Productivity & Streak
              </h2>
              <p className="text-[11px] text-slate-400">GitHub-style activity heatmap & milestones</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 4-Session Streak Milestone Pill */}
            <div className="flex items-center gap-1.5 text-xs font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-xl shadow-sm">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold tabular-nums">
                {analytics.completedTodayCount >= 4 
                  ? '🎉 4-Streak Milestone!' 
                  : `${analytics.completedTodayCount % 4}/4 Streak Goal`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span className="font-bold tabular-nums">{streakDays} Day Streak</span>
            </div>

            <button
              onClick={triggerMilestoneReward}
              title="Trigger Milestone Celebration Confetti"
              className="btn-tactile p-1.5 rounded-xl bg-obsidian-900 border border-white/[0.06] hover:border-indigo-500/40 text-indigo-300 hover:text-white transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-obsidian-900/90 border border-white/[0.06] rounded-2xl p-3.5">
            <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              Total Focus
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono text-white tabular-nums">{totalHours}</span>
              <span className="text-xs font-mono text-slate-500">hours</span>
            </div>
          </div>

          <div className="bg-obsidian-900/90 border border-white/[0.06] rounded-2xl p-3.5">
            <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" />
              This Week
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono text-emerald-300 tabular-nums">{weeklyHours}</span>
              <span className="text-xs font-mono text-slate-500">hours</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-obsidian-900/90 border border-white/[0.06] rounded-2xl p-3.5">
            <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              Sessions
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono text-amber-300 tabular-nums">{sessions.length}</span>
              <span className="text-xs font-mono text-slate-500">logged</span>
            </div>
          </div>
        </div>

        {/* GitHub-style Mini Activity Heatmap */}
        <div className="bg-obsidian-900/80 border border-white/[0.06] rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              28-Day Focus Heatmap:
            </span>

            {/* Hover Tooltip or Date */}
            <span className="text-[11px] font-mono text-indigo-300 min-h-[16px]">
              {hoveredDay 
                ? `${hoveredDay.date}: ${hoveredDay.minutes}m (${hoveredDay.sessions} sessions)` 
                : 'Hover square to inspect'}
            </span>
          </div>

          {/* Grid of 28 squares: 4 rows of 7 days */}
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 max-w-fit mx-auto sm:mx-0">
            {heatmapDays.map((day) => (
              <div
                key={day.date}
                onMouseEnter={() => setHoveredDay({ date: day.date, minutes: day.totalMinutes, sessions: day.sessionCount })}
                onMouseOver={() => setHoveredDay({ date: day.date, minutes: day.totalMinutes, sessions: day.sessionCount })}
                onMouseLeave={() => setHoveredDay(null)}
                className={`w-4 h-4 rounded-sm border transition-all duration-200 cursor-pointer hover:scale-125 hover:z-10 ${getHeatmapColor(
                  day.level
                )}`}
                title={`${day.date}: ${day.totalMinutes} minutes (${day.sessionCount} sessions)`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-slate-500">
            <span>Past 4 Weeks</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-obsidian-900 border border-white/5" />
              <div className="w-3 h-3 rounded-sm bg-indigo-950 border border-indigo-800/40" />
              <div className="w-3 h-3 rounded-sm bg-indigo-500/80 border border-indigo-400/50" />
              <div className="w-3 h-3 rounded-sm bg-emerald-600/90 border border-emerald-500/60" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Export / Import Footer */}
      <div className="border-t border-white/[0.06] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-[11px] font-mono text-slate-400">Data Portability (JSON):</span>

          <div className="flex items-center gap-2">
            {/* Export JSON Button */}
            <button
              onClick={downloadBackupFile}
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 border border-white/[0.06] hover:border-white/20 text-slate-300 hover:text-white text-xs font-mono transition-all active:scale-[0.98]"
              title="Download JSON session backup"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>

            {/* Import JSON Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 border border-white/[0.06] hover:border-white/20 text-indigo-300 hover:text-indigo-200 text-xs font-mono transition-all active:scale-[0.98]"
              title="Import and restore sessions from JSON"
            >
              <Upload className="w-3 h-3" />
              <span>Import</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {importStatus && (
          <div className="mt-2 text-xs font-mono text-indigo-300 animate-fadeIn">
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
};
