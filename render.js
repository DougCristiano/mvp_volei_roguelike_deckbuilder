// ─── render.js — UI rendering ───────────────────────────────────────────────
// Owner: UI/Render agent. All DOM mutations live here.
// Depends on: data.js (PHASE_NAMES), state.js (G)
// Rule: render() must remain a pure read of G — no state mutation allowed here.

function render() {
  document.getElementById('point-display').textContent = `${G.pPts} — ${G.aPts}`;

  const setsEl = document.getElementById('sets-display');
  if (setsEl) setsEl.textContent = `Sets: ${G.pSets} × ${G.aSets}`;

  // Campaign match progress indicator
  const cp = document.getElementById('campaign-progress');
  if (cp) {
    cp.style.display = G.gameMode === 'campaign' ? 'inline-block' : 'none';
    const lbl = document.getElementById('campaign-match-label');
    if (lbl && G.campaignMatchIndex) {
      const cfg = CAMPAIGN_MATCH_CONFIG[G.campaignMatchIndex - 1];
      lbl.textContent = cfg ? cfg.label : '';
    }
  }

  // Phase label
  let detailedPhase = '';
  if (G.blockWindow) {
    detailedPhase = `Seu Bloqueio (Ataque do ${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'})`;
  } else if (G.defWindow) {
    detailedPhase = G.isDefendingServe
      ? `Sua Recepção (Saque do ${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'})`
      : `Sua Defesa (Ataque do ${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'})`;
  } else if (G.possession === 'player') {
    detailedPhase = G.phase === 'service' ? 'Seu Saque' :
                    G.phase === 'defense' ? 'Sua Defesa/Recepção' :
                    G.phase === 'setting' ? 'Seu Levantamento' :
                    G.phase === 'attack'  ? 'Seu Ataque' :
                    (PHASE_NAMES[G.phase] || G.phase);
  } else {
    detailedPhase = `Turno do ${G.gameMode === 'multiplayer' ? 'Oponente' : 'IA'}`;
  }
  document.getElementById('phase-label').textContent = detailedPhase;

  // Possession badge
  const acting = (G.possession === 'player' || G.blockWindow || G.defWindow) ? 'player' : 'ai';
  const pb = document.getElementById('possession-badge');
  pb.textContent = acting === 'player' ? 'Você' : (G.gameMode === 'multiplayer' ? 'Oponente' : 'IA');
  pb.className = 'poss-' + acting;

  document.getElementById('combo-badge').style.display = G.comboIdx > 0 ? 'inline' : 'none';

  // Message area
  const msg = document.getElementById('message-area');
  if (G.pointDone)        msg.textContent = '';
  else if (G.defWindow)   msg.textContent = G.isDefendingServe ? 'Prepare a Recepção!' : 'Defenda o Ataque!';
  else if (G.blockWindow) msg.textContent = 'Ação Rápida: Bloqueio!';
  else if (G.locked)      msg.textContent = G.gameMode === 'multiplayer' ? '🧑‍💻 Oponente jogando...' : '🤖 IA jogando...';
  else if (G.phase === 'service')     msg.textContent = 'Escolha uma carta de saque';
  else if (G.possession === 'player') msg.textContent = 'Sua vez de jogar';
  else msg.textContent = G.gameMode === 'multiplayer' ? 'Aguardando Oponente...' : 'Aguardando IA...';

  // Energy pips
  const headerPips = document.getElementById('energy-pips-header');
  if (headerPips) {
    headerPips.innerHTML = '';
    for (let i = 0; i < G.maxEnergy; i++) {
      const p = document.createElement('div');
      p.className = 'energy-pip' + (i < G.energy ? ' filled' : '');
      headerPips.appendChild(p);
    }
  }
  const aiPips = document.getElementById('ai-energy-pips');
  aiPips.innerHTML = '';
  for (let i = 0; i < G.maxAiEnergy; i++) {
    const p = document.createElement('div');
    p.className = 'energy-pip' + (i < G.aiEnergy ? ' filled' : '');
    aiPips.appendChild(p);
  }

  document.getElementById('freeball-notice').style.display = (G.energy === 0 && !G.pointDone) ? 'block' : 'none';
  document.getElementById('deck-count').textContent    = G.deck.length;
  document.getElementById('discard-count').textContent = G.discard.length;

  renderHand();
  renderResolve();
  renderActions();
  renderLog();
  moveBall();
}

