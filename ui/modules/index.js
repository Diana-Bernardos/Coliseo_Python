/**
 * INDEX.JS - Entry Point
 * Orquesta todos los módulos y coordina el flujo del juego
 * v3.0 Sprint 2: Roguelike Core System integrado
 */

import { GameState, PersistentStats, CLASS_STATS, DIFFICULTY_MODS } from './game-state.js';
import * as CombatEngine from './combat-engine.js';
import { Run, getRewardPerks, scaleDifficultyForRun, RunLeaderboard } from './roguelike-system.js';
import * as UIRenderer from './ui-renderer.js';
import { showRewardScreen, hideRewardScreen, initRewardScreen } from './reward-screen.js';
import { AdsManager, shouldShowInterstitial } from './ads-manager.js';

// ─── GLOBAL INSTANCES ───
const state = new GameState();
const stats = new PersistentStats();
const adsManager = new AdsManager(false); // false = dev mode (no real ads)
const runLeaderboard = new RunLeaderboard(10);
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

let battleCount = 0; // For ad frequency tracking
let currentRun = null; // Current roguelike run
let roguelikeMode = false; // Toggle roguelike vs classic mode

// ─── WEB AUDIO SYSTEM ───
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
      const o = ctx.createOscillator();
      o.connect(g);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(380, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);
      g.gain.setValueAtTime(0.22, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start();
      o.stop(ctx.currentTime + 0.2);
    } else if (type === 'fury') {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++)
        d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const s = ctx.createBufferSource();
      s.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 600;
      s.connect(f);
      f.connect(g);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      s.start();
    } else if (type === 'magic') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const gn = ctx.createGain();
        o.connect(gn);
        gn.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        gn.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
        gn.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.07 + 0.05);
        gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.5);
        o.start(ctx.currentTime + i * 0.07);
        o.stop(ctx.currentTime + i * 0.07 + 0.55);
      });
    } else if (type === 'shield') {
      const o = ctx.createOscillator();
      o.connect(g);
      o.type = 'triangle';
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.18, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start();
      o.stop(ctx.currentTime + 0.25);
    } else if (type === 'dodge') {
      const o = ctx.createOscillator();
      o.connect(g);
      o.type = 'sine';
      o.frequency.setValueAtTime(800, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.12);
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start();
      o.stop(ctx.currentTime + 0.15);
    } else if (type === 'victory') {
      [262, 330, 392, 523, 659].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const gn = ctx.createGain();
        o.connect(gn);
        gn.connect(ctx.destination);
        o.type = 'square';
        o.frequency.value = freq;
        gn.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1);
        gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
        o.start(ctx.currentTime + i * 0.1);
        o.stop(ctx.currentTime + i * 0.1 + 0.45);
      });
    } else if (type === 'defeat') {
      [330, 262, 220, 165].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const gn = ctx.createGain();
        o.connect(gn);
        gn.connect(ctx.destination);
        o.type = 'sawtooth';
        o.frequency.value = freq;
        gn.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.18);
        gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.5);
        o.start(ctx.currentTime + i * 0.18);
        o.stop(ctx.currentTime + i * 0.18 + 0.55);
      });
    }
  } catch (e) {}
}

// ─── SETUP: CLASS & DIFFICULTY ───
function selectClass(cls) {
  state.playerClass = cls;
  document.querySelectorAll('.class-btn').forEach(b =>
    b.classList.toggle('selected', b.dataset.class === cls)
  );
  const s = CLASS_STATS[cls];
  const preview = $('class-preview');
  if (preview) preview.innerHTML = `<span>${s.icon}</span> <strong>${cls.toUpperCase()}</strong>: ${s.desc}`;
}

function selectDifficulty(diff) {
  state.difficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(b =>
    b.classList.toggle('selected', b.dataset.diff === diff)
  );
}

