/**
 * EXAMPLE USAGE - Ejemplos de cómo usar los módulos
 * Los módulos pueden importarse directamente en otros archivos o usarse vía window.game
 */

// ════════════════════════════════════════════════════════════════
// OPCIÓN 1: Acceso vía window.game (desde DevTools o script externo)
// ════════════════════════════════════════════════════════════════

// Iniciar juego
window.game.startGame()

// Ejecutar acción
window.game.playerAction('attack')
window.game.playerAction('fury')
window.game.playerAction('magic')
window.game.playerAction('shield')

// Ver estado actual
console.log(window.game.state)
// GameState {
//   playerName: 'Uthred',
//   playerClass: 'warrior',
//   playerHP: 100,
//   orcHP: 120,
//   turn: 2,
//   ...
// }

// Ver estadísticas persistentes
console.log(window.game.stats)
// PersistentStats {
//   wins: 3,
//   losses: 1,
//   streak: 3,
//   scores: [...]
// }

// Ver gestor de anuncios
console.log(window.game.adsManager)
// AdsManager { isProduction: false, adUnitIds: {...} }

// ════════════════════════════════════════════════════════════════
// OPCIÓN 2: Importar módulos (para archivos futuros)
// ════════════════════════════════════════════════════════════════

// En un archivo utils.js o analytics.js:
import { GameState, PersistentStats, CLASS_STATS } from './modules/game-state.js';
import * as CombatEngine from './modules/combat-engine.js';
import * as UIRenderer from './modules/ui-renderer.js';
import { PERKS, Run } from './modules/roguelike-system.js';
import { AdsManager } from './modules/ads-manager.js';

// Ejemplo: Crear una utilidad de análisis
export function analyzeGameState(state) {
  const winChance = calculateWinProbability(state);
  console.log(`Win chance: ${(winChance * 100).toFixed(1)}%`);
}

function calculateWinProbability(state) {
  // Lógica hipotética
  const playerPower = state.playerHP + (state.playerShield * 0.5);
  const orcPower = state.orcHP + (state.orcFury * 0.3);
  return playerPower / (playerPower + orcPower);
}

// ════════════════════════════════════════════════════════════════
// EJEMPLO 1: Acceder a estadísticas
// ════════════════════════════════════════════════════════════════

// En consola del navegador:
window.game.stats.recordWin('Diego', 500, 'hard');
console.log(window.game.stats.scores);
// [{name: 'Diego', score: 500, diff: 'hard'}, ...]

// ════════════════════════════════════════════════════════════════
// EJEMPLO 2: Testear combate sin UI
// ════════════════════════════════════════════════════════════════

import * as CombatEngine from './modules/combat-engine.js';
import { GameState } from './modules/game-state.js';

const testState = new GameState();
testState.applyPlayerClass('warrior');
testState.applyDifficulty('normal');

// Simular daño
const result = CombatEngine.orcReceiveDamage(25, testState);
console.log(result);
// { result: 'HIT', damage: 20, message: '→ Thrall recibió 20 daño...' }

// ════════════════════════════════════════════════════════════════
// EJEMPLO 3: Crear un juego custom (futuro)
// ════════════════════════════════════════════════════════════════

// Ej: Sistema de torneos con múltiples batallas

import { GameState, PersistentStats } from './modules/game-state.js';
import * as CombatEngine from './modules/combat-engine.js';

class Tournament {
  constructor(playerName, rounds = 5) {
    this.playerName = playerName;
    this.rounds = rounds;
    this.wins = 0;
    this.stats = new PersistentStats();
  }

  async playRound(difficulty) {
    const state = new GameState();
    state.playerName = this.playerName;
    state.applyPlayerClass('warrior');
    state.applyDifficulty(difficulty);

    // Simular batalla...
    while (state.playerAlive && state.orcAlive && state.turn < 15) {
      const damage = CombatEngine.calculatePlayerDamage('attack', state);
      CombatEngine.orcReceiveDamage(damage, state);
      
      if (state.orcAlive) {
        const orcDmg = CombatEngine.orcAttack(state);
        CombatEngine.playerReceiveDamage(orcDmg, state);
      }
      
      state.tickCooldowns();
      state.incrementTurn();
    }

    if (state.playerAlive) {
      this.wins++;
      this.stats.recordWin(this.playerName, state.score, difficulty);
    }
  }

  async run() {
    for (let i = 0; i < this.rounds; i++) {
      const difficulty = i < 2 ? 'easy' : i < 4 ? 'normal' : 'hard';
      await this.playRound(difficulty);
    }
    console.log(`Tournament complete: ${this.wins}/${this.rounds} wins`);
  }
}

// Usar:
const tournament = new Tournament('Champion', 5);
tournament.run().then(() => {
  console.log(tournament.stats.scores);
});

// ════════════════════════════════════════════════════════════════
// EJEMPLO 4: Debug de estado en tiempo real
// ════════════════════════════════════════════════════════════════

