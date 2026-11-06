import React from 'react';
import { useSoundscape } from '../../hooks/useSoundscape';
import { useTheme } from '../../hooks/useTheme';
import { SoundTrackId } from '../../types/soundscape';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Headphones, 
  CloudRain, 
  Coffee, 
  Sparkles, 
  PowerOff,
  Sliders
} from 'lucide-react';

interface SoundscapeMixerProps {
  soundscape: ReturnType<typeof useSoundscape>;
}

interface TrackMeta {
  id: SoundTrackId;
  name: string;
  sub: string;
  icon: React.ElementType;
  lightAccent: string;
  darkAccent: string;
}

const TRACKS: TrackMeta[] = [
  {
    id: 'pinkNoise',
    name: 'Pink Noise',
    sub: '1/f gentle acoustic masking',
    icon: Radio,
    lightAccent: '#2E4036',
    darkAccent: '#10B981',
  },
  {
    id: 'binaural',
    name: '40Hz Binaural',
    sub: 'Gamma focus carrier (216Hz + 256Hz)',
    icon: Headphones,
    lightAccent: '#4D6B5A',
    darkAccent: '#06B6D4',
  },
  {
    id: 'rain',
    name: 'Rain Simulator',
    sub: 'Downpour bed + organic drops',
    icon: CloudRain,
    lightAccent: '#3D5447',
    darkAccent: '#34D399',
  },
  {
    id: 'cafe',
    name: 'Café Ambience',
    sub: 'Multi-formant resonant murmur',
    icon: Coffee,
    lightAccent: '#8C5A41',
    darkAccent: '#F59E0B',
  },
];

