# audio.js — Web Audio API sound system

## Purpose
All sound effects. No game state or DOM access.

## Exports (globals)
| Name | Description |
|---|---|
| `audioCtx` | Shared AudioContext (singleton) |
| `playSound(freq, duration, type)` | Low-level oscillator sound |
| `sounds` | Named sound effects object |

## sounds API
| Key | Trigger |
|---|---|
| `sounds.cardPlay()` | Card played by player |
| `sounds.pointScored()` | Player wins a point |
| `sounds.aiTurn()` | AI begins its turn |
| `sounds.block()` | Block attempt |
| `sounds.combo()` | Combo completed |
| `sounds.error()` | Player loses a point |
| `sounds.energy()` | Energy event (unused — reserved) |

## How to add a sound
```js
sounds.myNew = () => {
  playSound(440, 0.2);                          // freq (Hz), duration (s)
  setTimeout(() => playSound(880, 0.1), 100);   // optional chord/sequence
};
```

## Notes
- `playSound` wraps each call in try/catch — audio failures are silent.
- `audioCtx` is created at module load time. Browsers may suspend it until a user gesture;
  the first user click (e.g. start button) typically resumes it automatically.
- `type` parameter accepts any OscillatorType: `'sine'` (default), `'square'`, `'triangle'`, `'sawtooth'`.
