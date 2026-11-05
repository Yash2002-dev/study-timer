// Procedural Web Audio API Chime Synthesizer
// Generates warm, crystalline harmonic Zen bells without external MP3/audio files

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a warm, multi-harmonic Tibetan singing bowl / Zen chime
 */
export function playCompletionChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic frequencies for a calming focus bell (C Major 9 chord tones)
    const frequencies = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
    const baseGain = 0.15;

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Slight detune for natural analog warmth
      osc.detune.setValueAtTime((index - 2) * 4, now);

      // Staggered note onset for an arpeggiated ripple
      const noteDelay = index * 0.06;
      const noteStart = now + noteDelay;
      const decayDuration = 2.4 - index * 0.2; // Higher partials decay slightly faster

      // Anti-pop gentle attack
      gain.gain.setValueAtTime(0.00001, noteStart);
      gain.gain.exponentialRampToValueAtTime(baseGain / (index * 0.6 + 1), noteStart + 0.03);

      // Natural acoustic bell exponential decay
      gain.gain.exponentialRampToValueAtTime(0.00001, noteStart + decayDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + decayDuration + 0.1);
    });
  } catch (err) {
    console.warn('Web Audio playback error or blocked by browser gesture policy:', err);
  }
}

