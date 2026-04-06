// =====================================================
//  RPG BATTLE GAME LOGIC v2.0 - Coliseo de Batalla
//  Mejoras: IA adaptativa, racha, daño flotante,
//  barras suaves, sonido Web Audio, leaderboard
// =====================================================

// --- PERSISTENT STATS ---
const SAVE_KEY = 'coliseo_v2';
function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, scores: [] };
  } catch { return { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, scores: [] }; }
}
function saveStats() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(STATS)); } catch {}
}
const STATS = loadStats();

// --- GAME STATE ---
const STATE = {
  playerName: 'Guerrero',
  playerClass: 'warrior',     // warrior | mage | rogue
  difficulty: 'normal',       // easy | normal | hard
  playerHP: 100,
  playerMaxHP: 100,
  playerShield: 10,
  playerAlive: true,
  // Cooldowns (turns remaining)
  furyCD: 0,
  magicCD: 0,
  shieldCD: 0,
  orcHP: 120,
  orcMaxHP: 120,
  orcShield: 5,
  orcAlive: true,
  orcFury: 0,
  turn: 1,
  maxTurns: 15,
  historial: [],
  busy: false,
  score: 0,
};

// Per-class base stats
const CLASS_STATS = {
  warrior: { hp: 130, shield: 12, icon: '⚔️', desc: 'Alta defensa, ataques consistentes' },
  mage:    { hp: 85,  shield: 4,  icon: '🔮', desc: 'Magia potente, curación superior' },
  rogue:   { hp: 100, shield: 7,  icon: '🗡️', desc: 'Alta esquiva, ataques críticos 20%' },
};

// --- Difficulty modifiers for orc AI ---
const DIFFICULTY = {
  easy:   { orcHPMult: 0.75, orcDmgMult: 0.7,  smartWeight: 0.15 },
  normal: { orcHPMult: 1.0,  orcDmgMult: 1.0,  smartWeight: 0.40 },
  hard:   { orcHPMult: 1.35, orcDmgMult: 1.35, smartWeight: 0.75 },
};

// --- Utility ---
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const $ = id => document.getElementById(id);

// =====================================================
//  WEB AUDIO — synthetic SFX (no assets needed)
// =====================================================
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playSfx(type) {
  try {
    const ctx = getAudio();
    const g = ctx.createGain();
    g.connect(ctx.destination);

    if (type === 'attack') {
      // Short metallic hit
      const o = ctx.createOscillator();
      o.connect(g);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(380, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);
      g.gain.setValueAtTime(0.22, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start(); o.stop(ctx.currentTime + 0.2);
    } else if (type === 'fury') {
      // Heavy whoosh
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const s = ctx.createBufferSource();
      s.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 600;
      s.connect(f); f.connect(g);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      s.start();
    } else if (type === 'magic') {
      // Bell shimmer
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const gn = ctx.createGain();
        o.connect(gn); gn.connect(ctx.destination);
        o.type = 'sine'; o.frequency.value = freq;
        gn.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
        gn.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.07 + 0.05);
        gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.5);
        o.start(ctx.currentTime + i * 0.07);
        o.stop(ctx.currentTime + i * 0.07 + 0.55);
      });
      return;
    } else if (type === 'shield') {
      const o = ctx.createOscillator();
      o.connect(g); o.type = 'triangle';
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.18, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start(); o.stop(ctx.currentTime + 0.25);
    } else if (type === 'dodge') {
      const o = ctx.createOscillator();
      o.connect(g); o.type = 'sine';
      o.frequency.setValueAtTime(800, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.12);
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start(); o.stop(ctx.currentTime + 0.15);
    } else if (type === 'victory') {
      [262, 330, 392, 523, 659].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const gn = ctx.createGain();
        o.connect(gn); gn.connect(ctx.destination);
        o.type = 'square'; o.frequency.value = freq;
        gn.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1);
        gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
        o.start(ctx.currentTime + i * 0.1);
        o.stop(ctx.currentTime + i * 0.1 + 0.45);
      });
      return;
    } else if (type === 'defeat') {
      [330, 262, 220, 165].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const gn = ctx.createGain();
        o.connect(gn); gn.connect(ctx.destination);
        o.type = 'sawtooth'; o.frequency.value = freq;
        gn.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.18);
        gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.5);
        o.start(ctx.currentTime + i * 0.18);
        o.stop(ctx.currentTime + i * 0.18 + 0.55);
      });
      return;
    }
  } catch(e) {}
}