export function SoundscapeMixer({ soundscape }: SoundscapeMixerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const {
    masterVolume,
    isMuted,
    volumes,
    activeTracks,
    setTrackVolume,
    toggleTrack,
    setMasterVolume,
    toggleMute,
    stopAll,
    applyPreset,
  } = soundscape;

  const activeCount = Object.values(activeTracks).filter(Boolean).length;

  return (
    <div className="organic-card p-6 relative flex flex-col justify-between transition-colors duration-300">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DC] dark:border-white/[0.08] pb-4 mb-5 transition-colors duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE5] dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 flex items-center justify-center text-[#2E4036] dark:text-emerald-400 shrink-0 transition-colors duration-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#1A1A1A] dark:text-[#EDEDED] flex items-center gap-2 transition-colors duration-300">
                Ambient Soundscape Mixer
                {activeCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E2ECE5] text-[#2E4036] dark:bg-emerald-500/15 dark:text-emerald-300 dark:border dark:border-emerald-500/30 font-mono tabular-nums transition-colors duration-300">
                    {activeCount} active
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-[#5F5E58] dark:text-[#A1A1AA] transition-colors duration-300">
                Procedural Web Audio • Mathematical synthesis
              </p>
            </div>
          </div>

          {/* Master Volume & Mute Controls */}
          <div className="flex items-center gap-2.5">
            {/* Master Volume Slider */}
            <div className="flex items-center gap-2 bg-[#F2EFE9] dark:bg-[#121217] dark:border dark:border-white/[0.08] px-2.5 py-1.5 rounded-xl transition-colors duration-300">
              <span className="text-[10px] font-mono text-[#5F5E58] dark:text-[#A1A1AA]">Master:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                aria-label="Master Sound Volume"
                className="w-16 sm:w-20 h-1.5 bg-[#DDD8CB] dark:bg-[#23232C] rounded-lg appearance-none cursor-pointer accent-[#2E4036] dark:accent-emerald-400"
              />
              <span className="text-[10px] font-mono text-[#1A1A1A] dark:text-[#EDEDED] w-8 text-right tabular-nums transition-colors duration-300">
                {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
              </span>
            </div>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute soundscape [M]' : 'Mute soundscape [M]'}
              title="Toggle Mute (Shortcut: M)"
              className={`btn-precision p-2 rounded-xl flex items-center gap-1 text-xs font-mono transition-colors duration-300 ${
                isMuted
                  ? 'bg-[#F4ECE7] dark:bg-rose-500/15 dark:border dark:border-rose-500/30 text-[#8C5A41] dark:text-rose-300'
                  : 'bg-[#EAE6DC] hover:bg-[#DDD8CB] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-[#EDEDED] dark:border dark:border-white/[0.08]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="text-[10px] hidden sm:inline">[M]</span>
            </button>

            {/* Stop All */}
            {activeCount > 0 && (
              <button
                onClick={stopAll}
                aria-label="Stop all currently playing tracks"
                title="Stop All Tracks"
                className="btn-precision p-2 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#5F5E58] hover:text-[#8C5A41] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-[#A1A1AA] dark:hover:text-rose-300 dark:border dark:border-white/[0.08] transition-colors duration-300"
              >
                <PowerOff className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Preset Badges with Precision Magnetic Hover */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-[11px] text-[#5F5E58] dark:text-[#A1A1AA] flex items-center gap-1 font-mono transition-colors duration-300">
            <Sparkles className="w-3 h-3 text-[#2E4036] dark:text-emerald-400" />
            Presets:
          </span>
          <button
            onClick={() => applyPreset('deepFocus')}
            aria-label="Apply Deep Focus ambient sound preset"
            className="btn-precision text-[11px] font-medium px-2.5 py-1 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-[#EDEDED] dark:border dark:border-white/[0.08] transition-colors duration-300"
          >
            Deep Focus
          </button>
          <button
            onClick={() => applyPreset('rainyLibrary')}
            aria-label="Apply Rainy Haven ambient sound preset"
            className="btn-precision text-[11px] font-medium px-2.5 py-1 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-[#EDEDED] dark:border dark:border-white/[0.08] transition-colors duration-300"
          >
            Rainy Haven
          </button>
          <button
            onClick={() => applyPreset('zenMeditation')}
            aria-label="Apply Zen Sanctuary ambient sound preset"
            className="btn-precision text-[11px] font-medium px-2.5 py-1 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-[#EDEDED] dark:border dark:border-white/[0.08] transition-colors duration-300"
          >
            Zen Sanctuary
          </button>
        </div>

        {/* Procedural Track Channels - Adaptive Light/Dark cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRACKS.map((t) => {
            const isActive = activeTracks[t.id];
            const volume = volumes[t.id] ?? 0.5;
            const Icon = t.icon;
            const accent = isDark ? t.darkAccent : t.lightAccent;

            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-2xl transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-[#E7EFEA]'
                    : 'bg-[#F2EFE9] hover:bg-[#ECE8DF] dark:bg-[#121217] dark:hover:bg-[#181820] dark:border dark:border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Track Toggle Button - Magnetic Hover */}
                    <button
                      onClick={() => toggleTrack(t.id)}
                      aria-label={isActive ? `Pause ${t.name}` : `Play ${t.name}`}
                      aria-pressed={isActive}
                      className={`btn-precision w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        isActive
                          ? isDark
                            ? 'bg-emerald-500 text-[#09090C]'
                            : 'bg-[#2E4036] text-[#FAF9F5]'
                          : 'bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#5F5E58] hover:text-[#1A1A1A] dark:bg-[#23232C] dark:hover:bg-[#2C2C38] dark:text-[#A1A1AA] dark:hover:text-[#EDEDED] dark:border dark:border-white/[0.08]'
                      }`}
                      title={isActive ? `Pause ${t.name}` : `Play ${t.name}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#EDEDED] tracking-tight transition-colors duration-300">
                          {t.name}
                        </span>
                        {isActive && (
                          <span 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                        )}
                      </div>
                      <p className="text-[10px] text-[#5F5E58] dark:text-[#A1A1AA] truncate max-w-[170px] transition-colors duration-300">
                        {t.sub}
                      </p>
                    </div>
                  </div>

                  {/* Track Volume Readout - Zero CLS, IBM Plex Mono */}
                  <span className="text-xs font-mono text-[#5F5E58] dark:text-[#A1A1AA] tabular-nums min-w-[3ch] text-right transition-colors duration-300">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setTrackVolume(t.id, parseFloat(e.target.value))}
                    aria-label={`${t.name} Volume Level`}
                    className="w-full h-1.5 bg-[#DDD8CB] dark:bg-[#23232C] rounded-lg appearance-none cursor-pointer accent-[#2E4036] dark:accent-emerald-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}