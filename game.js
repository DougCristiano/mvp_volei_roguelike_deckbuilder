const CARDS_DB=[
  {id:'srv1',name:'Saque Flutuante',type:'service',cost:1,power:2,desc:'Difícil de receber.',phases:['service']},
  {id:'srv2',name:'Saque Potente',type:'service',cost:2,power:4,desc:'Agressivo. Dificulta a recepção adversária.',phases:['service']},
  {id:'srv3',name:'Saque Tático',type:'service',cost:0,power:1,desc:'Controlado. Guarda energia.',phases:['service']},
  {id:'rec1',name:'Manchete Firme',type:'reception',cost:1,power:3,desc:'Recepção estável.',phases:['reception']},
  {id:'rec2',name:'Mergulho',type:'reception',cost:1,power:2,desc:'Salva bolas difíceis.',phases:['reception','defense']},
  {id:'rec3',name:'Leitura de Jogo',type:'reception',cost:2,power:4,desc:'+1 Energia.',phases:['reception'],bonus:'energy1'},
  {id:'set1',name:'Levantamento Alto',type:'setting',cost:1,power:3,desc:'Abre o ataque.',phases:['setting']},
  {id:'set2',name:'Levantamento Rápido',type:'setting',cost:2,power:5,desc:'+2 poder no próximo ataque.',phases:['setting'],bonus:'atkBoost2'},
  {id:'set3',name:'Levantamento de Costas',type:'setting',cost:1,power:2,desc:'Engana o bloqueio.',phases:['setting']},
  {id:'atk1',name:'Cortada Diagonal',type:'attack',cost:2,power:5,desc:'Alto poder.',phases:['attack']},
  {id:'atk2',name:'Ponta Aberta',type:'attack',cost:1,power:3,desc:'Ataque nas bordas.',phases:['attack']},
  {id:'atk3',name:'Bola na Linha',type:'attack',cost:3,power:7,desc:'Alto risco, alta recompensa.',phases:['attack']},
  {id:'atk4',name:'Finta',type:'attack',cost:1,power:2,desc:'IA defende com -1.',phases:['attack'],bonus:'aiDefMinus1'},
  {id:'def1',name:'Defesa de Plataforma',type:'defense',cost:1,power:3,desc:'Sólida e confiável.',phases:['defense']},
  {id:'def2',name:'Bloco Antecipado',type:'defense',cost:2,power:5,desc:'Reduz o ataque adversário.',phases:['defense']},
  {id:'def3',name:'Leitura do Ataque',type:'defense',cost:1,power:4,desc:'Boa leitura recompensa.',phases:['defense']},
  {id:'def4',name:'Defesa Desesperada',type:'defense',cost:0,power:1,desc:'Grátis. Última esperança.',phases:['defense']},
  {id:'blk1',name:'Bloqueio Simples',type:'block',cost:1,power:2,desc:'Tenta parar o ataque na rede.',phases:['block']},
  {id:'blk2',name:'Paredão',type:'block',cost:2,power:4,desc:'Grande chance de ponto direto.',phases:['block']},
  {id:'sup1',name:'Foco',type:'support',cost:0,power:0,desc:'+2 Energia.',phases:['reception','setting','attack','defense'],bonus:'energy2'},
  {id:'sup2',name:'Comunicação',type:'support',cost:1,power:0,desc:'+1 carta.',phases:['reception','setting','attack','defense'],bonus:'draw1'},
];

const PHASE_NAMES={service:'Saque',reception:'Recepção',setting:'Levantamento',attack:'Ataque',defense:'Defesa',block:'Bloqueio'};
const COMBO_SEQ=['reception','setting','attack'];
let G={};

