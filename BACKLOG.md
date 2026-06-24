# Project Backlog — ASCENSION Beach Volleyball Deckbuilder

**Last Updated:** 2026-06-23

---

## Overview

ASCENSION is a beach volleyball roguelike deckbuilder game. Players build dynamic decks of volleyball techniques (attack, defense, block, set, serve, coach) and face progressively challenging matches. The game uses a **5-tier gap-based resolution system** where the outcome of rallies depends on the power difference between attack and defense.

**Current Version:** MVP with 22 implemented cards, 120-card catalog design, 5-tier mechanics, coach reframe, and card collection viewer.

---

## ✅ Completed Features

### Phase 1: Core Game Loop (Completed)
- [x] Base game state management (`state.js`)
- [x] 22-card database with all types: service, defense, setting, attack, block, coach
- [x] Deck building (7 copies × 6 types = 42-card pool)
- [x] Card drawing and hand management
- [x] Phase system: service → defense → setting → attack → block
- [x] AI opponent with tactical decision-making
- [x] Audio system (coin, hits, rally sounds)

### Phase 2: Combat & Resolution (Completed)
- [x] 5-tier GDD resolution system (gap-based):
  - 💥 **Ataque Dominante** (gap ≤ -7): 0% success, -2 attack bonus
  - ⚡ **Vantagem Ofensiva** (gap -6 to -4): 25% success, -1 attack bonus
  - ⚖️ **Equilíbrio** (gap -3 to +3): 95% success, 0 attack bonus
  - 🛡️ **Vantagem Defensiva** (gap +4 to +6): 100% success, +2 attack bonus
  - ⭐ **Defesa Dominante** (gap ≥ +7): 100% success, +4 attack bonus
- [x] Block mechanics with 4-outcome system (direct point, out, soften, touched)
- [x] Attack power carryover via `nextAttackBonus` (player & AI)
- [x] Scoring system: WIN = 5 points, ≥2 lead to win set
- [x] Point and set/match end detection

### Phase 3: Card Mechanics (Completed)
- [x] Card types: 'service', 'defense', 'setting', 'attack', 'block', 'coach'
- [x] Coach type reframe (Dica do Treinador):
  - Limited to 1 use per point (`G.coachUsed`)
  - Not available during service or block phases
  - Refreshes hand when played without advancing phase
