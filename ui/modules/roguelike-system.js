/**
 * ROGUELIKE SYSTEM MODULE
 * Sistema de meta-progresión: runs, perks, rewards
 * Complete pour Sprint 2: 30+ perks, run system, reward selection
 */

// ═══════════════════════════════════════════════════════════════
// ─── TIER 1: COMMON PERKS ───
// ═══════════════════════════════════════════════════════════════
const PERKS_COMMON = {
  HP_PLUS_10: {
    id: 'HP_PLUS_10',
    name: '+10 HP Máximos',
    description: 'Aumenta tu vida máxima en 10.',
    icon: '❤️',
    rarity: 'common',
    stackable: true,
    apply: (state) => {
      state.playerMaxHP += 10;
      state.playerHP = Math.min(state.playerHP + 10, state.playerMaxHP);
    },
  },

  DMG_PLUS_2: {
    id: 'DMG_PLUS_2',
    name: '+2 Daño Base',
    description: 'Todos tus ataques hacen +2 daño.',
    icon: '⚔️',
    rarity: 'common',
    stackable: true,
    apply: (state) => {
      state.damageBonus = (state.damageBonus || 0) + 2;
    },
  },

  DEF_PLUS_1: {
    id: 'DEF_PLUS_1',
    name: '+1 Defensa',
    description: 'Aumenta tu defensa permanente en +1.',
    icon: '🛡️',
    rarity: 'common',
    stackable: true,
    apply: (state) => {
      state.defenseBonus = (state.defenseBonus || 0) + 1;
    },
  },

  SHIELD_PLUS_2: {
    id: 'SHIELD_PLUS_2',
    name: '+2 Escudo Inicial',
    description: 'Comienzas combate con +2 escudo.',
    icon: '⛑️',
    rarity: 'common',
    stackable: true,
    apply: (state) => {
      state.playerShield += 2;
    },
  },

  HP_REGEN_3: {
    id: 'HP_REGEN_3',
    name: 'Regeneración +3',
    description: 'Recuperas 3 HP al final de cada turno.',
    icon: '🌿',
    rarity: 'common',
    stackable: true,
    apply: (state) => {
      state.regenPerTurn = (state.regenPerTurn || 0) + 3;
    },
  },

  SHIELD_PLUS_3: {
    id: 'SHIELD_PLUS_3',
    name: '+3 Escudo/Batalla',
    description: 'Comienzas combate con +3 escudo adicional.',
    icon: '🛡️+',
    rarity: 'common',
    stackable: true,
    apply: (state) => {
      state.playerShield += 3;
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── TIER 2: UNCOMMON PERKS (Críticos & Evasión) ───
// ═══════════════════════════════════════════════════════════════
const PERKS_UNCOMMON = {
  CRIT_CHANCE_15: {
    id: 'CRIT_CHANCE_15',
    name: '+15% Crítico',
    description: 'Ataques tienen 15% chance de crítico (×1.8 daño).',
    icon: '⚡',
    rarity: 'uncommon',
    stackable: true,
    apply: (state) => {
      state.critChance = (state.critChance || 0) + 0.15;
    },
  },

  CRIT_MULT_UP: {
    id: 'CRIT_MULT_UP',
    name: '×2.0 Crítico Mult',
    description: 'Críticos hacen ×2.0 daño en lugar de ×1.8.',
    icon: '⚡🔥',
    rarity: 'uncommon',
    stackable: true,
    apply: (state) => {
      state.critMultiplier = (state.critMultiplier || 1.8) + 0.2;
    },
  },

  DODGE_CHANCE_10: {
    id: 'DODGE_CHANCE_10',
    name: '+10% Esquiva',
    description: 'Los ataques enemigos tienen 10% chance de fallar.',
    icon: '💨',
    rarity: 'uncommon',
    stackable: true,
    apply: (state) => {
      state.extraDodgeChance = (state.extraDodgeChance || 0) + 0.10;
    },
  },

  BLOCK_INCREASE: {
    id: 'BLOCK_INCREASE',
    name: 'Bloqueo +50%',
    description: 'Tu escudo bloquea 50% más daño.',
    icon: '🛡️💪',
    rarity: 'uncommon',
    stackable: false,
    apply: (state) => {
      state.blockMultiplier = (state.blockMultiplier || 1) + 0.5;
    },
  },

  ARMOR_PLATING: {
    id: 'ARMOR_PLATING',
    name: 'Placas de Armadura',
    description: 'Incrementa tu bloqueo en 25%.',
    icon: '🧱',
    rarity: 'uncommon',
    stackable: true,
    apply: (state) => {
      state.blockMultiplier = (state.blockMultiplier || 1.5) + 0.25;
    },
  },

  MANA_SURGE: {
    id: 'MANA_SURGE',
    name: 'Oleada Mágica',
    description: 'Reduce el cooldown de Magia en 1 turno.',
    icon: '🔮⚡',
    rarity: 'uncommon',
    stackable: false,
    apply: (state) => {
      state.magicCDReduction = (state.magicCDReduction || 0) + 1;
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── TIER 3: RARE PERKS (Sostenibilidad) ───
// ═══════════════════════════════════════════════════════════════
const PERKS_RARE = {
  LIFESTEAL_25: {
    id: 'LIFESTEAL_25',
    name: 'Lifesteal 25%',
    description: 'Curas 25% del daño que infliges.',
    icon: '🩸',
    rarity: 'rare',
    stackable: true,
    apply: (state) => {
      state.lifestealPercent = (state.lifestealPercent || 0) + 0.25;
    },
  },

  HEAL_BONUS_15: {
    id: 'HEAL_BONUS_15',
    name: '+15% Curación',
    description: 'Tus hechizos de curación son 15% más potentes.',
    icon: '✨❤️',
    rarity: 'rare',
    stackable: true,
    apply: (state) => {
      state.healBonus = (state.healBonus || 0) + 0.15;
    },
  },

  REGEN_5_TURN: {
    id: 'REGEN_5_TURN',
    name: 'Regeneración +5',
    description: 'Regeneras 5 HP al final de cada turno.',
    icon: '💚',
    rarity: 'rare',
    stackable: true,
    apply: (state) => {
      state.regenPerTurn = (state.regenPerTurn || 0) + 5;
    },
  },

  SHIELD_CARRY: {
    id: 'SHIELD_CARRY',
    name: 'Escudo Persistente',
    description: 'Tu escudo no se reduce tras turno enemigo.',
    icon: '✨',
    rarity: 'rare',
    stackable: false,
    apply: (state) => {
      state.shieldPersistent = true;
    },
  },

  MAGIC_SURGE: {
    id: 'MAGIC_SURGE',
    name: 'Magia Potenciada',
    description: 'Curación mágica un 20% más potente.',
    icon: '✨💠',
    rarity: 'rare',
    stackable: true,
    apply: (state) => {
      state.healBonus = (state.healBonus || 0) + 0.20;
    },
  },

  FURY_FOCUS: {
    id: 'FURY_FOCUS',
    name: 'Furia Focalizada',
    description: 'Furia inflige +8 daño adicional.',
    icon: '🔥🎯',
    rarity: 'rare',
    stackable: true,
    apply: (state) => {
      state.furyBonus = (state.furyBonus || 0) + 8;
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── TIER 4: EPIC PERKS (Cooldowns & Velocidad) ───
// ═══════════════════════════════════════════════════════════════
const PERKS_EPIC = {
  CD_MAGIC_1: {
    id: 'CD_MAGIC_1',
    name: 'Magia Rápida',
    description: 'Cooldown Magia reducido de 2 → 1 turno.',
    icon: '✨⏱️',
    rarity: 'epic',
    stackable: false,
    apply: (state) => {
      state.magicCDReduction = (state.magicCDReduction || 0) + 1;
    },
  },

  CD_FURY_1: {
    id: 'CD_FURY_1',
    name: 'Furia Rápida',
    description: 'Cooldown Furia reducido de 3 → 2 turnos.',
    icon: '🔥⏱️',
    rarity: 'epic',
    stackable: false,
    apply: (state) => {
      state.furyCDReduction = (state.furyCDReduction || 0) + 1;
    },
  },

  CD_ALL_MINUS_1: {
    id: 'CD_ALL_MINUS_1',
    name: 'Todos -1 CD',
    description: 'Todos los cooldowns se reducen en 1 turno.',
    icon: '⚡⏱️',
    rarity: 'epic',
    stackable: false,
    apply: (state) => {
      state.allCDReduction = (state.allCDReduction || 0) + 1;
    },
  },

  ACTION_SPEED: {
    id: 'ACTION_SPEED',
    name: 'Velocidad +50%',
    description: 'Actúas primero en cada combate.',
    icon: '⚡💨',
    rarity: 'epic',
    stackable: false,
    apply: (state) => {
      state.firstTurn = true;
    },
  },

  POWER_STRIKE: {
    id: 'POWER_STRIKE',
    name: 'Golpe Potente',
    description: 'Tus ataques básicos infligen +8 daño si estás en buena forma.',
    icon: '💥',
    rarity: 'epic',
    stackable: false,
    apply: (state) => {
      state.highHealthBonus = (state.highHealthBonus || 0) + 8;
    },
  },

  ARCANE_FOCUS: {
    id: 'ARCANE_FOCUS',
    name: 'Foco Arcano',
    description: 'Reduce el cooldown de Magia y Escudo en 1 turno.',
    icon: '🌀',
    rarity: 'epic',
    stackable: false,
    apply: (state) => {
      state.magicCDReduction = (state.magicCDReduction || 0) + 1;
      state.shieldCDReduction = (state.shieldCDReduction || 0) + 1;
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── TIER 5: LEGENDARY PERKS (Efectos Especiales) ───
// ═══════════════════════════════════════════════════════════════
const PERKS_LEGENDARY = {
  FURY_CHAIN: {
    id: 'FURY_CHAIN',
    name: 'Furia Encadenada',
    description: 'Si Furia hace > 50 daño, no consume CD.',
    icon: '🔥🔗',
    rarity: 'legendary',
    stackable: false,
    apply: (state) => {
      state.furyChain = true;
    },
  },

  SHIELD_REFLECT: {
    id: 'SHIELD_REFLECT',
    name: 'Reflejo Defensivo',
    description: 'Escudo refleja 20% daño recibido al enemigo.',
    icon: '🛡️⚡',
    rarity: 'legendary',
    stackable: false,
    apply: (state) => {
      state.shieldReflect = 0.20;
    },
  },

  DESPERATE_MODE: {
    id: 'DESPERATE_MODE',
    name: 'Desperado',
    description: 'Si HP < 30%, daño aumenta 50%.',
    icon: '💪🔥',
    rarity: 'legendary',
    stackable: false,
    apply: (state) => {
      state.desperateMode = true;
    },
  },

  CARRY_OVER_DMG: {
    id: 'CARRY_OVER_DMG',
    name: 'Acumulador Daño',
    description: 'Daño no utilizado se acumula (máx 2 turnos).',
    icon: '➡️💥',
    rarity: 'legendary',
    stackable: false,
    apply: (state) => {
      state.carryOverDamage = true;
      state.accumulatedDamage = 0;
    },
  },

  SECOND_WIND: {
    id: 'SECOND_WIND',
    name: 'Segundo Aliento',
    description: 'Si sobrevives con < 10% HP, regenera 40% HP.',
    icon: '🌬️❤️',
    rarity: 'legendary',
    stackable: false,
    apply: (state) => {
      state.secondWind = true;
    },
  },

  ETERNAL_REGEN: {
    id: 'ETERNAL_REGEN',
    name: 'Regeneración Eterna',
    description: 'Recuperas +8 HP al final de cada turno.',
    icon: '🌟',
    rarity: 'legendary',
    stackable: false,
    apply: (state) => {
      state.regenPerTurn = (state.regenPerTurn || 0) + 8;
    },
  },

  BERSERK: {
    id: 'BERSERK',
    name: 'Berserk',
    description: 'Cuando estás herido, tus ataques hacen +15 daño.',
    icon: '🩸',
    rarity: 'legendary',
    stackable: false,
    apply: (state) => {
      state.berserk = true;
    },
  },
};

// ─── PERKS COMPLETO ───
export const PERKS_COMPLETE = {
  ...PERKS_COMMON,
  ...PERKS_UNCOMMON,
  ...PERKS_RARE,
  ...PERKS_EPIC,
  ...PERKS_LEGENDARY,
};

export function getPerkList() {
  return Object.values(PERKS_COMPLETE);
}

export function getPerksByRarity(rarity) {
  return getPerkList().filter(p => p.rarity === rarity);
}

// ─── RUN SYSTEM ───
export class Run {
  constructor(playerName, playerClass, difficulty) {
    this.id = Date.now();
    this.playerName = playerName;
    this.playerClass = playerClass;
    this.difficulty = difficulty;
    this.startTime = Date.now();
    this.endTime = null;
    this.wins = 0;
    this.losses = 0;
    this.perks = [];
    this.active = true;
    this.totalScore = 0;
    this.battles = [];
  }

  addWin(score) {
    this.wins++;
    this.totalScore += score;
    this.battles.push({ type: 'win', score, turn: new Date() });
  }

  addLoss() {
    this.losses++;
    this.active = false;
    this.endTime = Date.now();
    this.battles.push({ type: 'loss', turn: new Date() });
  }

  selectPerk(perkId) {
    if (PERKS_COMPLETE[perkId] && !this.perks.includes(perkId)) {
      this.perks.push(perkId);
      return true;
    }
    return false;
  }

  applyPerks(state) {
    this.perks.forEach(perkId => {
      const perk = PERKS_COMPLETE[perkId];
      if (perk && typeof perk.apply === 'function') {
        perk.apply(state);
      }
    });
  }

  getStats() {
    return {
      id: this.id,
      playerName: this.playerName,
      playerClass: this.playerClass,
      difficulty: this.difficulty,
      wins: this.wins,
      losses: this.losses,
      totalScore: this.totalScore,
      perksCount: this.perks.length,
      duration: this.endTime ? this.endTime - this.startTime : Date.now() - this.startTime,
      perks: this.perks.map(pid => ({ id: pid, ...PERKS_COMPLETE[pid] })),
    };
  }
}

// ─── REWARD SELECTION ───
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function getRewardPerks(run, count = 3) {
  // Get 3 random perks weighted by rarity
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const weights = [40, 30, 20, 8, 2]; // Porcentajes

  const candidates = [];
  for (let i = 0; i < count; i++) {
    let selected = null;
    let attempts = 0;

    while (!selected && attempts < 10) {
      // Seleccionar rareza por peso
      const roll = rand(1, 100);
      let cumulative = 0;
      for (let j = 0; j < rarities.length; j++) {
        cumulative += weights[j];
        if (roll <= cumulative) {
          const perksOfRarity = getPerksByRarity(rarities[j]);
          // Filtrar perks ya seleccionados
          const available = perksOfRarity.filter(p => !run.perks.includes(p.id) && !candidates.find(c => c.id === p.id));
          if (available.length > 0) {
            selected = available[rand(0, available.length - 1)];
          }
          break;
        }
      }
      attempts++;
    }

    if (selected) {
      candidates.push(selected);
    }
  }

  // Completar si faltan perks
  while (candidates.length < count) {
    const all = getPerkList().filter(p => !run.perks.includes(p.id) && !candidates.find(c => c.id === p.id));
    if (all.length === 0) break;
    candidates.push(all[rand(0, all.length - 1)]);
  }

  return candidates;
}

// ─── DIFFICULTY SCALING ───
export function scaleDifficultyForRun(runWins) {
  // Incrementar difficulty después de X victorias
  if (runWins < 2) return 'normal';
  if (runWins < 4) return 'hard';
  return 'insane'; // Difficulty custom (futura expansion) - ahora soportado por DIFFICULTY_MODS
}

// ─── LEADERBOARD (Mejores runs) ───
export class RunLeaderboard {
  constructor(maxSize = 10) {
    this.runs = [];
    this.maxSize = maxSize;
  }

  addRun(run) {
    const stats = run.getStats();
    this.runs.push(stats);
    this.runs.sort((a, b) => b.totalScore - a.totalScore);
    if (this.runs.length > this.maxSize) {
      this.runs = this.runs.slice(0, this.maxSize);
    }
  }

  getTopRuns(limit = 5) {
    return this.runs.slice(0, limit);
  }

  save(storageKey = 'roguelike_runs') {
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.runs));
    } catch (e) {}
  }

  load(storageKey = 'roguelike_runs') {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || [];
      this.runs = saved;
    } catch (e) {}
  }
}