function renderHand() {
  const c = document.getElementById('hand-cards');
  c.innerHTML = '';
  G.hand.forEach((card, idx) => {
    const playable = canPlay(card);
    const sel      = G.selected.includes(idx);
    const blocked  = !playable || (G.locked && !G.defWindow);
    const div      = document.createElement('div');
    div.className  = 'card' + (sel ? ' selected' : '') + (blocked ? ' disabled' : '');
    div.innerHTML  = `<div class="card-type type-${card.type}">${card.type}</div>` +
                     `<div class="card-cost">${card.cost}</div>` +
                     `<div class="card-name">${card.name}</div>` +
                     `<div class="card-power">${card.power > 0 ? card.power : '—'}</div>` +
                     `<div class="card-desc">${card.desc}</div>`;
    if (!blocked) div.addEventListener('click', () => selectCard(idx));
    c.appendChild(div);
  });
}

function renderResolve() {
  const panel       = document.getElementById('resolve-panel');
  const header      = document.getElementById('resolve-header');
  const timerWrapper = document.getElementById('timer-wrapper');

  if ((G.defWindow || G.blockWindow) && !G.pointDone) {
    panel.style.display = 'block';
    panel.className     = G.blockWindow ? 'block-mode' : 'def-mode';
    header.textContent  = G.blockWindow
      ? '✋ Janela de bloqueio — bloquear ou deixar passar?'
      : '🛡️ Janela de defesa — selecione cartas e resolva';
    timerWrapper.style.display = 'flex';

    document.getElementById('atk-val').textContent = G.aiAtkPow;
    let dp = 0;
    G.selected.forEach(i => { if (G.hand[i]) dp += G.hand[i].power; });
    const defVal = document.getElementById('def-val');
    defVal.textContent   = dp;
    defVal.style.color   = dp >= G.aiAtkPow ? 'var(--teal)' : 'var(--coral)';
  } else {
    panel.style.display = 'none';
    panel.className = '';
  }
}

function renderActions() {
  const bPlay = document.getElementById('btn-play');
  const bDraw = document.getElementById('btn-reroll');
  const bPass = document.getElementById('btn-pass');
  const bRes  = document.getElementById('btn-resolve');
  const bBlk  = document.getElementById('btn-block');
  const bSkip = document.getElementById('btn-skip-block');

  bDraw.textContent = 'Trocar (1⚡)';
  bDraw.disabled    = G.locked || G.energy < 1 || G.selected.length !== 1;

  if (G.defWindow) {
    bPlay.style.display = 'none'; bBlk.style.display  = 'none';
    bDraw.style.display = 'block'; bPass.style.display = 'none';
    bRes.style.display  = 'block'; bSkip.style.display = 'none';
    bRes.disabled = !G.selected.some(i => G.hand[i]?.type !== 'coach');
  } else if (G.blockWindow) {
    bPlay.style.display = 'none'; bRes.style.display  = 'none';
    bDraw.style.display = 'block'; bPass.style.display = 'none';
    bBlk.style.display  = 'block'; bSkip.style.display = 'block';
    bBlk.disabled  = !G.selected.some(i => G.hand[i]?.type !== 'coach');
    bSkip.disabled = G.locked;
  } else {
    bPlay.style.display = 'block'; bBlk.style.display  = 'none';
    bDraw.style.display = 'block'; bPass.style.display = 'block';
    bRes.style.display  = 'none';  bSkip.style.display = 'none';
    bPlay.disabled = G.selected.length === 0 || G.locked;
    bPass.disabled = G.locked || G.phase === 'service' || G.possession !== 'player';
  }
}

function logClass(msg) {
  if (/^[✅🎉🏆]/.test(msg))   return 'log-win';
  if (/^[❌⏱]/.test(msg))      return 'log-loss';
  if (/^[🛡🧤🔁🏃🤺🤖]/.test(msg)) return 'log-ai';
  if (/^[+⚡🃏]/.test(msg))    return 'log-energy';
  if (/^🔥/.test(msg))          return 'log-combo';
  if (/^—/.test(msg))           return 'log-neutral';
  if (/^⚖/.test(msg))          return 'log-combat';
  return '';
}

function renderLog() {
  document.getElementById('log-area').innerHTML =
    G.log.slice(0, 12)
         .map(l => { const c = logClass(l); return `<div class="log-entry${c ? ' ' + c : ''}">${l}</div>`; })
         .join('');
}

// ── Ball positioning & arc animation ───────────────────────────────────────────
// Ball is driven by requestAnimationFrame: x interpolates linearly, y follows a
// parabola that arcs over the net whenever the ball changes side.
let _ballTargetKey = '';
let _ballAnimId    = null;
let _ballX = 12, _ballY = 16;  // current resolved position (x in %, y in px)
const _NET_TOP_PX = 136;       // approx top of #net-bar (bottom 40 + height 96)

