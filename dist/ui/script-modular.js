/**
 * SCRIPT-MODULAR.JS
 * Entry point wrapper que carga todos los modulos.
 * Incluir en HTML: <script type="module" src="script-modular.js"></script>
 */

import {
  startGame,
  playerAction,
  restartGame,
  initGame,
  state,
  stats,
  adsManager,
  analytics,
  setRoguelikeMode,
  getRoguelikeMode,
  getCurrentRun,
} from './modules/index.js';

window.game = {
  startGame,
  playerAction,
  restartGame,
  initGame,
  state,
  stats,
  adsManager,
  analytics,
  setRoguelikeMode,
  getRoguelikeMode,
  getCurrentRun,
};

window.startGame = startGame;
window.playerAction = playerAction;
window.restartGame = restartGame;
window.initGame = initGame;

console.log(
  '%cColiseo RPG v3.0 Modular',
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
