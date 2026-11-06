import React, { useRef, useState } from 'react';
import { useStudyAnalytics } from '../../hooks/useStudyAnalytics';
import { useTheme } from '../../hooks/useTheme';
import { DayHeatmapData } from '../../types/analytics';
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
  const [hoveredDay, setHoveredDay] = useState<DayHeatmapData | null>(null);

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
          setImportStatus(`Successfully restored ${res.count} sessions.`);
        } else {
          setImportStatus(`Import failed: ${res.error || 'Invalid file'}`);
        }
        setTimeout(() => setImportStatus(''), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Adaptive Heatmap Palette (Light: Botanical Moss | Dark: Vibrant Emerald Glow)
  const getHeatmapColor = (level: number, dark: boolean) => {
    if (dark) {
      switch (level) {
        case 4:
          return 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]';
        case 3:
          return 'bg-[#059669]';
        case 2:
          return 'bg-[#047857]';
        case 1:
          return 'bg-[#064E3B]';
        case 0:
        default:
          return 'bg-[#23232C] border border-white/[0.04]';
      }
    }

    switch (level) {
      case 4:
        return 'bg-[#2E4036]';
      case 3:
        return 'bg-[#50725F]';
      case 2:
        return 'bg-[#8FA897]';
      case 1:
        return 'bg-[#C8D7CD]';
      case 0:
      default:
        return 'bg-[#E6E2D8]';
    }
  };

  return (
    <div className="organic-card p-6 relative flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DC] dark:border-white/[0.08] pb-4 mb-5 transition-colors duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE5] dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 flex items-center justify-center text-[#2E4036] dark:text-emerald-400 shrink-0 transition-colors duration-300">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#1A1A1A] dark:text-[#EDEDED] flex items-center gap-2 transition-colors duration-300">
                Weekly Productivity & Streak
              </h2>
              <p className="text-[11px] text-[#5F5E58] dark:text-[#A1A1AA] transition-colors duration-300">
                Activity heatmap & focus milestones
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 4-Session Streak Milestone Pill */}
            <div className="flex items-center gap-1.5 text-xs font-mono bg-[#E2ECE5] dark:bg-emerald-500/15 dark:border dark:border-emerald-500/30 text-[#2E4036] dark:text-emerald-300 px-2.5 py-1 rounded-xl transition-colors duration-300">
              <Award className="w-3.5 h-3.5 text-[#2E4036] dark:text-emerald-400" />
              <span className="font-semibold tabular-nums">
                {analytics.completedTodayCount >= 4 
                  ? '4-Streak Milestone!' 
                  : `${analytics.completedTodayCount % 4}/4 Streak Goal`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono bg-[#EAE6DC] dark:bg-[#23232C] dark:border dark:border-white/[0.08] text-[#1A1A1A] dark:text-[#EDEDED] px-2.5 py-1 rounded-xl transition-colors duration-300">
              <Flame className="w-3.5 h-3.5 fill-current text-[#8C5A41] dark:text-amber-400" />
              <span className="font-semibold tabular-nums">{streakDays}d Streak</span>
            </div>

            <button
              onClick={triggerMilestoneReward}
              aria-label="Celebrate focus milestones with confetti"
              title="Trigger Milestone Celebration Confetti"
              className="btn-precision p-1.5 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:border dark:border-white/[0.08] text-[#2E4036] dark:text-emerald-400 transition-colors duration-300"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Cards Row - High-Contrast Readouts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-[#F2EFE9] dark:bg-[#121217] dark:border dark:border-white/[0.08] rounded-2xl p-3.5 transition-colors duration-300">
            <span className="text-[10px] text-[#5F5E58] dark:text-[#A1A1AA] uppercase font-mono block mb-1 flex items-center gap-1 tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#2E4036] dark:text-emerald-400" />
              Total Focus
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#1A1A1A] dark:text-[#EDEDED] tabular-nums transition-colors duration-300">{totalHours}</span>
              <span className="text-xs font-mono text-[#7A7972] dark:text-[#71717A]">hours</span>
            </div>
          </div>

          <div className="bg-[#F2EFE9] dark:bg-[#121217] dark:border dark:border-white/[0.08] rounded-2xl p-3.5 transition-colors duration-300">
            <span className="text-[10px] text-[#5F5E58] dark:text-[#A1A1AA] uppercase font-mono block mb-1 flex items-center gap-1 tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#4D6B5A] dark:text-cyan-400" />
              This Week
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#2E4036] dark:text-emerald-400 tabular-nums transition-colors duration-300">{weeklyHours}</span>
              <span className="text-xs font-mono text-[#7A7972] dark:text-[#71717A]">hours</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#F2EFE9] dark:bg-[#121217] dark:border dark:border-white/[0.08] rounded-2xl p-3.5 transition-colors duration-300">
            <span className="text-[10px] text-[#5F5E58] dark:text-[#A1A1AA] uppercase font-mono block mb-1 flex items-center gap-1 tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#8C5A41] dark:text-amber-400" />
              Total Sessions
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#1A1A1A] dark:text-[#EDEDED] tabular-nums transition-colors duration-300">{sessions.length}</span>
              <span className="text-xs font-mono text-[#7A7972] dark:text-[#71717A]">logged</span>
            </div>
          </div>
        </div>

        {/* 28-Day GitHub-style Heatmap Grid */}
        <div className="bg-[#F2EFE9] dark:bg-[#121217] dark:border dark:border-white/[0.08] rounded-2xl p-4 mb-5 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#EDEDED] flex items-center gap-1.5 font-sans transition-colors duration-300">
              <span>Past 4 Weeks Activity:</span>
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#5F5E58] dark:text-[#A1A1AA]">
              <span>Less</span>
              <span className={`w-2.5 h-2.5 rounded-sm ${isDark ? 'bg-[#23232C]' : 'bg-[#E6E2D8]'}`} />
              <span className={`w-2.5 h-2.5 rounded-sm ${isDark ? 'bg-[#064E3B]' : 'bg-[#C8D7CD]'}`} />
              <span className={`w-2.5 h-2.5 rounded-sm ${isDark ? 'bg-[#047857]' : 'bg-[#8FA897]'}`} />
              <span className={`w-2.5 h-2.5 rounded-sm ${isDark ? 'bg-[#059669]' : 'bg-[#50725F]'}`} />
              <span className={`w-2.5 h-2.5 rounded-sm ${isDark ? 'bg-[#10B981]' : 'bg-[#2E4036]'}`} />
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Grid of 28 Days (4 columns x 7 rows) */}
          <div className="flex justify-between items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            {Array.from({ length: 4 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1.5">
                {heatmapDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onFocus={() => setHoveredDay(day)}
                    onBlur={() => setHoveredDay(null)}
                    aria-label={`${day.date}: ${day.totalMinutes} minutes, ${day.sessionCount} sessions`}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md transition-all duration-150 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${getHeatmapColor(
                      day.level,
                      isDark
                    )} hover:ring-2 hover:ring-[#2E4036]/50 dark:hover:ring-emerald-400/50`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Interactive Tooltip Card - Monospace Tabular */}
          <div className="mt-3 pt-2 border-t border-[#DDD8CB] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#5F5E58] dark:text-[#A1A1AA] transition-colors duration-300">
            {hoveredDay ? (
              <span>
                <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">{hoveredDay.date}</strong>: {hoveredDay.totalMinutes}m ({hoveredDay.sessionCount} sessions)
              </span>
            ) : (
              <span>Hover or focus on a block to view focus summary</span>
            )}
            <span className="text-[#7A7972] dark:text-[#71717A] tabular-nums">{heatmapDays.length} days recorded</span>
          </div>
        </div>

        {/* Import Status Alert */}
        {importStatus && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#E2ECE5] dark:bg-emerald-500/15 dark:border dark:border-emerald-500/30 text-[#2E4036] dark:text-emerald-300 text-xs font-mono animate-fadeIn" role="status">
            {importStatus}
          </div>
        )}
      </div>

      {/* JSON Backup & Restore Actions - Magnetic Hover */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EAE6DC] dark:border-white/[0.08] transition-colors duration-300">
        <span className="text-[11px] font-mono text-[#7A7972] dark:text-[#71717A]">Local Storage Sync</span>
        <div className="flex items-center gap-2">
          {/* Quick JSON Export Button */}
          <button
            onClick={downloadBackupFile}
            aria-label="Download study sessions JSON backup"
            className="btn-precision flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:border dark:border-white/[0.08] text-[#1A1A1A] dark:text-[#EDEDED] text-xs font-mono transition-colors duration-300"
            title="Download study sessions JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-[#2E4036] dark:text-emerald-400" />
            <span>Export Backup</span>
          </button>

          {/* Quick JSON Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import and restore sessions from JSON backup file"
            className="btn-precision flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:border dark:border-white/[0.08] text-[#1A1A1A] dark:text-[#EDEDED] text-xs font-mono transition-colors duration-300"
            title="Import and restore sessions JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-[#2E4036] dark:text-emerald-400" />
            <span>Restore JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            aria-label="Upload backup JSON file"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};