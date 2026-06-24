# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Quick Start

**⚠️ npm is ONLY for tests.** The game itself is 100% vanilla JS/HTML/CSS with no build step.

### Running the Game
Just open in a browser:
- **Main game:** `index.html`
- **Campaign select:** `campaign.html`
- **Card catalog:** `catalog.html`
- **Game wiki:** `wiki.html`

No npm, no server, no build needed. Modify files and refresh browser to see changes.

### Running Tests
```bash
npm test              # Run all tests once
npm test -- --watch  # Watch mode (rerun on file changes)
npm test -- --coverage  # Coverage report
```

**Test setup:** Jest runs in Node.js (not browser). Tests are in `tests/` directory and only test pure functions (data.js, combat.js, deck.js) — no DOM or browser APIs in tests.

---

## Project Overview

**Ascension** is a beach volleyball roguelike deckbuilder where you act as a team coach making tactical card choices to win rallies and sets. The game runs entirely in the browser with no backend for single-player/campaign modes (multiplayer uses peer-to-peer via PeerJS).

**Tech stack:**
- HTML5, CSS3, Vanilla JavaScript (no framework)
- Jest for unit tests
- PeerJS for multiplayer WebRTC
- Web Audio API for sound effects
- Responsive design: mobile to 4K

**Language:** Portuguese (Brazil)

---

## Architecture: 10 Core Modules

The game loads 11 JS files in strict order (see `index.html` tail). **Load order matters** — each module depends on globals defined by previous modules:

```
1. data.js              — Card database (CARDS_DB), phase names, defense quality tiers, combo sequence
2. campaign.js          — Campaign teams (CAMPAIGN_TEAMS), deck config, reward selection, match progression
3. audio.js             — Web Audio API sound effects (sounds.*)
4. state.js             — Game state G, newGame(), startPoint(), startNextCampaignMatch()
5. deck.js              — Deck management: buildDeck(), resetDeck(), drawPhaseOptions(), shuffle()
6. render.js            — DOM rendering: render(), showRewards(), showEnd(), UI updates
7. input.js             — Player input: selectCard(), playCard(), rerollOption(), bonus application
8. combat.js            — Rally resolution: resolveDefense(), resolveBlock(), resolvePlayerAttack(), checkSet()
9. ai.js                — AI decision-making: aiTurn(), getAIPlay()
10. multiplayer.js      — PeerJS networking: sendData(), setupConnectionHandlers()
11. main.js             — Menu, event listeners, game loop wiring
```

### Key Module Responsibilities

| Module | Owns | Depends On |
|---|---|---|
| **data.js** | Card definitions, combat tiers, game constants | None |
| **campaign.js** | Campaign progression config (3 matches), team data, reward weights | data.js |
| **state.js** | Global G object, match initialization, point resets | campaign.js, deck.js |
| **combat.js** | Rally outcome logic, gap-based defense quality, block resolution | data.js, state.js |
| **ai.js** | AI play selection and behavior scaling | data.js, state.js, deck.js, combat.js |
| **render.js** | All DOM updates, canvas rendering, UI state | state.js, data.js |
| **input.js** | Player card selection and card effects | render.js, state.js, combat.js |
| **multiplayer.js** | Peer connection setup, packet dispatch | state.js, combat.js, data.js |

---

## Core Concepts

### Game State (G)

`G` is a single global object initialized in `state.js:newGame()`. It contains:
- **Score:** `pPts`, `aPts`, `pSets`, `aSets`
- **Resources:** `energy`, `aiEnergy`
- **Cards:** `deck`, `hand`, `discard`
- **Rally state:** `phase` (service|defense|setting|attack), `possession`, windows (defWindow, blockWindow)
- **Campaign:** `campaignTeam`, `campaignMatchIndex`, `aiDifficulty`
- **Log:** `log` array for game messages (rendered in UI)

**Rule:** Only `state.js` initializes G, and only `render.js` mutates the DOM based on G. No circular dependencies between modules.

### Defense Quality System (5-Tier Gap-Based)

After a defense or attack, a "gap" is calculated: `gap = defenderPower - attackerPower`.

| Tier | Gap Range | Success Rate | Next Attack Bonus |
|---|---|---|---|
| Ataque Dominante | ≤ -7 | 0% | -2 |
| Vantagem Ofensiva | -6 to -4 | 25% | -1 |
| Equilíbrio | -3 to +3 | 95% | 0 |
| Vantagem Defensiva | +4 to +6 | 100% | +2 |
| Defesa Dominante | ≥ +7 | 100% | +4 |

This is defined in `data.js:DEFENSE_QUALITY_RANGES` and used by `combat.js:getDefenseQuality()` and `ai.js:aiTurn()`.

### Campaign Progression (3 Fixed Matches)

Campaign is a 3-match sequence with escalating set disadvantage and AI difficulty:

1. **Jogo 1 de 3:** player 1×0, AI easy (30% block, 50% draw chance)
2. **Semifinal:** player 1×1, AI medium (50% block, 30% draw chance)
3. **Final:** player 0×1, AI hard (70% block, 10% draw chance, picks best card)

After each match win, player picks 1 of 3 random reward cards to add to deck. Config in `campaign.js:CAMPAIGN_MATCH_CONFIG`.

### Multiplayer (PeerJS)