// ─── GAME START ───
export function startGame() {
  const nameInput = $('player-name');
  if (!nameInput) return;

  const nameValue = nameInput.value.trim();
  state.playerName = nameValue
    ? nameValue.charAt(0).toUpperCase() + nameValue.slice(1)
    : 'Uthred';

  // Create new Run if roguelike mode
  if (roguelikeMode && (!currentRun || !currentRun.active)) {
    currentRun = new Run(state.playerName, state.playerClass, state.difficulty);
    console.log(`[ROGUELIKE] Nueva run iniciada: ${currentRun.playerName} - ${currentRun.playerClass} (${currentRun.difficulty})`);
  }

  // Apply class stats
  state.applyPlayerClass(state.playerClass);
  state.playerAlive = true;
  state.furyCD = 0;
  state.magicCD = 0;
  state.shieldCD = 0;

  // Apply difficulty (may be scaled in roguelike mode)
  let difficulty = state.difficulty;
  if (roguelikeMode && currentRun) {
    difficulty = scaleDifficultyForRun(currentRun.wins);
  }
  state.applyDifficulty(difficulty);

  // Apply perks from current run
  if (roguelikeMode && currentRun) {
    currentRun.applyPerks(state);
  }

  state.orcAlive = true;
  state.orcFury = 0;

  // Reset battle
  state.turn = 1;
  state.historial = [];
  state.busy = false;
  state.score = 0;

  // Update UI
  const warriorName = $('warrior-name');
  if (warriorName) warriorName.textContent = state.playerName.toUpperCase();

  const warriorIcon = $('warrior-class-icon');
  if (warriorIcon) warriorIcon.textContent = CLASS_STATS[state.playerClass].icon;

  const turnNum = $('turn-number');
  if (turnNum) turnNum.textContent = '1';

  const battleLog = $('battle-log');
  if (battleLog) battleLog.innerHTML = '';

  UIRenderer.updateHP(state);
  UIRenderer.updateCooldownUI(state);

  // Show streak or run status
  const streakBanner = $('streak-banner');
  if (streakBanner) {
    if (roguelikeMode && currentRun) {
      streakBanner.textContent = `🔥 Run: ${currentRun.wins}W | Perks: ${currentRun.perks.length}`;
      streakBanner.classList.remove('hidden');
    } else if (stats.streak > 0) {
      streakBanner.textContent = `🔥 Racha activa: ${stats.streak}`;
      streakBanner.classList.remove('hidden');
    } else {
      streakBanner.classList.add('hidden');
    }
  }

  UIRenderer.showScreen('battle-screen');
  setTimeout(() => UIRenderer.showTurnOverlay('warrior', state), 400);
}

