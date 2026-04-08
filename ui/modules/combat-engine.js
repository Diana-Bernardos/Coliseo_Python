/**
 * COMBAT ENGINE MODULE
 * Encapsula toda la lógica de combate y daño
 */

import { CLASS_STATS, DIFFICULTY_MODS } from './game-state.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── COMBO SYSTEM ───
export function checkCombo(state, action) {
  const comboWindow = 3000; // 3 seconds for combo
  const now = Date.now();

  if (!state.lastActionTime || (now - state.lastActionTime) > comboWindow) {
    state.comboCount = 1;
    state.lastActionTime = now;
    return { combo: false, multiplier: 1 };
  }

  state.comboCount = Math.min(state.comboCount + 1, 5);
  state.lastActionTime = now;

  const comboMultiplier = 1 + (state.comboCount * 0.15); // Up to 1.75x damage
  return {
    combo: state.comboCount > 1,
    multiplier: comboMultiplier,
    count: state.comboCount
  };
}

// ─── ADVANCED DAMAGE CALCULATIONS ───
export function calculatePlayerDamage(action, state) {
  let base = 0;
  switch (action) {
    case 'attack': base = rand(18, 28); break;
    case 'fury': base = rand(35, 50); break;
    case 'magic': base = rand(25, 40); break;
    case 'shield': base = rand(10, 15); break;
    default: return 0;
  }

  // Check for combo
  const combo = checkCombo(state, action);
  if (combo.combo) {
    base = Math.round(base * combo.multiplier);
  }

  base += state.damageBonus || 0;
  base += state.weaponDamageBonus || 0;
  if (action === 'fury') base += state.furyBonus || 0;
  if (state.highHealthBonus && (state.playerHP / state.playerMaxHP) >= 0.7) {
    base += state.highHealthBonus;
  }
  if (state.berserk && (state.playerHP / state.playerMaxHP) <= 0.5) {
    base += 15;
  }

  if (state.carryOverDamage) {
    base += state.accumulatedDamage || 0;
    state.accumulatedDamage = 0;
  }

  const critChance = state.critChance || 0;
  const critMultiplier = state.critMultiplier || 1.8;
  if (Math.random() < critChance) {
    base = Math.round(base * critMultiplier);
  }

  return Math.max(0, base);
}

export function playerReceiveDamage(amount, state) {
  // Dodge chance: 20% for rogue, 10% for others + perk bonus
  const baseDodge = state.playerClass === 'rogue' ? 0.20 : 0.10;
  const totalDodgeChance = Math.min(0.95, baseDodge + (state.extraDodgeChance || 0));
  if (Math.random() < totalDodgeChance) {
    return { result: 'ESQUIVADO', damage: 0, message: `✦ ${state.playerName} esquivó por completo!` };
  }

  const block = (state.playerShield * (state.blockMultiplier || 1.5)) + (state.defenseBonus || 0);
  const finalDmg = Math.max(0, Math.round(amount - block));
  state.playerHP = Math.max(0, state.playerHP - finalDmg);
  state.score = Math.max(0, state.score - Math.round(finalDmg * 0.5));

  if (state.shieldReflect && finalDmg > 0) {
    const reflected = Math.round(finalDmg * state.shieldReflect);
    state.orcHP = Math.max(0, state.orcHP - reflected);
  }

  if (state.secondWind && state.playerHP <= 0 && !state.secondWindUsed) {
    state.playerHP = Math.max(1, Math.floor(state.playerMaxHP * 0.4));
    state.secondWindUsed = true;
    state.playerAlive = true;
    return {
      result: 'SECOND_WIND',
      damage: 0,
      message: `🌬️ ¡Segundo Aliento! Te levantas con ${state.playerHP} HP.`,
    };
  }

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

  let finalAmount = amount;
  let isCrit = false;
  if (Math.random() < (state.critChance || 0)) {
    finalAmount = Math.round(amount * (state.critMultiplier || 1.8));
    isCrit = true;
  }

  const finalDmg = Math.max(0, Math.round(finalAmount - state.orcShield));
  state.orcHP = Math.max(0, state.orcHP - finalDmg);

  if (state.lifestealPercent && finalDmg > 0) {
    const life = Math.round(finalDmg * state.lifestealPercent);
    state.playerHP = Math.min(state.playerMaxHP, state.playerHP + life);
  }

  if (state.carryOverDamage && state.orcHP > 0) {
    state.accumulatedDamage = Math.round((state.accumulatedDamage || 0) + finalDmg * 0.25);
  }

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
  let healAmount = isPlayerCaster && state.playerClass === 'mage'
    ? rand(20, 35)
    : rand(10, 20);

  if (isPlayerCaster) {
    healAmount = Math.round(healAmount * (1 + (state.healBonus || 0)));
    state.playerHP = Math.min(state.playerMaxHP, state.playerHP + healAmount);
    state.score += Math.round(healAmount * 0.3);
    return {
      target: 'player',
      amount: healAmount,
      message: `✨ ${state.playerName} se cura ${healAmount} vida! (${state.playerHP})`,
    };
  }

  healAmount = Math.round(healAmount * 0.8);
  state.orcHP = Math.min(state.orcMaxHP, state.orcHP + healAmount);
  return {
    target: 'orc',
    amount: healAmount,
    message: `🟢 Thrall regenera ${healAmount} vida! (${state.orcHP})`,
  };
}

