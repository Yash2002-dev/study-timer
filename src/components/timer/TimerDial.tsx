import React from 'react';
import { TimerMode, TimerEngine } from '../../types/timer';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  PlusCircle, 
  SkipForward, 
  Maximize2 
} from 'lucide-react';

interface TimerDialProps {
  timer: TimerEngine;
  activeTagLabel?: string;
  activeTagColor?: string;
  onToggleZenMode?: () => void;
  size?: number; // default 290
}

export const TimerDial: React.FC<TimerDialProps> = ({
  timer,
  activeTagLabel = 'Deep Work',
  activeTagColor = '#6366F1',
  onToggleZenMode,
  size = 290,
}) => {
  const {
    mode,
    isRunning,
    progressRatio,
    formattedTime,
    start,
    pause,
    reset,
    extendFiveMinutes,
    skip,
  } = timer;

  // SVG Geometry
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  // Progress fills up clockwise smoothly
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progressRatio)));

  // Mode-based gradient and glow accents
  const getThemeColors = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'shortBreak':
      case 'longBreak':
        return {
          gradientStart: '#10B981',
          gradientEnd: '#14B8A6',
          glow: 'rgba(16, 185, 129, 0.40)',
          innerGlow: 'rgba(20, 184, 166, 0.25)',
          badgeBg: 'bg-emerald-500/15',
          badgeText: 'text-emerald-300',
          badgeBorder: 'border-emerald-500/30',
          dotBg: 'bg-emerald-400',
        };
      case 'flowmodoro':
        return {
          gradientStart: '#06B6D4',
          gradientEnd: '#3B82F6',
          glow: 'rgba(6, 182, 212, 0.40)',
          innerGlow: 'rgba(59, 130, 246, 0.25)',
          badgeBg: 'bg-cyan-500/15',
          badgeText: 'text-cyan-300',
          badgeBorder: 'border-cyan-500/30',
          dotBg: 'bg-cyan-400',
        };
      case 'custom':
        return {
          gradientStart: '#A855F7',
          gradientEnd: '#EC4899',
          glow: 'rgba(168, 85, 247, 0.40)',
          innerGlow: 'rgba(236, 72, 153, 0.25)',
          badgeBg: 'bg-purple-500/15',
          badgeText: 'text-purple-300',
          badgeBorder: 'border-purple-500/30',
          dotBg: 'bg-purple-400',
        };
      case 'pomodoro':
      default:
        return {
          gradientStart: '#6366F1',
          gradientEnd: '#8B5CF6',
          glow: 'rgba(99, 102, 241, 0.45)',
          innerGlow: 'rgba(139, 92, 246, 0.25)',
          badgeBg: 'bg-indigo-500/15',
          badgeText: 'text-indigo-300',
          badgeBorder: 'border-indigo-500/30',
          dotBg: 'bg-indigo-400',
        };
    }
  };

  const theme = getThemeColors(mode);
  const gradientId = `timer-gradient-${mode}`;

  const modeLabel =
    mode === 'pomodoro'
      ? 'Focus Session'
      : mode === 'shortBreak'
      ? 'Short Break'
      : mode === 'longBreak'
      ? 'Long Break'
      : mode === 'flowmodoro'
      ? 'Flowmodoro Stopwatch'
      : 'Custom Interval';

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      {/* Central Dial Housing with Radial Glow Accents */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-500"
        style={{ width: size, height: size }}
      >
        {/* Subtle Outer Radial Glow Accent */}
        <div 
          className={`absolute -inset-8 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
            isRunning ? 'opacity-85 animate-breathing-glow' : 'opacity-20'
          }`}
          style={{
            background: `radial-gradient(circle, ${theme.glow} 0%, rgba(0,0,0,0) 70%)`,
          }}
        />

        {/* Subtle Inner Core Bloom Glow Accent */}
        <div 
          className={`absolute -inset-2 rounded-full blur-xl pointer-events-none transition-all duration-700 ${
            isRunning ? 'opacity-90' : 'opacity-15'
          }`}
          style={{
            background: `radial-gradient(circle, ${theme.innerGlow} 0%, rgba(0,0,0,0) 65%)`,
          }}
        />

        {/* SVG Progress Circle */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] relative z-10"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.gradientStart} />
              <stop offset="100%" stopColor={theme.gradientEnd} />
            </linearGradient>

            <filter id="dial-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Static Track Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Foreground Animated Progress Ring with Smooth Stroke Dashoffset */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={isRunning ? 'url(#dial-glow)' : undefined}
            style={{
              transition: 'stroke-dashoffset 650ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Inner Content Container - Zero CLS */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
          {/* Status Badge */}
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText} shadow-sm`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? `${theme.dotBg} animate-pulse` : 'bg-slate-500'
                }`}
              />
              {isRunning ? modeLabel.toUpperCase() : 'PAUSED'}
            </span>
          </div>

          {/* Tabular Monospace Digits - Zero Layout Shift (CLS = 0.00) */}
          <div 
            className="flex items-center justify-center min-w-[7ch] w-full mb-1"
            aria-live="polite"
          >
            <span className="timer-digits text-5xl sm:text-6xl font-black text-white tracking-tight tabular-nums select-none drop-shadow-md">
              {formattedTime}
            </span>
          </div>

          {/* Active Task Tag Badge */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-obsidian-850/90 border border-white/[0.06] px-2.5 py-0.5 rounded-full mb-1 shadow-sm">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: activeTagColor }}
            />
            <span className="truncate max-w-[130px] font-sans">{activeTagLabel}</span>
          </div>

          {/* Progress Percentage */}
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {mode === 'flowmodoro' ? 'Stopwatch active' : `${Math.round(progressRatio * 100)}% elapsed`}
          </span>
        </div>
      </div>

      {/* Tactile Control Buttons Row - Smooth Micro-Interactions (active:scale-[0.98]) */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
        {/* Primary Play/Pause Button */}
        <button
          onClick={isRunning ? pause : start}
          className={`btn-tactile flex items-center justify-center gap-2 px-7 h-12 rounded-2xl font-semibold text-sm transition-all duration-180 active:scale-[0.98] min-w-[130px] shadow-lg ${
            isRunning
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-amber-500/10'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 border border-indigo-400/40'
          }`}
          title={isRunning ? 'Pause Timer [Space]' : 'Start Timer [Space]'}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Start</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={reset}
          title="Reset Timer"
          className="btn-tactile flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.06] hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-[0.98] text-xs font-medium shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>

        {/* Quick +5 Minutes Button */}
        {mode !== 'flowmodoro' && (
          <button
            onClick={extendFiveMinutes}
            title="Add 5 Minutes to Session"
            className="btn-tactile flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.06] hover:border-indigo-500/40 text-indigo-300 hover:text-indigo-200 transition-all active:scale-[0.98] text-xs font-medium shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+5m</span>
          </button>
        )}

        {/* Skip to Next Mode */}
        <button
          onClick={skip}
          title="Skip to Next Mode"
          className="btn-tactile flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.06] hover:border-white/20 text-slate-400 hover:text-slate-200 transition-all active:scale-[0.98] text-xs font-medium shadow-sm"
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip</span>
        </button>

        {/* Zen Mode Button */}
        {onToggleZenMode && (
          <button
            onClick={onToggleZenMode}
            title="Enter Zen Fullscreen Mode [F]"
            className="btn-tactile flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all active:scale-[0.98] text-xs font-medium shadow-sm"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Zen Mode</span>
          </button>
        )}
      </div>
    </div>
  );
};
