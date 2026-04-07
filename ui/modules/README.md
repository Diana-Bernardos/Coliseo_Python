# 📦 modules/ - Arquitectura Modular v3.0

## 📌 Qué es esto?

Esta carpeta contiene los 6 módulos que componen la arquitectura moderna de Coliseo RPG v3.0.

Sistema 100% compatible con v2.0, pero mejor estructurado para expansión futura (roguelike, ads, mobile).

---

## 📚 Módulos

| Módulo | Líneas | Responsabilidad | 🎯 Versión |
|--------|--------|-----------------|-----------|
| **game-state.js** | 157 | Estado centralizado | ✅ v2.0 |
| **combat-engine.js** | 142 | Lógica de combate | ✅ v2.0 |
| **ui-renderer.js** | 189 | Renderización DOM | ✅ v2.0 |
| **roguelike-system.js** | 74 | Meta-progresión | 🔮 v3.0 |
| **ads-manager.js** | 138 | Monetización ads | 🔮 v3.0 |
| **index.js** | 451 | Orquestador | ✅ v2.0 |

**Total**: ~1,150 líneas de código modular (vs. ~750 del monolito)

---

## 🚀 Cómo Activar

### En `ui/index.html`:

```html
<!-- Archivo activo: -->
<script type="module" src="script-modular.js"></script>
```

### Luego, en navigador:

```bash
cd ui
python -m http.server 8080
# http://localhost:8080
```

### En DevTools Console:

```javascript
window.game.startGame()        // Inicia juego
window.game.playerAction('attack')  // Ejecuta acción
console.log(window.game.state)      // Ver estado
```

---

## 📖 Importar en tu código

```javascript
// Si quieres usar los módulos en otro archivo:

import { GameState, PersistentStats } from './game-state.js';
import * as CombatEngine from './combat-engine.js';
import * as UIRenderer from './ui-renderer.js';
import { AdsManager } from './ads-manager.js';

const state = new GameState();
const stats = new PersistentStats();
const ads = new AdsManager();
```

---

## 🎮 Ejemplo Rápido

```javascript
// Acceso vía window.game (desde consola o DevTools)

window.game.startGame()              // Inicia batalla
window.game.playerAction('fury')     // Ejecuta acción "furia"
console.log(window.game.state.turn)  // Ver turno actual
console.log(window.game.stats.wins)  // Ver victorias
```

---

## 📝 Documentación

- **EXAMPLE_USAGE.js** - 10 ejemplos de uso diferentes
- **MIGRATION_GUIDE.md** - Cómo migrar de v2.0
- **README_SPRINT1.md** - Detalles del Sprint 1

---

## ✨ Ventajas

✅ Código modular y reutilizable  
✅ Fácil de testear  
✅ Fácil de mantener  
✅ Listo para expandir (roguelike, ads, mobile)  
✅ 100% compatible con v2.0  
✅ Sin dependencias externas  

---

## 🔮 v3.0 Roadmap

### Sprint 2: Roguelike Core
- Expandir roguelike-system.js con 30+ perks
- Reward screen post-victoria

### Sprint 3: UI/UX
- Animaciones mejoradas
- Responsive design optimizado

### Sprint 4: Monetización
- Google AdMob integration
- Ad hooks activos

### Sprint 5: Mobile
- Capacitor.js
- APK build

### Sprint 6: Launch
- Play Store deployment
- GitHub Pages

---

**Status**: ✅ Sprint 1 COMPLETADO  
**Próximo**: Sprint 2 - Roguelike Core  
**Version**: 3.0.0-modular-sprint1

