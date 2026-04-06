/**
 * SCRIPT-MODULAR.JS
 * Entry point wrapper que carga todos los módulos
 * Incluir en HTML: <script type="module" src="script-modular.js"></script>
 * 
 * COMPATIBILIDAD:
 * - Reemplaza completamente al antiguo script.js
 * - Mantiene 100% compatibilidad con el HTML actual
 * - Estructura modular lista para v3.0 Roguelike
 */

import {
  startGame,
  playerAction,
  restartGame,
  initGame,
  state,
  stats,
  adsManager,
  setRoguelikeMode,
  getRoguelikeMode,
  getCurrentRun,
} from './modules/index.js';

// ─── EXPORT PARA DEBUG EN CONSOLA ───
window.game = {
  startGame,
  playerAction,
  restartGame,
  initGame,
  state,
  stats,
  adsManager,
  setRoguelikeMode,
  getRoguelikeMode,
  getCurrentRun,
};

console.log(
  '%c🎮 Coliseo RPG v3.0 Modular',
  'color: #ff6b6b; font-size: 16px; font-weight: bold'
);
console.log(
  '%cArquitectura modular lista para v3.0 Roguelike',
  'color: #4ecdc4'
);
console.log(
  '%cDocs: Ver TECHNICAL_SPECIFICATIONS.md y ROADMAP_IMPLEMENTATION.md',
  'color: #95e1d3'
);
