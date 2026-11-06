import React from 'react';
import { useSoundscape } from '../../hooks/useSoundscape';
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
  accentColor: string;
}

const TRACKS: TrackMeta[] = [
  {
    id: 'pinkNoise',
    name: 'Pink Noise',
    sub: '1/f gentle acoustic masking',
    icon: Radio,
    accentColor: '#2E4036',
  },
  {
    id: 'binaural',
    name: '40Hz Binaural',
    sub: 'Gamma focus carrier (216Hz + 256Hz)',
    icon: Headphones,
    accentColor: '#4D6B5A',
  },
  {
    id: 'rain',
    name: 'Rain Simulator',
    sub: 'Downpour bed + organic drops',
    icon: CloudRain,
    accentColor: '#3D5447',
  },
  {
    id: 'cafe',
    name: 'Café Ambience',
    sub: 'Multi-formant resonant murmur',
    icon: Coffee,
    accentColor: '#8C5A41',
  },
];

export function SoundscapeMixer({ soundscape }: SoundscapeMixerProps) {
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
    <div className="organic-card p-6 relative flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DC] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE5] flex items-center justify-center text-[#2E4036] shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#1A1A1A] flex items-center gap-2">
                Ambient Soundscape Mixer
                {activeCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E2ECE5] text-[#2E4036] font-mono tabular-nums">
                    {activeCount} active
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-[#5F5E58]">Procedural Web Audio • Mathematical synthesis</p>
            </div>
          </div>

          {/* Master Volume & Mute Controls */}
          <div className="flex items-center gap-2.5">
            {/* Master Volume Slider */}
            <div className="flex items-center gap-2 bg-[#F2EFE9] px-2.5 py-1.5 rounded-xl">
              <span className="text-[10px] font-mono text-[#5F5E58]">Master:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                aria-label="Master Sound Volume"
                className="w-16 sm:w-20 h-1.5 bg-[#DDD8CB] rounded-lg appearance-none cursor-pointer accent-[#2E4036]"
              />
              <span className="text-[10px] font-mono text-[#1A1A1A] w-8 text-right tabular-nums">
                {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
              </span>
            </div>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute soundscape [M]' : 'Mute soundscape [M]'}
              title="Toggle Mute (Shortcut: M)"
              className={`btn-precision p-2 rounded-xl flex items-center gap-1 text-xs font-mono ${
                isMuted
                  ? 'bg-[#F4ECE7] text-[#8C5A41]'
                  : 'bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A]'
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
                className="btn-precision p-2 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#5F5E58] hover:text-[#8C5A41]"
              >
                <PowerOff className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Preset Badges with Precision Magnetic Hover */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-[11px] text-[#5F5E58] flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3 text-[#2E4036]" />
            Presets:
          </span>
          <button
            onClick={() => applyPreset('deepFocus')}
            aria-label="Apply Deep Focus ambient sound preset"
            className="btn-precision text-[11px] font-medium px-2.5 py-1 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A]"
          >
            Deep Focus
          </button>
          <button
            onClick={() => applyPreset('rainyLibrary')}
            aria-label="Apply Rainy Haven ambient sound preset"
            className="btn-precision text-[11px] font-medium px-2.5 py-1 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A]"
          >
            Rainy Haven
          </button>
          <button
            onClick={() => applyPreset('zenMeditation')}
            aria-label="Apply Zen Sanctuary ambient sound preset"
            className="btn-precision text-[11px] font-medium px-2.5 py-1 rounded-xl bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#1A1A1A]"
          >
            Zen Sanctuary
          </button>
        </div>

        {/* Procedural Track Channels - Flat cards, zero borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRACKS.map((t) => {
            const isActive = activeTracks[t.id];
            const volume = volumes[t.id] ?? 0.5;
            const Icon = t.icon;

            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-2xl transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  isActive
                    ? 'bg-[#E7EFEA]'
                    : 'bg-[#F2EFE9] hover:bg-[#ECE8DF]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Track Toggle Button - Magnetic Hover */}
                    <button
                      onClick={() => toggleTrack(t.id)}
                      aria-label={isActive ? `Pause ${t.name}` : `Play ${t.name}`}
                      aria-pressed={isActive}
                      className={`btn-precision w-8 h-8 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-[#2E4036] text-[#FAF9F5]'
                          : 'bg-[#EAE6DC] hover:bg-[#DDD8CB] text-[#5F5E58] hover:text-[#1A1A1A]'
                      }`}
                      title={isActive ? `Pause ${t.name}` : `Play ${t.name}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1A1A1A] tracking-tight">{t.name}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E4036]" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#5F5E58] truncate max-w-[170px]">{t.sub}</p>
                    </div>
                  </div>

                  {/* Track Volume Readout - Zero CLS, IBM Plex Mono */}
                  <span className="text-xs font-mono text-[#5F5E58] tabular-nums min-w-[3ch] text-right">
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
                    className="w-full h-1.5 bg-[#DDD8CB] rounded-lg appearance-none cursor-pointer accent-[#2E4036]"
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