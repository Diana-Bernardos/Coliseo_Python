// =====================================================
//  RPG BATTLE GAME LOGIC - Coliseo de Batalla
//  Port of batalla_rpg.py to JavaScript
// =====================================================

// --- GAME STATE ---
const STATE = {
  playerName: 'Guerrero',
  playerHP: 100,
  playerMaxHP: 100,
  playerShield: 10,
  playerAlive: true,
  orcHP: 120,
  orcMaxHP: 120,
  orcShield: 5,
  orcAlive: true,
  orcFury: 0,
  turn: 1,
  maxTurns: 15,
  historial: [],
  busy: false,  // prevent double clicks
};

// --- Utility ---
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// --- DOM helpers ---
const $ = id => document.getElementById(id);

// =====================================================
//  INTRO SCREEN
// =====================================================
function startGame() {
  const nameInput = $('player-name').value.trim();
  STATE.playerName = nameInput
    ? nameInput.charAt(0).toUpperCase() + nameInput.slice(1)
    : 'Arturo';

  // Update warrior name displays
  $('warrior-name').textContent = STATE.playerName.toUpperCase();
  $('turn-number').textContent = '1';

  // Show battle screen
  $('intro-screen').classList.remove('active');
  $('battle-screen').classList.add('active');

  // Small delay then show the turn overlay for the warrior's first turn
  setTimeout(() => showTurnOverlay('warrior'), 400);
}

// =====================================================
//  TURN OVERLAY TRANSITIONS
// =====================================================
async function showTurnOverlay(who) {
  const overlay = $('turn-overlay');
  const img = $('turn-portrait-img');
  const text = $('turn-text');

  overlay.classList.remove('hidden');

  if (who === 'warrior') {
    img.src = 'assets/warrior.jpg';
    text.textContent = `⚔️ TURNO DE ${STATE.playerName.toUpperCase()}`;
    text.className = 'turn-text warrior-text';
    // Highlight warrior portrait
    $('portrait-warrior').classList.add('active-turn');
    $('portrait-orc').classList.remove('active-turn');
  } else {
    img.src = 'assets/orc.png';
    text.textContent = '🔥 TURNO DE THRALL';
    text.className = 'turn-text orc-text';
    // Highlight orc portrait
    $('portrait-orc').classList.add('active-turn');
    $('portrait-warrior').classList.remove('active-turn');
  }

  // Show overlay for 1.5 seconds
  await sleep(1600);
  overlay.classList.add('hidden');
}

