import React, { useRef, useState } from 'react';
import { useStudyAnalytics } from '../../hooks/useStudyAnalytics';
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

  // Organic Botanical Moss Heatmap Palette
  const getHeatmapColor = (level: number) => {
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
    <div className="organic-card p-6 relative flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DC] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE5] flex items-center justify-center text-[#2E4036]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#1A1A1A] flex items-center gap-2">
                Weekly Productivity & Streak
              </h2>
              <p className="text-[11px] text-[#5F5E58]">Activity heatmap & focus milestones</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 4-Session Streak Milestone Pill */}
            <div className="flex items-center gap-1.5 text-xs font-mono bg-[#E2ECE5] text-[#2E4036] px-2.5 py-1 rounded-xl">
              <Award className="w-3.5 h-3.5 text-[#2E4036]" />
              <span className="font-semibold tabular-nums">
                {analytics.completedTodayCount >= 4 
                  ? '4-Streak Milestone!' 
                  : `${analytics.completedTodayCount % 4}/4 Streak Goal`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono bg-[#EAE6DC] text-[#1A1A1A] px-2.5 py-1 rounded-xl">
              <Flame className="w-3.5 h-3.5 fill-current text-[#8C5A41]" />
              <span className="font-semibold tabular-nums">{streakDays}d Streak</span>
            </div>

            <button
              onClick={triggerMilestoneReward}
              title="Trigger Milestone Celebration Confetti"
              className="btn-tactile p-1.5 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#2E4036] transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-[#F2EFE9] rounded-2xl p-3.5">
            <span className="text-[10px] text-[#5F5E58] uppercase font-mono block mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#2E4036]" />
              Total Focus
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#1A1A1A] tabular-nums">{totalHours}</span>
              <span className="text-xs font-mono text-[#7A7972]">hours</span>
            </div>
          </div>

          <div className="bg-[#F2EFE9] rounded-2xl p-3.5">
            <span className="text-[10px] text-[#5F5E58] uppercase font-mono block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#4D6B5A]" />
              This Week
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#2E4036] tabular-nums">{weeklyHours}</span>
              <span className="text-xs font-mono text-[#7A7972]">hours</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#F2EFE9] rounded-2xl p-3.5">
            <span className="text-[10px] text-[#5F5E58] uppercase font-mono block mb-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-[#8C5A41]" />
              Total Sessions
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#1A1A1A] tabular-nums">{sessions.length}</span>
              <span className="text-xs font-mono text-[#7A7972]">logged</span>
            </div>
          </div>
        </div>

        {/* 28-Day GitHub-style Heatmap Grid */}
        <div className="bg-[#F2EFE9] rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
              <span>Past 4 Weeks Activity:</span>
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#5F5E58]">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-[#E6E2D8]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#C8D7CD]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#8FA897]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#50725F]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2E4036]" />
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Grid of 28 Days (4 columns x 7 rows, Sunday to Saturday) */}
          <div className="flex justify-between items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            {Array.from({ length: 4 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1.5">
                {heatmapDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day) => (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md transition-all duration-150 cursor-pointer ${getHeatmapColor(
                      day.level
                    )} hover:ring-2 hover:ring-[#2E4036]/50`}
                    title={`${day.date}: ${day.totalMinutes} mins (${day.sessionCount} sessions)`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Interactive Tooltip Card */}
          <div className="mt-3 pt-2 border-t border-[#DDD8CB] flex items-center justify-between text-[11px] font-mono text-[#5F5E58]">
            {hoveredDay ? (
              <span>
                <strong className="text-[#1A1A1A]">{hoveredDay.date}</strong>: {hoveredDay.totalMinutes} min ({hoveredDay.sessionCount} sessions)
              </span>
            ) : (
              <span>Hover over a block to view focus summary</span>
            )}
            <span className="text-[#7A7972]">{heatmapDays.length} days recorded</span>
          </div>
        </div>

        {/* Import Status Alert */}
        {importStatus && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#E2ECE5] text-[#2E4036] text-xs font-mono animate-fadeIn">
            {importStatus}
          </div>
        )}
      </div>

      {/* JSON Backup & Restore Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EAE6DC]">
        <span className="text-[11px] font-mono text-[#7A7972]">Local Storage Sync</span>
        <div className="flex items-center gap-2">
          {/* Quick JSON Export Button */}
          <button
            onClick={downloadBackupFile}
            className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] text-xs font-mono active:scale-[0.98]"
            title="Download study sessions JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-[#2E4036]" />
            <span>Export Backup</span>
          </button>

          {/* Quick JSON Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] text-xs font-mono active:scale-[0.98]"
            title="Import and restore sessions JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-[#2E4036]" />
            <span>Restore JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};