// En consola, trazar cambios de HP:
setInterval(() => {
  if (window.game && window.game.state) {
    console.log(
      `[${window.game.state.turn}] Player: ${window.game.state.playerHP}/${window.game.state.playerMaxHP} | ` +
      `Orc: ${window.game.state.orcHP}/${window.game.state.orcMaxHP}`
    );
  }
}, 500);

// ════════════════════════════════════════════════════════════════
// EJEMPLO 5: Extensión de AdsManager
// ════════════════════════════════════════════════════════════════

// Para futura integración con Firebase Analytics:

import { AdsManager } from './modules/ads-manager.js';

class AnalyticsAdsManager extends AdsManager {
  async showRewardedAd(rewardType = 'revive') {
    // Loguear evento a Firebase
    if (window.firebase) {
      firebase.analytics().logEvent('rewarded_ad_shown', {
        reward_type: rewardType,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await super.showRewardedAd(rewardType);

    if (result) {
      firebase.analytics().logEvent('rewarded_ad_completed', {
        reward_type: rewardType,
      });
    }

    return result;
  }
}

// Usar:
const analyticsAds = new AnalyticsAdsManager(false);
await analyticsAds.showRewardedAd('revive');

// ════════════════════════════════════════════════════════════════
// EJEMPLO 6: Simular roguelike run (Sprint 2)
// ════════════════════════════════════════════════════════════════

// Este ejemplo será más completo en Sprint 2 cuando se expanda roguelike-system.js

import { Run, PERKS } from './modules/roguelike-system.js';

const run = new Run('Hero', 'warrior', 'normal');

// Después de cada victoria:
run.addWin();

// Opcional: agregar perk después de victoria
if (PERKS.LIFESTEAL_10) {
  run.selectPerk('LIFESTEAL_10');
}

console.log(run);
// Run {
//   id: 1712389123456,
//   playerName: 'Hero',
//   wins: 1,
//   perks: ['LIFESTEAL_10'],
//   active: true
// }

// ════════════════════════════════════════════════════════════════
// EJEMPLO 7: Conectar a localStorage (Persistencia)
// ════════════════════════════════════════════════════════════════

// Las estadísticas se guardan automáticamente:
window.game.stats.recordWin('Diego', 1000, 'hard');
window.game.stats.save();

// Verificar en localStorage:
console.log(localStorage.getItem('coliseo_v3'));
// {"wins":4,"losses":1,"streak":2,"bestStreak":3,"scores":[...]}

// Cargar después del refresh:
const stats = new PersistentStats();
console.log(stats.wins); // Se mantiene

// ════════════════════════════════════════════════════════════════
// EJEMPLO 8: Testing unitario (futuro)
// ════════════════════════════════════════════════════════════════

// Con Jest o Vitest (Sprint 5):

import { GameState } from './modules/game-state.js';
import * as CombatEngine from './modules/combat-engine.js';

describe('CombatEngine', () => {
  it('should return HIT when orc receives damage', () => {
    const state = new GameState();
    state.applyPlayerClass('warrior');
    const result = CombatEngine.orcReceiveDamage(30, state);
    expect(result.result).toBe('HIT');
    expect(result.damage).toBeGreaterThan(0);
  });

  it('should update score on orc damage', () => {
    const state = new GameState();
    const scoreBefore = state.score;
    CombatEngine.orcReceiveDamage(20, state);
    expect(state.score).toBeGreaterThan(scoreBefore);
  });

  it('should handle crit for rogue', () => {
    const state = new GameState();
    state.playerClass = 'rogue';
    // Múltiples intentos para encontrar un crit
    for (let i = 0; i < 100; i++) {
      const result = CombatEngine.orcReceiveDamage(25, state);
      if (result.isCrit) {
        expect(result.message).toContain('CRÍTICO');
        break;
      }
    }
  });
});

// ════════════════════════════════════════════════════════════════
// EJEMPLO 9: Hook personalizado para eventos
// ════════════════════════════════════════════════════════════════

// Crear observable para cambios de estado (futuro):

class StateObserver {
  constructor(gameState) {
    this.state = gameState;
    this.listeners = {
      hpChange: [],
      turnChange: [],
      battleEnd: [],
    };
  }

  onHpChange(callback) {
    this.listeners.hpChange.push(callback);
  }

  notifyHpChange(who, newHp) {
    this.listeners.hpChange.forEach(cb => cb(who, newHp));
  }

  // ... más métodos
}

// Usar:
const observer = new StateObserver(window.game.state);
observer.onHpChange((who, hp) => {
  console.log(`${who} HP changed to ${hp}`);
});

// ════════════════════════════════════════════════════════════════
// EJEMPLO 10: Performance monitoring
// ════════════════════════════════════════════════════════════════

console.time('battle-duration');

window.game.startGame();
// ... ejecutar acciones ...

console.timeEnd('battle-duration');
// Resultado: battle-duration: 45.234ms
