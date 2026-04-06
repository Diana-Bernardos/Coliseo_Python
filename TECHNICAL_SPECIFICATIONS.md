# 🔧 ESPECIFICACIONES TÉCNICAS — SISTEMA ROGUELIKE

**Documento Técnico**: Arquitectura, APIs, Perks & Hookpoints  
**Target Developers**: Frontend (JavaScript/CSS)  
**Versión**: 3.0 MVP  

---

## ÍNDICE

1. [Perks Pool (30+)](#perks-pool)
2. [State Management](#state-management)
3. [API Modules](#api-modules)
4. [Hookpoints de Monetización](#hookpoints-de-monetización)
5. [Ejemplos de Código](#ejemplos-de-código)

---

## 💎 PERKS POOL

### Tier 1: Estadísticas Básicas (Comunes)

```javascript
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
      state.playerHP += 10;
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
      state.damageBase = (state.damageBase || 23) + 2;
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
      state.defenseBase = (state.defenseBase || 0) + 1;
    },
  },

  SHIELD_PLUS_2: {
    id: 'SHIELD_PLUS_2',
    name: '+2 Escudo Inicial',
    description: 'Comienzas combate con +2 escudo.',
    icon: '🛡️⬆️',
    rarity: 'common',
    stackable: true,
    apply: (state) => {
      state.playerShield += 2;
    },
  },
};
```

### Tier 2: Críticos & Evasión (Sin Comunes)

```javascript
const PERKS_UNCOMMON = {
  CRIT_CHANCE_15: {
    id: 'CRIT_CHANCE_15',
    name: '+15% Crítico',
    description: 'Ataques tienen 15% chance de crítico (×1.8 daño).',
    icon: '⚡',
    rarity: 'uncommon',
    stackable: false,
    apply: (state) => {
      state.critChance = (state.critChance || 0) + 0.15;
    },
  },
  
  CRIT_MULT_1_5x: {
    id: 'CRIT_MULT_1_5x',
    name: '×1.5 Crítico Mult',
    description: 'Críticos hacen ×1.5 daño en lugar de ×1.8.',
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
      state.dodgeChance = (state.dodgeChance || 0) + 0.10;
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
};
```

### Tier 3: Sostenibilidad (Raros)

```javascript
const PERKS_RARE = {
  LIFESTEAL_25: {
    id: 'LIFESTEAL_25',
    name: 'Lifesteal 25%',
    description: 'Curas 25% del daño que infliges.',
    icon: '🩸❤️',
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
    counterTurn: 0,
    apply: (state) => {
      state.regenPerTurn = (state.regenPerTurn || 0) + 5;
    },
  },
  
  SHIELD_CARRY: {
    id: 'SHIELD_CARRY',
    name: 'Escudo Persistente',
    description: 'Tu escudo no se reduce tras turno enemigo.',
    icon: '🛡️✨',
    rarity: 'rare',
    stackable: false,
    apply: (state) => {
      state.shieldPersistent = true;
    },
  },
};
```

### Tier 4: Cooldowns & Velocidad (Épico)

```javascript
const PERKS_EPIC = {
  CD_MAGIC_1: {
    id: 'CD_MAGIC_1',
    name: '⏱️ Magia Rápida',
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
    name: '⏱️ Furia Rápida',
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
    name: '⏱️ Todos -1 CD',
    description: 'Todos los cooldowns se reducen en 1 turno.',
    icon: '⚡⏱️',
    rarity: 'epic',
    stackable: false,
    apply: (state) => {
      state.allCDReduction = (state.allCDReduction || 0) + 1;
    },
  },
  
  ACTION_SPEED_UP: {
    id: 'ACTION_SPEED_UP',
    name: '⚡ Velocidad +50%',
    description: 'Actúas primero en el combate.',
    icon: '⚡💨',
    rarity: 'epic',
    stackable: false,
    apply: (state) => {
      state.firstTurn = true;
    },
  },
};
```

### Tier 5: Especiales & Combos (Legendario)

```javascript
const PERKS_LEGENDARY = {
  FURY_CHAIN: {
    id: 'FURY_CHAIN',
    name: '🔗 Furia Encadenada',
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
    name: '🛡️ Reflejo Defensivo',
    description: 'Escudo refleja 20% daño recibido.',
    icon: '🛡️⚡',
    rarity: 'legendary',
    stackable: false,
    apply: (state) => {
      state.shieldReflect = 0.20;
    },
  },
  
  LOW_HP_BOOST: {
    id: 'LOW_HP_BOOST',
    name: '💪 Desperado',
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
    name: '➡️ Acumulador Daño',
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
    name: '🌬️ Segundo Aliento',
    description: 'Si sobrevives con < 10% HP, regenera 40%.',
    icon: '🌬️❤️',
    rarity: 'legendary',
    stackable: false,
    apply: (state) => {
      state.secondWind = true;
    },
  },
};
```

### Todo el Pool (Compilado)

```javascript
const PERKS_COMPLETE = {
  ...PERKS_COMMON,
  ...PERKS_UNCOMMON,
  ...PERKS_RARE,
  ...PERKS_EPIC,
  ...PERKS_LEGENDARY,
};

function getPerkList() {
  return Object.values(PERKS_COMPLETE);
}

function getPerksByRarity(rarity) {
  return getPerkList().filter(p => p.rarity === rarity);
}
```

---

## 🧠 STATE MANAGEMENT

### Estructura Global de STATE

```javascript
// modules/game-state.js

const GAME_STATE = {
  // =====================
  // META (Persistente)
  // =====================
  meta: {
    playerName: 'Guerrero',
    playerClass: 'warrior', // warrior | mage | rogue
    playerLevel: 1,
    totalXP: 0,
    collectedPerks: [], // ["LIFESTEAL_25", "CRIT_CHANCE_15"]
  },

  // =====================
  // CURRENT RUN
  // =====================
  run: {
    active: false,
    difficulty: 'normal', // easy | normal | hard
    combatesWon: 0,
    combatesLost: 0,
    totalDamageDealt: 0,
    totalDamageReceived: 0,
    score: 0,
  },

  // =====================
  // BATTLE STATE
  // =====================
  battle: {
    turn: 1,
    maxTurns: 15,
    
    // Player
    playerHP: 130,
    playerMaxHP: 130,
    playerShield: 12,
    playerAlive: true,
    furyCD: 0,
    magicCD: 0,
    shieldCD: 0,
    
    // Orc
    orcHP: 120,
    orcMaxHP: 120,
    orcShield: 5,
    orcAlive: true,
    orcFury: 0,
    
    // Modifiers
    playerDefenseBonus: 0,
    playerDamageBonus: 0,
    lifesteal: 0,
    
    busy: false,
  },

  // =====================
  // STATS GLOBALES
  // =====================
  stats: {
    allTimeWins: 0,
    allTimeDeaths: 0,
    allTimeStreak: 0,
    bestStreak: 0,
    totalDamageAll: 0,
    totalHealsAll: 0,
    perksCollectedAll: 0,
  },

  // =====================
  // LEADERBOARD
  // =====================
  leaderboard: [
    // { rank, name, score, difficulty, perks, timestamp }
  ],
};

// Export functions
export function getState() { return GAME_STATE; }
export function saveStateToDisk() { localStorage.setItem('coliseo_v3', JSON.stringify(GAME_STATE)); }
export function loadStateFromDisk() { /* ... */ }
export function resetBattle() { /* Reset battle sub-state */ }
export function resetRun() { /* Reset run sub-state */ }
```

---

## 🔌 API MODULES

### 1. modules/roguelike-system.js

```javascript
// API Pública
export class RoguelikeSystem {
  constructor(gameState) {
    this.state = gameState;
  }

  /**
   * Genera 3 perks aleatorios (sin duplicados recientes)
   */
  generateRewardOptions(count = 3) {
    const available = PERKS_COMPLETE;
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const perk = this.weightedRandomPerk(available, selected);
      selected.push(perk);
    }
    
    return selected;
  }

  /**
   * Aplica un perk seleccionado al state
   */
  selectPerk(perkID) {
    const perk = PERKS_COMPLETE[perkID];
    if (!perk) throw new Error(`Perk not found: ${perkID}`);
    
    this.state.meta.collectedPerks.push(perkID);
    perk.apply(this.state);
    
    this.saveState();
  }

  /**
   * Calcula el score final de una run
   */
  calculateFinalScore() {
    const { run, battle, meta } = this.state;
    const diffMult = DIFFICULTY_MULT[run.difficulty];
    
    const baseScore = 
      run.totalDamageDealt +
      (run.totalDamageReceived * -0.3) +
      (battle.playerHP * 2) +
      (run.combatesWon * 100) +
      (meta.collectedPerks.length * 50);
    
    return Math.round(baseScore * diffMult);;
  }

  /**
   * Inicia una nueva run
   */
  startNewRun(difficulty, perkOverride = null) {
    this.state.run = {
      active: true,
      difficulty,
      combatesWon: 0,
      combatesLost: 0,
      totalDamageDealt: 0,
      totalDamageReceived: 0,
      score: 0,
    };
    
    if (!perkOverride) {
      this.state.meta.collectedPerks = [];
    }
    
    this.saveState();
  }

  /**
   * Finaliza la run actual
   */
  endRun() {
    this.state.run.active = false;
    const finalScore = this.calculateFinalScore();
    
    // Actualizar leaderboard
    this.addToLeaderboard({
      name: this.state.meta.playerName,
      score: finalScore,
      difficulty: this.state.run.difficulty,
      perks: [...this.state.meta.collectedPerks],
      timestamp: Date.now(),
    });
    
    this.saveState();
    return finalScore;
  }

  addToLeaderboard(entry) {
    this.state.leaderboard.push(entry);
    this.state.leaderboard.sort((a, b) => b.score - a.score);
    
    if (this.state.leaderboard.length > 50) {
      this.state.leaderboard = this.state.leaderboard.slice(0, 50);
    }
  }

  saveState() {
    saveStateToDisk();
  }
}
```

### 2. modules/combat-engine.js

```javascript
export class CombatEngine {
  constructor(gameState, roguelike) {
    this.state = gameState;
    this.rogue = roguelike;
    this.history = [];
  }

  /**
   * Ejecuta acción del jugador
   */
  playerAction(action) {
    const { battle } = this.state;
    
    if (action === 'attack') {
      return this.playerAttack();
    } else if (action === 'fury') {
      return this.playerFury();
    } else if (action === 'magic') {
      return this.playerMagic();
    } else if (action === 'shield') {
      return this.playerShield();
    }
  }

  playerAttack() {
    let baseMin = 18, baseMax = 28;
    
    // Aplicar modificadores
    if (this.state.meta.playerClass === 'rogue') {
      // Check crítico
      if (Math.random() < 0.20) {
        return this.applyCritical(baseMin, baseMax);
      }
    }
    
    const damage = this.randomInt(baseMin, baseMax) + this.state.battle.playerDamageBonus;
    return this.applyDamageToOrc(damage, 'attack');
  }

  playerFury() {
    if (this.state.battle.furyCD > 0) {
      return { error: 'cooldown' };
    }
    
    const damage = this.randomInt(35, 50);
    this.state.battle.furyCD = 3;
    this.state.battle.playerDefenseBonus = -2; // Penalización 1 turno
    
    return this.applyDamageToOrc(damage, 'fury');
  }

  playerMagic() {
    if (this.state.battle.magicCD > 0) {
      return { error: 'cooldown' };
    }
    
    let heal = this.randomInt(10, 20);
    const healBonus = this.state.battle.lifesteal; // Aplicar perks
    heal = Math.round(heal * (1 + healBonus));
    
    this.state.battle.playerHP = Math.min(
      this.state.battle.playerHP + heal,
      this.state.battle.playerMaxHP
    );
    
    this.state.battle.magicCD = 2;
    
    return { type: 'heal', value: heal };
  }

  playerShield() {
    if (this.state.battle.shieldCD > 0) {
      return { error: 'cooldown' };
    }
    
    const damage = this.randomInt(10, 15);
    this.state.battle.playerShield += 2;
    this.state.battle.shieldCD = 2;
    
    return this.applyDamageToOrc(damage, 'shield');
  }

  applyDamageToOrc(damage, source) {
    // TODO: Aplicar escudo del orco, crítico, etc.
    const actualDamage = damage - (this.state.battle.orcShield || 0);
    this.state.battle.orcHP = Math.max(0, this.state.battle.orcHP - actualDamage);
    this.state.run.totalDamageDealt += actualDamage;
    
    // Lifesteal
    if (source === 'attack' && this.state.battle.lifesteal > 0) {
      const lifeGain = Math.round(damage * this.state.battle.lifesteal);
      this.state.battle.playerHP = Math.min(
        this.state.battle.playerHP + lifeGain,
        this.state.battle.playerMaxHP
      );
    }
    
    return { type: 'damage', value: actualDamage, source };
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  applyCritical(baseMin, baseMax) {
    const baseDmg = this.randomInt(baseMin, baseMax);
    const critDmg = Math.round(baseDmg * 1.8);
    return this.applyDamageToOrc(critDmg, 'crit');
  }

  checkWinCondition() {
    const { orcAlive, playerAlive } = this.state.battle;
    const turn = this.state.battle.turn;
    
    if (!this.state.battle.orcAlive) return 'player';
    if (!this.state.battle.playerAlive) return 'orc';
    if (turn > 15) return 'draw';
    
    return null;
  }
}
```

---

## 📱 HOOKPOINTS DE MONETIZACIÓN

### Ubicaciones de Ads en Flujo

```javascript
// ==========================================
// HOOK 1: Reviva después de derrota
// ==========================================
function handlePlayerDefeat() {
  const container = document.getElementById('end-screen');
  
  // Ofrecer reviva
  const reviveBtn = document.createElement('button');
  reviveBtn.textContent = '🎬 REVIVIR + VER AD';
  reviveBtn.onclick = () => {
    ADS_MANAGER.showRewardAd('revive', () => {
      // Callback: Revivir al jugador
      STATE.battle.playerHP = Math.ceil(STATE.battle.playerMaxHP * 0.3);
      STATE.battle.playerAlive = true;
      STATE.battle.busy = false;
      // Reanudar combate
      continueGame();
    });
  };
  
  container.appendChild(reviveBtn);
}

// ==========================================
// HOOK 2: Duplicar recompensa (perks)
// ==========================================
function showRewardScreen(reward) {
  const container = document.getElementById('reward-screen');
  
  // Mostrar: "¿Ver AD para x2 opciones?"
  const doubleBtn = document.createElement('button');
  doubleBtn.textContent = '🎬 x2 OPCIONES + AD';
  doubleBtn.onclick = () => {
    ADS_MANAGER.showRewardAd('double-reward', () => {
      // Generar 6 opciones en lugar de 3
      const options = roguelikeSystem.generateRewardOptions(6);
      renderRewardOptions(options, count: 6);
    });
  };
  
  // Mostración normal de 3 opciones
  const normalBtn = document.createElement('button');
  normalBtn.textContent = '✓ ACEPTAR OPCIÓN';
  normalBtn.onclick = () => {
    const options = roguelikeSystem.generateRewardOptions(3);
    renderRewardOptions(options, count: 3);
  };
  
  container.appendChild(doubleBtn);
  container.appendChild(normalBtn);
}

// ==========================================
// HOOK 3: Bonus diario (solo localStorage)
// ==========================================
function checkDailyBonus() {
  const lastDaily = localStorage.getItem('lastDaily') | 0;
  const now = Date.now();
  
  if (now - lastDaily > 86400000) { // 24h
    const bonusBtn = document.createElement('button');
    bonusBtn.textContent = '🎬 BONUS DIARIO +200 XP';
    bonusBtn.onclick = () => {
      ADS_MANAGER.showRewardAd('daily-bonus', () => {
        STATE.meta.totalXP += 200;
        localStorage.setItem('lastDaily', now);
      });
    };
  }
}
```

### Clase AdsManager

```javascript
// modules/ads-manager.js

export class AdsManager {
  constructor() {
    this.adMobReady = false;
    this.initAdMob();
  }

  initAdMob() {
    // En producción:
    // if (typeof admob !== 'undefined') {
    //   admob.initialize();
    //   this.adMobReady = true;
    // }
  }

  showRewardAd(reason, callback) {
    const reasons = ['revive', 'double-reward', 'daily-bonus'];
    if (!reasons.includes(reason)) {
      console.error('Invalid ad reason:', reason);
      return;
    }

    // Dev mode: simular ad
    if (!this.adMobReady) {
      console.warn('Ad skipped (dev mode)');
      setTimeout(callback, 1000);
      return;
    }

    // Producción: mostrar ad real
    // admob.showRewardVideo(reason, callback);
  }

  isSupported() {
    return this.adMobReady;
  }
}

// Global instance
export const ADS_MANAGER = new AdsManager();
```

---

## 📝 EJEMPLOS DE CÓDIGO

### Ejemplo: Integrar Perk al Ataque

```javascript
// Al ejecutar playerAttack(), aplicar modificadores:

function playerAttackWithPerks() {
  let baseDamage = this.randomInt(18, 28);
  
  // Aplicar perk: +2 Daño
  if (this.state.meta.collectedPerks.includes('DMG_PLUS_2')) {
    baseDamage += 2;
  }
  
  // Aplicar perk: Crítico 15%
  if (this.state.meta.collectedPerks.includes('CRIT_CHANCE_15')) {
    if (Math.random() < 0.15) {
      baseDamage = Math.round(baseDamage * 1.8); // Crítico
    }
  }
  
  // Aplicar perk: Desperado (daño +50% si HPbajo<30%)
  if (this.state.meta.collectedPerks.includes('LOW_HP_BOOST')) {
    const hpPercent = this.state.battle.playerHP / this.state.battle.playerMaxHP;
    if (hpPercent < 0.30) {
      baseDamage = Math.round(baseDamage * 1.5);
    }
  }
  
  return this.applyDamageToOrc(baseDamage, 'attack');
}
```

### Ejemplo: Implementar Lifesteal

```javascript
function applyLifesteal(damage) {
  const lifestealPercent = this.state.battle.lifesteal || 0;
  
  if (lifestealPercent > 0) {
    const healAmount = Math.round(damage * lifestealPercent);
    const newHP = Math.min(
      this.state.battle.playerHP + healAmount,
      this.state.battle.playerMaxHP
    );
    
    this.state.battle.playerHP = newHP;
    
    return {
      type: 'lifesteal',
      damageDealt: damage,
      healed: healAmount,
    };
  }
}
```

---

## 🏗️ MIGRACIÓN DEL CÓDIGO ACTUAL

Para adaptar el código v2.0 actual a la arquitecura v3.0:

### Paso 1: Crear módulos

```
ui/
├── script.js (legacy, deprecado)
├── modules/
│   ├── game-state.js     (NUEVO)
│   ├── combat-engine.js  (NUEVO)
│   ├── roguelike-system.js (NUEVO)
│   ├── ai-engine.js      (refactor de script.js)
│   ├── ui-renderer.js    (refactor de script.js)
│   ├── ads-manager.js    (NUEVO)
│   └── leaderboard.js    (refactor)
└── style.css (mejorado)
```

### Paso 2: Refactor incrementalCodigo viejo (v2.0):
```javascript
// script.js (monolítico)
const STATE = { playerHP: 130, ... };
function playerAction(action) { ... }
function endGame(winner) { ... }
```

Código nuevo (v3.0):
```javascript
// main.js
import { GameState } from './modules/game-state.js';
import { CombatEngine } from './modules/combat-engine.js';
import { RoguelikeSystem } from './modules/roguelike-system.js';

const gameState = GameState.load();
const roguelike = new RoguelikeSystem(gameState);
const combat = new CombatEngine(gameState, roguelike);

// Usar:
combat.playerAction('attack');
```

---

**Documento Técnico v1.0** | 2026-04-06

