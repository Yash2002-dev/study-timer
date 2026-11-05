import { useState, useEffect } from 'react';
import { useTimerEngine } from './hooks/useTimerEngine';
import { useSoundscape } from './hooks/useSoundscape';
import { useStudyAnalytics } from './hooks/useStudyAnalytics';
import { TimerDial } from './components/timer/TimerDial';
import { SoundscapeMixer } from './components/audio/SoundscapeMixer';
import { TaskMatrixTile, PRESET_TAGS } from './components/tasks/TaskMatrixTile';
import { AnalyticsTile } from './components/analytics/AnalyticsTile';
import { ZenOverlay } from './components/zen/ZenOverlay';
import { TaskTag } from './types/tasks';
import { TimerMode } from './types/timer';
import { 
  Clock, 
  Flame, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Settings2,
  CheckCircle2,
  Keyboard
} from 'lucide-react';

export default function App() {
  const [activeTag, setActiveTag] = useState<TaskTag>(PRESET_TAGS[0]);
  const [targetMinutes, setTargetMinutes] = useState<number>(240); // 4 hours
  const [isZenModeOpen, setIsZenModeOpen] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<number>(45);
  const [lastNotification, setLastNotification] = useState<string>('');

  const analytics = useStudyAnalytics();

  const timer = useTimerEngine({
    initialMode: 'pomodoro',
    onSessionComplete: (completedMode, duration) => {
      // 1. Log session to persistent analytics with assigned tag & timestamp
      analytics.logSession({
        durationSeconds: duration,
        tagId: activeTag.id,
        tagLabel: activeTag.label,
        tagColor: activeTag.color,
        mode: completedMode,
      });

      // 2. Notification banner
      setLastNotification(
        `🎉 Session completed! ${activeTag.label} • ${completedMode.toUpperCase()} (${Math.floor(
          duration / 60
        )} min) at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
    },
  });

  const soundscape = useSoundscape();

  const {
    mode,
    isRunning,
    start,
    pause,
    setMode,
    setCustomMinutes,
  } = timer;

  // Global Keyboard Shortcuts (Space = Play/Pause, F = Zen Mode, M = Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
          pause();
        } else {
          start();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsZenModeOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, start, pause]);

  const modes: { id: TimerMode; label: string; sub: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro', sub: '25 min' },
    { id: 'shortBreak', label: 'Short Break', sub: '5 min' },
    { id: 'longBreak', label: 'Long Break', sub: '15 min' },
    { id: 'flowmodoro', label: 'Flowmodoro', sub: 'Count-Up' },
    { id: 'custom', label: 'Custom', sub: `${customInput} min` },
  ];

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className={`w-full max-w-7xl space-y-6 transition-all duration-500 ease-out ${isZenModeOpen ? 'opacity-0 pointer-events-none scale-[0.98]' : 'opacity-100 scale-100'}`}>
        {/* Top Obsidian Navigation Header */}
        <header className="bento-card rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-500/10">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Masterpiece Study Timer
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  Obsidian Bento v4.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Tactile Deep Work Hub with Productivity Analytics</p>
            </div>
          </div>

          {/* Quick Header Utility Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Streak Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-850 border border-white/[0.06] text-xs font-mono text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span className="font-bold tabular-nums">{analytics.streakDays}d Streak</span>
            </div>

            {/* Zen Mode Button */}
            <button
              onClick={() => setIsZenModeOpen(true)}
              className="btn-tactile flex items-center gap-1.5 px-3 py-2 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all active:scale-[0.98] text-xs font-mono"
              title="Fullscreen Zen Mode [F]"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Zen Mode [F]</span>
            </button>

            {/* Sound Mute Button */}
            <button
              onClick={soundscape.toggleMute}
              className={`btn-tactile flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all active:scale-[0.98] ${
                soundscape.isMuted
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-obsidian-850 border-white/[0.06] text-slate-300 hover:text-white hover:border-white/20'
              }`}
              title="Mute Ambient Sound [M]"
            >
              {soundscape.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">[M]</span>
            </button>
          </div>
        </header>

        {/* 12-Column Obsidian Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Bento Tile 1: Hero Timer Dial (Col Span 7 on Desktop) */}
          <section className="lg:col-span-7 bento-card rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Ambient Background Aura */}
            <div 
              className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-700 opacity-60"
              style={{
                backgroundColor:
                  mode === 'shortBreak' || mode === 'longBreak'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : mode === 'flowmodoro'
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'rgba(99, 102, 241, 0.18)',
              }}
            />

            <div>
              {/* Mode Selector Pill Buttons */}
              <nav aria-label="Interval Modes" className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6 relative z-10">
                {modes.map((m) => {
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`btn-tactile flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all duration-200 border text-center active:scale-[0.98] ${
                        isActive
                          ? 'bg-obsidian-800 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/15 scale-[1.02]'
                          : 'bg-obsidian-850/60 border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/15'
                      }`}
                    >
                      <span className="text-xs font-semibold">{m.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">{m.sub}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Custom Interval Configuration Input */}
              {mode === 'custom' && (
                <div className="mb-6 p-3 rounded-2xl bg-obsidian-850 border border-white/[0.06] flex items-center justify-between text-xs relative z-10">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-indigo-400" />
                    Configure Custom Duration:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="240"
                      value={customInput}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setCustomInput(val);
                        setCustomMinutes(val);
                      }}
                      className="w-16 bg-obsidian-900 border border-white/[0.06] rounded-lg px-2 py-1 text-center font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
                    />
                    <span className="text-slate-500">mins</span>
                  </div>
                </div>
              )}

              {/* Central Glowing Circular SVG Timer Dial */}
              <div className="py-2 flex justify-center">
                <TimerDial
                  timer={timer}
                  activeTagLabel={activeTag.label}
                  activeTagColor={activeTag.color}
                  onToggleZenMode={() => setIsZenModeOpen(true)}
                  size={290}
                />
              </div>
            </div>

            {/* Notification Ribbon */}
            {lastNotification && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{lastNotification}</span>
              </div>
            )}
          </section>

          {/* Bento Tile 2: Ambient Soundscape Mixer (Col Span 5 on Desktop) */}
          <section className="lg:col-span-5 h-full">
            <SoundscapeMixer soundscape={soundscape} />
          </section>

          {/* Bento Tile 3: Daily Goal & Task Session Tag Matrix (Col Span 7) */}
          <section className="lg:col-span-7">
            <TaskMatrixTile
              activeTag={activeTag}
              onSelectTag={setActiveTag}
              completedSecondsToday={analytics.completedTodaySeconds}
              targetMinutes={targetMinutes}
              onUpdateTargetMinutes={setTargetMinutes}
              completedSessionsCount={analytics.completedTodayCount}
            />
          </section>

          {/* Bento Tile 4: Weekly Bento Analytics & Activity Heatmap (Col Span 5) */}
          <section className="lg:col-span-5">
            <AnalyticsTile analytics={analytics} />
          </section>
        </div>

        {/* Global Keyboard Shortcut Bar */}
        <footer className="bento-card border border-white/[0.06] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tactile Controls:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-obsidian-850 border border-white/[0.06] text-slate-300">Space</kbd> Start / Pause</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-obsidian-850 border border-white/[0.06] text-slate-300">F</kbd> Zen Fullscreen</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-obsidian-850 border border-white/[0.06] text-slate-300">M</kbd> Master Mute</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-obsidian-850 border border-white/[0.06] text-slate-300">Esc</kbd> Exit Zen</span>
          </div>
        </footer>

        {/* Global Fullscreen Zen Mode Overlay */}
        <ZenOverlay
          isOpen={isZenModeOpen}
          onClose={() => setIsZenModeOpen(false)}
          timer={timer}
          soundscape={soundscape}
          activeTagLabel={activeTag.label}
          activeTagColor={activeTag.color}
        />
      </div>
    </div>
  );
}