// ─── ORC AI ───
export function orcChooseAction(state) {
  const mods = DIFFICULTY_MODS[state.difficulty];
  const smart = mods.smartWeight;
  const orcHPpct = state.orcHP / state.orcMaxHP;
  const playerHPpct = state.playerHP / state.playerMaxHP;

  // Initialize behavior patterns if not exists
  if (!state.orcBehavior) {
    state.orcBehavior = {
      lastActions: [],
      aggressionLevel: 0.5,
      healingCooldown: 0,
      furyBuildup: 0
    };
  }

  const behavior = state.orcBehavior;

  // Update healing cooldown
  if (behavior.healingCooldown > 0) behavior.healingCooldown--;

  // Track recent actions for pattern recognition
  if (behavior.lastActions.length > 3) {
    behavior.lastActions.shift();
  }

  // Adaptive aggression based on HP and turn
  if (orcHPpct < 0.3) {
    behavior.aggressionLevel = Math.max(0.8, behavior.aggressionLevel + 0.1);
  } else if (orcHPpct > 0.7) {
    behavior.aggressionLevel = Math.min(0.3, behavior.aggressionLevel - 0.05);
  }

  // Fury buildup logic
  if (state.orcFury >= 4) {
    behavior.furyBuildup++;
  } else {
    behavior.furyBuildup = Math.max(0, behavior.furyBuildup - 1);
  }

  let actionWeights = {
    attack: 0.4,
    fury: 0.2,
    magic: 0.2,
    roar: 0.2
  };

  // Smart AI adjustments
  if (Math.random() < smart) {
    // Emergency fury buildup when low HP
    if (orcHPpct < 0.25) {
      actionWeights.roar = 0.8;
      actionWeights.attack = 0.1;
      actionWeights.fury = 0.05;
      actionWeights.magic = 0.05;
    }
    // Build up fury when advantageous
    else if (state.orcFury < 4 && playerHPpct > 0.6 && behavior.furyBuildup < 3) {
      actionWeights.attack = 0.6;
      actionWeights.fury = 0.1;
      actionWeights.roar = 0.2;
      actionWeights.magic = 0.1;
    }
    // Use fury when ready and player is weak
    else if (state.orcFury >= 4 && (playerHPpct < 0.4 || behavior.furyBuildup >= 3)) {
      actionWeights.fury = 0.7;
      actionWeights.attack = 0.2;
      actionWeights.magic = 0.05;
      actionWeights.roar = 0.05;
    }
    // Intimidate early game
    else if (state.turn <= 4) {
      actionWeights.roar = 0.4;
      actionWeights.attack = 0.4;
      actionWeights.fury = 0.1;
      actionWeights.magic = 0.1;
    }
    // Aggressive when player is low
    else if (playerHPpct < 0.3) {
      actionWeights.fury = 0.5;
      actionWeights.attack = 0.4;
      actionWeights.magic = 0.05;
      actionWeights.roar = 0.05;
    }
    // Balanced play
    else {
      actionWeights.attack = 0.5;
      actionWeights.fury = 0.2;
      actionWeights.magic = 0.15;
      actionWeights.roar = 0.15;
    }
  }

  // Apply aggression modifier
  actionWeights.fury *= (1 + behavior.aggressionLevel);
  actionWeights.attack *= (1 + behavior.aggressionLevel * 0.5);

  // Normalize weights
  const totalWeight = Object.values(actionWeights).reduce((a, b) => a + b, 0);
  for (let action in actionWeights) {
    actionWeights[action] /= totalWeight;
  }

  // Select action based on weights
  let random = Math.random();
  let cumulative = 0;

  for (let action in actionWeights) {
    cumulative += actionWeights[action];
    if (random <= cumulative) {
      behavior.lastActions.push(action);
      return action;
    }
  }

  return 'attack'; // Fallback
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

export function orcMagic(state) {
  const mods = DIFFICULTY_MODS[state.difficulty];
  const dmgMagic = Math.round((rand(20, 35) + state.orcFury) * mods.orcDmgMult);
  state.orcFury += 1;
  return dmgMagic;
}

export function orcRoar(state) {
  state.orcFury += 2;
  return { fury: state.orcFury, message: `🟢 ¡Rugido Aterrador! Thrall se enfurece. (+2 Furia → ${state.orcFury})` };
}