function moveBall() {
  const ball = document.getElementById('ball');
  if (!ball) return;

  // Pick target anchor (element box: left %, bottom px) from game state
  let tx, ty;
  if (G.phase === 'service') {
    if (G.possession === 'player') { tx = 12; ty = 16; }  // behind left court line
    else                           { tx = 84; ty = 16; }  // behind right court line
  } else if (G.defWindow)          { tx = 46; ty = 64; }  // contested at the net
  else if (G.possession === 'player') { tx = 22; ty = 50; }
  else                             { tx = 70; ty = 50; }

  const key = tx + ',' + ty;
  if (key === _ballTargetKey) return;  // no change → don't restart animation
  _ballTargetKey = key;
  animateBall(ball, _ballX, _ballY, tx, ty);
}

function animateBall(ball, x0, y0, x1, y1) {
  if (_ballAnimId) cancelAnimationFrame(_ballAnimId);

  const crossing   = (x0 - 50) * (x1 - 50) < 0;            // changed side of the net
  const targetApex = crossing ? (_NET_TOP_PX + 18) : (Math.max(y0, y1) + 16);
  const arcH       = targetApex - (y0 + y1) / 2;           // peak (t=0.5) reaches targetApex
  const dur        = crossing ? 600 : 320;
  const spin       = crossing ? 720 : 360;
  const t0         = performance.now();

  function frame(now) {
    let t = (now - t0) / dur;
    if (t > 1) t = 1;
    const x = x0 + (x1 - x0) * t;
    const y = (y0 + (y1 - y0) * t) + arcH * 4 * t * (1 - t);
    ball.style.left      = x + '%';
    ball.style.bottom    = y + 'px';
    ball.style.transform = `rotate(${spin * t}deg)`;
    if (t < 1) {
      _ballAnimId = requestAnimationFrame(frame);
    } else {
      _ballX = x1; _ballY = y1; _ballAnimId = null;
    }
  }
  _ballAnimId = requestAnimationFrame(frame);
}

// ── Crowd (pixel-art fans doing the "ola" wave in the sand corners) ─────────────
let _crowdBuilt = false;
function initCrowd() {
  if (_crowdBuilt) return;
  const left  = document.getElementById('crowd-left');
  const right = document.getElementById('crowd-right');
  if (!left || !right) return;

  const COLORS = ['#d85a30', '#1d9e75', '#2a6fa8', '#d4a017', '#9b59b6', '#e8506e', '#ff6b6b', '#ffa500'];
  const PER_SIDE = 10;
  let waveIndex = 0;

  function fill(container, reverse) {
    for (let i = 0; i < PER_SIDE; i++) {
      const fan = document.createElement('div');
      fan.className = 'fan';
      fan.style.setProperty('--fan-color', COLORS[Math.floor(Math.random() * COLORS.length)]);
      // Stagger delays so the wave sweeps left → right across both corners
      const order = reverse ? (PER_SIDE - 1 - i) : i;
      fan.style.animationDelay = (waveIndex + order) * 0.12 + 's';
      container.appendChild(fan);
    }
  }
  fill(left, false);
  waveIndex = PER_SIDE;
  fill(right, false);
  _crowdBuilt = true;
}

function showPointResult(type, title, desc) {
  const el = document.getElementById('point-result');
  el.className = type;
  el.style.display = 'block';
  document.getElementById('point-result-title').textContent = title;
  document.getElementById('point-result-desc').textContent  = desc;
  document.getElementById('action-area').style.display = 'none';
  document.getElementById('hand-area').style.display   = 'none';
  document.getElementById('resolve-panel').style.display = 'none';
}

function hidePointResult() {
  document.getElementById('point-result').style.display = 'none';
  document.getElementById('action-area').style.display  = 'flex';
  document.getElementById('hand-area').style.display    = 'flex';
}

