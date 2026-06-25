// ─── main.js — App entry point and event bindings ────────────────────────────
// Owner: Main/Infra agent. Wires DOM events to game functions.
// Depends on: all other modules (loaded before this file in index.html).
// Rule: no game logic here — only event bindings and menu orchestration.

// ── UI element references ────────────────────────────────────────────────────
const mainMenu          = document.getElementById('main-menu-overlay');
const multiplayerSetupUI = document.getElementById('multiplayer-setup');
const appUI             = document.getElementById('app');
const btnStartAI        = document.getElementById('btn-start-ai');
const btnStartMultiplayer = document.getElementById('btn-start-multiplayer');
const btnConnect        = document.getElementById('btn-connect-room');
const playerIdDisplay   = document.getElementById('player-id-display');
const peerIdInput       = document.getElementById('peer-id-input');
const connectionStatus  = document.getElementById('connection-status');

// ── Game action buttons ───────────────────────────────────────────────────────
document.getElementById('btn-play').addEventListener('click', playCard);
document.getElementById('btn-reroll').addEventListener('click', rerollOption);
document.getElementById('btn-pass').addEventListener('click', () => {
  if (!G.locked && !G.pointDone && G.phase !== 'service' && !G.blockWindow) passBall(false);
});
document.getElementById('btn-block').addEventListener('click', resolveBlock);
document.getElementById('btn-skip-block').addEventListener('click', () => {
  if (!G.locked && !G.pointDone && G.blockWindow) resolveBlock();
});
document.getElementById('btn-resolve').addEventListener('click', resolveDefense);
document.getElementById('btn-next').addEventListener('click', startPoint);
document.getElementById('overlay-btn').addEventListener('click', () => {
  document.getElementById('overlay').style.display = 'none';
  newGame();
});

// ── Navigation helpers ────────────────────────────────────────────────────────
function showMainMenu() {
  document.getElementById('overlay').style.display      = 'none';
  document.getElementById('quit-overlay').style.display = 'none';
  document.getElementById('btn-desistir').style.display = 'none';
  appUI.style.display    = 'none';
  mainMenu.style.display = 'flex';
  // Reset multiplayer UI state
  btnStartAI.style.display        = '';
  btnStartMultiplayer.textContent = 'Multiplayer (Online)';
  btnStartMultiplayer.disabled    = false;
  multiplayerSetupUI.style.display = 'none';
}

// ── Desistir / Quit confirmation ──────────────────────────────────────────────
const btnDesistir = document.getElementById('btn-desistir');
const quitOverlay = document.getElementById('quit-overlay');

btnDesistir.addEventListener('click', () => {
  quitOverlay.style.display = 'flex';
});

document.getElementById('btn-quit-cancel').addEventListener('click', () => {
  quitOverlay.style.display = 'none';
});

document.getElementById('btn-quit-confirm').addEventListener('click', () => {
  quitOverlay.style.display = 'none';
  showMainMenu();
});

// ── Main menu ─────────────────────────────────────────────────────────────────
appUI.style.display    = 'none';
mainMenu.style.display = 'flex';

// Campaign: if player selected a team on campaign.html, start immediately
const _pendingTeam = localStorage.getItem('ascension_campaign_team');
if (_pendingTeam && CAMPAIGN_TEAMS[_pendingTeam]) {
  localStorage.removeItem('ascension_campaign_team');
  mainMenu.style.display    = 'none';
  appUI.style.display       = 'grid';
  btnDesistir.style.display = 'block';
  newGame('campaign', false, _pendingTeam);
  setTimeout(() => { initSeaCanvas(); initCrowd(); }, 0);
}

btnStartAI.addEventListener('click', () => {
  mainMenu.style.display    = 'none';
  appUI.style.display       = 'grid';
  btnDesistir.style.display = 'block';
  newGame('ai');
  setTimeout(() => { initSeaCanvas(); initCrowd(); }, 0);
});

btnStartMultiplayer.addEventListener('click', () => {
  btnStartAI.style.display         = 'none';
  btnStartMultiplayer.textContent  = 'Criando Sala...';
  btnStartMultiplayer.disabled     = true;
  connectionStatus.textContent     = 'Aguardando conexão com o servidor...';
  multiplayerSetupUI.style.display = 'block';
  initializePeer();
});

btnConnect.addEventListener('click', () => {
  const remoteId = peerIdInput.value.trim();
  if (remoteId && peer) connectToPeer(remoteId);
});

playerIdDisplay.addEventListener('click', () => {
  if (playerIdDisplay.textContent.includes('Carregando')) return;
  navigator.clipboard.writeText(playerIdDisplay.textContent).then(() => {
    connectionStatus.textContent = 'ID copiado!';
    setTimeout(() => { connectionStatus.textContent = ''; }, 2000);
  });
});
