// ─── campaign.js — Campaign mode: team data and passive effect helpers ─────────
// Owner: Campaign agent. Defines CAMPAIGN_TEAMS and exposes applyTeamPassive().
// Loaded in index.html (after data.js) and campaign.html.

const CAMPAIGN_TEAMS = {

  // ── Dupla 1: Ataque ────────────────────────────────────────────────────────
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
    // Deck: +2 attack cards, −2 service cards  (attack: 9, service: 5, rest: 7)
    deckBias:   { attack: 9, service: 5 },
    passive:    '+2 de poder em cada ataque da dupla.',
    passiveDesc:'Sua agressividade natural eleva todo ataque em +2 pontos de poder — sem custo adicional.',
    specialBadge: 'ATAQUE',
  },

  // ── Dupla 2: Bloqueio ──────────────────────────────────────────────────────
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
    // Deck: +2 block cards, −2 service cards  (block: 9, service: 5, rest: 7)
    deckBias:   { block: 9, service: 5 },
    passive:    'Primeiro bloqueio de cada ponto custa 0 energia.',
    passiveDesc:'Uma vez por ponto, a dupla sobe no bloqueio sem gastar energia — reflexo puro de quem vive na rede.',
    specialBadge: 'BLOQUEIO',
  },

  // ── Dupla 3: Defesa ────────────────────────────────────────────────────────
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
    // Deck: +2 defense cards, −2 service cards  (defense: 8, service: 5, rest: 7)
    deckBias:   { defense: 9, service: 5 },
    passive:    'Taxa de sucesso de defesa +5% em todos os tiers.',
    passiveDesc:'Anos de treino em recepção fazem cada defesa ser um pouco mais sólida — até as mais difíceis têm mais chance.',
    specialBadge: 'DEFESA',
  },
};

// Returns the active campaign team object from G, or null if not in campaign mode.
function getCampaignTeam() {
  if (!G || !G.campaignTeam) return null;
  return CAMPAIGN_TEAMS[G.campaignTeam] || null;
}
