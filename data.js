// ─── data.js — Cards database and game constants ───────────────────────────
// Owner: Data agent. Add cards here; do not add game logic.

const CARDS_DB = [
  {id:'srv1',name:'Saque Flutuante',type:'service',cost:1,power:3,desc:'Equilibrado e seguro.',phases:['service']},
  {id:'srv2',name:'Saque Potente',type:'service',cost:2,power:5,desc:'Agressivo. Dificulta a recepção.',phases:['service']},
  {id:'srv3',name:'Saque Tático',type:'service',cost:0,power:1,desc:'Controlado. Guarda energia.',phases:['service']},

  {id:'def1',name:'Manchete Firme',type:'defense',cost:1,power:4,desc:'Defesa estável.',phases:['defense']},
  {id:'def2',name:'Mergulho',type:'defense',cost:0,power:2,desc:'Grátis. Salva bolas.',phases:['defense']},
  {id:'def3',name:'Leitura de Jogo',type:'defense',cost:2,power:4,desc:'+2 Energia.',phases:['defense'],bonus:'energy2'},
  {id:'def4',name:'Posicionamento Perfeito',type:'defense',cost:2,power:7,desc:'Forte absorção de impacto.',phases:['defense']},
  {id:'def5',name:'Defesa de Manchete',type:'defense',cost:1,power:5,desc:'Boa leitura do ataque.',phases:['defense']},
  {id:'def6',name:'Defesa Heroica',type:'defense',cost:3,power:10,desc:'Defesa espetacular contra cravadas.',phases:['defense']},

  {id:'set1',name:'Levantamento Alto',type:'setting',cost:1,power:0,desc:'+3 poder no ataque.',phases:['setting'],bonus:'atkBoost3'},
  {id:'set2',name:'Levantamento Rápido',type:'setting',cost:2,power:0,desc:'+6 poder no ataque.',phases:['setting'],bonus:'atkBoost6'},
  {id:'set3',name:'Levantamento de Costas',type:'setting',cost:1,power:0,desc:'Engana bloqueio (-2 def Adv.).',phases:['setting'],bonus:'aiDefMinus2'},

  {id:'atk1',name:'Cortada Diagonal',type:'attack',cost:2,power:6,desc:'Explora ângulos da quadra.',phases:['attack'],outcomes:{point:0.50,blocked:0.15,out:0.25,net:0.10}},
  {id:'atk2',name:'Ponta Aberta',type:'attack',cost:1,power:3,desc:'Ataque seguro e eficiente.',phases:['attack'],outcomes:{point:0.55,blocked:0.30,out:0.05,net:0.10}},
  {id:'atk3',name:'Bola na Linha',type:'attack',cost:3,power:9,desc:'Poder massivo, alto risco.',phases:['attack'],outcomes:{point:0.45,blocked:0.25,out:0.20,net:0.10}},
  {id:'atk4',name:'Finta',type:'attack',cost:1,power:2,desc:'Adv. defende com -2.',phases:['attack'],bonus:'aiDefMinus2',outcomes:{point:0.60,blocked:0.15,out:0.10,net:0.15}},
  {id:'atk5',name:'Ataque Fundo',type:'attack',cost:2,power:5,desc:'Força o adversário para trás.',phases:['attack'],outcomes:{point:0.40,blocked:0.10,out:0.35,net:0.15}},

  {id:'blk1',name:'Bloqueio Simples',type:'block',cost:1,power:3,desc:'Tenta parar o ataque na rede.',phases:['block']},
  {id:'blk2',name:'Paredão',type:'block',cost:2,power:6,desc:'Grande chance de ponto direto.',phases:['block']},
  {id:'blk3',name:'Leitura de Bloqueio',type:'block',cost:1,power:4,desc:'Equilibrado. Boa chance de amortecer.',phases:['block']},

  {id:'sup1',name:'Foco',type:'support',cost:0,power:0,desc:'+2 Energia.',phases:['defense','setting','attack'],bonus:'energy2'},
  {id:'sup2',name:'Comunicação',type:'support',cost:1,power:0,desc:'+1 Uso Livre.',phases:['defense','setting','attack'],bonus:'draw1'},
];

const PHASE_NAMES = {
  service: 'Saque',
  setting: 'Levantamento',
  attack: 'Ataque',
  defense: 'Defesa',
  block: 'Bloqueio',
};

const COMBO_SEQ = ['defense', 'setting', 'attack'];

// Gap = defPow - attackPow (negative = attack stronger than defense)
const DEFENSE_QUALITY_RANGES = {
  critica: { min: 4,        max: Infinity, desc: 'Perfeita', emoji: '⭐', nextAtkBonus:  3, successRate: 1.00 },
  boa:     { min: 0,        max: 3,        desc: 'Boa',      emoji: '✅', nextAtkBonus:  1, successRate: 0.95 },
  ruim:    { min: -3,       max: -1,       desc: 'Ruim',     emoji: '⚠️', nextAtkBonus: -1, successRate: 0.30 },
  miss:    { min: -Infinity, max: -4,      desc: 'Miss',     emoji: '❌', nextAtkBonus: -2, successRate: 0.00 },
};
