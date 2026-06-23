// ─── data.js — Cards database and game constants ───────────────────────────
// Owner: Data agent. Add cards here; do not add game logic.

const CARDS_DB = [
  // ── SERVICE ───────────────────────────────────────────────────────────────
  {id:'srv1',name:'Saque Flutuante',   type:'service',level:'basico',       cost:1,power:3, desc:'Equilibrado e seguro.',                       phases:['service']},
  {id:'srv2',name:'Saque Potente',     type:'service',level:'intermediario', cost:2,power:5, desc:'Agressivo. Dificulta a recepção.',             phases:['service']},
  {id:'srv3',name:'Saque Tático',      type:'service',level:'basico',       cost:0,power:1, desc:'Controlado. Guarda energia.',                  phases:['service']},

  // ── DEFENSE ───────────────────────────────────────────────────────────────
  {id:'def1',name:'Manchete Firme',          type:'defense',level:'basico',       cost:1,power:4,  desc:'Defesa estável.',                              phases:['defense']},
  {id:'def2',name:'Mergulho',                type:'defense',level:'basico',       cost:0,power:2,  desc:'Grátis. Salva bolas.',                         phases:['defense']},
  {id:'def3',name:'Leitura de Jogo',         type:'defense',level:'intermediario', cost:2,power:4,  desc:'+2 Energia.',                                  phases:['defense'],bonus:'energy2'},
  {id:'def4',name:'Posicionamento Perfeito', type:'defense',level:'intermediario', cost:2,power:7,  desc:'Forte absorção de impacto.',                   phases:['defense']},
  {id:'def5',name:'Defesa de Manchete',      type:'defense',level:'intermediario', cost:1,power:5,  desc:'Boa leitura do ataque.',                       phases:['defense']},
  {id:'def6',name:'Defesa Heroica',          type:'defense',level:'avancado',     cost:3,power:10, desc:'Defesa espetacular contra cravadas.',           phases:['defense']},

  // ── SETTING ───────────────────────────────────────────────────────────────
  {id:'set1',name:'Levantamento Alto',      type:'setting',level:'basico',       cost:1,power:0, desc:'+3 poder no ataque.',              phases:['setting'],bonus:'atkBoost3'},
  {id:'set2',name:'Levantamento Rápido',    type:'setting',level:'avancado',     cost:2,power:0, desc:'+6 poder no ataque.',              phases:['setting'],bonus:'atkBoost6'},
  {id:'set3',name:'Levantamento de Costas', type:'setting',level:'intermediario', cost:1,power:0, desc:'Engana bloqueio (-2 def Adv.).',   phases:['setting'],bonus:'aiDefMinus2'},

  // ── ATTACK ────────────────────────────────────────────────────────────────
  {id:'atk1',name:'Cortada Diagonal',type:'attack',level:'intermediario', cost:2,power:6, desc:'Explora ângulos da quadra.',        phases:['attack'],outcomes:{point:0.50,blocked:0.15,out:0.25,net:0.10}},
  {id:'atk2',name:'Ponta Aberta',    type:'attack',level:'basico',       cost:1,power:3, desc:'Ataque seguro e eficiente.',         phases:['attack'],outcomes:{point:0.55,blocked:0.30,out:0.05,net:0.10}},
  {id:'atk3',name:'Bola na Linha',   type:'attack',level:'avancado',     cost:3,power:9, desc:'Poder massivo, alto risco.',         phases:['attack'],outcomes:{point:0.45,blocked:0.25,out:0.20,net:0.10}},
  {id:'atk4',name:'Finta',           type:'attack',level:'intermediario', cost:1,power:2, desc:'Adv. defende com -2.',              phases:['attack'],bonus:'aiDefMinus2',outcomes:{point:0.60,blocked:0.15,out:0.10,net:0.15}},
  {id:'atk5',name:'Ataque Fundo',    type:'attack',level:'basico',       cost:2,power:5, desc:'Força o adversário para trás.',      phases:['attack'],outcomes:{point:0.40,blocked:0.10,out:0.35,net:0.15}},

  // ── BLOCK ─────────────────────────────────────────────────────────────────
  {id:'blk1',name:'Bloqueio Simples',    type:'block',level:'basico',       cost:1,power:3, desc:'Tenta parar o ataque na rede.',         phases:['block']},
  {id:'blk2',name:'Paredão',             type:'block',level:'intermediario', cost:2,power:6, desc:'Grande chance de ponto direto.',         phases:['block']},
  {id:'blk3',name:'Leitura de Bloqueio', type:'block',level:'basico',       cost:1,power:4, desc:'Equilibrado. Boa chance de amortecer.',  phases:['block']},

  // ── COACH (Dica do Treinador) — 1 uso por ponto, fases defensivas/ofensivas ──
  {id:'cch1',name:'Foco do Técnico',    type:'coach',level:'basico',       cost:0,power:0, desc:'+2 Energia. O técnico mantém o atleta concentrado.',      phases:['defense','setting','attack'],bonus:'energy2'},
  {id:'cch2',name:'Chamada do Técnico', type:'coach',level:'intermediario', cost:1,power:0, desc:'+1 opção extra de carta. Ajuste tático imediato.',        phases:['defense','setting','attack'],bonus:'draw1'},
];

const PHASE_NAMES = {
  service: 'Saque',
  setting: 'Levantamento',
  attack:  'Ataque',
  defense: 'Defesa',
  block:   'Bloqueio',
};

const COMBO_SEQ = ['defense', 'setting', 'attack'];

// Gap = defPow - attackPow (positive = defense wins, negative = attack wins).
// Based on the 5-tier GDD resolution system.
const DEFENSE_QUALITY_RANGES = {
  ataque_dominante:   { min: -Infinity, max: -7,       desc: 'Ataque Dominante',   emoji: '💥', nextAtkBonus: -2, successRate: 0.00 },
  vantagem_ofensiva:  { min: -6,        max: -4,       desc: 'Vantagem Ofensiva',  emoji: '⚡', nextAtkBonus: -1, successRate: 0.25 },
  equilibrio:         { min: -3,        max: +3,       desc: 'Equilíbrio',         emoji: '⚖️', nextAtkBonus:  0, successRate: 0.95 },
  vantagem_defensiva: { min: +4,        max: +6,       desc: 'Vantagem Defensiva', emoji: '🛡️', nextAtkBonus: +2, successRate: 1.00 },
  defesa_dominante:   { min: +7,        max: Infinity, desc: 'Defesa Dominante',   emoji: '⭐', nextAtkBonus: +4, successRate: 1.00 },
};