// ─── PLAYER ACTION ───
export async function playerAction(action) {
  if (state.busy || !state.playerAlive || !state.orcAlive) return;

  // Check cooldowns
  if (action === 'fury' && state.furyCD > 0) {
    UIRenderer.addLog(`🔥 Furia en recarga (${state.furyCD} turnos)`, 'action-player');
    return;
  }
  if (action === 'magic' && state.magicCD > 0) {
    UIRenderer.addLog(`✨ Magia en recarga (${state.magicCD} turnos)`, 'action-player');
    return;
  }
  if (action === 'shield' && state.shieldCD > 0) {
    UIRenderer.addLog(`🛡️ Escudo en recarga (${state.shieldCD} turnos)`, 'action-player');
    return;
  }

  state.busy = true;
  UIRenderer.setActionButtons(false);

  UIRenderer.addLog(`══ TURNO ${state.turn} / ${state.maxTurns} ══`, 'turn-header');

  // PLAYER ACTION
  if (action === 'attack') {
    const dmg = CombatEngine.calculatePlayerDamage('attack', state);
    playSfx('attack');
    UIRenderer.addLog(`⚔️ ${state.playerName} lanza un Tajo con ${dmg} de daño!`, 'action-player');
    const result = CombatEngine.orcReceiveDamage(dmg, state);
    UIRenderer.shakeCard('orc');
    UIRenderer.spawnFloatingNumber('orc', result.damage + (result.isCrit ? '!' : ''), 'damage');
    UIRenderer.addLog(result.message, 'damage');
    state.addHistory(state.turn, `${state.playerName} Ataque`, state.playerName);
  } else if (action === 'fury') {
    const dmg = CombatEngine.calculatePlayerDamage('fury', state);
    playSfx('fury');
    UIRenderer.addLog(`🔥 ¡FURIA! ${state.playerName} embiste con ${dmg} de daño!`, 'action-player');
    const result = CombatEngine.orcReceiveDamage(dmg, state);
    UIRenderer.shakeCard('orc');
    UIRenderer.spawnFloatingNumber('orc', result.damage, 'damage');
    UIRenderer.addLog(result.message, 'damage');
    state.furyCD = 3;
    state.addHistory(state.turn, `${state.playerName} FURIA`, state.playerName);
  } else if (action === 'magic') {
    playSfx('magic');
    UIRenderer.addLog(`✨ ${state.playerName} invoca magia curativa!`, 'action-player');
    const heal = CombatEngine.healMagic('player', state);
    UIRenderer.healEffect('warrior');
    UIRenderer.spawnFloatingNumber('warrior', heal.amount, 'heal');
    UIRenderer.addLog(heal.message, 'heal');
    state.magicCD = 2;
    state.addHistory(state.turn, `${state.playerName} Magia`, state.playerName);
  } else if (action === 'shield') {
    const dmg = CombatEngine.calculatePlayerDamage('shield', state);
    playSfx('shield');
    state.playerShield += 2;
    UIRenderer.addLog(`🛡️ Embate de Escudo! ${dmg} daño. Escudo → ${state.playerShield}`, 'action-player');
    const result = CombatEngine.orcReceiveDamage(dmg, state);
    UIRenderer.shakeCard('orc');
    UIRenderer.spawnFloatingNumber('orc', result.damage, 'damage');
    UIRenderer.addLog(result.message, 'damage');
    state.shieldCD = 2;
    state.addHistory(state.turn, `${state.playerName} Escudo`, state.playerName);
  }

  UIRenderer.updateHP(state);
  UIRenderer.updateCooldownUI(state);

  if (!state.orcAlive) {
    await sleep(600);
    endGame('warrior');
    return;
  }

  // ORC TURN
  UIRenderer.showWaiting(true);
  await sleep(900);
  await UIRenderer.showTurnOverlay('orc', state);
  UIRenderer.showWaiting(false);

  const orcAction = CombatEngine.orcChooseAction(state);

  if (orcAction === 'attack') {
    const dmgTotal = CombatEngine.orcAttack(state);
    playSfx('attack');
    UIRenderer.addLog(`🟢 Thrall ataca (Furia ${state.orcFury - 1})! ${dmgTotal} daño`, 'action-orc');
    const result = CombatEngine.playerReceiveDamage(dmgTotal, state);
    if (result.result !== 'ESQUIVADO') {
      UIRenderer.shakeCard('warrior');
      UIRenderer.spawnFloatingNumber('warrior', result.damage, 'damage');
    } else {
      UIRenderer.shakeCard('warrior');
      UIRenderer.spawnFloatingNumber('warrior', 'ESQUIVA', 'dodge');
    }
    UIRenderer.addLog(result.message, result.result === 'ESQUIVADO' ? 'dodge' : 'damage');
  } else if (orcAction === 'fury') {
    const dmgFuria = CombatEngine.orcFury(state);
    playSfx('fury');
    UIRenderer.addLog(`🔥 ¡Thrall golpea con FURIA! ${dmgFuria} daño!`, 'action-orc');
    const result = CombatEngine.playerReceiveDamage(dmgFuria, state);
    UIRenderer.shakeCard('warrior');
    UIRenderer.spawnFloatingNumber('warrior', result.damage, 'damage');
    UIRenderer.addLog(result.message, 'damage');
  } else if (orcAction === 'magic') {
    playSfx('magic');
    UIRenderer.addLog(`🟢 Thrall gruñe y se recupera...`, 'action-orc');
    const heal = CombatEngine.healMagic('orc', state);
    UIRenderer.healEffect('orc');
    UIRenderer.spawnFloatingNumber('orc', heal.amount, 'heal');
    UIRenderer.addLog(heal.message, 'heal');
  } else if (orcAction === 'roar') {
    const roar = CombatEngine.orcRoar(state);
    UIRenderer.addLog(roar.message, 'action-orc');
  }

  UIRenderer.updateHP(state);

  if (!state.playerAlive) {
    await sleep(600);
    endGame('orc');
    return;
  }

  // Next turn
  state.tickCooldowns();
  const hasMoreTurns = state.incrementTurn();

  const turnNum = $('turn-number');
  if (turnNum) turnNum.textContent = String(Math.min(state.turn, state.maxTurns));

  if (!hasMoreTurns) {
    await sleep(500);
    endGame('draw');
    return;
  }

  await UIRenderer.showTurnOverlay('warrior', state);
  state.busy = false;
  UIRenderer.setActionButtons(true);
}

