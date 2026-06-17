const CARDS_DB=[
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
  {id:'set3',name:'Levantamento de Costas',type:'setting',cost:1,power:0,desc:'Engana bloqueio (-2 def IA).',phases:['setting'],bonus:'aiDefMinus2'},
  
  {id:'atk1',name:'Cortada Diagonal',type:'attack',cost:2,power:6,desc:'Alto poder.',phases:['attack']},
  {id:'atk2',name:'Ponta Aberta',type:'attack',cost:1,power:3,desc:'Ataque eficiente.',phases:['attack']},
  {id:'atk3',name:'Bola na Linha',type:'attack',cost:3,power:9,desc:'Poder massivo.',phases:['attack']},
  {id:'atk4',name:'Finta',type:'attack',cost:1,power:2,desc:'IA defende com -2.',phases:['attack'],bonus:'aiDefMinus2'},
  
  {id:'blk1',name:'Bloqueio Simples',type:'block',cost:1,power:3,desc:'Tenta parar o ataque na rede.',phases:['block']},
  {id:'blk2',name:'Paredão',type:'block',cost:2,power:6,desc:'Grande chance de ponto direto.',phases:['block']},
  {id:'blk3',name:'Leitura de Bloqueio',type:'block',cost:1,power:4,desc:'Equilibrado. Boa chance de amortecer.',phases:['block']},
  
  {id:'sup1',name:'Foco',type:'support',cost:0,power:0,desc:'+2 Energia.',phases:['defense','setting','attack'],bonus:'energy2'},
  {id:'sup2',name:'Comunicação',type:'support',cost:1,power:0,desc:'+1 Uso Livre.',phases:['defense','setting','attack'],bonus:'draw1'},
];

const PHASE_NAMES={service:'Saque',setting:'Levantamento',attack:'Ataque',defense:'Defesa',block:'Bloqueio'};
const COMBO_SEQ=['defense','setting','attack'];
let G={};

function newGame(){
  G={pPts:0,aPts:0,pSets:0,aSets:0,energy:10,maxEnergy:10,aiEnergy:10,maxAiEnergy:10,deck:[],hand:[],discard:[],phase:'service',possession:'player',nextServer:'player',comboIdx:0,atkBoost:0,aiDefMinus:0,aiAtkPow:0,selected:[],defWindow:false,blockWindow:false,locked:false,pointDone:false,log:[],blockTimerVal:0,blockInterval:null,defTimerVal:0,defInterval:null,aiJustDefended:false};
  buildDeck();startPoint();
}

function buildDeck(){
  let pool=[];
  const types = ['service', 'setting', 'attack', 'defense', 'block', 'support'];
  types.forEach(t => {
    const typeCards = CARDS_DB.filter(c => c.type === t);
    for(let i=0; i<6; i++) pool.push({...typeCards[i % typeCards.length]});
    for(let i=0; i<7; i++) pool.push({...typeCards[i % typeCards.length]});
  });
  G.deck=shuffle(pool);
}

