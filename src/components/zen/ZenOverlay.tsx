import React, { useEffect, useState } from 'react';
import { TimerEngine } from '../../types/timer';
import { useSoundscape } from '../../hooks/useSoundscape';
import { TimerDial } from '../timer/TimerDial';
import { 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Sparkles,
  SlidersHorizontal,
  ChevronUp
} from 'lucide-react';

interface ZenOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  timer: TimerEngine;
  soundscape: ReturnType<typeof useSoundscape>;
  activeTagLabel?: string;
  activeTagColor?: string;
}

export const ZenOverlay: React.FC<ZenOverlayProps> = ({
  isOpen,
  onClose,
  timer,
  soundscape,
  activeTagLabel = 'Deep Work',
  activeTagColor = '#6366F1',
}) => {
  const [showSoundControls, setShowSoundControls] = useState<boolean>(false);

  // Keyboard shortcut listener for F and Escape to exit Zen Mode
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { masterVolume, isMuted, setMasterVolume, toggleMute, activeTracks } = soundscape;
  const activeCount = Object.values(activeTracks).filter(Boolean).length;

  return (
    <div data-zen-overlay="true" className="fixed inset-0 z-50 bg-[#050608] flex flex-col justify-between items-center p-6 md:p-10 select-none animate-fadeIn transition-colors duration-700">
      {/* Top Floating Utility Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTagColor }} />
          <span className="text-slate-300 font-semibold">{activeTagLabel}</span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-400/80">ZEN FOCUS</span>
        </div>

        <button
          onClick={onClose}
          className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.06] text-slate-300 hover:text-white transition-all active:scale-[0.98]"
          title="Exit Zen Mode [F or Esc]"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Zen [Esc]</span>
        </button>
      </div>

      {/* Central Screen: Expanded Glowing Dial with Breathing Physics */}
      <div className="my-auto flex flex-col items-center justify-center relative">
        <TimerDial
          timer={timer}
          activeTagLabel={activeTagLabel}
          activeTagColor={activeTagColor}
          size={320}
        />
      </div>

      {/* Bottom Floating Ambient Sound Pill */}
      <div className="w-full max-w-md flex flex-col items-center gap-2">
        {/* Toggle drawer trigger */}
        <button
          onClick={() => setShowSoundControls(!showSoundControls)}
          className="btn-tactile flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors px-3 py-1 rounded-full bg-obsidian-900/80 border border-white/[0.06] active:scale-[0.98]"
        >
          <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
          <span>Ambient Audio {activeCount > 0 ? `(${activeCount} active)` : ''}</span>
          <ChevronUp className={`w-3 h-3 transition-transform duration-300 ${showSoundControls ? 'rotate-180' : ''}`} />
        </button>

        {/* Ambient Sound Bar Drawer */}
        {showSoundControls && (
          <div className="w-full backdrop-blur-xl bg-obsidian-900/90 border border-white/[0.06] rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className={`btn-tactile p-2 rounded-xl border transition-all active:scale-[0.98] ${
                  isMuted
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    : 'bg-obsidian-850 border-white/[0.06] text-slate-300 hover:text-white'
                }`}
                title="Mute/Unmute [M]"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : masterVolume}
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                  aria-label="Master Volume"
                  className="w-24 sm:w-32 h-1.5 bg-obsidian-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[11px] font-mono text-slate-300 w-8 tabular-nums">
                  {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span className="truncate max-w-[120px]">
                {Object.entries(activeTracks).filter(([, a]) => a).map(([k]) => k).join(', ') || 'No sound playing'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