// =====================================================
//  BATTLE LOG
// =====================================================
function addLog(message, type = '') {
  const log = $('battle-log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = message;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// =====================================================
//  HP BAR UPDATES
// =====================================================
function updateHP() {
  // Warrior
  const wPct = Math.max(0, (STATE.playerHP / STATE.playerMaxHP) * 100);
  const wBar = $('warrior-hp-bar');
  wBar.style.width = wPct + '%';
  $('warrior-hp-value').textContent = `${Math.max(0, STATE.playerHP)} / ${STATE.playerMaxHP}`;
  wBar.classList.remove('danger', 'warning');
  if (wPct <= 25) wBar.classList.add('danger');
  else if (wPct <= 50) wBar.classList.add('warning');

  // Orc
  const oPct = Math.max(0, (STATE.orcHP / STATE.orcMaxHP) * 100);
  const oBar = $('orc-hp-bar');
  oBar.style.width = oPct + '%';
  $('orc-hp-value').textContent = `${Math.max(0, STATE.orcHP)} / ${STATE.orcMaxHP}`;
  oBar.classList.remove('danger', 'warning');
  if (oPct <= 25) oBar.classList.add('danger');
  else if (oPct <= 50) oBar.classList.add('warning');

  // Orc fury
  $('orc-fury').textContent = STATE.orcFury;
}

// =====================================================
//  DAMAGE & HEAL ANIMATIONS
// =====================================================
function shakeCard(who) {
  const card = who === 'warrior' ? $('card-warrior') : $('card-orc');
  card.classList.remove('shake');
  // Force reflow
  void card.offsetWidth;
  card.classList.add('shake');
  setTimeout(() => card.classList.remove('shake'), 500);
}
function healEffect(who) {
  const card = who === 'warrior' ? $('card-warrior') : $('card-orc');
  card.classList.remove('heal-flash');
  void card.offsetWidth;
  card.classList.add('heal-flash');
  setTimeout(() => card.classList.remove('heal-flash'), 600);
}

// =====================================================
//  CORE MECHANICS (mirrored from Python)
// =====================================================

/** Warrior-style receive damage (1.5x shield block) */
function warriorReceiveDamage(amount) {
  // 10% dodge chance
  if (rand(1, 10) === 1) {
    addLog(`✦ ${STATE.playerName} se movió rápido y esquivó completamente!`, 'dodge');
    return 'ESQUIVADO';
  }
  const block = STATE.playerShield * 1.5;
  const finalDmg = Math.max(0, amount - block);
  STATE.playerHP = Math.max(0, STATE.playerHP - finalDmg);
  shakeCard('warrior');
  addLog(`→ ${STATE.playerName} bloqueó parcialmente. Recibió ${finalDmg} daño. Vida: ${STATE.playerHP}`, 'damage');
  if (STATE.playerHP <= 0) {
    STATE.playerAlive = false;
    addLog(`!!! ${STATE.playerName} ha caído en combate !!!`, 'death');
  }
  return finalDmg;
}

/** Orc-style receive damage (ignores small hits, base shield) */
function orcReceiveDamage(amount) {
  if (amount < 5) {
    addLog(`${STATE.orcName} ni lo sintió...`, 'action-orc');
    return 0;
  }
  // 10% dodge
  if (rand(1, 10) === 1) {
    addLog(`✦ Thrall ha esquivado el ataque completamente!`, 'dodge');
    return 'ESQUIVADO';
  }
  const finalDmg = Math.max(0, amount - STATE.orcShield);
  STATE.orcHP = Math.max(0, STATE.orcHP - finalDmg);
  shakeCard('orc');
  addLog(`→ Thrall recibió ${finalDmg} de daño. Vida: ${STATE.orcHP}`, 'damage');
  if (STATE.orcHP <= 0) {
    STATE.orcAlive = false;
    addLog(`!!! Thrall ha caído en combate !!!`, 'death');
  }
  return finalDmg;
}

function curaMagia(who) {
  const pocion = rand(10, 20);
  if (who === 'warrior') {
    STATE.playerHP += pocion;
    healEffect('warrior');
    addLog(`✨ ${STATE.playerName} usa magia y recupera ${pocion} de vida! (Vida: ${STATE.playerHP})`, 'heal');
  } else {
    STATE.orcHP += pocion;
    healEffect('orc');
    addLog(`✨ Thrall ruge y se regenera! +${pocion} vida (Vida: ${STATE.orcHP})`, 'heal');
  }
}

// =====================================================
//  PLAYER ACTION (called from buttons)
// =====================================================
async function playerAction(action) {
  if (STATE.busy || !STATE.playerAlive || !STATE.orcAlive) return;
  STATE.busy = true;

  // Disable buttons
  setActionButtons(false);

  // Turn header in log
  addLog(`══ TURNO ${STATE.turn} ══`, 'turn-header');

  // --- Player Action ---
  if (action === 'attack') {
    const dmg = rand(18, 28);
    addLog(`⚔️ ${STATE.playerName} lanza un Tajo con ${dmg} de daño!`, 'action-player');
    const res = orcReceiveDamage(dmg);
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} Ataque (${res})`);
  } else if (action === 'fury') {
    const dmg = rand(30, 45);
    addLog(`🔥 ¡FURIA! ${STATE.playerName} embiste con ${dmg} de daño!`, 'action-player');
    const res = orcReceiveDamage(dmg);
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} FURIA (${res})`);
  } else if (action === 'magic') {
    addLog(`✨ ${STATE.playerName} invoca magia curativa!`, 'action-player');
    curaMagia('warrior');
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} Magia`);
  }

  updateHP();

  // Check win condition
  if (!STATE.orcAlive) {
    await sleep(800);
    endGame('warrior');
    return;
  }

  // --- ORC TURN ---
  showWaiting(true);
  await sleep(1200);

  // Show orc turn overlay
  await showTurnOverlay('orc');
  showWaiting(false);

  // Orc picks a random action
  const actions = ['attack', 'fury', 'magic'];
  const orcAction = actions[rand(0, 2)];

  if (orcAction === 'attack') {
    const dmgBase = 15;
    const dmgTotal = dmgBase + STATE.orcFury * 2;
    addLog(`🟢 Thrall ataca con Furia nivel ${STATE.orcFury}! (${dmgTotal} daño)`, 'action-orc');
    warriorReceiveDamage(dmgTotal);
    STATE.orcFury += 1;
    $('orc-fury').textContent = STATE.orcFury;
    STATE.historial.push(`T${STATE.turn}: Thrall Ataque`);
  } else if (orcAction === 'fury') {
    const dmgFuria = rand(25, 35) + STATE.orcFury;
    addLog(`🔥 ¡Thrall golpea con FURIA! ${dmgFuria} daño!`, 'action-orc');
    warriorReceiveDamage(dmgFuria);
    STATE.orcFury += 1;
    $('orc-fury').textContent = STATE.orcFury;
    STATE.historial.push(`T${STATE.turn}: Thrall FURIA`);
  } else {
    addLog(`🟢 Thrall ruge y recupera energía...`, 'action-orc');
    curaMagia('orc');
    STATE.historial.push(`T${STATE.turn}: Thrall Magia`);
  }

  updateHP();

  // Check lose condition
  if (!STATE.playerAlive) {
    await sleep(800);
    endGame('orc');
    return;
  }

  // Advance turn
  STATE.turn++;
  $('turn-number').textContent = Math.min(STATE.turn, STATE.maxTurns);

  // Check max turns
  if (STATE.turn > STATE.maxTurns) {
    await sleep(600);
    endGame('draw');
    return;
  }

  // Show warrior turn overlay for next turn
  await showTurnOverlay('warrior');

  STATE.busy = false;
  setActionButtons(true);
}

// =====================================================
//  UI HELPERS
// =====================================================
function setActionButtons(enabled) {
  ['btn-attack', 'btn-fury', 'btn-magic'].forEach(id => {
    $(id).disabled = !enabled;
  });
  $('action-panel').style.display = enabled ? 'block' : 'none';
}

function showWaiting(show) {
  $('waiting-panel').classList.toggle('hidden', !show);
}

// =====================================================
//  END GAME
// =====================================================
function endGame(winner) {
  // Build end screen
  const endPortrait = $('result-portrait');
  const resultTitle = $('result-title');
  const resultSub = $('result-subtitle');
  const endLog = $('end-log');

  if (winner === 'warrior') {
    endPortrait.innerHTML = `<img src="assets/warrior.jpg" alt="Guerrero Victorioso"/>`;
    resultTitle.textContent = `⚔️ ¡VICTORIA!`;
    resultSub.textContent = `¡${STATE.playerName} ha derrotado a Thrall!`;
  } else if (winner === 'orc') {
    endPortrait.innerHTML = `<img src="assets/orc.png" alt="Thrall Victorioso"/>`;
    resultTitle.textContent = `💀 DERROTA`;
    resultSub.textContent = `${STATE.playerName} ha sido vencido por Thrall...`;
  } else {
    endPortrait.innerHTML = `<img src="assets/background.png" alt="Empate"/>`;
    resultTitle.textContent = `⚖️ EMPATE`;
    resultSub.textContent = `El combate terminó sin un vencedor...`;
  }

  // Fill battle log
  STATE.historial.forEach(evt => {
    const p = document.createElement('p');
    p.textContent = `• ${evt}`;
    endLog.appendChild(p);
  });

  // Transition to end screen
  $('battle-screen').classList.remove('active');
  $('end-screen').classList.add('active');
}

// =====================================================
//  RESTART
// =====================================================
function restartGame() {
  // Reset state
  Object.assign(STATE, {
    playerName: 'Guerrero',
    playerHP: 100, playerMaxHP: 100, playerShield: 10, playerAlive: true,
    orcHP: 120, orcMaxHP: 120, orcShield: 5, orcAlive: true,
    orcFury: 0, turn: 1, historial: [], busy: false,
  });

  // Clear logs
  $('battle-log').innerHTML = '';
  $('end-log').innerHTML = '';
  $('player-name').value = '';
  $('turn-number').textContent = '1';

  // Reset HP bars
  $('warrior-hp-bar').style.width = '100%';
  $('warrior-hp-value').textContent = '100 / 100';
  $('orc-hp-bar').style.width = '100%';
  $('orc-hp-value').textContent = '120 / 120';
  $('orc-fury').textContent = '0';

  // Reset cards
  $('card-warrior').classList.remove('defeated');
  $('card-orc').classList.remove('defeated');
  $('portrait-warrior').classList.remove('active-turn');
  $('portrait-orc').classList.remove('active-turn');

  // Reset panels
  $('action-panel').style.display = 'block';
  setActionButtons(true);
  showWaiting(false);

  // Go back to intro
  $('end-screen').classList.remove('active');
  $('battle-screen').classList.remove('active');
  $('intro-screen').classList.add('active');
}