// =====================================================
//  FLOATING DAMAGE NUMBERS
// =====================================================
function spawnFloatingNumber(who, value, type = 'damage') {
  const card = who === 'warrior' ? $('card-warrior') : $('card-orc');
  const el = document.createElement('div');
  el.className = `floating-number float-${type}`;
  const prefix = type === 'heal' ? '+' : (type === 'dodge' ? '' : '-');
  el.textContent = prefix + (typeof value === 'number' ? value : value);
  el.style.left = (30 + rand(10, 40)) + '%';
  el.style.top = '20%';
  card.style.position = 'relative';
  card.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

// =====================================================
//  SETUP SCREEN
// =====================================================
function selectClass(cls) {
  STATE.playerClass = cls;
  document.querySelectorAll('.class-btn').forEach(b => b.classList.toggle('selected', b.dataset.class === cls));
  const s = CLASS_STATS[cls];
  $('class-preview').innerHTML = `<span>${s.icon}</span> <strong>${cls.toUpperCase()}</strong>: ${s.desc}`;
}

function selectDifficulty(diff) {
  STATE.difficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.toggle('selected', b.dataset.diff === diff));
}

function startGame() {
  const nameInput = $('player-name').value.trim();
  STATE.playerName = nameInput
    ? nameInput.charAt(0).toUpperCase() + nameInput.slice(1)
    : 'Uthred';

  // Apply class stats
  const cs = CLASS_STATS[STATE.playerClass];
  STATE.playerHP = cs.hp;
  STATE.playerMaxHP = cs.hp;
  STATE.playerShield = cs.shield;
  STATE.playerAlive = true;
  STATE.furyCD = 0; STATE.magicCD = 0; STATE.shieldCD = 0;

  // Apply difficulty to orc
  const dm = DIFFICULTY[STATE.difficulty];
  STATE.orcMaxHP = Math.round(120 * dm.orcHPMult);
  STATE.orcHP = STATE.orcMaxHP;
  STATE.orcShield = 5;
  STATE.orcAlive = true;
  STATE.orcFury = 0;
  STATE.turn = 1;
  STATE.historial = [];
  STATE.busy = false;
  STATE.score = 0;

  // Reset UI
  $('warrior-name').textContent = STATE.playerName.toUpperCase();
  $('warrior-class-icon').textContent = CLASS_STATS[STATE.playerClass].icon;
  $('turn-number').textContent = '1';
  $('battle-log').innerHTML = '';
  updateHP(true);
  updateCooldownUI();

  // Show current streak
  if (STATS.streak > 0) {
    $('streak-banner').textContent = `🔥 Racha activa: ${STATS.streak}`;
    $('streak-banner').classList.remove('hidden');
  } else {
    $('streak-banner').classList.add('hidden');
  }

  $('intro-screen').classList.remove('active');
  $('battle-screen').classList.add('active');

  setTimeout(() => showTurnOverlay('warrior'), 400);
}