- [x] All 22 cards assigned `level` field: básico / intermediário / avançado
- [x] Card bonus effects:
  - `energy2` — restore 2 energy
  - `atkBoost3` — next attack +3
  - `atkBoost6` — next attack +6
  - `aiDefMinus2` — reduce AI defense by 2
  - `draw1` — draw 1 extra card (can't be coach)

### Phase 4: Multiplayer & Sync (Completed)
- [x] PeerJS P2P connection
- [x] Deck sync across players
- [x] Rally state sync (phase, defense quality, scores)
- [x] Point/set end sync

### Phase 5: UI & Polish (Completed)
- [x] Beach volleyball theme with CSS custom properties
- [x] Responsive design (mobile, tablet, 4K)
- [x] Sticky headers and safe-area insets
- [x] Card grid UI with type-based styling
- [x] Log system with emoji feedback
- [x] Main menu with AI/Multiplayer options
- [x] Timer UI for defense/block windows
- [x] Point result overlay

### Phase 6: Design & Documentation (Completed)
- [x] **GDD Integration**:
  - Migrated from 4-tier to 5-tier resolution system
  - Reframed "Support" as "Dica do Treinador" (Coach)
  - Added `level` field to card schema
- [x] **120-Card Design Catalog** (`docs/card-catalog.md`):
  - 30 Ataque cards (10 básico, 12 intermediário, 8 avançado)
  - 30 Defesa cards (10 básico, 12 intermediário, 8 avançado)
  - 22 Levantamento cards (7 básico, 9 intermediário, 6 avançado)
  - 22 Bloqueio cards (7 básico, 9 intermediário, 6 avançado)
  - 16 Saque cards (5 básico, 6 intermediário, 5 avançado)
  - Design-only (no code implementation yet)
- [x] **Card Collection Viewer** (`catalog.html`):
  - Shows 22 unlocked cards (CARDS_DB)
  - Shows ~99 locked cards (catalog preview)
  - Filterable by type and level
  - Searchable
  - Progress bar: "22 / ~121 desbloqueadas"
- [x] **Comprehensive Documentation**:
  - `AGENT.md` — central source of truth
  - `docs/data.md` — card schema, DEFENSE_QUALITY_RANGES
  - `docs/combat.md` — rally resolution flow
  - `docs/deck.md` — deck composition and drawing
  - `docs/card-catalog.md` — 120-card design document

---

## 📋 In Progress / Ready to Start

### Card Collection System (READY)
- [ ] **Progression system**: unlock cards as player levels up or completes challenges
- [ ] Persist unlocked cards to localStorage
- [ ] Add progression milestones (e.g., "unlock Básico cards at level 1, Intermediário at level 5, Avançado at level 10")
- [ ] Animate unlock transitions

### Game Statistics & Analytics (READY)
- [ ] Track stats: total wins, rallies played, avg rally length, most-used cards
- [ ] Display on stats page
- [ ] Add to `wiki.html`

---

## 🔄 Next Priority: Backlog Tiers

### Tier 1: Engine & Core Gameplay (High Value, Medium Effort)

#### 1a. Conditional Effects Engine
**Why:** 100+ cards have conditional text (e.g., "If opponent is tired, +2 power"; "On third touch of set, +1 energy"). Engine needed to parse and apply these.
**Scope:**
- Define conditional syntax in natural language (or simple DSL)
- Implement parser in combat/input logic
- Test with 10–15 high-impact cards first
- Rollout to full catalog

**Files:** `combat.js`, `input.js`, `data.js` (add `conditions` field)

---

#### 1b. Moral Attribute & System
**Why:** GDD specifies Moral as a dynamic stat that increases with good plays, decreases with failures. Affects next-turn bonus.
**Scope:**
- Add `G.moral: number` to state (starts at 0, range 0–10)
- Increment on successful defense (+1) and attack (+1)
- Decrement on failed defense (-2) and block failure (-1)
- Apply moral bonus to next card played (e.g., +1 power if moral ≥ 5)
- Display moral bar in UI

**Files:** `state.js`, `combat.js`, `render.js`, `input.js`

---

#### 1c. Build Archetype System
**Why:** 120-card catalog defines 6 archetypes (Potência, Técnica, Resistência, Leitura, Pressão, Bloqueio). Hook into deck building for flavor/strategy.
**Scope:**
- Tag each card with archetype(s) in data.js
- Optional: Show archetype on card UI
- Optional: Add deck-building guide showing "recommended cards for [Archetype]"

**Files:** `data.js`, `render.js` (optional UI), `wiki.html`

---

### Tier 2: Content & Features (Medium Value, Low–Medium Effort)

#### 2a. Wiki Page (Interactive Game Encyclopedia)
**Why:** Players need a centralized reference for all cards, mechanics, build guides.
**Scope:**
- Searchable/filterable card database
- Mechanic explanations (5-tier system, phases, scoring)
- Build archetype guides
- Statistics dashboard
- Glossary

**Files:** `wiki.html` (new), loads `data.js` + embedded catalog data

---

#### 2b. Progression & Challenges
**Why:** Replayability. Give players goals beyond "beat AI."
**Scope:**
- Daily challenges (e.g., "win 3 sets without using defense cards")
- Unlocks (e.g., "beat AI on hard mode → unlock Avançado cards")
- Leveling system (XP per rally, unlock higher card tiers at levels 5/10/20)
- Leaderboard (localStorage or online)

**Files:** `state.js` (add progress tracking), `main.js` (UI), `multiplayer.js` (optional sync)

---

#### 2c. Difficulty Modes
**Why:** Progression and replayability.
**Scope:**
- Beginner: AI easy, 3 points to win
- Intermediate: AI medium, 5 points to win (current)
- Advanced: AI hard, 7 points to win, AI gets +1 bonus per round
- Ranked: AI scales to player win rate

**Files:** `ai.js` (difficulty parameter), `state.js` (mode selection), `main.js` (UI)

---

#### 2d. Combos & Synergies
**Why:** Cards already have a combo counter (3-touch bonus). Expand to synergy system.
**Scope:**
- Define synergy pairs (e.g., "if Levantador → Atacante in same turn, +2 power")
- Tag cards with synergy keywords
- Bonus applied in input.js:playCard()

**Files:** `data.js` (synergy tags), `input.js` (synergy logic), `combat.js` (resolution)

---

### Tier 3: Quality & Polish (Low Value, Low Effort)

#### 3a. Mobile Optimization
**Why:** Game is responsive but touch controls could be smoother.
**Scope:**
- Larger tap targets on mobile
- Swipe gestures for phase selection
- Reduce motion for reduced-motion users

**Files:** `style.css`, `input.js`

---

#### 3b. Accessibility
**Why:** WCAG compliance + broader audience.
**Scope:**
- Color-blind mode (alternative palettes)
- High-contrast theme
- Screen reader labels (aria-labels)
- Keyboard navigation

**Files:** `style.css`, `index.html`, `catalog.html`, `wiki.html`

---

#### 3c. Sound Design
**Why:** Audio makes gameplay feel alive.
**Scope:**
- More rally sounds (whip, metal, crowd)
- Tier-based sounds (ataque_dominante = big whoosh, equilíbrio = small tap)
- Volume control

**Files:** `audio.js`

---

### Tier 4: Expansion (High Value, High Effort)

#### 4a. Campaign Mode
**Why:** Story + progression beyond sandbox play.
**Scope:**
- 10–20 AI opponents (each with preset deck, playstyle, flavor)
- Progressive difficulty (opponent 1 = easy, opponent 10 = hard)
- Unlock cosmetics, cards, themes per opponent
- Narrative between matches (PT-BR flavor text)

**Files:** `state.js` (campaign tracking), `ai.js` (opponent templates), `main.js` (UI), new `campaign.html`

---

#### 4b. Roguelike Run Mode
**Why:** Classic roguelike: pick 3-card upgrades after each win, permadeath.
**Scope:**
- Start with 10-card starter deck
- Win match → choose 3 cards to add to deck (+ remove 3 or keep deck size)
- Lose → run ends, track score
- Scaling difficulty (each win = opponent +1 power)

**Files:** `state.js` (run state), `main.js` (run UI), new `run.html`

---

#### 4c. Online Ranked & Lobbies
**Why:** Multiplayer competition and social features.
**Scope:**
- Central matchmaking server (or peer-to-peer lobby)
- Ranked rating system
- Player profiles
- Match history

**Files:** `multiplayer.js` (extend protocol), backend TBD

---

### Tier 5: Polish & Optimization (Very Low Value, Medium Effort)

#### 5a. Animations & Transitions
**Why:** Feels more polished and game-like.
**Scope:**
- Smooth card animations on play
- Slide/fade transitions between phases
- Particle effects on combo/tier promotions
- Bounce on audio feedback

**Files:** `style.css` (add keyframes), `render.js` (trigger animations)

---

#### 5b. Performance Optimization
**Why:** Smaller bundle size, faster load.
**Scope:**
- Minify CSS/JS
- Lazy-load images
- Code split modules

**Files:** Build config (if added)

---

## 🗺️ Recommended Execution Order

1. **Week 1: Backlog visibility & Wiki**
   - [ ] Create `BACKLOG.md` ← **YOU ARE HERE**
   - [ ] Create `wiki.html`

2. **Week 2–3: Core engine features**
   - [ ] Conditional effects parser
   - [ ] Moral system
   - [ ] Build archetype tags

3. **Week 4–5: Content & replayability**
   - [ ] Progression/leveling
   - [ ] Difficulty modes
   - [ ] Wiki expansion with synergy guide

4. **Beyond: Expansion content**
   - [ ] Campaign mode
   - [ ] Roguelike runs
   - [ ] Ranked multiplayer

---

## 📊 Metrics & Success Criteria

| Feature | Definition of Done |
|---|---|
| **5-Tier System** | ✅ Gap formula working, tier probabilities hit, AI uses system |
| **Coach Cards** | ✅ Type works, 1-use limit enforced, refreshes hand correctly |
| **120-Card Catalog** | ✅ Design document written, all cards have synergies/strategy notes |
| **Collection Viewer** | ✅ Shows 22 unlocked + ~99 locked, filters work, progress accurate |
| **Conditional Engine** | ⏳ 50+ cards have condition text implemented, no gamebreaking bugs |
| **Moral System** | ⏳ Stat tracks correctly, UI displays, affects gameplay noticeably |
| **Progression** | ⏳ Unlock system persists, difficulty scaling works, leaderboard accurate |
| **Wiki** | ⏳ All cards searchable, all mechanics explained, build guides clear |

---

## 🔗 File Structure & Ownership

| Module | Owner | Status |
|---|---|---|
| `data.js` | Core data | 22 cards active, 120 designed, 5-tier ranges, coach type |
| `combat.js` | Combat logic | 5-tier working, gap-based resolution active |
| `deck.js` | Deck mgmt | Coach excluded from phase options when `G.coachUsed` |
| `state.js` | State mgmt | `G.coachUsed` tracking, ready for `G.moral` |
| `render.js` | UI render | Beach theme active, responsive, card display working |
| `input.js` | Input logic | Coach handling in place, bonus effects working |
| `ai.js` | AI | Using 5-tier system, tactical choices, ready for difficulty modes |
| `multiplayer.js` | P2P sync | Quality tier sync working |
| `catalog.html` | Collection UI | 22 unlocked, ~99 locked, filters/search active |
| `wiki.html` | Reference | TBD — to be built |
| `docs/*.md` | Documentation | All modules documented, BACKLOG added |

---

## 📝 Notes

- **No breaking changes expected** for upcoming work — all additions are additive
- **Multiplayer-safe:** conditional effects & moral system can be designed P2P from day 1
- **Design-first approach:** catalog & archetypes are design-complete; code follows
- **Performance OK:** 22 cards + 42-card deck + AI is well within performance budgets

---

## 🎯 Vision

**ASCENSION** aims to be a roguelike deckbuilder that captures the strategy, tension, and beauty of beach volleyball:
- **Strategy:** Card synergies, build archetypes, adaptive play
- **Tension:** Rally rallies where outcome is probabilistic until the end
- **Beauty:** Authentic volleyball mechanics, clean UI, satisfying feedback

Long term: campaign mode with personality, ranked multiplayer, roguelike runs, cosmetics.