// Show campaign rewards screen (3 cards to choose from)
function showRewards(rewardCards) {
  if (!rewardCards || rewardCards.length === 0) return;

  const rewardsCards = document.getElementById('rewards-cards');
  rewardsCards.innerHTML = '';

  rewardCards.forEach(card => {
    const rarityClass = `rarity-${card.level}`;
    const rarityLabel = { 'basico': 'Comum', 'intermediario': 'Raro', 'avancado': 'Lendário' }[card.level] || 'Comum';

    const cardEl = document.createElement('div');
    cardEl.className = 'reward-card';
    cardEl.innerHTML = `
      <div class="reward-card-rarity ${rarityClass}">${rarityLabel}</div>
      <div class="reward-card-type type-${card.type}">${card.type.toUpperCase()}</div>
      <div class="reward-card-name">${card.name}</div>
      <div class="reward-card-power">${card.power || '–'}</div>
      <div class="reward-card-desc">${card.desc}</div>
    `;
    cardEl.onclick = () => {
      addCardToReward(card.id);
      document.getElementById('rewards-overlay').style.display = 'none';
      if (G.gameMode === 'campaign') startNextCampaignMatch();
      else startPoint();
    };
    rewardsCards.appendChild(cardEl);
  });

  document.getElementById('rewards-overlay').style.display = 'flex';
}

function showEnd(won) {
  const oppNameCap = G.gameMode === 'multiplayer' ? 'Oponente' : 'IA';
  const isCampaignFinal = G.gameMode === 'campaign' && G.campaignMatchIndex === CAMPAIGN_MATCH_CONFIG.length;

  if (won && isCampaignFinal) {
    document.getElementById('overlay-title').textContent = '🏆 Campeão da Temporada!';
    document.getElementById('overlay-msg').textContent   = 'Você venceu os 3 jogos e conquistou o título. Incrível!';
  } else if (won) {
    document.getElementById('overlay-title').textContent = '🏆 Vitória!';
    document.getElementById('overlay-msg').textContent   = `Você venceu! ${G.pSets}×${G.aSets} em sets.`;
  } else {
    document.getElementById('overlay-title').textContent = '💔 Derrota';
    document.getElementById('overlay-msg').textContent   = G.gameMode === 'campaign'
      ? `Campanha encerrada. ${oppNameCap} venceu. Tente novamente!`
      : `${oppNameCap} venceu. ${G.aSets}×${G.pSets} em sets.`;
  }

  // Extra navigation buttons
  const actions = document.getElementById('overlay-actions');
  if (actions) {
    let html = `<button class="btn btn-secondary" onclick="showMainMenu()">← Menu</button>`;
    if (G.gameMode === 'campaign') {
      html += `<a href="catalog.html" class="btn btn-secondary">📋 Coleção</a>`;
    }
    actions.innerHTML = html;
  }

  document.getElementById('overlay').style.display = 'flex';
}

// ── Pixel art sea canvas ───────────────────────────────────────────────────────
let _seaCanvasRunning = false;
function initSeaCanvas() {
  if (_seaCanvasRunning) return;
  _seaCanvasRunning = true;
  const canvas = document.getElementById('sea-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const PX = 4;

  function resize() {
    canvas.width  = canvas.offsetWidth  || canvas.parentElement.clientWidth;
    canvas.height = canvas.offsetHeight || 65;
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  const COLORS = ['#0a4a6e', '#0d6090', '#1478aa', '#1a85bb'];
  const WAVES  = [
    { yFrac: 0.18, speed: 1.2,  foam: '#5ec0e8', spray: '#c0eaff' },
    { yFrac: 0.50, speed: 0.75, foam: '#80cce0', spray: '#d0f0ff' },
    { yFrac: 0.80, speed: 1.6,  foam: '#a8dff0', spray: '#e8f8ff' },
  ];

  let offset = 0;

  function draw() {
    const W = canvas.width, H = canvas.height;
    if (W === 0 || H === 0) return;

    // Sea background (pixel rows)
    for (let y = 0; y < H; y += PX) {
      const idx = Math.min(COLORS.length - 1, Math.floor((y / H) * COLORS.length));
      ctx.fillStyle = COLORS[idx];
      ctx.fillRect(0, y, W, PX);
    }

    // Scrolling wave crests
    WAVES.forEach(w => {
      const y    = Math.floor(w.yFrac * H / PX) * PX;
      const gap  = PX * 9;
      const wOff = Math.floor(offset * w.speed) % gap;
      for (let x = -gap + wOff; x < W + gap; x += gap) {
        const bx = Math.floor(x / PX) * PX;
        ctx.fillStyle = w.foam;
        ctx.fillRect(bx,      y,      PX * 4, PX);
        ctx.fillRect(bx + PX, y - PX, PX * 2, PX); // cap above crest
        ctx.fillStyle = w.spray;
        ctx.fillRect(bx + PX * 2, y - PX * 2, PX, PX); // spray dot
      }
    });

    offset += 0.4;
  }

  (function tick() { draw(); setTimeout(() => requestAnimationFrame(tick), 125); })();
}

