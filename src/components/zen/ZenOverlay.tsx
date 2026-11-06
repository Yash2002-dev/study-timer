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
  activeTagColor = '#2E4036',
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
    <div 
      data-zen-overlay="true" 
      className="fixed inset-0 z-50 bg-[#F2F0E9] flex flex-col justify-between items-center p-6 md:p-10 select-none animate-fadeIn transition-colors duration-700"
    >
      {/* Top Floating Utility Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs font-mono text-[#5F5E58]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTagColor }} />
          <span className="text-[#1A1A1A] font-semibold">{activeTagLabel}</span>
          <span className="text-[#7A7972]">•</span>
          <span className="text-[#2E4036] font-medium">ZEN SANCTUARY</span>
        </div>

        <button
          onClick={onClose}
          className="btn-tactile flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] transition-all active:scale-[0.98]"
          title="Exit Zen Mode [F or Esc]"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Zen [Esc]</span>
        </button>
      </div>

      {/* Central Screen: Expanded Dial in Serene Cream Space */}
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
          className="btn-tactile flex items-center gap-1.5 text-[11px] font-mono text-[#5F5E58] hover:text-[#1A1A1A] transition-colors px-3.5 py-1.5 rounded-full bg-[#EAE6DC] hover:bg-[#DDD8CB] active:scale-[0.98]"
        >
          <SlidersHorizontal className="w-3 h-3 text-[#2E4036]" />
          <span>Ambient Audio {activeCount > 0 ? `(${activeCount} active)` : ''}</span>
          <ChevronUp className={`w-3 h-3 transition-transform duration-300 ${showSoundControls ? 'rotate-180' : ''}`} />
        </button>

        {/* Ambient Sound Bar Drawer */}
        {showSoundControls && (
          <div className="w-full organic-card p-4 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className={`btn-tactile p-2 rounded-xl transition-all active:scale-[0.98] ${
                  isMuted
                    ? 'bg-[#F4ECE7] text-[#8C5A41]'
                    : 'bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A]'
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
                  className="w-24 sm:w-32 h-1.5 bg-[#DDD8CB] rounded-lg appearance-none cursor-pointer accent-[#2E4036]"
                />
                <span className="text-[11px] font-mono text-[#1A1A1A] w-8 tabular-nums">
                  {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-[#5F5E58]">
              <Sparkles className="w-3 h-3 text-[#2E4036]" />
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