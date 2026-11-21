// Tiny WebAudio bleeps, synthesised on the spot — no audio files, nothing to load. A find
// chimes two bright notes, a mistake buzzes low, a hint pings softly and a cleared harbour
// gets a little arpeggio. The context is created lazily on the first user gesture (browsers
// refuse one before that) and every failure is swallowed: the game never needs its sounds.

export function createAudio() {
  let context = null;

  function ensureContext() {
    if (context === null) {
      try {
        context = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        context = null;
      }
    }
    if (context !== null && context.state === 'suspended') {
      context.resume().catch(() => {});
    }
    return context;
  }

  function tone(freq, start, duration, type, gain) {
    const ctx = ensureContext();
    if (ctx === null) return;
    try {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + start;
      amp.gain.setValueAtTime(0.0001, t0);
      amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
      amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.05);
    } catch {
      // Sound is garnish; a failed bleep must never break a click.
    }
  }

  return {
    unlock() {
      ensureContext();
    },
    playFind() {
      tone(880, 0, 0.14, 'sine', 0.16);
      tone(1318, 0.07, 0.2, 'sine', 0.14);
    },
    playMiss() {
      tone(138, 0, 0.16, 'square', 0.07);
    },
    playHint() {
      tone(1568, 0, 0.25, 'sine', 0.08);
    },
    playWin() {
      tone(659, 0, 0.16, 'triangle', 0.14);
      tone(880, 0.11, 0.16, 'triangle', 0.14);
      tone(1108, 0.22, 0.16, 'triangle', 0.14);
      tone(1318, 0.33, 0.3, 'triangle', 0.15);
    },
    playLose() {
      tone(392, 0, 0.2, 'triangle', 0.12);
      tone(311, 0.16, 0.32, 'triangle', 0.12);
    },
  };
}
