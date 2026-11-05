import { SoundTrackId } from '../types/soundscape';

/**
 * Procedural Audio Engine for Ambient Soundscapes
 * Built exclusively using the HTML5 Web Audio API - Zero external assets or CDN dependencies.
 */

interface ActiveGenerator {
  gainNode: GainNode;
  stop: () => void;
}

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private trackVolumes: Record<SoundTrackId, number> = {
    pinkNoise: 0.5,
    binaural: 0.4,
    rain: 0.6,
    cafe: 0.3,
  };
  private activeGenerators: Map<SoundTrackId, ActiveGenerator> = new Map();
  private isInitialized: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master output bus with smooth limiter
      this.masterGain = this.ctx.createGain();
      const initialVol = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public initialize(): void {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  /**
   * Generates a 5-second buffer of true Pink Noise (1/f spectral density)
   * using the Paul Kellet 7-pole filter algorithm.
   */
  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 5; // 5-second seamless loop
    const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.76160 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        output[i] = pink * 0.11; // Gain scale to avoid clipping
      }
    }
    return buffer;
  }

  /**
   * 1. Pink Noise Generator (Gentle Static Acoustic Masking)
   */
  private startPinkNoise(ctx: AudioContext, destination: GainNode): ActiveGenerator {
    const buffer = this.createPinkNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Warm low-pass filter for cozy ambient texture
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    const trackGain = ctx.createGain();
    const targetVol = this.trackVolumes.pinkNoise;
    trackGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetVol), ctx.currentTime + 0.1);

    source.connect(filter);
    filter.connect(trackGain);
    trackGain.connect(destination);

    source.start();

    return {
      gainNode: trackGain,
      stop: () => {
        try {
          trackGain.gain.setValueAtTime(trackGain.gain.value, ctx.currentTime);
          trackGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
          setTimeout(() => {
            try {
              source.stop();
              source.disconnect();
              filter.disconnect();
              trackGain.disconnect();
            } catch {}
          }, 100);
        } catch {}
      },
    };
  }

  /**
   * 2. Binaural Beats (40Hz Gamma Focus Carrier)
   * Left Ear: 216 Hz, Right Ear: 256 Hz (Delta = 40 Hz Gamma Focus)
   */
  private startBinaural(ctx: AudioContext, destination: GainNode): ActiveGenerator {
    const baseFreq = 216; // Deep resonant carrier tone
    const beatFreq = 40;  // 40Hz Gamma wave for working memory & focus

    // Channel merger to send distinct pure sines to left and right ears
    const merger = ctx.createChannelMerger(2);

    // Left channel oscillator
    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    const gainLeft = ctx.createGain();
    gainLeft.gain.setValueAtTime(0.35, ctx.currentTime);
    oscLeft.connect(gainLeft);
    gainLeft.connect(merger, 0, 0); // Left channel

    // Right channel oscillator
    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);

    const gainRight = ctx.createGain();
    gainRight.gain.setValueAtTime(0.35, ctx.currentTime);
    oscRight.connect(gainRight);
    gainRight.connect(merger, 0, 1); // Right channel

    // Subtle sub-bass foundation (108 Hz, low volume) for acoustic richness
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq / 2, ctx.currentTime);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.12, ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(merger, 0, 0);
    subGain.connect(merger, 0, 1);

    const trackGain = ctx.createGain();
    const targetVol = this.trackVolumes.binaural;
    trackGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetVol), ctx.currentTime + 0.1);

    merger.connect(trackGain);
    trackGain.connect(destination);

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    return {
      gainNode: trackGain,
      stop: () => {
        try {
          trackGain.gain.setValueAtTime(trackGain.gain.value, ctx.currentTime);
          trackGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
          setTimeout(() => {
            try {
              oscLeft.stop();
              oscRight.stop();
              subOsc.stop();
              oscLeft.disconnect();
              oscRight.disconnect();
              subOsc.disconnect();
              merger.disconnect();
              trackGain.disconnect();
            } catch {}
          }, 100);
        } catch {}
      },
    };
  }

  /**
   * 3. Rain Simulator (Multi-layer steady downpour + randomized high-frequency droplet bursts)
   */
  private startRain(ctx: AudioContext, destination: GainNode): ActiveGenerator {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 5;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, sampleRate);

    // Generate stereo rain base with random droplet transients
    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1);
      }
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    // Layer A: Low rumble of steady rain
    const lowFilter = ctx.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.setValueAtTime(950, ctx.currentTime);

    // Layer B: Resonant high-pass for droplet patter
    const midFilter = ctx.createBiquadFilter();
    midFilter.type = 'bandpass';
    midFilter.frequency.setValueAtTime(2800, ctx.currentTime);
    midFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    const midGain = ctx.createGain();
    midGain.gain.setValueAtTime(0.35, ctx.currentTime);

    // Layer C: Subtle wind/rain fluctuation via low-frequency LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime); // Gentle 0.18Hz wave
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.15, ctx.currentTime);
    lfo.connect(lfoGain);

    const rainMixer = ctx.createGain();
    rainMixer.gain.setValueAtTime(0.6, ctx.currentTime);
    lfoGain.connect(rainMixer.gain);

    rainSource.connect(lowFilter);
    lowFilter.connect(rainMixer);

    rainSource.connect(midFilter);
    midFilter.connect(midGain);
    midGain.connect(rainMixer);

    // Dynamic droplet bursts generator using scheduled procedural grains
    let isDropletActive = true;
    let dropletTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleDroplet = () => {
      if (!isDropletActive || ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();

      // Random high droplet frequencies (3kHz - 6kHz)
      const dropFreq = 3200 + Math.random() * 3000;
      osc.frequency.setValueAtTime(dropFreq, now);
      osc.frequency.exponentialRampToValueAtTime(dropFreq * 0.7, now + 0.04);

      dropGain.gain.setValueAtTime(0.0001, now);
      const peakVol = 0.02 + Math.random() * 0.04;
      dropGain.gain.linearRampToValueAtTime(peakVol, now + 0.005);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(dropGain);
      dropGain.connect(rainMixer);

      osc.start(now);
      osc.stop(now + 0.05);

      // Random intervals between drops (50ms - 220ms)
      const nextDelay = 50 + Math.random() * 170;
      dropletTimeoutId = setTimeout(scheduleDroplet, nextDelay);
    };

    scheduleDroplet();

    const trackGain = ctx.createGain();
    const targetVol = this.trackVolumes.rain;
    trackGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetVol), ctx.currentTime + 0.1);

    rainMixer.connect(trackGain);
    trackGain.connect(destination);

    rainSource.start();
    lfo.start();

    return {
      gainNode: trackGain,
      stop: () => {
        isDropletActive = false;
        if (dropletTimeoutId) clearTimeout(dropletTimeoutId);
        try {
          trackGain.gain.setValueAtTime(trackGain.gain.value, ctx.currentTime);
          trackGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
          setTimeout(() => {
            try {
              rainSource.stop();
              lfo.stop();
              rainSource.disconnect();
              lowFilter.disconnect();
              midFilter.disconnect();
              midGain.disconnect();
              lfo.disconnect();
              lfoGain.disconnect();
              rainMixer.disconnect();
              trackGain.disconnect();
            } catch {}
          }, 100);
        } catch {}
      },
    };
  }

  /**
   * 4. Café Ambience (Multi-formant resonant noise murmur)
   */
  private startCafe(ctx: AudioContext, destination: GainNode): ActiveGenerator {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Resonant bandpass filters approximating human conversational murmur formants
    const formant1 = ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.setValueAtTime(450, ctx.currentTime);
    formant1.Q.setValueAtTime(3.0, ctx.currentTime);

    const formant2 = ctx.createBiquadFilter();
    formant2.type = 'bandpass';
    formant2.frequency.setValueAtTime(1400, ctx.currentTime);
    formant2.Q.setValueAtTime(2.5, ctx.currentTime);

    const cafeMixer = ctx.createGain();
    cafeMixer.gain.setValueAtTime(0.5, ctx.currentTime);

    source.connect(formant1);
    formant1.connect(cafeMixer);
    source.connect(formant2);
    formant2.connect(cafeMixer);

    const trackGain = ctx.createGain();
    const targetVol = this.trackVolumes.cafe;
    trackGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetVol), ctx.currentTime + 0.1);

    cafeMixer.connect(trackGain);
    trackGain.connect(destination);

    source.start();

    return {
      gainNode: trackGain,
      stop: () => {
        try {
          trackGain.gain.setValueAtTime(trackGain.gain.value, ctx.currentTime);
          trackGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
          setTimeout(() => {
            try {
              source.stop();
              source.disconnect();
              formant1.disconnect();
              formant2.disconnect();
              cafeMixer.disconnect();
              trackGain.disconnect();
            } catch {}
          }, 100);
        } catch {}
      },
    };
  }

  // --- Public Controls ---

  public toggleTrack(trackId: SoundTrackId): boolean {
    if (this.activeGenerators.has(trackId)) {
      this.stopTrack(trackId);
      return false;
    } else {
      this.startTrack(trackId);
      return true;
    }
  }

  public startTrack(trackId: SoundTrackId): void {
    if (this.activeGenerators.has(trackId)) return;

    const ctx = this.getAudioContext();
    if (!this.masterGain) return;

    let gen: ActiveGenerator | null = null;
    switch (trackId) {
      case 'pinkNoise':
        gen = this.startPinkNoise(ctx, this.masterGain);
        break;
      case 'binaural':
        gen = this.startBinaural(ctx, this.masterGain);
        break;
      case 'rain':
        gen = this.startRain(ctx, this.masterGain);
        break;
      case 'cafe':
        gen = this.startCafe(ctx, this.masterGain);
        break;
    }

    if (gen) {
      this.activeGenerators.set(trackId, gen);
    }
  }

  public stopTrack(trackId: SoundTrackId): void {
    const gen = this.activeGenerators.get(trackId);
    if (gen) {
      gen.stop();
      this.activeGenerators.delete(trackId);
    }
  }

  public stopAll(): void {
    this.activeGenerators.forEach((gen) => gen.stop());
    this.activeGenerators.clear();
  }

  public isTrackPlaying(trackId: SoundTrackId): boolean {
    return this.activeGenerators.has(trackId);
  }

  public setTrackVolume(trackId: SoundTrackId, volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.trackVolumes[trackId] = clamped;

    const gen = this.activeGenerators.get(trackId);
    if (gen && this.ctx) {
      const now = this.ctx.currentTime;
      // Smooth 40ms parameter ramp to eliminate volume stepping zipper noise
      gen.gainNode.gain.setTargetAtTime(Math.max(0.0001, clamped), now, 0.04);
    }
  }

  public setMasterVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.masterVolume = clamped;

    if (this.masterGain && this.ctx && !this.isMuted) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(clamped, now, 0.04);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const target = this.isMuted ? 0.0001 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(target, now, 0.04);
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const target = muted ? 0.0001 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(target, now, 0.04);
    }
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getTrackVolume(trackId: SoundTrackId): number {
    return this.trackVolumes[trackId] ?? 0.5;
  }

  public getAllTrackVolumes(): Record<SoundTrackId, number> {
    return { ...this.trackVolumes };
  }

  public getActiveTrackIds(): SoundTrackId[] {
    return Array.from(this.activeGenerators.keys());
  }
}

// Singleton Soundscape Engine Instance
export const soundscapeEngine = new SoundscapeEngine();
