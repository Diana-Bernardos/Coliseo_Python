/**
 * INDEX.JS - Entry Point
 * Orquesta todos los módulos y coordina el flujo del juego
 * v3.0 Sprint 2: Roguelike Core System integrado
 */

import * as CombatEngine from './combat-engine.js';
import * as UIRenderer from './ui-renderer.js';
import { showRewardScreen, hideRewardScreen, initRewardScreen } from './reward-screen.js';
import { AdsManager, shouldShowInterstitial, offerReviveWithAd, offerDoubleRewardWithAd, claimDailyBonusWithAd } from './ads-manager.js';
import { Analytics } from './analytics.js';
import { GameState, PersistentStats, CLASS_STATS } from './game-state.js';
import { Run, getRewardPerks, scaleDifficultyForRun, RunLeaderboard } from './roguelike-system.js';
import {
  loadPlayerConfig as loadConfigUtil,
  savePlayerConfig as saveConfigUtil,
  selectClass as selectClassUtil,
  selectDifficulty as selectDifficultyUtil,
  selectWeapon as selectWeaponUtil,
  selectBackground as selectBackgroundUtil,
  selectSkin as selectSkinUtil,
  renderSkinOptions as renderSkinOptionsUtil,
  renderSelectionOptions as renderSelectionOptionsUtil,
  getCharacterNameForSkin,
} from './player-config.js';
import {
  updateRoguelikeButton as updateRoguelikeButtonUtil,
  updateDailyBonusButton as updateDailyBonusButtonUtil,
  bindMenuControls,
} from './menu-controls.js';

// ─── GLOBAL INSTANCES ───
const state = new GameState();
const stats = new PersistentStats();
const adsManager = new AdsManager(false); // false = dev mode (no real ads)
const analytics = new Analytics(false);
const runLeaderboard = new RunLeaderboard(10);
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
let battleCount = 0; // For ad frequency tracking
let currentRun = null; // Current roguelike run
let roguelikeMode = false; // Toggle roguelike vs classic mode
let gameInitialized = false; // Prevent duplicate DOM bindings

function savePlayerConfig() {
  saveConfigUtil(state, () => $('player-name')?.value || '', () => roguelikeMode);
}

function loadPlayerConfig() {
  return loadConfigUtil(state, {
    set(value) {
      roguelikeMode = value;
    },
  });
}

function updateRoguelikeButton() {
  updateRoguelikeButtonUtil(() => roguelikeMode, $);
}

function updateDailyBonusButton() {
  updateDailyBonusButtonUtil($);
}

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
  selectClassUtil(state, cls, $, savePlayerConfig);
}

function selectDifficulty(diff) {
  selectDifficultyUtil(state, diff, savePlayerConfig);
}

function selectWeapon(weaponId) {
  selectWeaponUtil(state, weaponId, $, savePlayerConfig);
}

function selectBackground(backgroundId) {
  selectBackgroundUtil(state, backgroundId, $, savePlayerConfig);
}

function selectSkin(skinId) {
  selectSkinUtil(state, skinId, $, UIRenderer, savePlayerConfig);
}

function renderSkinOptions() {
  renderSkinOptionsUtil(state, $);
}

function renderSelectionOptions() {
  renderSelectionOptionsUtil(state, $, selectWeapon);
}