function newGame(){
  G={pPts:0,aPts:0,pSets:0,aSets:0,energy:3,maxEnergy:3,deck:[],hand:[],discard:[],phase:'service',possession:'player',nextServer:'player',comboIdx:0,atkBoost:0,aiDefMinus:0,aiAtkPow:0,selected:[],defWindow:false,blockWindow:false,locked:false,pointDone:false,log:[],blockTimerVal:0,blockInterval:null};
  buildDeck();startPoint();
}

function buildDeck(){
  let pool=[];CARDS_DB.forEach(c=>{pool.push({...c});pool.push({...c});});
  G.deck=shuffle(pool).slice(0,22);
}

function shuffle(arr){let a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function resetDeck(){G.deck=[...G.deck,...G.hand,...G.discard];G.hand=[];G.discard=[];G.deck=shuffle(G.deck);}

function drawCard(n=1){
  for(let i=0;i<n;i++){
    if(G.deck.length===0){if(G.discard.length===0)return;G.deck=shuffle([...G.discard]);G.discard=[];log('📦 Baralho reembaralhado.');}
    if(G.deck.length>0)G.hand.push(G.deck.pop());
  }
}

function startPoint(){
  resetDeck();drawCard(5);
  G.energy=G.maxEnergy;G.phase='service';
  G.possession=G.nextServer || 'player';
  G.comboIdx=0;G.atkBoost=0;G.aiDefMinus=0;G.selected=[];G.defWindow=false;G.blockWindow=false;G.locked=false;G.pointDone=false;
  clearInterval(G.blockInterval);
  hidePointResult();

  if(G.possession === 'player') {
    log('— Novo ponto. Seu saque —');
    if(!G.hand.some(c=>c.phases.includes('service'))){
      const si=G.deck.findIndex(c=>c.phases.includes('service'));
      if(si>=0){const wi=G.hand.findIndex(c=>!c.phases.includes('service'));if(wi>=0){G.discard.push(G.hand[wi]);G.hand[wi]=G.deck.splice(si,1)[0];}}
    }
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
  G.locked=true;G.energy-=card.cost;G.hand.splice(idx,1);G.discard.push(card);G.selected=[];
  applyBonus(card);
  log(`✅ ${card.name} [${PHASE_NAMES[G.phase]}, poder ${card.power}]`);
  updateCombo(card);
  if(G.phase==='service'){
    log('🏐 Saque realizado! A bola cruzou a rede...');
    render();
    setTimeout(() => passBall(true), 600);
  }
  else if(G.phase==='reception'){G.phase='setting';log('🤲 Levantamento...');G.locked=false;checkFreeball();render();}
  else if(G.phase==='setting'){G.phase='attack';log('💥 Prepare o ataque!');G.locked=false;checkFreeball();render();}
  else if(G.phase==='attack'){const total=card.power+G.atkBoost;G.atkBoost=0;log(`🏐 Ataque total ${total}!`);render();setTimeout(()=>resolvePlayerAttack(total),700);}
}

function buyCard(){
  if(G.locked || G.pointDone || G.phase === 'service' || G.energy < 1) return;
  G.energy-=1;drawCard(1);
  log('🃏 Comprou 1 carta (-1 energia).');
  checkFreeball();render();
}

function applyBonus(card){
  if(!card.bonus)return;
  if(card.bonus==='energy1'){G.energy=Math.min(G.energy+1,G.maxEnergy);log('+1 Energia!');}
  if(card.bonus==='energy2'){G.energy=Math.min(G.energy+2,G.maxEnergy);log('+2 Energia!');}
  if(card.bonus==='atkBoost2'){G.atkBoost+=2;log('+2 poder no próximo ataque!');}
  if(card.bonus==='draw1'){drawCard(1);log('+1 carta!');}
  if(card.bonus==='aiDefMinus1'){G.aiDefMinus+=1;log('IA defende com -1!');}
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
  G.possession='ai';G.energy=Math.min(G.energy+1,G.maxEnergy);G.locked=true;render();
  setTimeout(()=>aiTurn(),900);
}

function aiTurn(){
  if(G.pointDone)return;
  log('🤖 IA preparando ataque...');render();
  setTimeout(()=>{
    const pow=2+Math.floor(Math.random()*5);G.aiAtkPow=pow;
    G.blockWindow=true;G.selected=[];G.phase='block';
    G.energy=Math.min(G.energy+1,G.maxEnergy);G.locked=false;
    log(`⚡ IA ataca com poder ${pow}! Bloquear ou Deixar passar?`);
    
    // Inicia Timer de Bloqueio (5 segundos para decisão)
    G.blockTimerVal = 5.0;
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
  if (bar) bar.style.width = (G.blockTimerVal / 5.0 * 100) + "%";
}

function resolveBlock(){
  if(!G.blockWindow || G.pointDone) return;
  clearInterval(G.blockInterval);
  const idx = G.selected[0];
  const card = G.hand[idx];
  
  G.blockWindow = false;
  G.selected = [];

  if(!card) {
    log("🏃 Você não bloqueou. Preparando defesa...");
    startDefenseWindow();
    return;
  }

  G.energy -= card.cost;
  G.hand.splice(idx, 1);
  G.discard.push(card);

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
    clearTimeout(G._defTimer);
    G._defTimer=setTimeout(()=>{if(G.defWindow&&!G.pointDone)autoResolve();},9000);
    render();
}

function resolveDefense(){
  if(!G.defWindow||G.pointDone)return;
  clearTimeout(G._defTimer);
  let defPow=0;
  [...G.selected].sort((a,b)=>b-a).forEach(idx=>{
    const c=G.hand[idx];
    if(c&&c.phases.includes('defense')&&c.cost<=G.energy){defPow+=c.power;G.energy-=c.cost;G.discard.push(c);G.hand.splice(idx,1);log(`🛡 ${c.name} (poder ${c.power})`);}
  });
  G.selected=[];G.defWindow=false;
  log(`⚖ IA ${G.aiAtkPow} vs Defesa ${defPow}`);
  if(defPow>=G.aiAtkPow){
    log('✅ Defesa! Posse volta para você.');
    G.possession='player';G.phase='reception';G.energy=Math.min(G.energy+1,G.maxEnergy);drawCard(1);G.locked=false;render();
  } else {
    log(`❌ Ataque passou. Ponto para a IA.`);G.aPts++;
    G.nextServer = 'ai';
    endPoint('loss',`IA atacou com ${G.aiAtkPow}, você defendeu com ${defPow}.`);
  }
}

function autoResolve(){
  if(!G.defWindow||G.pointDone)return;
  G.defWindow=false;G.selected=[];
  log('⏱ Tempo! Defesa 0.');G.aPts++;
  G.nextServer = 'ai';
  endPoint('loss',`Tempo esgotado. IA atacou com ${G.aiAtkPow}, defesa 0.`);
}

function resolvePlayerAttack(pow){
  if(G.pointDone)return;
  const aiDef=Math.max(0,(1+Math.floor(Math.random()*4))-G.aiDefMinus);G.aiDefMinus=0;
  log(`🤖 IA defende ${aiDef}`);log(`⚖ Ataque ${pow} vs IA ${aiDef}`);
  if(pow>aiDef){
    log('✅ Ponto para você!');G.pPts++;
    G.nextServer = 'player';
    endPoint('win',`Seu ataque (${pow}) superou a defesa da IA (${aiDef}).`);
  } else {
    log('❌ IA defendeu. Posse passa para a IA.');
    G.possession='ai';G.energy=Math.min(G.energy+1,G.maxEnergy);G.locked=false;render();
    setTimeout(()=>aiTurn(),900);
  }
}

function endPoint(result,desc){
  G.pointDone=true;G.locked=true;clearTimeout(G._defTimer);
  checkSet(result,desc);
}

function checkSet(result,desc){
  const WIN=15;
  if(G.pPts>=WIN&&G.pPts-G.aPts>=2){
    G.pSets++;G.pPts=0;G.aPts=0;
    if(G.pSets>=2){render();showEnd(true);return;}
    log(`🏆 Set para você! ${G.pSets}×${G.aSets}`);
    render();showPointResult('win','🏆 Set para você!',`Você venceu o set. Placar: ${G.pSets}×${G.aSets}`);return;
  }
  if(G.aPts>=WIN&&G.aPts-G.pPts>=2){
    G.aSets++;G.pPts=0;G.aPts=0;
    if(G.aSets>=2){render();showEnd(false);return;}
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
  document.getElementById('energy-text').textContent=`${G.energy}/${G.maxEnergy}`;
  document.getElementById('freeball-notice').style.display=(G.energy===0&&!G.pointDone)?'block':'none';
  document.getElementById('deck-count').textContent=G.deck.length;
  document.getElementById('discard-count').textContent=G.discard.length;
  renderHand();renderResolve();renderActions();renderLog();moveBall();
}

function renderHand(){
  const c=document.getElementById('hand-cards');c.innerHTML='';
  document.getElementById('hand-title').textContent=G.defWindow?'Mão — selecione cartas de defesa (pode acumular)':`Mão — ${G.hand.length} cartas`;
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
    timerWrapper.style.display = G.blockWindow ? 'block' : 'none';
    
    document.getElementById('atk-val').textContent=G.aiAtkPow;
    let dp=0;G.selected.forEach(i=>{if(G.hand[i])dp+=G.hand[i].power;});
    document.getElementById('def-val').textContent=dp;
    document.getElementById('def-val').style.color=dp>=G.aiAtkPow?'var(--teal)':'var(--coral)';
  } else {panel.style.display='none';}
}

function renderActions(){
  const bPlay=document.getElementById('btn-play');
  const bDraw=document.getElementById('btn-draw');
  const bPass=document.getElementById('btn-pass');
  const bRes=document.getElementById('btn-resolve');
  const bBlk=document.getElementById('btn-block');

  if(G.defWindow){
    bPlay.style.display='none'; bBlk.style.display='none'; bDraw.style.display='block'; bPass.style.display='none'; bRes.style.display='block';
    bRes.disabled=G.selected.length===0;
    bDraw.disabled=G.locked||G.energy<1;
  } else if(G.blockWindow){
    bPlay.style.display='none'; bRes.style.display='none'; bDraw.style.display='block'; bPass.style.display='block'; bBlk.style.display='block';
    bBlk.disabled=G.selected.length===0;
    bDraw.disabled=G.locked||G.energy<1;
    bPass.textContent = "Não Bloquear";
  } else {
    bPlay.style.display='block'; bBlk.style.display='none'; bDraw.style.display='block'; bPass.style.display='block'; bRes.style.display='none';
    bPass.textContent = "Passar Bola";
    bPlay.disabled=G.selected.length===0||G.locked;
    bDraw.disabled=G.locked||G.phase==='service'||G.energy<1;
    bPass.disabled=G.locked||G.phase==='service'||G.possession!=='player';
  }
}

function renderLog(){
  document.getElementById('log-area').innerHTML=G.log.slice(0,6).map(l=>`<div class="log-entry">${l}</div>`).join('');
}

document.getElementById('btn-play').addEventListener('click',playCard);
document.getElementById('btn-draw').addEventListener('click',buyCard);
document.getElementById('btn-pass').addEventListener('click',()=>{if(!G.locked&&!G.pointDone&&G.phase!=='service'){ if(G.blockWindow) resolveBlock(); else passBall(false); }});
document.getElementById('btn-block').addEventListener('click',resolveBlock);
document.getElementById('btn-resolve').addEventListener('click',resolveDefense);
document.getElementById('btn-next').addEventListener('click',startPoint);
document.getElementById('overlay-btn').addEventListener('click',()=>{document.getElementById('overlay').style.display='none';newGame();});

newGame();