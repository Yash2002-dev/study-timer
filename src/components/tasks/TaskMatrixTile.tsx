import React, { useState } from 'react';
import { TaskTag } from '../../types/tasks';
import { 
  Target, 
  Flame, 
  Tag, 
  Plus, 
  Check, 
  Clock,
  Sparkles
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
  { id: 'deep-work', label: 'Deep Work', color: '#6366F1' },
  { id: 'reading', label: 'Reading', color: '#10B981' },
  { id: 'revision', label: 'Revision', color: '#F59E0B' },
  { id: 'coding', label: 'Coding', color: '#06B6D4' },
  { id: 'writing', label: 'Writing', color: '#EC4899' },
  { id: 'design', label: 'Creative', color: '#8B5CF6' },
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

    const colors = ['#6366F1', '#10B981', '#06B6D4', '#F59E0B', '#EC4899', '#8B5CF6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

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
    <div className="bg-obsidian-850 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Daily Goal & Session Matrix
              </h2>
              <p className="text-[11px] text-slate-400">Target tracking & contextual focus tagging</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-obsidian-900 border border-white/5 px-2.5 py-1 rounded-xl">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Streak:</span>
            <span className="text-amber-300 font-bold">1 Day</span>
          </div>
        </div>

        {/* Daily Goal Progress Bar Section */}
        <div className="bg-obsidian-900/80 border border-white/5 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Daily Study Target:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300">
                <strong className="text-white font-bold">{completedHours}h {completedMins}m</strong>
                <span className="text-slate-500"> / {Math.round(targetMinutes / 60)}h</span>
              </span>

              {/* Quick Target Adjusters */}
              {onUpdateTargetMinutes && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => onUpdateTargetMinutes(Math.max(30, targetMinutes - 30))}
                    title="Decrease Target by 30m"
                    className="w-5 h-5 rounded bg-obsidian-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-mono border border-white/5"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdateTargetMinutes(targetMinutes + 30)}
                    title="Increase Target by 30m"
                    className="w-5 h-5 rounded bg-obsidian-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-mono border border-white/5"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar with Zero CLS */}
          <div className="w-full bg-obsidian-950 border border-white/5 rounded-full h-3 overflow-hidden p-0.5 mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{progressPercent}% of target achieved</span>
            <span>{completedSessionsCount} sessions completed</span>
          </div>
        </div>

        {/* Task Tag Matrix Selection */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Active Session Tag:
            </span>
            <button
              onClick={() => setIsAddingTag(!isAddingTag)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition-colors"
            >
              <Plus className="w-3 h-3" />
              {isAddingTag ? 'Cancel' : 'Add Tag'}
            </button>
          </div>

          {/* Tag Add Input Form */}
          {isAddingTag && (
            <form onSubmit={handleCreateTag} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Physics Chapter 3"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                maxLength={25}
                className="flex-1 bg-obsidian-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 shadow-md"
              >
                <Check className="w-3 h-3" />
                Save
              </button>
            </form>
          )}

          {/* Tag Pills Grid */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = activeTag.id === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => onSelectTag(tag)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border active:scale-95 ${
                    isSelected
                      ? 'bg-obsidian-800 border-indigo-500/50 text-white shadow-md shadow-indigo-500/10 scale-[1.02]'
                      : 'bg-obsidian-900/70 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.label}</span>
                  {isSelected && <Sparkles className="w-2.5 h-2.5 text-indigo-400 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

