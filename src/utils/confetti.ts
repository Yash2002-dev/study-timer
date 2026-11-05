import confetti from 'canvas-confetti';

const NEON_PALETTE = ['#6366F1', '#10B981', '#06B6D4', '#F59E0B', '#EC4899', '#A855F7'];

/**
 * Triggers a grand multi-stage confetti burst celebrating a 4-session streak milestone
 */
export function triggerMilestoneConfetti(): void {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: NEON_PALETTE,
      disableForReducedMotion: true,
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Dynamic staggered explosion waves
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // Side cannons after 250ms
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: NEON_PALETTE,
        zIndex: 9999,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: NEON_PALETTE,
        zIndex: 9999,
      });
    }, 250);
  } catch (err) {
    console.warn('Canvas-confetti error or not available in environment:', err);
  }
}

/**
 * Subtle celebration on completing a single focus session
 */
export function triggerSessionCompleteConfetti(): void {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#6366F1', '#10B981', '#06B6D4'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });
  } catch (err) {
    console.warn('Canvas-confetti error:', err);
  }
}

