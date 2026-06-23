// ─── audio.js — Web Audio API sound system ──────────────────────────────────
// Owner: Audio agent. Add new sounds here; do not import game state.

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, duration, type = 'sine') {
  try {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

const sounds = {
  cardPlay:    () => { playSound(523, 0.1); setTimeout(() => playSound(659, 0.1), 50); },
  pointScored: () => { playSound(800, 0.2); setTimeout(() => playSound(600, 0.3), 100); },
  aiTurn:      () => playSound(400, 0.15),
  block:       () => { playSound(700, 0.08); setTimeout(() => playSound(700, 0.08), 60); },
  combo:       () => {
    playSound(600, 0.1);
    setTimeout(() => playSound(800,  0.1), 80);
    setTimeout(() => playSound(1000, 0.1), 160);
  },
  error:  () => playSound(200, 0.2, 'square'),
  energy: () => playSound(880, 0.05),
};
