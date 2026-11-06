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
    { id: 'pomodoro', label: 'Pomodoro', sub: '25 min' },
    { id: 'shortBreak', label: 'Short Break', sub: '5 min' },
    { id: 'longBreak', label: 'Long Break', sub: '15 min' },
    { id: 'flowmodoro', label: 'Flowmodoro', sub: 'Count-Up' },
    { id: 'custom', label: 'Custom', sub: `${customInput} min` },
  ];

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#1A1A1A] flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#C8D7CE]/50 overflow-x-hidden">
      <div className={`w-full max-w-7xl space-y-6 transition-all duration-500 ease-out ${isZenModeOpen ? 'opacity-0 pointer-events-none scale-[0.98]' : 'opacity-100 scale-100'}`}>
        {/* Top Organic Navigation Header - Flat, Zero Borders */}
        <header className="organic-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2ECE5] flex items-center justify-center text-[#2E4036]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#1A1A1A]">
                  Masterpiece Study Timer
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-[#EAE6DC] text-[#5F5E58] font-mono">
                  Organic Tech v5.0
                </span>
              </div>
              <p className="text-xs text-[#5F5E58]">Clinical Boutique Productivity Hub • High-Accuracy Focus Engine</p>
            </div>
          </div>

          {/* Quick Header Utility Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Streak Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAE6DC] text-xs font-mono text-[#1A1A1A]">
              <Flame className="w-3.5 h-3.5 text-[#8C5A41] fill-current" />
              <span className="font-semibold tabular-nums">{analytics.streakDays}d Streak</span>
            </div>

            {/* Zen Mode Button */}
            <button
              onClick={() => setIsZenModeOpen(true)}
              className="btn-tactile flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] transition-all active:scale-[0.98] text-xs font-mono"
              title="Fullscreen Zen Mode [F]"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#2E4036]" />
              <span>Zen Mode [F]</span>
            </button>

            {/* Sound Mute Button */}
            <button
              onClick={soundscape.toggleMute}
              className={`btn-tactile flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all active:scale-[0.98] ${
                soundscape.isMuted
                  ? 'bg-[#F4ECE7] text-[#8C5A41]'
                  : 'bg-[#EAE6DC] text-[#1A1A1A] hover:bg-[#DDD8CB]'
              }`}
              title="Mute Ambient Sound [M]"
            >
              {soundscape.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">[M]</span>
            </button>
          </div>
        </header>

        {/* 12-Column Organic Bento Grid - Zero Borders, Generous Whitespace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Bento Tile 1: Hero Timer Dial (Col Span 7 on Desktop) */}
          <section className="lg:col-span-7 organic-card p-6 sm:p-8 relative flex flex-col justify-between">
            <div>
              {/* Mode Selector Pill Buttons */}
              <nav aria-label="Interval Modes" className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6 relative z-10">
                {modes.map((m) => {
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`btn-tactile flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all duration-200 text-center active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#2E4036] text-[#FAF9F5] shadow-sm'
                          : 'bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#5F5E58] hover:text-[#1A1A1A]'
                      }`}
                    >
                      <span className="text-xs font-medium">{m.label}</span>
                      <span className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-[#FAF9F5]/80' : 'text-[#7A7972]'}`}>
                        {m.sub}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Custom Interval Configuration Input */}
              {mode === 'custom' && (
                <div className="mb-6 p-3 rounded-2xl bg-[#F2EFE9] flex items-center justify-between text-xs relative z-10">
                  <span className="text-[#5F5E58] flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-[#2E4036]" />
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
                      className="w-16 bg-[#FAF9F5] rounded-lg px-2 py-1 text-center font-mono text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#2E4036] tabular-nums"
                    />
                    <span className="text-[#7A7972]">mins</span>
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
                  size={290}
                />
              </div>
            </div>

            {/* Notification Ribbon */}
            {lastNotification && (
              <div className="mt-4 p-3 rounded-2xl bg-[#E2ECE5] text-[#2E4036] text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E4036] shrink-0" />
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

        {/* Global Keyboard Shortcut Bar - Flat, Zero Borders */}
        <footer className="organic-card p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#5F5E58]">
          <div className="flex items-center gap-1.5 text-[#1A1A1A]">
            <Keyboard className="w-3.5 h-3.5 text-[#2E4036]" />
            <span className="font-medium">Tactile Shortcuts:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#EAE6DC] text-[#1A1A1A]">Space</kbd> Start / Pause</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#EAE6DC] text-[#1A1A1A]">F</kbd> Zen Fullscreen</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#EAE6DC] text-[#1A1A1A]">M</kbd> Master Mute</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#EAE6DC] text-[#1A1A1A]">Esc</kbd> Exit Zen</span>
          </div>
        </footer>
      </div>

      {/* Global Fullscreen Zen Mode Overlay - Clean Clinical Sanctuary */}
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