// ─── GAME START ───
export function startGame() {
  const nameInput = $('player-name');
  if (!nameInput) return;

  const nameValue = nameInput.value.trim();
  const selectedClass = state.playerClass || 'warrior';
  const selectedDifficulty = state.difficulty || 'normal';
  const selectedWeapon = state.playerWeapon || 'sword';
  const selectedSkin = state.playerSkin || 'classic';
  const selectedBackground = state.battleBackground || 'forest';

  state.resetBattle();
  state.applyPlayerConfig({
    playerClass: selectedClass,
    difficulty: selectedDifficulty,
    playerWeapon: selectedWeapon,
    playerSkin: selectedSkin,
    battleBackground: selectedBackground,
    playerName: nameValue
      ? nameValue.charAt(0).toUpperCase() + nameValue.slice(1)
      : getCharacterNameForSkin(selectedSkin),
  });
  savePlayerConfig();

  analytics.trackEvent('game_start', {
    playerName: state.playerName,
    playerClass: state.playerClass,
    difficulty: state.difficulty,
    roguelikeMode,
  });

  // Create new Run if roguelike mode
  if (roguelikeMode && (!currentRun || !currentRun.active)) {
    currentRun = new Run(state.playerName, state.playerClass, state.difficulty);
    console.log(`[ROGUELIKE] Nueva run iniciada: ${currentRun.playerName} - ${currentRun.playerClass} (${currentRun.difficulty})`);
  }

  // Apply class stats and selected equipment
  state.applyPlayerClass(state.playerClass);
  state.applyWeapon(state.playerWeapon);
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

  UIRenderer.updatePlayerSkin(state);

  const warriorIcon = $('warrior-class-icon');
  if (warriorIcon) warriorIcon.textContent = CLASS_STATS[state.playerClass].icon;

  const turnNum = $('turn-number');
  if (turnNum) turnNum.textContent = '1';

  const battleLog = $('battle-log');
  if (battleLog) battleLog.innerHTML = '';

  UIRenderer.updateHP(state);
  UIRenderer.updateCooldownUI(state);
  UIRenderer.setActionButtons(true);

  // Hide waiting overlay and ensure action panel is visible
  const waitingPanel = $('waiting-panel');
  if (waitingPanel) waitingPanel.classList.add('hidden');

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
  UIRenderer.updateBattleBackground(state);
  UIRenderer.updateWeaponOverlay(state);
  adsManager.showBannerAd();
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
    const combo = CombatEngine.checkCombo(state, action);
    const dmg = CombatEngine.calculatePlayerDamage('attack', state);
    if (combo.combo) {
      UIRenderer.showComboIndicator(combo);
      UIRenderer.addLog(`🔥 ¡COMBO x${combo.count}! Daño aumentado!`, 'combo');
    }
    playSfx('attack');
    UIRenderer.addLog(`⚔️ ${state.playerName} lanza un Tajo con ${dmg} de daño!`, 'action-player');
    const result = CombatEngine.orcReceiveDamage(dmg, state);
    UIRenderer.shakeCard('orc');
    UIRenderer.spawnFloatingNumber('orc', result.damage + (result.isCrit ? '!' : ''), combo.combo ? 'combo' : 'damage');
    UIRenderer.addLog(result.message, 'damage');
    state.addHistory(state.turn, `${state.playerName} Ataque`, state.playerName);
  } else if (action === 'fury') {
    const combo = CombatEngine.checkCombo(state, action);
    const dmg = CombatEngine.calculatePlayerDamage('fury', state);
    if (combo.combo) {
      UIRenderer.showComboIndicator(combo);
      UIRenderer.addLog(`🔥 ¡COMBO x${combo.count}! Daño aumentado!`, 'combo');
    }
    playSfx('fury');
    UIRenderer.addLog(`🔥 ¡FURIA! ${state.playerName} embiste con ${dmg} de daño!`, 'action-player');
    const result = CombatEngine.orcReceiveDamage(dmg, state);
    UIRenderer.shakeCard('orc');
    UIRenderer.spawnFloatingNumber('orc', result.damage, combo.combo ? 'combo' : 'damage');
    UIRenderer.addLog(result.message, 'damage');
    state.furyCD = Math.max(0, 3 - (state.furyCDReduction || 0));
    if (state.furyChain && dmg > 50) {
      state.furyCD = 0;
      UIRenderer.addLog('🔁 ¡Furia encadenada no consume recarga!', 'action-player');
    }
    state.addHistory(state.turn, `${state.playerName} FURIA`, state.playerName);
  } else if (action === 'magic') {
    const combo = CombatEngine.checkCombo(state, action);
    const dmg = CombatEngine.calculatePlayerDamage('magic', state);
    if (combo.combo) {
      UIRenderer.showComboIndicator(combo);
      UIRenderer.addLog(`🔥 ¡COMBO x${combo.count}! Daño aumentado!`, 'combo');
    }
    playSfx('magic');
    UIRenderer.addLog(`✨ ¡MAGIA! ${state.playerName} lanza un hechizo con ${dmg} de daño!`, 'action-player');
    const result = CombatEngine.orcReceiveDamage(dmg, state);
    UIRenderer.shakeCard('orc');
    UIRenderer.spawnFloatingNumber('orc', result.damage, combo.combo ? 'combo' : 'damage');
    UIRenderer.addLog(result.message, 'damage');
    state.magicCD = Math.max(0, 4 - (state.magicCDReduction || 0));
    state.addHistory(state.turn, `${state.playerName} MAGIA`, state.playerName);
  } else if (action === 'shield') {
    const dmg = CombatEngine.calculatePlayerDamage('shield', state);
    playSfx('shield');
    state.playerShield += 2;
    UIRenderer.addLog(`🛡️ Embate de Escudo! ${dmg} daño. Escudo → ${state.playerShield}`, 'action-player');
    const result = CombatEngine.orcReceiveDamage(dmg, state);
    UIRenderer.shakeCard('orc');
    UIRenderer.spawnFloatingNumber('orc', result.damage, 'damage');
    UIRenderer.addLog(result.message, 'damage');
    state.shieldCD = Math.max(0, 2 - (state.shieldCDReduction || 0));
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
    const dmg = CombatEngine.orcMagic(state);
    playSfx('magic');
    UIRenderer.addLog(`✨ ¡Thrall lanza un hechizo! ${dmg} daño!`, 'action-orc');
    const result = CombatEngine.playerReceiveDamage(dmg, state);
    UIRenderer.shakeCard('warrior');
    UIRenderer.spawnFloatingNumber('warrior', result.damage, 'damage');
    UIRenderer.addLog(result.message, 'damage');
  } else if (orcAction === 'roar') {
    const roar = CombatEngine.orcRoar(state);
    UIRenderer.addLog(roar.message, 'action-orc');
  }

  UIRenderer.updateHP(state);

  if (state.regenPerTurn > 0 && state.playerAlive) {
    const healAmount = Math.min(state.regenPerTurn, state.playerMaxHP - state.playerHP);
    if (healAmount > 0) {
      state.playerHP = Math.min(state.playerMaxHP, state.playerHP + healAmount);
      UIRenderer.healEffect('warrior');
      UIRenderer.spawnFloatingNumber('warrior', healAmount, 'heal');
      UIRenderer.addLog(`✨ Regeneras ${healAmount} HP gracias a tus perks.`, 'heal');
      UIRenderer.updateHP(state);
    }
  }

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

  // Revive hook for classic mode: offer a rewarded ad to continue from defeat.
  if (!roguelikeMode && winner === 'orc') {
    const reviveMultiplier = await offerReviveWithAd(adsManager);
    if (reviveMultiplier > 0) {
      state.playerHP = Math.max(1, Math.floor(state.playerMaxHP * reviveMultiplier));
      state.playerAlive = true;
      state.busy = false;
      state.furyCD = Math.max(0, state.furyCD - 1);
      state.magicCD = Math.max(0, state.magicCD - 1);
      state.shieldCD = Math.max(0, state.shieldCD - 1);
      UIRenderer.updateHP(state);
      UIRenderer.updateCooldownUI(state);
      UIRenderer.setActionButtons(true);
      UIRenderer.addLog('🎬 ¡Has revivido con energía renovada! Continúa la batalla.', 'action-player');
      analytics.trackEvent('ad_revive', { playerName: state.playerName, difficulty: state.difficulty });
      return;
    }
  }

  // Handle roguelike mode
  if (roguelikeMode && currentRun) {
    if (winner === 'warrior') {
      currentRun.addWin(state.score);
      analytics.trackEvent('run_win', {
        playerName: currentRun.playerName,
        wins: currentRun.wins,
        score: state.score,
        perks: currentRun.perks.length,
      });
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

  // Reward hook for classic mode: watch ad to double score after victory.
  if (!roguelikeMode && winner === 'warrior') {
    const doubledScore = await offerDoubleRewardWithAd(adsManager, state.score);
    if (doubledScore !== state.score) {
      state.score = doubledScore;
      UIRenderer.addLog('🎬 Recompensa doblada tras ver el anuncio!', 'action-player');
      analytics.trackEvent('ad_double_reward', {
        playerName: state.playerName,
        difficulty: state.difficulty,
        score: state.score,
      });
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
  adsManager.hideBannerAd();
  UIRenderer.renderEndScreen(state, winner);
  UIRenderer.renderLeaderboard(stats);
  UIRenderer.updateStatsUI(stats);

  UIRenderer.showScreen('end-screen');

  // ROGUELIKE: Show reward screen if won
  if (roguelikeMode && winner === 'warrior' && currentRun && currentRun.active) {
    await sleep(1500); // Brief pause for celebration
    
    // Show reward screen directly and hide others
    UIRenderer.showScreen('reward-screen');

    // Show reward selection
    const selectedPerkId = await showRewardScreen(currentRun, stats);
    console.log(`[ROGUELIKE] Perk seleccionado: ${selectedPerkId}`);
    if (selectedPerkId) {
      const perk = currentRun.getStats().perks.find(p => p.id === selectedPerkId);
      if (perk) {
        UIRenderer.showPerkNotification(perk.name);
      }
      analytics.trackEvent('perk_selected', {
        playerName: currentRun.playerName,
        perkId: selectedPerkId,
        perksCount: currentRun.perks.length,
        runWins: currentRun.wins,
      });
    }

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
    hideRewardScreen();
    startGame();
    return;
  }

  // Classic mode: reset to intro screen
  const endLog = $('end-log');
  if (endLog) endLog.innerHTML = '';

  const battleLog = $('battle-log');
  if (battleLog) battleLog.innerHTML = '';

  state.resetBattle();
  currentRun = null;
  const savedConfig = loadPlayerConfig();
  if ($('player-name')) $('player-name').value = savedConfig.playerName || '';
  selectClass(state.playerClass);
  selectDifficulty(state.difficulty);
  renderSelectionOptions();
  renderSkinOptions();
  selectWeapon(state.playerWeapon);
  selectBackground(state.battleBackground);
  selectSkin(state.playerSkin);
  updateRoguelikeButton();
  updateDailyBonusButton();
  adsManager.hideBannerAd();
  UIRenderer.showScreen('intro-screen');
}

// ─── ROGUELIKE MODE CONTROLS ───
export function setRoguelikeMode(enabled) {
  roguelikeMode = enabled;
  console.log(`[GAME] Roguelike Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  if (!enabled) {
    currentRun = null;
  }
  updateRoguelikeButton();
  savePlayerConfig();
}

export function getRoguelikeMode() {
  return roguelikeMode;
}

export function getCurrentRun() {
  return currentRun;
}

async function offerDailyBonusIfAvailable() {
  const lastClaim = localStorage.getItem('DAILY_AD_CLAIM') || '0';
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (now - parseInt(lastClaim, 10) < dayMs) {
    updateDailyBonusButton();
    return;
  }

  const result = await claimDailyBonusWithAd(adsManager);
  if (result.claimed) {
    alert(`Bonus reclamado: ${result.bonus.gold} oro + ${result.bonus.xp} XP (simulado)`);
    analytics.trackEvent('ad_daily_bonus', {
      playerName: state.playerName,
      bonusGold: result.bonus.gold,
      bonusXp: result.bonus.xp,
    });
  } else {
    alert(result.message || 'No se reclamó el bonus diario.');
  }
  updateDailyBonusButton();
}

// ─── INITIALIZATION ───
export function initGame() {
  if (gameInitialized) return;
  gameInitialized = true;

  // Initialize reward screen
  initRewardScreen();

  // Load run leaderboard
  runLeaderboard.load('roguelike_runs_v3');

  const savedConfig = loadPlayerConfig();
  const nameInput = $('player-name');
  if (nameInput) {
    nameInput.value = savedConfig.playerName || '';
  }

  selectClass(state.playerClass);
  selectDifficulty(state.difficulty);
  renderSelectionOptions();
  renderSkinOptions();
  selectWeapon(state.playerWeapon);
  selectBackground(state.battleBackground);
  selectSkin(state.playerSkin);
  updateRoguelikeButton();
  updateDailyBonusButton();

  // Bind selection buttons
  document.querySelectorAll('.class-btn').forEach(btn => {
    btn.addEventListener('click', () => selectClass(btn.dataset.class));
  });
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => selectDifficulty(btn.dataset.diff));
  });
  
  // Bind skin dropdown
  const skinSelect = $('skin-options');
  if (skinSelect) {
    skinSelect.addEventListener('change', (e) => selectSkin(e.target.value));
  }
  
  // Bind background dropdown
  const bgSelect = $('background-options');
  if (bgSelect) {
    bgSelect.addEventListener('change', (e) => selectBackground(e.target.value));
  }

  analytics.trackEvent('app_init', { loaded: true });

  if (nameInput) {
    nameInput.addEventListener('input', () => savePlayerConfig());
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
  bindMenuControls({
    getById: $,
    getRoguelikeMode: () => roguelikeMode,
    setRoguelikeMode,
    claimDailyBonus: offerDailyBonusIfAvailable,
    analytics,
    refreshDailyBonus: updateDailyBonusButton,
  });

  console.log('[GAME] Modulos inicializados');
}

export { state, stats, adsManager, analytics };

// ─── DOM READY ───
document.addEventListener('DOMContentLoaded', initGame);

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalhost) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
      console.log('[SW] Disabled on localhost for development');
      return;
    }

    navigator.serviceWorker.register('sw.js').then(registration => {
      console.log('[SW] Registered:', registration.scope);
    }).catch(error => {
      console.log('[SW] Registration failed:', error);
    });
  });
}

// ─── BATTLE CLEANUP (Memory optimization) ───
function cleanupBattle() {
  // Reset only transient battle state. Do not clear config or active runs here.
  state.resetBattle();

  // Force garbage collection hint (not guaranteed)
  if (window.gc) window.gc();
}

export { cleanupBattle };
