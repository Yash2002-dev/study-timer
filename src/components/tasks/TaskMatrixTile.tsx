import React, { useState } from 'react';
import { TaskTag } from '../../types/tasks';
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
    <div className="organic-card p-6 relative flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#EAE6DC] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE5] flex items-center justify-center text-[#2E4036]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#1A1A1A] flex items-center gap-2">
                Daily Goal & Session Matrix
              </h2>
              <p className="text-[11px] text-[#5F5E58]">Target tracking & contextual focus tagging</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-[#EAE6DC] px-2.5 py-1 rounded-xl">
            <Flame className="w-3.5 h-3.5 text-[#8C5A41]" />
            <span className="text-[#5F5E58]">Goal:</span>
            <span className="text-[#1A1A1A] font-semibold tabular-nums">Daily Target</span>
          </div>
        </div>

        {/* Daily Goal Progress Bar Section */}
        <div className="bg-[#F2EFE9] rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2E4036]" />
              Daily Study Target:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#5F5E58] tabular-nums">
                <strong className="text-[#1A1A1A] font-semibold">{completedHours}h {completedMins}m</strong>
                <span className="text-[#7A7972]"> / {Math.round(targetMinutes / 60)}h</span>
              </span>

              {/* Quick Target Adjusters */}
              {onUpdateTargetMinutes && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => onUpdateTargetMinutes(Math.max(30, targetMinutes - 30))}
                    title="Decrease Target by 30m"
                    className="btn-tactile w-5 h-5 rounded-lg bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] flex items-center justify-center text-xs font-mono active:scale-[0.98]"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdateTargetMinutes(targetMinutes + 30)}
                    title="Increase Target by 30m"
                    className="btn-tactile w-5 h-5 rounded-lg bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] flex items-center justify-center text-xs font-mono active:scale-[0.98]"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar with Zero CLS - Solid Moss Fill */}
          <div className="w-full bg-[#E6E2D8] rounded-full h-2.5 overflow-hidden p-0 mb-2">
            <div
              className="h-full rounded-full bg-[#2E4036] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#5F5E58]">
            <span className="tabular-nums">{progressPercent}% of target achieved</span>
            <span className="tabular-nums">{completedSessionsCount} sessions completed</span>
          </div>
        </div>

        {/* Task Tag Matrix Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#2E4036]" />
              Assigned Focus Tag:
            </span>

            {!isAddingTag && (
              <button
                onClick={() => setIsAddingTag(true)}
                className="btn-tactile text-[11px] font-mono text-[#2E4036] hover:text-[#1B2721] flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#EAE6DC] hover:bg-[#DDD8CB] active:scale-[0.98]"
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
                className="flex-1 bg-[#F2EFE9] rounded-xl px-3 py-1.5 text-xs text-[#1A1A1A] placeholder-[#7A7972] focus:outline-none focus:ring-1 focus:ring-[#2E4036]"
              />
              <button
                type="submit"
                className="btn-tactile px-3 py-1.5 bg-[#2E4036] hover:bg-[#24332B] text-[#FAF9F5] rounded-xl text-xs font-medium active:scale-[0.98]"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTag(false)}
                className="btn-tactile px-2.5 py-1.5 bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#5F5E58] rounded-xl text-xs active:scale-[0.98]"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Tag Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tags.map((t) => {
              const isSelected = activeTag.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTag(t)}
                  className={`btn-tactile flex items-center justify-between p-2.5 rounded-xl text-xs transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#2E4036] text-[#FAF9F5] shadow-sm'
                      : 'bg-[#F2EFE9] hover:bg-[#ECE8DF] text-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#FAF9F5' : t.color }}
                    />
                    <span className="font-medium truncate">{t.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-[#FAF9F5]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};