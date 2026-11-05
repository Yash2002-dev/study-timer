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
    sub: '1/f gentle static acoustic masking',
    icon: Radio,
    accentColor: '#6366F1', // Indigo
  },
  {
    id: 'binaural',
    name: '40Hz Binaural',
    sub: 'Gamma focus carrier (216Hz + 256Hz)',
    icon: Headphones,
    accentColor: '#06B6D4', // Cyan
  },
  {
    id: 'rain',
    name: 'Rain Simulator',
    sub: 'Downpour bed + randomized drops',
    icon: CloudRain,
    accentColor: '#10B981', // Emerald
  },
  {
    id: 'cafe',
    name: 'Café Ambience',
    sub: 'Multi-formant resonant murmur',
    icon: Coffee,
    accentColor: '#F59E0B', // Amber
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
    <div className="bg-obsidian-850 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Ambient Soundscape Mixer
              {activeCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  {activeCount} active
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">Procedural Web Audio • Zero external samples</p>
          </div>
        </div>

        {/* Master Volume & Mute Controls */}
        <div className="flex items-center gap-3">
          {/* Master Volume Slider */}
          <div className="flex items-center gap-2 bg-obsidian-900 border border-white/5 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400">Master:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              aria-label="Master Volume"
              className="w-20 h-1.5 bg-obsidian-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[10px] font-mono text-slate-300 w-8 text-right tabular-nums">
              {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
            </span>
          </div>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            title="Toggle Mute (Shortcut: M)"
            className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1 text-xs font-mono ${
              isMuted
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : 'bg-obsidian-900 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] hidden sm:inline">[M]</span>
          </button>

          {/* Stop All */}
          {activeCount > 0 && (
            <button
              onClick={stopAll}
              title="Stop All Tracks"
              className="p-2 rounded-xl bg-obsidian-900 border border-white/10 hover:border-white/20 text-slate-400 hover:text-rose-300 transition-all active:scale-95"
            >
              <PowerOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preset Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Presets:
        </span>
        <button
          onClick={() => applyPreset('deepFocus')}
          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-white/5 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all active:scale-95"
        >
          🧠 Deep Focus
        </button>
        <button
          onClick={() => applyPreset('rainyLibrary')}
          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-white/5 hover:border-emerald-500/40 text-slate-300 hover:text-white transition-all active:scale-95"
        >
          🌧️ Rainy Library
        </button>
        <button
          onClick={() => applyPreset('zenMeditation')}
          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-white/5 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all active:scale-95"
        >
          🧘 Zen Waves
        </button>
      </div>

      {/* Procedural Track Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TRACKS.map((t) => {
          const isActive = activeTracks[t.id];
          const volume = volumes[t.id] ?? 0.5;
          const Icon = t.icon;

          return (
            <div
              key={t.id}
              className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                isActive
                  ? 'bg-obsidian-800/90 border-white/20 shadow-lg'
                  : 'bg-obsidian-900/60 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  {/* Track Toggle Button */}
                  <button
                    onClick={() => toggleTrack(t.id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-400/50 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-obsidian-850 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                    title={isActive ? `Pause ${t.name}` : `Play ${t.name}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white tracking-tight">{t.name}</span>
                      {isActive && (
                        <span 
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ backgroundColor: t.accentColor }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[170px]">{t.sub}</p>
                  </div>
                </div>

                {/* Track Volume Readout */}
                <span className="text-xs font-mono text-slate-400 tabular-nums">
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
                  aria-label={`${t.name} Volume`}
                  className="w-full h-1.5 bg-obsidian-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