// =====================================================
//  TURN OVERLAY
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
    $('portrait-warrior').classList.add('active-turn');
    $('portrait-orc').classList.remove('active-turn');
  } else {
    img.src = 'assets/orc.jpg';
    text.textContent = '🔥 TURNO DE THRALL';
    text.className = 'turn-text orc-text';
    $('portrait-orc').classList.add('active-turn');
    $('portrait-warrior').classList.remove('active-turn');
  }

  await sleep(1400);
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
//  HP BAR UPDATES — smooth CSS transitions
// =====================================================
function updateHP(instant = false) {
  const wPct = Math.max(0, (STATE.playerHP / STATE.playerMaxHP) * 100);
  const wBar = $('warrior-hp-bar');
  if (instant) wBar.style.transition = 'none';
  else wBar.style.transition = 'width 0.6s cubic-bezier(0.4,0,0.2,1), background-color 0.4s';
  wBar.style.width = wPct + '%';
  $('warrior-hp-value').textContent = `${Math.max(0, STATE.playerHP)} / ${STATE.playerMaxHP}`;
  wBar.classList.remove('danger', 'warning');
  if (wPct <= 25) wBar.classList.add('danger');
  else if (wPct <= 50) wBar.classList.add('warning');

  const oPct = Math.max(0, (STATE.orcHP / STATE.orcMaxHP) * 100);
  const oBar = $('orc-hp-bar');
  if (instant) oBar.style.transition = 'none';
  else oBar.style.transition = 'width 0.6s cubic-bezier(0.4,0,0.2,1), background-color 0.4s';
  oBar.style.width = oPct + '%';
  $('orc-hp-value').textContent = `${Math.max(0, STATE.orcHP)} / ${STATE.orcMaxHP}`;
  oBar.classList.remove('danger', 'warning');
  if (oPct <= 25) oBar.classList.add('danger');
  else if (oPct <= 50) oBar.classList.add('warning');

  $('orc-fury').textContent = STATE.orcFury;
  $('warrior-shield').textContent = STATE.playerShield;

  if (instant) {
    requestAnimationFrame(() => {
      wBar.style.transition = '';
      oBar.style.transition = '';
    });
  }
}

// =====================================================
//  COOLDOWN UI
// =====================================================
function updateCooldownUI() {
  const cds = { 'btn-fury': STATE.furyCD, 'btn-magic': STATE.magicCD, 'btn-shield': STATE.shieldCD };
  for (const [id, cd] of Object.entries(cds)) {
    const btn = $(id);
    if (!btn) continue;
    const badge = btn.querySelector('.cooldown-badge');
    if (cd > 0) {
      btn.classList.add('on-cooldown');
      if (badge) badge.textContent = cd;
    } else {
      btn.classList.remove('on-cooldown');
      if (badge) badge.textContent = '';
    }
  }
}

function tickCooldowns() {
  if (STATE.furyCD > 0) STATE.furyCD--;
  if (STATE.magicCD > 0) STATE.magicCD--;
  if (STATE.shieldCD > 0) STATE.shieldCD--;
  updateCooldownUI();
}

