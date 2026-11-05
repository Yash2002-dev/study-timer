import { useState, useEffect, useCallback, useRef } from 'react';
import { SoundTrackId, SoundscapeEngineHook } from '../types/soundscape';
import { soundscapeEngine } from '../audio/soundscape';

const STORAGE_KEYS = {
  VOLUMES: 'study_timer_soundscape_volumes',
  MASTER_VOLUME: 'study_timer_master_volume',
  MUTED: 'study_timer_muted',
};

const DEFAULT_VOLUMES: Record<SoundTrackId, number> = {
  pinkNoise: 0.5,
  binaural: 0.4,
  rain: 0.6,
  cafe: 0.35,
};

export function useSoundscape(): SoundscapeEngineHook {
  // Load persistent volumes from localStorage or defaults
  const [volumes, setVolumesState] = useState<Record<SoundTrackId, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOLUMES);
      if (saved) return { ...DEFAULT_VOLUMES, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_VOLUMES;
  });

  const [masterVolume, setMasterVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MASTER_VOLUME);
      if (saved !== null) return parseFloat(saved);
    } catch {}
    return 0.75;
  });

  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MUTED);
      if (saved !== null) return saved === 'true';
    } catch {}
    return false;
  });

  const [activeTracks, setActiveTracks] = useState<Record<SoundTrackId, boolean>>({
    pinkNoise: false,
    binaural: false,
    rain: false,
    cafe: false,
  });

  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false);

  // Sync initial stored volumes to the engine on mount
  useEffect(() => {
    soundscapeEngine.setMasterVolume(masterVolume);
    soundscapeEngine.setMuted(isMuted);
    Object.entries(volumes).forEach(([id, vol]) => {
      soundscapeEngine.setTrackVolume(id as SoundTrackId, vol);
    });
  }, []);

  // Update localStorage when settings change
  const saveVolumesRef = useRef((v: Record<SoundTrackId, number>) => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOLUMES, JSON.stringify(v));
    } catch {}
  });

  const initializeAudio = useCallback(() => {
    soundscapeEngine.initialize();
    setIsAudioInitialized(true);
  }, []);

  const setTrackVolume = useCallback((trackId: SoundTrackId, volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    soundscapeEngine.setTrackVolume(trackId, clamped);
    setVolumesState((prev) => {
      const next = { ...prev, [trackId]: clamped };
      saveVolumesRef.current(next);
      return next;
    });
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    soundscapeEngine.setMasterVolume(clamped);
    setMasterVolumeState(clamped);
    try {
      localStorage.setItem(STORAGE_KEYS.MASTER_VOLUME, clamped.toString());
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    const nextMute = soundscapeEngine.toggleMute();
    setIsMutedState(nextMute);
    try {
      localStorage.setItem(STORAGE_KEYS.MUTED, nextMute.toString());
    } catch {}
  }, []);

  const setTrackActive = useCallback((trackId: SoundTrackId, active: boolean) => {
    initializeAudio();
    if (active) {
      soundscapeEngine.startTrack(trackId);
    } else {
      soundscapeEngine.stopTrack(trackId);
    }
    setActiveTracks((prev) => ({
      ...prev,
      [trackId]: active,
    }));
  }, [initializeAudio]);

  const toggleTrack = useCallback((trackId: SoundTrackId) => {
    initializeAudio();
    const isNowPlaying = soundscapeEngine.toggleTrack(trackId);
    setActiveTracks((prev) => ({
      ...prev,
      [trackId]: isNowPlaying,
    }));
  }, [initializeAudio]);

  const stopAll = useCallback(() => {
    soundscapeEngine.stopAll();
    setActiveTracks({
      pinkNoise: false,
      binaural: false,
      rain: false,
      cafe: false,
    });
  }, []);

  const applyPreset = useCallback((preset: 'deepFocus' | 'rainyLibrary' | 'zenMeditation' | 'reset') => {
    initializeAudio();
    stopAll();

    switch (preset) {
      case 'deepFocus':
        // 40Hz Binaural + Pink Noise
        soundscapeEngine.setTrackVolume('binaural', 0.45);
        soundscapeEngine.setTrackVolume('pinkNoise', 0.40);
        soundscapeEngine.startTrack('binaural');
        soundscapeEngine.startTrack('pinkNoise');
        setActiveTracks({ pinkNoise: true, binaural: true, rain: false, cafe: false });
        break;

      case 'rainyLibrary':
        // Rain + gentle Pink Noise
        soundscapeEngine.setTrackVolume('rain', 0.65);
        soundscapeEngine.setTrackVolume('pinkNoise', 0.30);
        soundscapeEngine.startTrack('rain');
        soundscapeEngine.startTrack('pinkNoise');
        setActiveTracks({ pinkNoise: true, binaural: false, rain: true, cafe: false });
        break;

      case 'zenMeditation':
        // Binaural 40Hz + Rain
        soundscapeEngine.setTrackVolume('binaural', 0.40);
        soundscapeEngine.setTrackVolume('rain', 0.45);
        soundscapeEngine.startTrack('binaural');
        soundscapeEngine.startTrack('rain');
        setActiveTracks({ pinkNoise: false, binaural: true, rain: true, cafe: false });
        break;

      case 'reset':
        stopAll();
        break;
    }
  }, [initializeAudio, stopAll]);

  // Global Keyboard shortcut 'M' to toggle mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);

  return {
    masterVolume,
    isMuted,
    volumes,
    activeTracks,
    isAudioInitialized,
    setTrackVolume,
    toggleTrack,
    setTrackActive,
    setMasterVolume,
    toggleMute,
    stopAll,
    initializeAudio,
    applyPreset,
  };
}
