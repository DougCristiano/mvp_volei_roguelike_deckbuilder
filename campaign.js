// ─── campaign.js — Campaign mode: team data and passive effect helpers ─────────
// Owner: Campaign agent. Defines CAMPAIGN_TEAMS and exposes applyTeamPassive().
// Loaded in index.html (after data.js) and campaign.html.
//
// Deck design philosophy — "minimalista e crescimento durante a campanha":
//   Base deck for ALL teams: 3 service + 3 defense + 2 setting + 3 attack + 3 block = 14 cartas
//   Each team shifts +2 to their specialty → specialty type gets 5 copies.
//   Result: 16 cartas por dupla, sem Treinador no início (adicionados em Atos futuros).
//   Isso força escolhas de draw e cria tensão — você recicla o deck inteiro vários vezes por partida.
//   Crescimento: a cada Ato (10-15 partidas), o jogador escolhe ~5 cartas para adicionar.

// Single source of truth for base deck composition (used in campaign.html preview and deck.js buildDeck)
const BASE_DECK_COPIES = { service: 3, defense: 3, setting: 2, attack: 3, block: 3 };

const CAMPAIGN_TEAMS = {

  // ── Dupla 1: Ataque ────────────────────────────────────────────────────────
  // service:3 defense:3 setting:2 attack:5 block:3  = 16
  meteoros: {
    id:      'meteoros',
    name:    'Os Meteoros',
    players: ['Lucas', 'Kauã'],
    desc:    'Atacam com tudo. Não perdoam erros do adversário.',
    flavor:  '"Cada cortada é uma sentença."',
    emoji:   '🔥',
    color:   '#C94A1A',
    colorBg: 'linear-gradient(160deg, #F97316 0%, #C94A1A 100%)',
    colorAccent: '#FF9A5C',
    stats:   { atk: 5, def: 2, blk: 3 },
    // +2 attack. Base: service:3 defense:3 setting:2 attack:3 block:3
    deckBias:    { attack: 5 },
    passive:     '+2 de poder em cada ataque da dupla.',
    passiveDesc: 'Sua agressividade natural eleva todo ataque em +2 pontos de poder — sem custo adicional.',
    specialBadge: 'ATAQUE',
  },

  // ── Dupla 2: Bloqueio ──────────────────────────────────────────────────────
  // service:3 defense:3 setting:2 attack:3 block:5  = 16
  muralha: {
    id:      'muralha',
    name:    'A Muralha',
    players: ['Thiago', 'Felipe'],
    desc:    'Nenhuma cortada passa. A rede é território deles.',
    flavor:  '"Pode tentar. A gente bloqueia tudo."',
    emoji:   '🧱',
    color:   '#1E3A8A',
    colorBg: 'linear-gradient(160deg, #3B82F6 0%, #1E3A8A 100%)',
    colorAccent: '#93C5FD',
    stats:   { atk: 2, def: 3, blk: 5 },
    // +2 block. Base: service:3 defense:3 setting:2 attack:3 block:3
    deckBias:    { block: 5 },
    passive:     'Primeiro bloqueio de cada ponto custa 0 energia.',
    passiveDesc: 'Uma vez por ponto, a dupla sobe no bloqueio sem gastar energia — reflexo puro de quem vive na rede.',
    specialBadge: 'BLOQUEIO',
  },

  // ── Dupla 3: Defesa ────────────────────────────────────────────────────────
  // service:3 defense:5 setting:2 attack:3 block:3  = 16
  fortaleza: {
    id:      'fortaleza',
    name:    'A Fortaleza',
    players: ['Ana', 'Júlia'],
    desc:    'Devolvem tudo. Paciência e resistência definem seu jogo.',
    flavor:  '"A bola sempre volta. Sempre."',
    emoji:   '🛡️',
    color:   '#155A35',
    colorBg: 'linear-gradient(160deg, #22C55E 0%, #155A35 100%)',
    colorAccent: '#86EFAC',
    stats:   { atk: 3, def: 5, blk: 2 },
    // +2 defense. Base: service:3 defense:3 setting:2 attack:3 block:3
    deckBias:    { defense: 5 },
    passive:     'Taxa de sucesso de defesa +5% em todos os tiers.',
    passiveDesc: 'Anos de treino em recepção fazem cada defesa ser um pouco mais sólida — até as mais difíceis têm mais chance.',
    specialBadge: 'DEFESA',
  },
};

// Returns the active campaign team object from G, or null if not in campaign mode.
function getCampaignTeam() {
  if (!G || !G.campaignTeam) return null;
  return CAMPAIGN_TEAMS[G.campaignTeam] || null;
}

// ── Rewards system ────────────────────────────────────────────────────────────
// Weight for card rarity: lower level = higher chance
const RARITY_WEIGHT = { 'basico': 60, 'intermediario': 30, 'avancado': 10 };

// Select 3 unique random cards based on rarity weights
function selectRewardCards(count = 3) {
  if (!CARDS_DB || CARDS_DB.length === 0) return [];

  // Filter out cards already in deck
  const deckCardIds = new Set();
  if (G && G.deck) G.deck.forEach(c => deckCardIds.add(c.id));
  if (G && G.hand) G.hand.forEach(c => deckCardIds.add(c.id));
  if (G && G.discard) G.discard.forEach(c => deckCardIds.add(c.id));

  const availableCards = CARDS_DB.filter(c => !deckCardIds.has(c.id));
  if (availableCards.length === 0) return [];

  // Weighted random selection
  const selected = [];
  for (let i = 0; i < Math.min(count, availableCards.length); i++) {
    let pick = null;
    let maxAttempts = 50;

    while (!pick && maxAttempts-- > 0) {
      const candidate = availableCards[Math.floor(Math.random() * availableCards.length)];
      if (!selected.some(c => c.id === candidate.id)) {
        const roll = Math.random() * 100;
        const weight = RARITY_WEIGHT[candidate.level] || 50;
        if (roll < weight) {
          pick = candidate;
        }
      }
    }

    // Fallback: pick any available card
    if (!pick) {
      for (let c of availableCards) {
        if (!selected.some(x => x.id === c.id)) {
          pick = c;
          break;
        }
      }
    }

    if (pick) selected.push(pick);
  }

  return selected;
}

// Add a card to the campaign deck
function addCardToReward(cardId) {
  if (!G || !cardId) return;
  const card = CARDS_DB.find(c => c.id === cardId);
  if (!card) return;
  G.deck.push({ ...card });
  // Deck will be reshuffled on next drawPhaseOptions() call
}
