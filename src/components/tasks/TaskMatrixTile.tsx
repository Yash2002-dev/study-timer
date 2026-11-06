import React, { useState } from 'react';
import { TaskTag } from '../../types/tasks';
import { useTheme } from '../../hooks/useTheme';
import { 
  Target, 
  Flame, 
  Tag, 
  Plus, 
  Check, 
  Clock
} from 'lucide-react';

interface TaskMatrixTileProps {
  activeTag: TaskTag;
  onSelectTag: (tag: TaskTag) => void;
  completedSecondsToday: number;
  targetMinutes?: number;
  onUpdateTargetMinutes?: (minutes: number) => void;
  completedSessionsCount?: number;
}

export const PRESET_TAGS: TaskTag[] = [
  { id: 'deep-work', label: 'Deep Work', color: '#2E4036' },
  { id: 'reading', label: 'Reading', color: '#4D6B5A' },
  { id: 'revision', label: 'Revision', color: '#8C5A41' },
  { id: 'coding', label: 'Engineering', color: '#3D5447' },
  { id: 'writing', label: 'Writing', color: '#A67C52' },
  { id: 'design', label: 'Research', color: '#5B7065' },
];

export const TaskMatrixTile: React.FC<TaskMatrixTileProps> = ({
  activeTag,
  onSelectTag,
  completedSecondsToday,
  targetMinutes = 240, // 4 hours
  onUpdateTargetMinutes,
  completedSessionsCount = 0,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [tags, setTags] = useState<TaskTag[]>(PRESET_TAGS);
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [newTagInput, setNewTagInput] = useState<string>('');

  const targetSeconds = targetMinutes * 60;
  const progressRatio = targetSeconds > 0 ? Math.min(1, completedSecondsToday / targetSeconds) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const completedHours = Math.floor(completedSecondsToday / 3600);
  const completedMins = Math.floor((completedSecondsToday % 3600) / 60);

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTagInput.trim();
    if (!trimmed) return;

    const organicColors = ['#2E4036', '#4D6B5A', '#8C5A41', '#A67C52', '#5B7065', '#6B5B52'];
    const randomColor = organicColors[Math.floor(Math.random() * organicColors.length)];

    const created: TaskTag = {
      id: `custom-${Date.now()}`,
      label: trimmed,
      color: randomColor,
    };

    setTags((prev) => [...prev, created]);
    onSelectTag(created);
    setNewTagInput('');
    setIsAddingTag(false);
  };

  return (
    <div className="organic-card p-6 relative flex flex-col justify-between transition-colors duration-300">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#EAE6DC] dark:border-white/[0.08] pb-4 mb-5 transition-colors duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE5] dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 flex items-center justify-center text-[#2E4036] dark:text-emerald-400 shrink-0 transition-colors duration-300">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#1A1A1A] dark:text-[#EDEDED] flex items-center gap-2 transition-colors duration-300">
                Daily Goal & Session Matrix
              </h2>
              <p className="text-[11px] text-[#5F5E58] dark:text-[#A1A1AA] transition-colors duration-300">
                Target tracking & contextual focus tagging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-[#EAE6DC] dark:bg-[#23232C] dark:border dark:border-white/[0.08] px-2.5 py-1 rounded-xl transition-colors duration-300">
            <Flame className="w-3.5 h-3.5 text-[#8C5A41] dark:text-amber-400" />
            <span className="text-[#5F5E58] dark:text-[#A1A1AA]">Target:</span>
            <span className="text-[#1A1A1A] dark:text-[#EDEDED] font-semibold tabular-nums">{Math.round(targetMinutes / 60)}h Daily</span>
          </div>
        </div>

        {/* Daily Goal Progress Bar Section */}
        <div className="bg-[#F2EFE9] dark:bg-[#121217] dark:border dark:border-white/[0.08] rounded-2xl p-4 mb-5 transition-colors duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#EDEDED] flex items-center gap-1.5 transition-colors duration-300">
              <Clock className="w-3.5 h-3.5 text-[#2E4036] dark:text-emerald-400" />
              Daily Study Target:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#5F5E58] dark:text-[#A1A1AA] tabular-nums transition-colors duration-300">
                <strong className="text-[#1A1A1A] dark:text-[#EDEDED] font-bold">{completedHours}h {completedMins}m</strong>
                <span className="text-[#7A7972] dark:text-[#71717A]"> / {Math.round(targetMinutes / 60)}h</span>
              </span>

              {/* Quick Target Adjusters with Magnetic Hover */}
              {onUpdateTargetMinutes && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => onUpdateTargetMinutes(Math.max(30, targetMinutes - 30))}
                    aria-label="Decrease daily study target by 30 minutes"
                    title="Decrease Target by 30m"
                    className="btn-precision w-5 h-5 rounded-lg bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] text-[#1A1A1A] dark:text-[#EDEDED] dark:border dark:border-white/[0.08] flex items-center justify-center text-xs font-mono transition-colors duration-300"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdateTargetMinutes(targetMinutes + 30)}
                    aria-label="Increase daily study target by 30 minutes"
                    title="Increase Target by 30m"
                    className="btn-precision w-5 h-5 rounded-lg bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] text-[#1A1A1A] dark:text-[#EDEDED] dark:border dark:border-white/[0.08] flex items-center justify-center text-xs font-mono transition-colors duration-300"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar with Zero CLS - Smooth EaseOutQuad Precision Animation */}
          <div className="w-full bg-[#E6E2D8] dark:bg-[#23232C] rounded-full h-2.5 overflow-hidden p-0 mb-2 transition-colors duration-300">
            <div
              className={`h-full rounded-full transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                isDark ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-[#2E4036]'
              }`}
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#5F5E58] dark:text-[#A1A1AA] transition-colors duration-300">
            <span className="tabular-nums">{progressPercent}% of target achieved</span>
            <span className="tabular-nums">{completedSessionsCount} sessions completed</span>
          </div>
        </div>

        {/* Task Tag Matrix Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#EDEDED] flex items-center gap-1.5 transition-colors duration-300">
              <Tag className="w-3.5 h-3.5 text-[#2E4036] dark:text-emerald-400" />
              Assigned Focus Tag:
            </span>

            {!isAddingTag && (
              <button
                onClick={() => setIsAddingTag(true)}
                aria-label="Create new custom focus session tag"
                className="btn-precision text-[11px] font-mono text-[#2E4036] dark:text-emerald-400 hover:text-[#1B2721] dark:hover:text-emerald-300 flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:border dark:border-white/[0.08] transition-colors duration-300"
              >
                <Plus className="w-3 h-3" />
                <span>New Tag</span>
              </button>
            )}
          </div>

          {/* New Tag Input Form */}
          {isAddingTag && (
            <form onSubmit={handleCreateTag} className="flex items-center gap-2 mb-3 animate-fadeIn">
              <input
                type="text"
                placeholder="Tag name (e.g., Organic Chem, Math)"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                autoFocus
                aria-label="New tag name"
                className="flex-1 bg-[#F2EFE9] dark:bg-[#1E1E26] text-[#1A1A1A] dark:text-[#EDEDED] placeholder-[#7A7972] dark:placeholder-[#71717A] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E4036] dark:focus:ring-emerald-400 dark:border dark:border-white/[0.1] transition-colors duration-300"
              />
              <button
                type="submit"
                className="btn-precision px-3 py-1.5 bg-[#2E4036] hover:bg-[#24332B] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-[#FAF9F5] dark:text-[#09090C] font-medium rounded-xl text-xs transition-colors duration-300"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTag(false)}
                className="btn-precision px-2.5 py-1.5 bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] text-[#5F5E58] dark:text-[#A1A1AA] dark:border dark:border-white/[0.08] rounded-xl text-xs transition-colors duration-300"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Tag Grid with Precision Magnetic Hover */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tags.map((t) => {
              const isSelected = activeTag.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTag(t)}
                  aria-pressed={isSelected}
                  aria-label={`Select tag ${t.label}`}
                  className={`btn-precision flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors duration-300 ${
                    isSelected
                      ? isDark
                        ? 'bg-emerald-500 text-[#09090C] font-semibold shadow-sm'
                        : 'bg-[#2E4036] text-[#FAF9F5] shadow-sm'
                      : 'bg-[#F2EFE9] hover:bg-[#ECE8DF] text-[#1A1A1A] dark:bg-[#121217] dark:hover:bg-[#181820] dark:text-[#EDEDED] dark:border dark:border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? isDark ? '#09090C' : '#FAF9F5' : t.color }}
                    />
                    <span className="font-semibold truncate">{t.label}</span>
                  </div>
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 shrink-0 ml-1 ${isDark ? 'text-[#09090C]' : 'text-[#FAF9F5]'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};