// =====================================================
//  ANIMATIONS
// =====================================================
function shakeCard(who) {
  const card = who === 'warrior' ? $('card-warrior') : $('card-orc');
  card.classList.remove('shake');
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
//  CORE MECHANICS
// =====================================================
function warriorReceiveDamage(amount) {
  const dodgeChance = STATE.playerClass === 'rogue' ? 5 : 10;
  if (rand(1, dodgeChance) === 1) {
    addLog(`✦ ${STATE.playerName} esquivó por completo!`, 'dodge');
    spawnFloatingNumber('warrior', 'ESQUIVA', 'dodge');
    playSfx('dodge');
    return 'ESQUIVADO';
  }

  const block = STATE.playerShield * 1.5;
  const finalDmg = Math.max(0, Math.round(amount - block));
  STATE.playerHP = Math.max(0, STATE.playerHP - finalDmg);
  STATE.score = Math.max(0, STATE.score - Math.round(finalDmg * 0.5));

  shakeCard('warrior');
  spawnFloatingNumber('warrior', finalDmg, 'damage');
  addLog(`→ ${STATE.playerName} bloqueó. Recibió ${finalDmg} daño. Vida: ${STATE.playerHP}`, 'damage');

  if (STATE.playerHP <= 0) {
    STATE.playerAlive = false;
    addLog(`!!! ${STATE.playerName} ha caído en combate !!!`, 'death');
  }
  return finalDmg;
}

function orcReceiveDamage(amount) {
  if (amount < 5) {
    addLog(`Thrall ni lo sintió...`, 'action-orc');
    return 0;
  }
  if (rand(1, 10) === 1) {
    addLog(`✦ Thrall esquivó el ataque!`, 'dodge');
    spawnFloatingNumber('orc', 'ESQUIVA', 'dodge');
    playSfx('dodge');
    return 'ESQUIVADO';
  }

  // Rogue gets 20% crit chance
  let finalAmount = amount;
  let isCrit = false;
  if (STATE.playerClass === 'rogue' && rand(1, 5) === 1) {
    finalAmount = Math.round(amount * 1.8);
    isCrit = true;
  }

  const finalDmg = Math.max(0, Math.round(finalAmount - STATE.orcShield));
  STATE.orcHP = Math.max(0, STATE.orcHP - finalDmg);

  // Score: more points for crits and high damage
  STATE.score += Math.round(finalDmg * (isCrit ? 2 : 1));

  shakeCard('orc');
  spawnFloatingNumber('orc', finalDmg + (isCrit ? '!' : ''), 'damage');
  addLog(`→ Thrall recibió ${finalDmg}${isCrit ? ' 💥 CRÍTICO' : ''} daño. Vida: ${STATE.orcHP}`, 'damage');

  if (STATE.orcHP <= 0) {
    STATE.orcAlive = false;
    addLog(`!!! Thrall ha caído en combate !!!`, 'death');
  }
  return finalDmg;
}

function curaMagia(who) {
  const base = who === 'warrior' && STATE.playerClass === 'mage' ? rand(20, 35) : rand(10, 20);
  if (who === 'warrior') {
    STATE.playerHP = Math.min(STATE.playerMaxHP, STATE.playerHP + base);
    healEffect('warrior');
    spawnFloatingNumber('warrior', base, 'heal');
    addLog(`✨ ${STATE.playerName} se cura ${base} vida! (${STATE.playerHP})`, 'heal');
    STATE.score += Math.round(base * 0.3);
  } else {
    STATE.orcHP = Math.min(STATE.orcMaxHP, STATE.orcHP + base);
    healEffect('orc');
    spawnFloatingNumber('orc', base, 'heal');
    addLog(`🟢 Thrall regenera ${base} vida! (${STATE.orcHP})`, 'action-orc');
  }
}

// =====================================================
//  ADAPTIVE ORC AI
// =====================================================
function orcChooseAction() {
  const dm = DIFFICULTY[STATE.difficulty];
  const smart = dm.smartWeight;
  const orcHPpct = STATE.orcHP / STATE.orcMaxHP;
  const playerHPpct = STATE.playerHP / STATE.playerMaxHP;

  // Smart AI: respond to game state
  if (Math.random() < smart) {
    // Low HP -> prefer heal or roar to build up
    if (orcHPpct < 0.25) return Math.random() < 0.6 ? 'magic' : 'roar';
    // High fury -> unleash fury attack
    if (STATE.orcFury >= 4) return Math.random() < 0.7 ? 'fury' : 'attack';
    // Player low HP -> go aggressive
    if (playerHPpct < 0.3) return Math.random() < 0.8 ? 'fury' : 'attack';
    // Early game -> build fury
    if (STATE.turn <= 4) return Math.random() < 0.5 ? 'roar' : 'attack';
  }

  // Random fallback
  return ['attack', 'fury', 'magic', 'roar'][rand(0, 3)];
}

// =====================================================
//  PLAYER ACTION
// =====================================================
async function playerAction(action) {
  if (STATE.busy || !STATE.playerAlive || !STATE.orcAlive) return;

  // Check cooldowns
  if (action === 'fury' && STATE.furyCD > 0) { addLog(`🔥 Furia en recarga (${STATE.furyCD} turnos)`, 'action-player'); return; }
  if (action === 'magic' && STATE.magicCD > 0) { addLog(`✨ Magia en recarga (${STATE.magicCD} turnos)`, 'action-player'); return; }
  if (action === 'shield' && STATE.shieldCD > 0) { addLog(`🛡️ Escudo en recarga (${STATE.shieldCD} turnos)`, 'action-player'); return; }

  STATE.busy = true;
  setActionButtons(false);

  addLog(`══ TURNO ${STATE.turn} / ${STATE.maxTurns} ══`, 'turn-header');

  // --- Player action ---
  if (action === 'attack') {
    const dmg = rand(18, 28);
    playSfx('attack');
    addLog(`⚔️ ${STATE.playerName} lanza un Tajo con ${dmg} de daño!`, 'action-player');
    orcReceiveDamage(dmg);
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} Ataque`);

  } else if (action === 'fury') {
    const dmg = rand(35, 50);
    playSfx('fury');
    addLog(`🔥 ¡FURIA! ${STATE.playerName} embiste con ${dmg} de daño!`, 'action-player');
    orcReceiveDamage(dmg);
    STATE.furyCD = 3;
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} FURIA`);

  } else if (action === 'magic') {
    playSfx('magic');
    addLog(`✨ ${STATE.playerName} invoca magia curativa!`, 'action-player');
    curaMagia('warrior');
    STATE.magicCD = 2;
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} Magia`);

  } else if (action === 'shield') {
    const dmg = rand(10, 15);
    playSfx('shield');
    STATE.playerShield += 2;
    addLog(`🛡️ Embate de Escudo! ${dmg} daño. Escudo → ${STATE.playerShield}`, 'action-player');
    orcReceiveDamage(dmg);
    STATE.shieldCD = 2;
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} Escudo`);
  }

  updateHP();
  updateCooldownUI();

  if (!STATE.orcAlive) {
    await sleep(600);
    endGame('warrior');
    return;
  }

  // --- Orc turn ---
  showWaiting(true);
  await sleep(900);
  await showTurnOverlay('orc');
  showWaiting(false);

  const dm = DIFFICULTY[STATE.difficulty];
  const orcAction = orcChooseAction();

  if (orcAction === 'attack') {
    const dmgBase = 15;
    const dmgTotal = Math.round((dmgBase + STATE.orcFury * 2) * dm.orcDmgMult);
    playSfx('attack');
    addLog(`🟢 Thrall ataca (Furia ${STATE.orcFury})! ${dmgTotal} daño`, 'action-orc');
    warriorReceiveDamage(dmgTotal);
    STATE.orcFury += 1;

  } else if (orcAction === 'fury') {
    const dmgFuria = Math.round((rand(25, 35) + STATE.orcFury) * dm.orcDmgMult);
    playSfx('fury');
    addLog(`🔥 ¡Thrall golpea con FURIA! ${dmgFuria} daño!`, 'action-orc');
    warriorReceiveDamage(dmgFuria);
    STATE.orcFury += 1;

  } else if (orcAction === 'magic') {
    playSfx('magic');
    addLog(`🟢 Thrall gruñe y se recupera...`, 'action-orc');
    curaMagia('orc');

  } else if (orcAction === 'roar') {
    STATE.orcFury += 2;
    addLog(`🟢 ¡Rugido Aterrador! Thrall se enfurece. (+2 Furia → ${STATE.orcFury})`, 'action-orc');
  }

  updateHP();

  if (!STATE.playerAlive) {
    await sleep(600);
    endGame('orc');
    return;
  }

  // Next turn
  tickCooldowns();
  STATE.turn++;
  $('turn-number').textContent = Math.min(STATE.turn, STATE.maxTurns);

  if (STATE.turn > STATE.maxTurns) {
    await sleep(500);
    endGame('draw');
    return;
  }

  await showTurnOverlay('warrior');
  STATE.busy = false;
  setActionButtons(true);
}

