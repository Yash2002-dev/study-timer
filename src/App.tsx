import { useState, useEffect } from 'react';
import { useTimerEngine } from './hooks/useTimerEngine';
import { useSoundscape } from './hooks/useSoundscape';
import { useStudyAnalytics } from './hooks/useStudyAnalytics';
import { useTheme } from './hooks/useTheme';
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
  Keyboard,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [activeTag, setActiveTag] = useState<TaskTag>(PRESET_TAGS[0]);
  const [targetMinutes, setTargetMinutes] = useState<number>(240); // 4 hours
  const [isZenModeOpen, setIsZenModeOpen] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<number>(45);
  const [lastNotification, setLastNotification] = useState<string>('');

  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
        `Session completed: ${activeTag.label} • ${completedMode.toUpperCase()} (${Math.floor(
          duration / 60
        )} min) logged.`
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
    { id: 'pomodoro', label: 'Pomodoro', sub: '25m' },
    { id: 'shortBreak', label: 'Short Break', sub: '5m' },
    { id: 'longBreak', label: 'Long Break', sub: '15m' },
    { id: 'flowmodoro', label: 'Flowmodoro', sub: 'Count-Up' },
    { id: 'custom', label: 'Custom', sub: `${customInput}m` },
  ];

  return (
    <div className="min-h-screen bg-[#F2F0E9] dark:bg-[#0D0D11] text-[#1A1A1A] dark:text-[#EDEDED] flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#2E4036]/15 dark:selection:bg-emerald-500/20 selection:text-[#1A1A1A] dark:selection:text-[#EDEDED] overflow-x-hidden transition-colors duration-300">
      <div className={`w-full max-w-7xl space-y-6 transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isZenModeOpen ? 'opacity-0 pointer-events-none scale-[0.99]' : 'opacity-100 scale-100'}`}>
        {/* Top Navigation Header - Adaptive Light / Dark */}
        <header className="organic-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2ECE5] dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 flex items-center justify-center text-[#2E4036] dark:text-emerald-400 shrink-0 transition-colors duration-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#1A1A1A] dark:text-[#EDEDED] transition-colors duration-300">
                  Masterpiece Study Timer
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-[#EAE6DC] dark:bg-[#23232C] text-[#5F5E58] dark:text-[#A1A1AA] dark:border dark:border-white/[0.08] font-mono tracking-wide transition-colors duration-300">
                  Precision v5.5
                </span>
              </div>
              <p className="text-xs text-[#5F5E58] dark:text-[#A1A1AA] transition-colors duration-300">
                {isDark ? 'Obsidian Noir Focus Station' : 'Clinical Boutique Productivity Hub'} • Drift-Free Precision Engine
              </p>
            </div>
          </div>

          {/* Quick Header Utility Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Streak Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAE6DC] dark:bg-[#23232C] dark:border dark:border-white/[0.08] text-xs font-mono text-[#1A1A1A] dark:text-[#EDEDED] transition-colors duration-300">
              <Flame className="w-3.5 h-3.5 text-[#8C5A41] dark:text-amber-400 fill-current" />
              <span className="font-semibold tabular-nums">{analytics.streakDays}d Streak</span>
            </div>

            {/* Seamless Light/Dark Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="btn-precision flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:border dark:border-white/[0.08] text-[#1A1A1A] dark:text-[#EDEDED] text-xs font-mono transition-colors duration-300"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline ml-1.5">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#2E4036]" />
                  <span className="hidden md:inline ml-1.5">Dark</span>
                </>
              )}
            </button>

            {/* Zen Mode Button */}
            <button
              onClick={() => setIsZenModeOpen(true)}
              aria-label="Enter fullscreen Zen focus mode [F]"
              className="btn-precision flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:border dark:border-white/[0.08] text-[#1A1A1A] dark:text-[#EDEDED] text-xs font-mono transition-colors duration-300"
              title="Fullscreen Zen Mode [F]"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#2E4036] dark:text-emerald-400" />
              <span className="hidden sm:inline">Zen [F]</span>
            </button>

            {/* Sound Mute Button */}
            <button
              onClick={soundscape.toggleMute}
              aria-label={soundscape.isMuted ? 'Unmute ambient sound [M]' : 'Mute ambient sound [M]'}
              className={`btn-precision flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-colors duration-300 ${
                soundscape.isMuted
                  ? 'bg-[#F4ECE7] dark:bg-rose-500/15 dark:border dark:border-rose-500/30 text-[#8C5A41] dark:text-rose-300'
                  : 'bg-[#EAE6DC] text-[#1A1A1A] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:text-[#EDEDED] dark:hover:bg-[#2C2C38] dark:border dark:border-white/[0.08]'
              }`}
              title="Mute Ambient Sound [M]"
            >
              {soundscape.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">[M]</span>
            </button>
          </div>
        </header>

        {/* 12-Column Responsive Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Bento Tile 1: Hero Precision Timer Dial (Col Span 7 on Desktop) */}
          <section className="lg:col-span-7 organic-card p-6 sm:p-8 relative flex flex-col justify-between transition-colors duration-300">
            <div>
              {/* Mode Selector Pill Buttons with Magnetic Hover */}
              <nav aria-label="Interval Modes" className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6 relative z-10">
                {modes.map((m) => {
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      aria-pressed={isActive}
                      aria-label={`Select ${m.label} mode, duration ${m.sub}`}
                      className={`btn-precision flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl text-center transition-colors duration-300 ${
                        isActive
                          ? isDark
                            ? 'bg-emerald-500 text-[#09090C] font-semibold shadow-md shadow-emerald-500/20'
                            : 'bg-[#2E4036] text-[#FAF9F5] shadow-sm'
                          : 'bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#5F5E58] hover:text-[#1A1A1A] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-[#A1A1AA] dark:hover:text-[#EDEDED] dark:border dark:border-white/[0.08]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{m.label}</span>
                      <span className={`text-[10px] font-mono mt-0.5 ${isActive ? isDark ? 'text-[#09090C]/80' : 'text-[#FAF9F5]/80' : 'text-[#7A7972] dark:text-[#71717A]'}`}>
                        {m.sub}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Custom Interval Configuration Input */}
              {mode === 'custom' && (
                <div className="mb-6 p-3 rounded-2xl bg-[#F2EFE9] dark:bg-[#121217] dark:border dark:border-white/[0.08] flex items-center justify-between text-xs relative z-10 transition-colors duration-300">
                  <span className="text-[#5F5E58] dark:text-[#A1A1AA] flex items-center gap-1.5 font-medium">
                    <Settings2 className="w-4 h-4 text-[#2E4036] dark:text-emerald-400" />
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
                      aria-label="Custom duration in minutes"
                      className="w-16 bg-[#FAF9F5] dark:bg-[#1E1E26] text-[#1A1A1A] dark:text-[#EDEDED] rounded-lg px-2 py-1 text-center font-mono tabular-nums dark:border dark:border-white/[0.1] focus:outline-none"
                    />
                    <span className="text-[#7A7972] dark:text-[#71717A] font-mono">mins</span>
                  </div>
                </div>
              )}

              {/* Central Clean Circular SVG Timer Dial */}
              <div className="py-2 flex justify-center">
                <TimerDial
                  timer={timer}
                  activeTagLabel={activeTag.label}
                  activeTagColor={activeTag.color}
                  onToggleZenMode={() => setIsZenModeOpen(true)}
                  size={310}
                />
              </div>
            </div>

            {/* Notification Ribbon */}
            {lastNotification && (
              <div 
                className="mt-4 p-3 rounded-2xl bg-[#E2ECE5] dark:bg-emerald-500/15 dark:border dark:border-emerald-500/30 text-[#2E4036] dark:text-emerald-300 text-xs font-mono flex items-center gap-2 transition-colors duration-300" 
                role="status"
              >
                <CheckCircle2 className="w-4 h-4 text-[#2E4036] dark:text-emerald-400 shrink-0" />
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

        {/* Global Keyboard Shortcut Bar - Adaptive Light / Dark */}
        <footer className="organic-card p-3.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#5F5E58] dark:text-[#A1A1AA] transition-colors duration-300">
          <div className="flex items-center gap-1.5 text-[#1A1A1A] dark:text-[#EDEDED] font-sans">
            <Keyboard className="w-3.5 h-3.5 text-[#2E4036] dark:text-emerald-400" />
            <span className="font-semibold">Precision Controls:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#EAE6DC] dark:bg-[#23232C] dark:border dark:border-white/[0.08] text-[#1A1A1A] dark:text-[#EDEDED]">Space</kbd> Start / Pause</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#EAE6DC] dark:bg-[#23232C] dark:border dark:border-white/[0.08] text-[#1A1A1A] dark:text-[#EDEDED]">F</kbd> Zen Sanctuary</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#EAE6DC] dark:bg-[#23232C] dark:border dark:border-white/[0.08] text-[#1A1A1A] dark:text-[#EDEDED]">M</kbd> Master Mute</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#EAE6DC] dark:bg-[#23232C] dark:border dark:border-white/[0.08] text-[#1A1A1A] dark:text-[#EDEDED]">Esc</kbd> Exit Zen</span>
          </div>
        </footer>
      </div>

      {/* Global Fullscreen Zen Mode Overlay - Adaptive Light & Dark */}
      <ZenOverlay
        isOpen={isZenModeOpen}
        onClose={() => setIsZenModeOpen(false)}
        timer={timer}
        soundscape={soundscape}
        activeTagLabel={activeTag.label}
        activeTagColor={activeTag.color}
      />
    </div>
  );
}