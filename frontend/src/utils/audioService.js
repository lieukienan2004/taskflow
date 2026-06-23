// Web Audio API Synthesized Sound Service for TaskFlow
// Synthesizes premium sounds programmatically. No external audio assets needed!

const MUTE_KEY = 'taskflow_audio_muted';
let isMuted = localStorage.getItem(MUTE_KEY) === 'true';

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  return new AudioContextClass();
};

export const audioService = {
  get isMuted() {
    return isMuted;
  },

  set isMuted(val) {
    isMuted = val;
    localStorage.setItem(MUTE_KEY, String(val));
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.playClickSound();
    return this.isMuted;
  },

  // 1. Soft woody click for UI button interactions
  playClickSound() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  },

  // 2. Beautiful magic chime sweep for task completions
  playSuccessSound() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Chime sweep: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.06, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.4);
    });
  },

  // 3. Triumphant retro fanfare for Level Up and unlocking achievements
  playLevelUpSound() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Hero Fanfare: C4 (0s), G4 (0.08s), C5 (0.16s), E5 (0.24s), G5 (0.32s), C6 (0.4s to 0.75s)
    const notes = [
      { f: 261.63, d: 0.08 },
      { f: 392.00, d: 0.08 },
      { f: 523.25, d: 0.08 },
      { f: 659.25, d: 0.08 },
      { f: 783.99, d: 0.08 },
      { f: 1046.50, d: 0.45 }
    ];

    let timeOffset = 0;
    notes.forEach((note, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Use a mix of triangle and sine for a rich retro brass tone
      osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(note.f, now + timeOffset);

      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(idx === notes.length - 1 ? 0.08 : 0.05, now + timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + note.d + 0.02);

      timeOffset += 0.07;
    });
  }
};
