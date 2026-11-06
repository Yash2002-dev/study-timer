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
  activeTagColor = '#2E4036',
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

  // Organic Tech Clinical Palette: Clean Moss, Terracotta, and Sage
  const getThemeColors = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'shortBreak':
      case 'longBreak':
        return {
          strokeColor: '#8C5A41', // Warm Terracotta / Clay
          badgeBg: 'bg-[#F4ECE7]',
          badgeText: 'text-[#8C5A41]',
          dotBg: 'bg-[#8C5A41]',
        };
      case 'flowmodoro':
        return {
          strokeColor: '#4D6B5A', // Sage Moss
          badgeBg: 'bg-[#E7EFEA]',
          badgeText: 'text-[#3D5447]',
          dotBg: 'bg-[#4D6B5A]',
        };
      case 'custom':
        return {
          strokeColor: '#7C674F', // Ochre Sand
          badgeBg: 'bg-[#F4EFE7]',
          badgeText: 'text-[#7C674F]',
          dotBg: 'bg-[#7C674F]',
        };
      case 'pomodoro':
      default:
        return {
          strokeColor: '#2E4036', // Deep Organic Moss
          badgeBg: 'bg-[#E2ECE5]',
          badgeText: 'text-[#2E4036]',
          dotBg: 'bg-[#2E4036]',
        };
    }
  };

  const theme = getThemeColors(mode);

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
      {/* Central Dial Housing - Flat Organic Tech, Zero Neon */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-500"
        style={{ width: size, height: size }}
      >
        {/* SVG Progress Circle */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] relative z-10"
        >
          {/* Background Static Track Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E6E2D8"
            strokeWidth={strokeWidth}
          />

          {/* Foreground Animated Progress Ring with Smooth Stroke Dashoffset */}
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
              transition: 'stroke-dashoffset 650ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Inner Content Container - Zero CLS */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
          {/* Status Badge */}
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium ${theme.badgeBg} ${theme.badgeText}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? `${theme.dotBg} animate-pulse` : 'bg-[#9E9D95]'
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
            <span className="timer-digits text-5xl sm:text-6xl font-medium text-[#1A1A1A] tracking-tight tabular-nums select-none">
              {formattedTime}
            </span>
          </div>

          {/* Active Task Tag Badge */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#5F5E58] bg-[#EAE6DC] px-2.5 py-0.5 rounded-full mb-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: activeTagColor }}
            />
            <span className="truncate max-w-[130px] font-sans">{activeTagLabel}</span>
          </div>

          {/* Progress Percentage */}
          <span className="text-[11px] font-mono text-[#7A7972] tabular-nums">
            {mode === 'flowmodoro' ? 'Stopwatch active' : `${Math.round(progressRatio * 100)}% elapsed`}
          </span>
        </div>
      </div>

      {/* Tactile Control Buttons Row - Smooth Micro-Interactions (active:scale-[0.98]) */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
        {/* Primary Play/Pause Button - Moss / Charcoal */}
        <button
          onClick={isRunning ? pause : start}
          className={`btn-tactile flex items-center justify-center gap-2 px-7 h-12 rounded-2xl font-medium text-sm transition-all duration-180 active:scale-[0.98] min-w-[130px] shadow-sm ${
            isRunning
              ? 'bg-[#3D5447] hover:bg-[#2E4036] text-[#FAF9F5]'
              : 'bg-[#2E4036] hover:bg-[#24332B] text-[#FAF9F5]'
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
          className="btn-tactile flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] transition-all active:scale-[0.98] text-xs font-medium shadow-none"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>

        {/* Quick +5 Minutes Button */}
        {mode !== 'flowmodoro' && (
          <button
            onClick={extendFiveMinutes}
            title="Add 5 Minutes to Session"
            className="btn-tactile flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#2E4036] transition-all active:scale-[0.98] text-xs font-medium shadow-none"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+5m</span>
          </button>
        )}

        {/* Skip to Next Mode */}
        <button
          onClick={skip}
          title="Skip to Next Mode"
          className="btn-tactile flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#5F5E58] hover:text-[#1A1A1A] transition-all active:scale-[0.98] text-xs font-medium shadow-none"
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip</span>
        </button>

        {/* Zen Mode Button */}
        {onToggleZenMode && (
          <button
            onClick={onToggleZenMode}
            title="Enter Zen Fullscreen Mode [F]"
            className="btn-tactile flex items-center justify-center gap-1.5 px-4 h-12 rounded-2xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#2E4036] hover:text-[#1A1A1A] transition-all active:scale-[0.98] text-xs font-medium shadow-none"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Zen Mode</span>
          </button>
        )}
      </div>
    </div>
  );
};