function shuffle(arr){let a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function resetDeck(){G.deck=[...G.deck,...G.hand,...G.discard];G.hand=[];G.discard=[];G.deck=shuffle(G.deck);}

function clearHand() {
  G.discard.push(...G.hand);
  G.hand = [];
  G.selected = [];
}

function drawPhaseOptions() {
  clearHand();
  let phases = [];
  if (G.blockWindow) phases = ['block'];
  else if (G.defWindow) phases = ['defense', 'support'];
  else phases = [G.phase, 'support']; // Suporte pode vir junto nas fases normais

  // O suporte não deve aparecer no saque nem no bloqueio
  if (G.phase === 'service' || G.blockWindow) phases = phases.filter(p => p !== 'support');

  let found = [];
  // Procura 3 cartas válidas no baralho
  for (let i = G.deck.length - 1; i >= 0 && found.length < 3; i--) {
    if (G.deck[i].phases.some(p => phases.includes(p))) found.push(G.deck.splice(i, 1)[0]);
  }
  // Se faltar carta, reembaralha o descarte e continua procurando
  if (found.length < 3) {
    let temp = G.deck;
    G.deck = shuffle([...temp, ...G.discard]);
    G.discard = [];
    for (let i = G.deck.length - 1; i >= 0 && found.length < 3; i--) {
      if (G.deck[i].phases.some(p => phases.includes(p))) found.push(G.deck.splice(i, 1)[0]);
    }
  }
  G.hand = found;
  if(G.hand.length === 0) log(`⚠ Nenhuma opção válida encontrada para ${phases[0]}.`);
}

function startPoint(){
  resetDeck();
  G.energy=G.maxEnergy;G.phase='service';
  G.aiEnergy=G.maxAiEnergy;
  G.possession=G.nextServer || 'player';
  G.comboIdx=0;G.atkBoost=0;G.aiDefMinus=0;G.selected=[];G.defWindow=false;G.blockWindow=false;G.locked=false;G.pointDone=false;G.aiJustDefended=false;
  clearInterval(G.blockInterval);
  clearInterval(G.defInterval);
  hidePointResult();

  if(G.possession === 'player') {
    log('— Novo ponto. Seu saque —');
    drawPhaseOptions();
  } else {
    log('— Novo ponto. Saque da IA —');
    G.locked = true;
    setTimeout(() => aiTurn(), 1000);
  }
  render();
}

function log(msg){G.log.unshift(msg);if(G.log.length>40)G.log.pop();}

function canPlay(card){
  if(G.defWindow)return card.phases.includes('defense')&&card.cost<=G.energy;
  if(G.blockWindow)return card.phases.includes('block')&&card.cost<=G.energy;
  return card.phases.includes(G.phase)&&card.cost<=G.energy;
}

function selectCard(idx){
  if(G.locked||G.pointDone)return;
  const card=G.hand[idx];if(!card||!canPlay(card))return;
  if(G.defWindow){const si=G.selected.indexOf(idx);if(si>=0)G.selected.splice(si,1);else G.selected.push(idx);}
  else if(G.blockWindow){G.selected=G.selected[0]===idx?[]:[idx];}
  else{G.selected=G.selected[0]===idx?[]:[idx];}
  render();
}

function playCard(){
  if(G.selected.length===0||G.locked||G.pointDone)return;
  const idx=G.selected[0];const card=G.hand[idx];if(!card)return;
  G.locked=true;G.energy-=card.cost;
  applyBonus(card);
  log(`✅ ${card.name} [${PHASE_NAMES[G.phase]}, poder ${card.power}]`);
  updateCombo(card);

  if (card.type === 'support') {
    clearHand();
    drawPhaseOptions(); // Gera novas opções para a mesma fase
    G.locked=false;
    render();
    return;
  }

  clearHand();

  if(G.phase==='service'){
    log('🏐 Saque realizado! A bola cruzou a rede...');
    G.phase='defense';
    render();
    setTimeout(() => passBall(true), 600);
  }
  else if(G.phase==='defense'){G.phase='setting';log('🤲 Levantamento...');G.locked=false;drawPhaseOptions();checkFreeball();render();}
  else if(G.phase==='setting'){G.phase='attack';log('💥 Prepare o ataque!');G.locked=false;drawPhaseOptions();checkFreeball();render();}
  else if(G.phase==='attack'){const total=card.power+G.atkBoost;G.atkBoost=0;log(`🏐 Ataque total ${total}!`);render();setTimeout(()=>resolvePlayerAttack(total),700);}
}

function rerollOption(){
  if (G.locked || G.pointDone || G.energy < 1 || G.selected.length !== 1) return;
  const idx = G.selected[0];
  const discarded = G.hand.splice(idx, 1)[0];
  G.discard.push(discarded);
  G.energy -= 1;

  let phases = [];
  if (G.blockWindow) phases = ['block'];
  else if (G.defWindow) phases = ['defense', 'support'];
  else phases = [G.phase, 'support'];
  if (G.phase === 'service' || G.blockWindow) phases = phases.filter(p => p !== 'support');

  let found = [];
  for (let i = G.deck.length - 1; i >= 0 && found.length < 1; i--) {
    if (G.deck[i].phases.some(p => phases.includes(p))) found.push(G.deck.splice(i, 1)[0]);
  }
  if (found.length < 1) {
    let temp = G.deck; G.deck = shuffle([...temp, ...G.discard]); G.discard = [];
    for (let i = G.deck.length - 1; i >= 0 && found.length < 1; i--) {
      if (G.deck[i].phases.some(p => phases.includes(p))) found.push(G.deck.splice(i, 1)[0]);
    }
  }
  
  if (found.length > 0) G.hand.splice(idx, 0, found[0]); // Coloca na mesma posição
  G.selected = [];
  log('🔄 Reciclou 1 opção (-1 energia).');
  checkFreeball();render();
}

function applyBonus(card){
  if(!card.bonus)return;
  if(card.bonus==='energy1'){G.energy=Math.min(G.energy+1,G.maxEnergy);log('+1 Energia!');}
  if(card.bonus==='energy2'){G.energy=Math.min(G.energy+2,G.maxEnergy);log('+2 Energia!');}
  if(card.bonus==='atkBoost2'){G.atkBoost+=2;log('+2 poder no próximo ataque!');}
  if(card.bonus==='atkBoost3'){G.atkBoost+=3;log('+3 poder no próximo ataque!');}
  if(card.bonus==='atkBoost6'){G.atkBoost+=6;log('+6 poder no próximo ataque!');}
  if(card.bonus==='draw1'){log('+1 Uso Livre! (Efeito de carta ignorado temporariamente)');} // Substituído pelo sistema de draft
  if(card.bonus==='aiDefMinus1'){G.aiDefMinus+=1;log('IA defende com -1!');}
  if(card.bonus==='aiDefMinus2'){G.aiDefMinus+=2;log('IA defende com -2!');}
}

function updateCombo(card){
  if(card.type==='support')return;
  if(G.comboIdx<COMBO_SEQ.length&&card.type===COMBO_SEQ[G.comboIdx]){G.comboIdx++;if(G.comboIdx===COMBO_SEQ.length){G.atkBoost+=2;log('🔥 COMBO! +2 poder bônus!');}}
  else if(card.type!=='service'){G.comboIdx=0;}
}

function checkFreeball(){
  if(G.energy===0&&!G.defWindow&&G.phase!=='service'&&G.possession==='player'){
    log('⚠ Energia zerada! Bola livre para a IA.');G.locked=true;
    setTimeout(()=>{G.locked=false;passBall(true);},600);
  }
}

function passBall(forced){
  if(G.pointDone)return;
  if(!forced)log('↩ Você passou a bola.');
  clearHand();
  G.possession='ai';G.locked=true;render();
  setTimeout(()=>aiTurn(),900);
}

function aiTurn(){
  if(G.pointDone)return;
  log('🤖 IA preparando jogada...');render();
  setTimeout(()=>{
    function getAIPlay(phase, maxCost) {
      let possible = CARDS_DB.filter(c => c.phases.includes(phase) && c.cost <= maxCost && c.power > 0);
      if(possible.length === 0) return { card: null, drew: false, drawCost: 0 };
      
      // Simula a chance (30%) da IA não ter a carta na mão e precisar gastar 1 de energia para comprá-la
      let drew = false;
      let drawCost = 0;
      if (Math.random() < 0.30 && maxCost >= 1) {
        drew = true;
        drawCost = 1;
        maxCost -= 1;
        possible = CARDS_DB.filter(c => c.phases.includes(phase) && c.cost <= maxCost && c.power > 0);
        if (possible.length === 0) return { card: null, drew: true, drawCost: 1 };
      }
      return { card: possible[Math.floor(Math.random() * possible.length)], drew, drawCost };
    }

    const targetPhase = (G.phase === 'service') ? 'service' : 'attack';
    let aiCost = 0;
    let aiCards = [];
    let comboCount = 0;
    let atkBoost = 0;
    let power = 0;

    if (targetPhase === 'service') {
      let play = getAIPlay('service', G.aiEnergy);
      let card = play.card || CARDS_DB.find(c => c.id === 'srv3');
      if (play.drew) { aiCost += play.drawCost; aiCards.push("🃏 Comprou"); }
      aiCost += card.cost; power = card.power; aiCards.push(card.name);
    } else {
      // Sequência Tática: Defesa -> Levantamento -> Ataque
      if (!G.aiJustDefended) {
        let recPlay = getAIPlay('defense', G.aiEnergy - aiCost);
        if (recPlay.drew) { aiCost += recPlay.drawCost; aiCards.push("🃏 Comprou"); }
        if (recPlay.card) { aiCost += recPlay.card.cost; aiCards.push(recPlay.card.name); comboCount++; }
        else { aiCards.push("Manchete Improvisada"); }
      } else {
        comboCount++; aiCards.push("(Já defendeu)");
      }

      let setPlay = getAIPlay('setting', G.aiEnergy - aiCost);
      if (setPlay.drew) { aiCost += setPlay.drawCost; aiCards.push("🃏 Comprou"); }
      if (setPlay.card) { aiCost += setPlay.card.cost; aiCards.push(setPlay.card.name); comboCount++; if(setPlay.card.bonus === 'atkBoost2') atkBoost += 2; }
      if (setPlay.card) { 
        aiCost += setPlay.card.cost; aiCards.push(setPlay.card.name); comboCount++; 
        if(setPlay.card.bonus && setPlay.card.bonus.startsWith('atkBoost')) atkBoost += parseInt(setPlay.card.bonus.replace('atkBoost', '')); 
      }

      let atkPlay = getAIPlay('attack', G.aiEnergy - aiCost);
      if (atkPlay.drew) { aiCost += atkPlay.drawCost; aiCards.push("🃏 Comprou"); }
      if (atkPlay.card) {
        aiCost += atkPlay.card.cost; aiCards.push(atkPlay.card.name); comboCount++;
        power = atkPlay.card.power + atkBoost + (comboCount >= 3 ? 2 : 0);
      } else {
        power = 1 + Math.floor(Math.random() * 2); aiCards.push("Freeball");
      }
    }

    G.aiJustDefended = false;
    G.aiEnergy = Math.max(0, G.aiEnergy - aiCost);
    G.aiAtkPow = power;
    
    log(`🤖 IA jogou: ${aiCards.join(' ➔ ')} (Gasto ${aiCost}⚡)`);
    G.blockWindow=true;G.selected=[];G.phase='block';
    G.locked=false;
    log(`⚡ IA ataca com poder ${G.aiAtkPow}! Bloquear ou Deixar passar?`);
    drawPhaseOptions();
    
    // Inicia Timer de Bloqueio (15 segundos para decisão)
    G.blockTimerVal = 15.0;
    const bar = document.getElementById('timer-bar');
    if (bar) bar.style.width = "100%";
    clearInterval(G.blockInterval);
    G.blockInterval = setInterval(tickBlockTimer, 100);
    
    render();
  },900);
}

function tickBlockTimer() {
  if (!G.blockWindow || G.pointDone) {
    clearInterval(G.blockInterval);
    return;
  }
  G.blockTimerVal -= 0.1;
  if (G.blockTimerVal <= 0) {
    G.blockTimerVal = 0;
    clearInterval(G.blockInterval);
    resolveBlock(); // Resolve sem carta (deixa passar)
  }
  const bar = document.getElementById('timer-bar');
  if (bar) bar.style.width = (G.blockTimerVal / 15.0 * 100) + "%";
}

function resolveBlock(){
  if(!G.blockWindow || G.pointDone) return;
  clearInterval(G.blockInterval);
  const idx = G.selected[0];
  const card = G.hand[idx];
  
  G.blockWindow = false;

  if(!card) {
    log("🏃 Você não bloqueou. Preparando defesa...");
    clearHand();
    startDefenseWindow();
    return;
  }

  G.energy -= card.cost;
  clearHand();

  const roll = Math.random();
  if (roll < 0.20) { // 20% Ponto de bloqueio
    log(`🧱 ${card.name}! A bola caiu direto na quadra da IA!`);
    G.pPts++; G.nextServer = 'player';
    endPoint('win', 'Ponto de bloqueio!');
  } else if (roll < 0.40) { // 20% Bloqueio para fora
    log(`❌ ${card.name} bateu e foi para fora! Ponto da IA.`);
    G.aPts++; G.nextServer = 'ai';
    endPoint('loss', 'Bloqueio para fora.');
  } else if (roll < 0.70) { // 30% Amorteceu (Defesa facilitada)
    G.aiAtkPow = Math.max(1, Math.floor(G.aiAtkPow / 2));
    log(`🧤 ${card.name} amorteceu o ataque! (Poder reduzido para ${G.aiAtkPow})`);
    startDefenseWindow();
  } else { // 30% Jogo continua para IA
    log(`🔁 ${card.name}! A bola voltou para a IA, o rally continua!`);
    setTimeout(() => aiTurn(), 1000);
  }
  render();
}

function startDefenseWindow(){
    G.defWindow=true; G.blockWindow=false; G.phase='defense';
    log(`🛡 Selecione sua defesa contra poder ${G.aiAtkPow}.`);
    drawPhaseOptions();
    
    // Inicia Timer de Defesa (15 segundos)
    G.defTimerVal = 15.0;
    const bar = document.getElementById('timer-bar');
    if (bar) bar.style.width = "100%";
    clearInterval(G.defInterval);
    G.defInterval = setInterval(tickDefTimer, 100);
    
    render();
}

function tickDefTimer() {
  if (!G.defWindow || G.pointDone) {
    clearInterval(G.defInterval);
    return;
  }
  G.defTimerVal -= 0.1;
  if (G.defTimerVal <= 0) {
    G.defTimerVal = 0;
    clearInterval(G.defInterval);
    autoResolve();
  }
  const bar = document.getElementById('timer-bar');
  if (bar) bar.style.width = (G.defTimerVal / 15.0 * 100) + "%";
}

function resolveDefense(){
  if(!G.defWindow||G.pointDone)return;
  clearInterval(G.defInterval);
  let defPow=0;
  
  [...G.selected].sort((a,b)=>b-a).forEach(idx=>{
    const c=G.hand[idx];
    if(c&&c.phases.includes('defense')&&c.cost<=G.energy){
      defPow+=c.power;G.energy-=c.cost;
      log(`🛡 ${c.name} (poder ${c.power})`);
    }
  });

  if(G.selected.length > 0) G.comboIdx = 1; // A defesa conta como o 1º toque do combo

  clearHand();G.defWindow=false;
  log(`⚖ IA ${G.aiAtkPow} vs Defesa ${defPow}`);
  if(defPow>=G.aiAtkPow){
    log('✅ Defesa! Posse volta para você.');
    G.possession='player';G.phase='setting';G.locked=false;drawPhaseOptions();render();
  } else {
    log(`❌ Ataque passou. Ponto para a IA.`);G.aPts++;
    G.nextServer = 'ai';
    endPoint('loss',`IA atacou com ${G.aiAtkPow}, você defendeu com ${defPow}.`);
  }
}

function autoResolve(){
  if(!G.defWindow||G.pointDone)return;
  clearInterval(G.defInterval);
  G.defWindow=false;clearHand();
  log('⏱ Tempo! Defesa 0.');G.aPts++;
  G.nextServer = 'ai';
  endPoint('loss',`Tempo esgotado. IA atacou com ${G.aiAtkPow}, defesa 0.`);
}

function resolvePlayerAttack(pow){
  if(G.pointDone)return;
  
  let aiDef = 0;
  let aiDefCards = [];
  
  // IA defende com 1 carta também (a melhor que puder pagar)
  let possibleDef = CARDS_DB.filter(c => c.phases.includes('defense') && c.cost <= G.aiEnergy).sort((a,b) => b.power - a.power);

  if (possibleDef.length > 0) {
    let card = possibleDef[0];
    aiDef = card.power;
    G.aiEnergy -= card.cost;
    aiDefCards.push(card.name);
    G.aiJustDefended = true; // Sinaliza que o primeiro toque da IA no próximo turno já foi feito
  }

  if (aiDefCards.length > 0) log(`🛡️ IA defendeu com: ${aiDefCards.join(', ')}`);
  
  aiDef = Math.max(0, aiDef - G.aiDefMinus);
  G.aiDefMinus = 0;

  log(`🤖 IA defesa total: ${aiDef}`);
  log(`⚖ Ataque ${pow} vs IA ${aiDef}`);

  if(pow>aiDef){
    log('✅ Ponto para você!');G.pPts++;
    G.nextServer = 'player';
    endPoint('win',`Seu ataque (${pow}) superou a defesa da IA (${aiDef}).`);
  } else {
    log('❌ IA defendeu. Posse passa para a IA.');
    G.possession='ai';G.locked=false;render();
    setTimeout(()=>aiTurn(),900);
  }
}

function endPoint(result,desc){
  G.pointDone=true;G.locked=true;clearInterval(G.blockInterval);clearInterval(G.defInterval);
  checkSet(result,desc);
}

function checkSet(result,desc){
  const WIN=5;
  if(G.pPts>=WIN&&G.pPts-G.aPts>=2){
    G.pSets++;G.pPts=0;G.aPts=0;
    if(G.pSets>=1){render();showEnd(true);return;}
    log(`🏆 Set para você! ${G.pSets}×${G.aSets}`);
    render();showPointResult('win','🏆 Set para você!',`Você venceu o set. Placar: ${G.pSets}×${G.aSets}`);return;
  }
  if(G.aPts>=WIN&&G.aPts-G.pPts>=2){
    G.aSets++;G.pPts=0;G.aPts=0;
    if(G.aSets>=1){render();showEnd(false);return;}
    log(`💔 Set para a IA! ${G.pSets}×${G.aSets}`);
    render();showPointResult('loss','💔 Set para a IA',`IA venceu o set. Placar: ${G.pSets}×${G.aSets}`);return;
  }
  render();
  if(result==='win')showPointResult('win','🎉 Ponto seu!',desc||'Você venceu o rally.');
  else showPointResult('loss','❌ Ponto da IA',desc||'IA venceu o rally.');
}

function showPointResult(type,title,desc){
  const el=document.getElementById('point-result');
  el.className=type;el.style.display='block';
  document.getElementById('point-result-title').textContent=title;
  document.getElementById('point-result-desc').textContent=desc;
  document.getElementById('action-area').style.display='none';
  document.getElementById('hand-area').style.display='none';
  document.getElementById('resolve-panel').style.display='none';
}

function hidePointResult(){
  document.getElementById('point-result').style.display='none';
  document.getElementById('action-area').style.display='flex';
  document.getElementById('hand-area').style.display='flex';
}

function showEnd(won){
  document.getElementById('overlay-title').textContent=won?'🏆 Vitória!':'💔 Derrota';
  document.getElementById('overlay-msg').textContent=won
    ?`Você venceu! ${G.pSets}×${G.aSets} em sets.`
    :`IA venceu. ${G.aSets}×${G.pSets} em sets.`;
  document.getElementById('overlay').style.display='flex';
}

function moveBall(){
  const ball=document.getElementById('ball');if(!ball)return;
  if(G.defWindow){ball.style.left='48%';ball.style.bottom='55px';}
  else if(G.possession==='player'){ball.style.left='25%';ball.style.bottom='25px';}
  else{ball.style.left='68%';ball.style.bottom='25px';}
}

function render(){
  document.getElementById('point-display').textContent=`${G.pPts} — ${G.aPts}`;
  document.getElementById('set-display').textContent=`${G.pSets} — ${G.aSets}`;
  document.getElementById('phase-label').textContent=PHASE_NAMES[G.phase]||G.phase;
  const pb=document.getElementById('possession-badge');pb.textContent=G.possession==='player'?'Você':'IA';pb.className='poss-'+(G.possession==='player'?'player':'ai');
  document.getElementById('combo-badge').style.display=G.comboIdx>0?'inline':'none';
  const msg=document.getElementById('message-area');
  if(G.pointDone)msg.textContent='';
  else if(G.defWindow)msg.textContent='⚡ Janela de defesa!';
  else if(G.locked)msg.textContent='🤖 IA jogando...';
  else if(G.phase==='service')msg.textContent='Escolha uma carta de saque';
  else if(G.possession==='player')msg.textContent=PHASE_NAMES[G.phase];
  else msg.textContent='Aguardando IA...';
  const pips=document.getElementById('energy-pips');pips.innerHTML='';
  for(let i=0;i<G.maxEnergy;i++){const p=document.createElement('div');p.className='energy-pip'+(i<G.energy?' filled':'');pips.appendChild(p);}
  
  const aiPips=document.getElementById('ai-energy-pips');aiPips.innerHTML='';
  for(let i=0;i<G.maxAiEnergy;i++){const p=document.createElement('div');p.className='energy-pip'+(i<G.aiEnergy?' filled':'');aiPips.appendChild(p);}

  document.getElementById('energy-text').textContent=`${G.energy}/${G.maxEnergy}`;
  document.getElementById('freeball-notice').style.display=(G.energy===0&&!G.pointDone)?'block':'none';
  document.getElementById('deck-count').textContent=G.deck.length;
  document.getElementById('discard-count').textContent=G.discard.length;
  renderHand();renderResolve();renderActions();renderLog();moveBall();
}

function renderHand(){
  const c=document.getElementById('hand-cards');c.innerHTML='';
  document.getElementById('hand-title').textContent=G.defWindow?'Opções de Defesa (pode acumular)':`Opções da Fase (${PHASE_NAMES[G.phase] || G.phase})`;
  G.hand.forEach((card,idx)=>{
    const playable=canPlay(card);const sel=G.selected.includes(idx);
    const blocked=!playable||(G.locked&&!G.defWindow);
    const div=document.createElement('div');
    div.className='card'+(sel?' selected':'')+(blocked?' disabled':'');
    div.innerHTML=`<div class="card-type type-${card.type}">${card.type}</div><div class="card-cost">${card.cost}</div><div class="card-name">${card.name}</div><div class="card-power">${card.power>0?card.power:'—'}</div><div class="card-desc">${card.desc}</div>`;
    if(!blocked)div.addEventListener('click',()=>selectCard(idx));
    c.appendChild(div);
  });
}

function renderResolve(){
  const panel=document.getElementById('resolve-panel');
  const header=document.getElementById('resolve-header');
  const timerWrapper=document.getElementById('timer-wrapper');

  if((G.defWindow || G.blockWindow) && !G.pointDone){
    panel.style.display='block';
    header.textContent = G.blockWindow ? "✋ Janela de bloqueio — bloquear ou deixar passar?" : "🛡️ Janela de defesa — selecione cartas e resolva";
    timerWrapper.style.display = 'block';
    
    document.getElementById('atk-val').textContent=G.aiAtkPow;
    let dp=0;G.selected.forEach(i=>{if(G.hand[i])dp+=G.hand[i].power;});
    document.getElementById('def-val').textContent=dp;
    document.getElementById('def-val').style.color=dp>=G.aiAtkPow?'var(--teal)':'var(--coral)';
  } else {panel.style.display='none';}
}

function renderActions(){
  const bPlay=document.getElementById('btn-play');
  const bDraw=document.getElementById('btn-reroll');
  const bPass=document.getElementById('btn-pass');
  const bRes=document.getElementById('btn-resolve');
  const bBlk=document.getElementById('btn-block');
  
  bDraw.textContent = "Trocar Carta (1⚡)";
  bDraw.disabled = G.locked || G.energy < 1 || G.selected.length !== 1;

  if(G.defWindow){
    bPlay.style.display='none'; bBlk.style.display='none'; bDraw.style.display='block'; bPass.style.display='none'; bRes.style.display='block';
    bRes.disabled=G.selected.length===0;
  } else if(G.blockWindow){
    bPlay.style.display='none'; bRes.style.display='none'; bDraw.style.display='block'; bPass.style.display='block'; bBlk.style.display='block';
    bBlk.disabled=G.selected.length===0;
    bPass.textContent = "Não Bloquear";
    bPass.disabled=G.locked;
  } else {
    bPlay.style.display='block'; bBlk.style.display='none'; bDraw.style.display='block'; bPass.style.display='block'; bRes.style.display='none';
    bPass.textContent = "Passar Bola";
    bPlay.disabled=G.selected.length===0||G.locked;
    bPass.disabled=G.locked||G.phase==='service'||G.possession!=='player';
  }
}

function renderLog(){
  // Aumentado de 6 para 12 entradas visíveis no log
  document.getElementById('log-area').innerHTML=G.log.slice(0,12).map(l=>`<div class="log-entry">${l}</div>`).join('');
}

document.getElementById('btn-play').addEventListener('click',playCard);
document.getElementById('btn-reroll').addEventListener('click',rerollOption);
document.getElementById('btn-pass').addEventListener('click',()=>{if(!G.locked&&!G.pointDone&&G.phase!=='service'){ if(G.blockWindow) resolveBlock(); else passBall(false); }});
document.getElementById('btn-block').addEventListener('click',resolveBlock);
document.getElementById('btn-resolve').addEventListener('click',resolveDefense);
document.getElementById('btn-next').addEventListener('click',startPoint);
document.getElementById('overlay-btn').addEventListener('click',()=>{document.getElementById('overlay').style.display='none';newGame();});

newGame();