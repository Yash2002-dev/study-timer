import React from 'react';
import { TimerMode, TimerEngine } from '../../types/timer';
import { useTheme } from '../../hooks/useTheme';
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
  size?: number; // default 310
}

export const TimerDial: React.FC<TimerDialProps> = ({
  timer,
  activeTagLabel = 'Deep Work',
  activeTagColor = '#2E4036',
  onToggleZenMode,
  size = 310,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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

  // Precision Clinical Palette: Adaptive Light (Organic Moss) & Dark (Refined Emerald Obsidian)
  const getThemeColors = (currentMode: TimerMode, dark: boolean) => {
    if (dark) {
      switch (currentMode) {
        case 'shortBreak':
        case 'longBreak':
          return {
            strokeColor: '#F59E0B', // Amber
            trackColor: 'rgba(255, 255, 255, 0.08)',
            badgeBg: 'bg-amber-500/15 border border-amber-500/30',
            badgeText: 'text-amber-300',
            dotBg: 'bg-amber-400',
          };
        case 'flowmodoro':
          return {
            strokeColor: '#06B6D4', // Cyan
            trackColor: 'rgba(255, 255, 255, 0.08)',
            badgeBg: 'bg-cyan-500/15 border border-cyan-500/30',
            badgeText: 'text-cyan-300',
            dotBg: 'bg-cyan-400',
          };
        case 'custom':
          return {
            strokeColor: '#A855F7', // Purple
            trackColor: 'rgba(255, 255, 255, 0.08)',
            badgeBg: 'bg-purple-500/15 border border-purple-500/30',
            badgeText: 'text-purple-300',
            dotBg: 'bg-purple-400',
          };
        case 'pomodoro':
        default:
          return {
            strokeColor: '#10B981', // Vibrant Emerald
            trackColor: 'rgba(255, 255, 255, 0.08)',
            badgeBg: 'bg-emerald-500/15 border border-emerald-500/30',
            badgeText: 'text-emerald-300',
            dotBg: 'bg-emerald-400',
          };
      }
    }

    // Light Mode (Organic Tech clinical palette)
    switch (currentMode) {
      case 'shortBreak':
      case 'longBreak':
        return {
          strokeColor: '#8C5A41', // Warm Terracotta / Clay
          trackColor: '#E6E2D8',
          badgeBg: 'bg-[#F4ECE7]',
          badgeText: 'text-[#8C5A41]',
          dotBg: 'bg-[#8C5A41]',
        };
      case 'flowmodoro':
        return {
          strokeColor: '#4D6B5A', // Sage Moss
          trackColor: '#E6E2D8',
          badgeBg: 'bg-[#E7EFEA]',
          badgeText: 'text-[#3D5447]',
          dotBg: 'bg-[#4D6B5A]',
        };
      case 'custom':
        return {
          strokeColor: '#7C674F', // Ochre Sand
          trackColor: '#E6E2D8',
          badgeBg: 'bg-[#F4EFE7]',
          badgeText: 'text-[#7C674F]',
          dotBg: 'bg-[#7C674F]',
        };
      case 'pomodoro':
      default:
        return {
          strokeColor: '#2E4036', // Deep Organic Moss
          trackColor: '#E6E2D8',
          badgeBg: 'bg-[#E2ECE5]',
          badgeText: 'text-[#2E4036]',
          dotBg: 'bg-[#2E4036]',
        };
    }
  };

  const theme = getThemeColors(mode, isDark);

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
      {/* Central Dial Housing - Precision Digital Instrument */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* SVG Progress Circle */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] relative z-10"
          aria-hidden="true"
        >
          {/* Background Static Track Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={theme.trackColor}
            strokeWidth={strokeWidth}
            className="transition-colors duration-300"
          />

          {/* Foreground Animated Progress Ring with Smooth Precision Easing */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={theme.strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 950ms cubic-bezier(0.25, 0.46, 0.45, 0.94), stroke 300ms ease',
            }}
          />
        </svg>

        {/* Inner Content Container - Absolute Zero CLS (CLS = 0.00) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
          {/* Status Badge */}
          <div className="mb-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide transition-colors duration-300 ${theme.badgeBg} ${theme.badgeText}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? theme.dotBg : isDark ? 'bg-zinc-500' : 'bg-[#9E9D95]'
                }`}
              />
              {isRunning ? modeLabel.toUpperCase() : 'PAUSED'}
            </span>
          </div>

          {/* Massive, Ultra-Legible IBM Plex Mono Digits (Zero Jitter, Zero CLS) */}
          <div 
            className="flex items-center justify-center min-w-[8ch] w-full my-0.5"
            aria-live="polite"
            aria-atomic="true"
          >
            <span 
              className="timer-digits text-6xl sm:text-7xl font-semibold text-[#1A1A1A] dark:text-[#EDEDED] tracking-tight tabular-nums select-none transition-colors duration-300"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formattedTime}
            </span>
          </div>

          {/* Active Task Tag Badge */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#5F5E58] dark:text-[#A1A1AA] bg-[#EAE6DC] dark:bg-[#23232C] dark:border dark:border-white/[0.08] px-2.5 py-0.5 rounded-full mb-1 transition-colors duration-300">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: activeTagColor }}
            />
            <span className="truncate max-w-[140px] font-sans">{activeTagLabel}</span>
          </div>

          {/* Progress Percentage in IBM Plex Mono */}
          <span className="text-[11px] font-mono text-[#7A7972] dark:text-[#71717A] tabular-nums transition-colors duration-300">
            {mode === 'flowmodoro' ? 'Stopwatch active' : `${Math.round(progressRatio * 100)}% elapsed`}
          </span>
        </div>
      </div>

      {/* Primary Controls Row - Magnetic Hover Effects (cubic-bezier(0.25, 0.46, 0.45, 0.94)) */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
        {/* Primary Play/Pause Button - Magnetic Hover */}
        <button
          onClick={isRunning ? pause : start}
          aria-label={isRunning ? 'Pause countdown timer [Space]' : 'Start countdown timer [Space]'}
          title={isRunning ? 'Pause Timer [Space]' : 'Start Timer [Space]'}
          className={`btn-precision flex items-center justify-center gap-2 px-8 h-12 rounded-2xl font-medium text-sm min-w-[140px] shadow-sm transition-colors duration-300 ${
            isRunning
              ? isDark
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-[#3D5447] hover:bg-[#2E4036] text-[#FAF9F5]'
              : isDark
                ? 'bg-emerald-500 hover:bg-emerald-400 text-[#09090C] font-semibold shadow-emerald-500/20'
                : 'bg-[#2E4036] hover:bg-[#24332B] text-[#FAF9F5]'
          }`}
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

        {/* Reset Button - Magnetic Hover */}
        <button
          onClick={reset}
          aria-label="Reset timer interval to beginning"
          title="Reset Timer"
          className="btn-precision flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-[#EDEDED] dark:border dark:border-white/[0.08] text-xs font-medium transition-colors duration-300"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>

        {/* Quick +5 Minutes Button */}
        {mode !== 'flowmodoro' && (
          <button
            onClick={extendFiveMinutes}
            aria-label="Add 5 minutes to active session"
            title="Add 5 Minutes to Session"
            className="btn-precision flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#2E4036] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-emerald-400 dark:border dark:border-white/[0.08] text-xs font-medium transition-colors duration-300"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+5m</span>
          </button>
        )}

        {/* Skip to Next Mode - Magnetic Hover */}
        <button
          onClick={skip}
          aria-label="Skip to next session mode"
          title="Skip to Next Mode"
          className="btn-precision flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#5F5E58] hover:text-[#1A1A1A] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-[#A1A1AA] dark:hover:text-[#EDEDED] dark:border dark:border-white/[0.08] text-xs font-medium transition-colors duration-300"
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip</span>
        </button>

        {/* Zen Mode Button */}
        {onToggleZenMode && (
          <button
            onClick={onToggleZenMode}
            aria-label="Enter Zen Fullscreen Mode [F]"
            title="Enter Zen Fullscreen Mode [F]"
            className="btn-precision flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#2E4036] hover:text-[#1A1A1A] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-emerald-400 dark:hover:text-emerald-300 dark:border dark:border-white/[0.08] text-xs font-medium transition-colors duration-300"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Zen Mode</span>
          </button>
        )}
      </div>
    </div>
  );
};