// ─── END GAME ───
async function endGame(winner) {
  battleCount++;

  // Handle roguelike mode
  if (roguelikeMode && currentRun) {
    if (winner === 'warrior') {
      currentRun.addWin(state.score);
      console.log(`[ROGUELIKE] Victoria #${currentRun.wins} - Score: ${state.score}`);
    } else {
      currentRun.addLoss();
      console.log(`[ROGUELIKE] Derrota - Run finalizada`);
      
      // Save completed run to leaderboard when run ends
      if (!currentRun.active) {
        runLeaderboard.addRun(currentRun);
        runLeaderboard.save('roguelike_runs_v3');
        console.log(`[ROGUELIKE] Run guardado en leaderboard`);
      }
    }
  }

  // Update permanent stats
  if (winner === 'warrior') {
    stats.recordWin(state.playerName, state.score, state.difficulty);
    playSfx('victory');
  } else if (winner === 'orc') {
    stats.recordLoss();
    playSfx('defeat');
  } else {
    stats.recordDraw();
  }

  // Render end screen
  UIRenderer.renderEndScreen(state, winner);
  UIRenderer.renderLeaderboard(stats);
  UIRenderer.updateStatsUI(stats);

  UIRenderer.showScreen('end-screen');

  // ROGUELIKE: Show reward screen if won
  if (roguelikeMode && winner === 'warrior' && currentRun && currentRun.active) {
    await sleep(1500); // Brief pause for celebration
    
    // Hide end screen and show reward screen
    UIRenderer.showScreen(null);
    hideRewardScreen();
    await sleep(300);

    // Show reward selection
    const selectedPerkId = await showRewardScreen(currentRun, stats);
    console.log(`[ROGUELIKE] Perk seleccionado: ${selectedPerkId}`);

    // Hide reward screen and show end screen again
    hideRewardScreen();
    await sleep(500);
    UIRenderer.showScreen('end-screen');
  }

  // Show interstitial ad every 3 battles (only in classic mode)
  if (!roguelikeMode && shouldShowInterstitial(battleCount)) {
    await adsManager.showInterstitialAd();
  }

  // ROGUELIKE: If run is active, show "Continue" instead of "Play Again"
  if (roguelikeMode && currentRun && currentRun.active) {
    const restartBtn = $('btn-restart');
    if (restartBtn) {
      restartBtn.textContent = '⚔️ Siguiente Batalla';
    }
  }
}

// ─── RESTART ───
export function restartGame() {
  // If in roguelike mode and run is active, start next battle
  if (roguelikeMode && currentRun && currentRun.active) {
    startGame();
    return;
  }

  // Classic mode: reset to intro screen
  const endLog = $('end-log');
  if (endLog) endLog.innerHTML = '';

  const battleLog = $('battle-log');
  if (battleLog) battleLog.innerHTML = '';

  const playerName = $('player-name');
  if (playerName) playerName.value = '';

  state.resetBattle();
  currentRun = null;
  selectClass('warrior');
  selectDifficulty('normal');
  UIRenderer.showScreen('intro-screen');
}

// ─── ROGUELIKE MODE CONTROLS ───
export function setRoguelikeMode(enabled) {
  roguelikeMode = enabled;
  console.log(`[GAME] Roguelike Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  if (!enabled) {
    currentRun = null;
  }
}

export function getRoguelikeMode() {
  return roguelikeMode;
}

export function getCurrentRun() {
  return currentRun;
}

// ─── INITIALIZATION ───
export function initGame() {
  // Initialize reward screen
  initRewardScreen();

  // Load run leaderboard
  runLeaderboard.load('roguelike_runs_v3');

  selectClass('warrior');
  selectDifficulty('normal');

  const nameInput = $('player-name');
  if (nameInput) {
    nameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') startGame();
    });
  }

  // Init cooldown badges
  ['btn-fury', 'btn-magic', 'btn-shield'].forEach(id => {
    const btn = $(id);
    if (!btn) return;
    const badge = document.createElement('span');
    badge.className = 'cooldown-badge';
    btn.appendChild(badge);
  });

  // Bind action buttons
  const btnAttack = $('btn-attack');
  const btnFury = $('btn-fury');
  const btnMagic = $('btn-magic');
  const btnShield = $('btn-shield');
  const btnStart = $('btn-start');
  const btnRestart = $('btn-restart');

  if (btnAttack) btnAttack.addEventListener('click', () => playerAction('attack'));
  if (btnFury) btnFury.addEventListener('click', () => playerAction('fury'));
  if (btnMagic) btnMagic.addEventListener('click', () => playerAction('magic'));
  if (btnShield) btnShield.addEventListener('click', () => playerAction('shield'));
  if (btnStart) btnStart.addEventListener('click', startGame);
  if (btnRestart) btnRestart.addEventListener('click', restartGame);

  console.log('[GAME] Módulos inicializados v3.0 Sprint 2 - Roguelike Core');
  console.log('[GAME] Activar roguelike: window.game.setRoguelikeMode(true)');
}

// ─── DOM READY ───
document.addEventListener('DOMContentLoaded', initGame);

// Export for debugging/testing
export { state, stats, adsManager, setRoguelikeMode, getRoguelikeMode, getCurrentRun, currentRun, runLeaderboard };