// =====================================================
//  UI HELPERS
// =====================================================
function setActionButtons(enabled) {
  ['btn-attack', 'btn-fury', 'btn-magic', 'btn-shield'].forEach(id => {
    const btn = $(id);
    if (!btn) return;
    btn.disabled = !enabled;
  });
  $('action-panel').style.display = enabled ? 'block' : 'none';
}

function showWaiting(show) {
  $('waiting-panel').classList.toggle('hidden', !show);
}

// =====================================================
//  END GAME + STATS
// =====================================================
function endGame(winner) {
  const endPortrait = $('result-portrait');
  const resultTitle = $('result-title');
  const resultSub = $('result-subtitle');
  const endLog = $('end-log');

  // Update persistent stats
  if (winner === 'warrior') {
    STATS.wins++;
    STATS.streak++;
    STATS.bestStreak = Math.max(STATS.bestStreak, STATS.streak);
    // Score bonus for remaining HP and difficulty
    const diffBonus = { easy: 1, normal: 1.5, hard: 2.5 };
    const finalScore = Math.round(STATE.score * diffBonus[STATE.difficulty] + STATE.playerHP * 2);
    STATE.score = finalScore;
    STATS.scores.push({ name: STATE.playerName, score: finalScore, diff: STATE.difficulty });
    STATS.scores.sort((a, b) => b.score - a.score);
    if (STATS.scores.length > 10) STATS.scores = STATS.scores.slice(0, 10);
    playSfx('victory');
  } else if (winner === 'orc') {
    STATS.losses++;
    STATS.streak = 0;
    playSfx('defeat');
  } else {
    STATS.draws++;
    STATS.streak = 0;
  }
  saveStats();

  if (winner === 'warrior') {
    endPortrait.innerHTML = `<img src="assets/warrior.jpg" alt="Guerrero Victorioso"/>`;
    resultTitle.textContent = `⚔️ ¡VICTORIA!`;
    resultSub.textContent = `¡${STATE.playerName} ha derrotado a Thrall! Puntuación: ${STATE.score.toLocaleString()}`;
    if (STATS.streak > 1) resultSub.textContent += ` 🔥 Racha: ${STATS.streak}`;
  } else if (winner === 'orc') {
    endPortrait.innerHTML = `<img src="assets/orc.jpg" alt="Thrall Victorioso"/>`;
    resultTitle.textContent = `💀 DERROTA`;
    resultSub.textContent = `${STATE.playerName} ha sido vencido por Thrall...`;
  } else {
    endPortrait.innerHTML = `<img src="assets/background.png" alt="Empate"/>`;
    resultTitle.textContent = `⚖️ EMPATE`;
    resultSub.textContent = `El combate terminó sin un vencedor...`;
  }

  STATE.historial.forEach(evt => {
    let icon = '⚔️';
    if (evt.includes('FURIA')) icon = '🔥';
    else if (evt.includes('Magia')) icon = '✨';
    else if (evt.includes('Escudo')) icon = '🛡️';
    else if (evt.includes('Ataque')) icon = '🗡️';

    const item = document.createElement('div');
    item.className = 'history-item';

    const badge = document.createElement('span');
    badge.className = 'history-icon';
    badge.textContent = icon;

    const text = document.createElement('div');
    text.className = 'history-text';
    const [turn, action] = evt.split(': ');
    text.innerHTML = `<strong>${turn}</strong> ${action}`;

    item.appendChild(badge);
    item.appendChild(text);
    endLog.appendChild(item);
  });

  // Show leaderboard
  renderLeaderboard();

  $('stat-wins').textContent = STATS.wins;
  $('stat-losses').textContent = STATS.losses;
  $('stat-best-streak').textContent = STATS.bestStreak;

  $('battle-screen').classList.remove('active');
  $('end-screen').classList.add('active');
}