Peers establish a DataConnection and exchange packets:
- `PLAY_CARD`, `SETTING_PLAY`, `ATTACK`, `DEFENSE_SUCCESS`, `DEFENSE_FAIL`, `POINT_END`, etc.
- Each packet includes `data.energy` for opponent energy sync
- Host is authoritative for score (sends `POINT_END`)
- See `multiplayer.js` for full packet types and handlers

---

## Critical Rules & Patterns

### ✅ DO:
- **Read `docs/[module].md` before touching any module** — it's self-contained: G properties, rules, invariants. Only open AGENT.md if the doc doesn't answer your question.
- **Update `docs/[module].md` when expected behavior changes** — mechanic added/changed, G property added, function renamed, business rule altered. Do NOT update for: bug fixes where the doc already described the correct behavior (code was wrong, not the doc), internal refactors with no interface change, CSS or log text tweaks. Ask: "would an AI reading this doc tomorrow have a wrong expectation?" → if yes, update.
- **Edit G only in `state.js`** (initialization) or legitimate handlers (combat.js when resolving actions)
- **Call `render()` after G changes** to sync DOM to state
- **Add tests to `tests/` for core logic** (combat, deck, data) — Jest runs on Node with `module.exports`
- **Use CSS custom properties** (`var(--color)`) for theming, defined at `:root` in `style.css`
- **Log actions to `G.log`** for the in-game message display

### ❌ DON'T:
- **Open AGENT.md as first step** — go to the relevant `docs/[module].md` first; AGENT.md is for design decisions and history, not implementation reference
- **Mutate G from render.js** — render reads G, never writes to it
- **Skip load order** — circular dependencies will cause undefined globals
- **Add a build step** — files are loaded directly by `<script>` tags
- **Hardcode magic numbers** — use constants in `data.js` (PHASE_NAMES, WIN_PTS, etc.)
- **Import modules dynamically** — everything is a global loaded upfront
- **Bypass state.js** — G initialization happens there; resist duplicating initialization logic elsewhere

### Test Coverage

- **Target files:** `data.js`, `combat.js`, `deck.js` (see `jest.config.js`)
- **Coverage threshold:** 70% lines
- **Test pattern:** pure functions (getDefenseQuality, _checkWinCondition, shuffle) with no DOM or G mutation
- **Run:** `npm test` or `npm test -- --watch` during development

---

## Common Tasks

### Adding a New Card

1. Add card object to `CARDS_DB` in `data.js` (id, name, type, cost, power, phases, bonus, level, desc)
2. Card is automatically available in decks (via `deck.js:buildDeck()`) and reward pools (`campaign.js:selectRewardCards()`)
3. Type must be one of: `service`, `defense`, `setting`, `attack`, `block`, `coach`
4. Phases must include valid phase names from `PHASE_NAMES`

### Changing AI Difficulty

- **Block chance:** `combat.js:resolvePlayerAttack()` uses `blockChances = [0.30, 0.50, 0.70]` indexed by `G.aiDifficulty`
- **Card selection:** `ai.js:getAIPlay()` uses `drawChances = [0.50, 0.30, 0.10]`, and difficulty 2 sorts cards by power
- Set `G.aiDifficulty = 0|1|2` and the AI adapts immediately (campaign does this in `state.js:startNextCampaignMatch()`)

### Adding a Campaign Match

1. Add entry to `CAMPAIGN_MATCH_CONFIG` in `campaign.js`: `{ matchIndex: N, pSets, aSets, aiDifficulty, label }`
2. `state.js:startNextCampaignMatch()` uses this config to apply match state
3. Campaign ends when `campaignMatchIndex > CAMPAIGN_MATCH_CONFIG.length`; `render.js:showEnd()` detects final match win

### Debugging Game State

1. Open browser DevTools (F12)
2. In console, type `G` to inspect full state
3. Type `G.log` to see all game messages
4. Type `CARDS_DB` to see all cards
5. Modify `G` directly (e.g., `G.energy = 10`) to test edge cases

---

## Design Constraints

1. **Single global (G):** Simplifies passing state around, no props drilling, clear ownership
2. **No framework:** Vanilla JS keeps the codebase lean and readable; direct DOM manipulation
3. **No build step:** Files load as-is; bundle size is ~150KB uncompressed
4. **Responsiveness:** CSS is mobile-first with 6 breakpoints; `100svh` for viewport height
5. **Accessibility:** Game is playable entirely by keyboard (click or Enter to select)

---

## How to navigate — what to read for each task

| Task | Read first |
|---|---|
| Changing card data / adding cards | `docs/data.md` |
| Changing selection or play logic | `docs/input.md` |
| Changing combat resolution / scoring | `docs/combat.md` |
| Changing deck draw / shuffle | `docs/deck.md` |
| Changing AI behavior | `docs/ai.md` |
| Changing game state / lifecycle | `docs/state.md` |
| Changing DOM / UI rendering | `docs/render.md` |
| Changing multiplayer packets | `docs/multiplayer.md` |
| Game design decisions / history | `AGENT.md` |

Each `docs/*.md` is self-contained: it lists the G properties the module uses, the functions it calls, and all the business rules needed to make changes without reading AGENT.md.

---

## Git Workflow

- **Main branch:** production-ready code
- **Commit messages:** Clear, single-sentence (e.g., "Fix: AI blocker chance scaling in campaign matches")
- **Changelog:** Update AGENT.md "Histórico de Mudanças" after substantial changes
- **No force-push:** Work on feature branches, create PR for review
