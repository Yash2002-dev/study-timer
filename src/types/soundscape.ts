export type SoundTrackId = 'pinkNoise' | 'binaural' | 'rain' | 'cafe';

export interface SoundTrackConfig {
  id: SoundTrackId;
  name: string;
  description: string;
  icon: string;
  defaultVolume: number;
}

export interface SoundscapeState {
  masterVolume: number; // 0.0 to 1.0
  isMuted: boolean;
  volumes: Record<SoundTrackId, number>; // 0.0 to 1.0
  activeTracks: Record<SoundTrackId, boolean>;
  isAudioInitialized: boolean;
}

export interface SoundscapeControls {
  setTrackVolume: (trackId: SoundTrackId, volume: number) => void;
  toggleTrack: (trackId: SoundTrackId) => void;
  setTrackActive: (trackId: SoundTrackId, active: boolean) => void;
  setMasterVolume: (volume: number) => void;
  toggleMute: () => void;
  stopAll: () => void;
  initializeAudio: () => void;
  applyPreset: (presetName: 'deepFocus' | 'rainyLibrary' | 'zenMeditation' | 'reset') => void;
}

export type SoundscapeEngineHook = SoundscapeState & SoundscapeControls;
