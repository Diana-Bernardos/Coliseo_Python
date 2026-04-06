/**
 * COMBAT ENGINE MODULE
 * Encapsula toda la lógica de combate y daño
 */

import { CLASS_STATS, DIFFICULTY_MODS } from './game-state.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── DAMAGE CALCULATIONS ───
export function calculatePlayerDamage(action, state) {
  switch (action) {
    case 'attack': return rand(18, 28);
    case 'fury': return rand(35, 50);
    case 'shield': return rand(10, 15);
    default: return 0;
  }
}

export function playerReceiveDamage(amount, state) {
  // Dodge chance: 20% for rogue, 10% for others
  const dodgeChance = state.playerClass === 'rogue' ? 5 : 10;
  if (rand(1, dodgeChance) === 1) {
    return { result: 'ESQUIVADO', damage: 0, message: `✦ ${state.playerName} esquivó por completo!` };
  }

  const block = state.playerShield * 1.5;
  const finalDmg = Math.max(0, Math.round(amount - block));
  state.playerHP = Math.max(0, state.playerHP - finalDmg);
  state.score = Math.max(0, state.score - Math.round(finalDmg * 0.5));

  if (state.playerHP <= 0) {
    state.playerAlive = false;
  }

  return {
    result: 'HIT',
    damage: finalDmg,
    message: `→ ${state.playerName} bloqueó. Recibió ${finalDmg} daño. Vida: ${state.playerHP}`,
  };
}

export function orcReceiveDamage(amount, state) {
  if (amount < 5) {
    return { result: 'IMMUNITY', damage: 0, message: `Thrall ni lo sintió...` };
  }

  if (rand(1, 10) === 1) {
    return { result: 'ESQUIVADO', damage: 0, message: `✦ Thrall esquivó el ataque!` };
  }

  // Rogue gets 20% crit chance
  let finalAmount = amount;
  let isCrit = false;
  if (state.playerClass === 'rogue' && rand(1, 5) === 1) {
    finalAmount = Math.round(amount * 1.8);
    isCrit = true;
  }

  const finalDmg = Math.max(0, Math.round(finalAmount - state.orcShield));
  state.orcHP = Math.max(0, state.orcHP - finalDmg);

  state.score += Math.round(finalDmg * (isCrit ? 2 : 1));

  if (state.orcHP <= 0) {
    state.orcAlive = false;
  }

  return {
    result: 'HIT',
    damage: finalDmg,
    isCrit,
    message: `→ Thrall recibió ${finalDmg}${isCrit ? ' 💥 CRÍTICO' : ''} daño. Vida: ${state.orcHP}`,
  };
}

// ─── HEALING ───
export function healMagic(caster, state) {
  const isPlayerCaster = caster === 'player';
  const healAmount = isPlayerCaster && state.playerClass === 'mage'
    ? rand(20, 35)
    : rand(10, 20);

  if (isPlayerCaster) {
    state.playerHP = Math.min(state.playerMaxHP, state.playerHP + healAmount);
    state.score += Math.round(healAmount * 0.3);
    return {
      target: 'player',
      amount: healAmount,
      message: `✨ ${state.playerName} se cura ${healAmount} vida! (${state.playerHP})`,
    };
  } else {
    state.orcHP = Math.min(state.orcMaxHP, state.orcHP + healAmount);
    return {
      target: 'orc',
      amount: healAmount,
      message: `🟢 Thrall regenera ${healAmount} vida! (${state.orcHP})`,
    };
  }
}

// ─── ORC AI ───
export function orcChooseAction(state) {
  const mods = DIFFICULTY_MODS[state.difficulty];
  const smart = mods.smartWeight;
  const orcHPpct = state.orcHP / state.orcMaxHP;
  const playerHPpct = state.playerHP / state.playerMaxHP;

  if (Math.random() < smart) {
    // Low HP -> prefer heal or roar
    if (orcHPpct < 0.25) return Math.random() < 0.6 ? 'magic' : 'roar';
    // High fury -> unleash
    if (state.orcFury >= 4) return Math.random() < 0.7 ? 'fury' : 'attack';
    // Player low HP -> aggressive
    if (playerHPpct < 0.3) return Math.random() < 0.8 ? 'fury' : 'attack';
    // Early game -> build fury
    if (state.turn <= 4) return Math.random() < 0.5 ? 'roar' : 'attack';
  }

  return ['attack', 'fury', 'magic', 'roar'][rand(0, 3)];
}

export function orcAttack(state) {
  const mods = DIFFICULTY_MODS[state.difficulty];
  const dmgBase = 15;
  const dmgTotal = Math.round((dmgBase + state.orcFury * 2) * mods.orcDmgMult);
  state.orcFury += 1;
  return dmgTotal;
}

export function orcFury(state) {
  const mods = DIFFICULTY_MODS[state.difficulty];
  const dmgFuria = Math.round((rand(25, 35) + state.orcFury) * mods.orcDmgMult);
  state.orcFury += 1;
  return dmgFuria;
}

export function orcRoar(state) {
  state.orcFury += 2;
  return { fury: state.orcFury, message: `🟢 ¡Rugido Aterrador! Thrall se enfurece. (+2 Furia → ${state.orcFury})` };
}