function renderLeaderboard() {
  const lb = $('leaderboard-list');
  if (!lb) return;
  lb.innerHTML = '';
  if (STATS.scores.length === 0) {
    lb.innerHTML = '<p style="opacity:0.5;font-size:0.8rem">Sin registros aún</p>';
    return;
  }
  STATS.scores.slice(0, 5).forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row';
    const medal = ['🥇', '🥈', '🥉', '4.', '5.'][i];
    row.innerHTML = `<span class="lb-rank">${medal}</span><span class="lb-name">${entry.name}</span><span class="lb-diff diff-${entry.diff}">${entry.diff}</span><span class="lb-score">${entry.score.toLocaleString()}</span>`;
    lb.appendChild(row);
  });
}

// =====================================================
//  RESTART
// =====================================================
function restartGame() {
  $('end-log').innerHTML = '';
  $('battle-log').innerHTML = '';
  $('player-name').value = '';
  $('end-screen').classList.remove('active');
  $('battle-screen').classList.remove('active');
  $('intro-screen').classList.add('active');
  // Reset class/difficulty selections to defaults
  selectClass('warrior');
  selectDifficulty('normal');
}

// =====================================================
//  INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  selectClass('warrior');
  selectDifficulty('normal');

  // Allow Enter key on name input
  const nameInput = $('player-name');
  if (nameInput) nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });

  // Init cooldown badges
  ['btn-fury', 'btn-magic', 'btn-shield'].forEach(id => {
    const btn = $(id);
    if (!btn) return;
    const badge = document.createElement('span');
    badge.className = 'cooldown-badge';
    btn.appendChild(badge);
  });
});