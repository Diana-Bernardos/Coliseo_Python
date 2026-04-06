# ⚔️ Coliseo de Batalla RPG → Coliseo Roguelike v3.0

## 📊 Status

**Current Version**: 3.0 Modular  
**Sprint 1**: ✅ **COMPLETADO** - Refactor arquitectura (6 módulos, 100% v2.0 compatible)  
**Sprint 2**: ✅ **COMPLETADO** - Roguelike Core System (30+ perks, Run system, Reward screen)  
**Next Phase**: Sprint 3 - UI/UX Refinement (animations, polish)  
**Timeline**: 6–8 semanas para MVP v3.0 listo para producción

> 🚀 **Sprint 2 completado**: Sistema roguelike functional, perks system, leaderboard

---

## 📚 DOCUMENTACIÓN COMPLETA (Prioriza por orden de lectura)

Este proyecto incluye especificaciones profesionales listas para implementación:

### 1. 📖 **GAME_DESIGN_DOCUMENT.md**
Documento de diseño del juego para la versión v3.0 Roguelike.

**Incluye**:
- Visión general y pitch
- Mecánicas core (combate, cooldowns, AI)
- Sistema roguelike (meta-progresión, perks, runs)
- Sistema de progresión (XP, niveles, leaderboard)
- Monetización (ads recompensados, hookpoints)
- Arquitectura técnica modular
- Especificaciones UI/UX
- Optimización mobile
- Timeline de implementación

📍 **Uso**: Léelo primero para entender la visión completa del juego v3.0.

---

### 2. ✨ **MIGRATION_GUIDE.md** (Nuevo)
Guía de migración de v2.0 (monolito) → v3.0 (modular).

**Incluye**:
- Resumen de cambios arquitectónicos
- Descripción de 6 módulos
- Cómo activar módulos en HTML
- Ejemplos de uso
- Debug en consola
- Browser compatibility

📍 **Uso**: Léelo después del GDD para entender la estructura modular.

---

### 3. 📋 **README_SPRINT1.md**
Reporte completo del Sprint 1 - Refactor Base.

**Incluye**:
- Entregas del sprint
- Checklist de verificación
- Cómo testear
- Métricas de calidad
- Próximos pasos

📍 **Uso**: Referencia para verificar completitud de Sprint 1.

---

### 4. 🎲 **README_SPRINT2.md** (Nuevo)
Reporte completo del Sprint 2 - Roguelike Core System.

**Incluye**:
- Sistema de 30+ perks (5 tiers balanceados)
- Clase Run para meta-progresión
- Reward screen UI interactivo
- Escalado de dificultad progresivo
- Leaderboard de top 10 runs
- Guía de testing
- Checklists de validación
- Próximos pasos

📍 **Uso**: Referencia para Sprint 2 completado.

---

### 5. 🔧 **TECHNICAL_SPECIFICATIONS.md**
Especificaciones técnicas profundas para desarrolladores.

**Incluye**:
- **30+ Perks Pool** (Comunes, Sin Comunes, Raros, Épicos, Legendarios)
  - Cada perk con definición completa (`apply()`, `icon`, `description`)
  - Ejemplos de hooks (`applyOnAttack`, `applyOnHeal`, etc.)
- **State Management** (Estructura global centralizada)
- **API Modules** (CombatEngine, RoguelikeSystem, UIRenderer, etc.)
- **Monetización Hookpoints** (Revive, Double Reward, Daily Bonus)
- **Ejemplos de código** (listo para copiar/pegar)

📍 **Uso**: Úsalo como referencia durante el desarrollo de módulos.

---

### 6. 🚀 **ROADMAP_IMPLEMENTATION.md**
Timeline detallado de 6 sprints con tasks, effort, deliverables y checklists.

**Incluye**:
- **Sprint 1**: ✅ COMPLETADO - Refactor arquitectura (6 módulos)
- **Sprint 2**: ✅ COMPLETADO - Roguelike core (30+ perks, runs, reward screen)
- **Sprint 3**: UI/UX refinement (animations, responsive)
- **Sprint 4**: Monetización (ads hooks)
- **Sprint 5**: Mobile & Optimization (Capacitor, APK)
- **Sprint 6**: Launch prep (Play Store, GitHub Pages)
- Métricas de éxito
- Timeline realista (6–8 semanas)

📍 **Uso**: Sigue este roadmap para implementación ordenada.

---

### 7. ✅ **IMPLEMENTATION_CHECKLIST.md**
Resumen ejecutivo de Sprint 1 completado.

**Incluye**:
- Desglose de archivos creados
- Validación de funcionalidad
- Métricas de mejora
- Cómo activar módulos
- Próximos sprints

📍 **Uso**: Quick reference de estado actual.

---

## 🎮 VERSIÓN ACTUAL (v3.0 Modular + Roguelike Core)

La arquitectura modular con sistema roguelike completamente implementado:

### ✅ Sprint 1 - Arquitectura Base
✅ Refactor monolítico → 6 módulos ES6  
✅ Game State Management  
✅ Combat Engine  
✅ UI Renderer  
✅ Ads Manager  
✅ 100% compatible con v2.0  

### ✅ Sprint 2 - Roguelike Meta-Progresión  
✅ 30+ perks balanceados (5 rarities)  
✅ Sistema de Runs (carrera de combates)  
✅ Reward Screen (selección de perks)  
✅ Escalado de dificultad progresivo  
✅ Leaderboard de top 10 runs  
✅ Persistencia localStorage  
✅ Dual mode: Classic + Roguelike  

---

## 🔮 VERSIÓN PRÓXIMA (v3.0 Sprint 3+)

Siguientes mejoras planeadas:

⏳ **Sprint 3**: UI/UX Refinement
- Animaciones de transición
- Responsive design mobile
- Dark mode
- Accessibility improvements

⏳ **Sprint 4**: Monetización
- Ads recompensados (revivir con 30% HP)
- Duplicar recompensas por video
- Bonus diario
- Leaderboard global (backend)

⏳ **Sprint 5**: Mobile & Deployment
- Capacitor wrapper (iOS/Android)
- Build APK
- Optimización performance mobile
- Offline support

⏳ **Sprint 6**: Launch Ready
- Play Store deployment
- GitHub Pages
- Marketing assets
- Beta feedback loop

🆕 **Mobile-first (Capacitor)**
- Build APK automatizado
- Deploy Play Store
- Offline mode
- Performance optimizado

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
Coliseo_Python/
├── README.md
├── GAME_DESIGN_DOCUMENT.md        ← NUEVA
├── TECHNICAL_SPECIFICATIONS.md    ← NUEVA
├── ROADMAP_IMPLEMENTATION.md      ← NUEVA
├── batalla_rpg.py                 (consola, legacy)
├── ui/
│   ├── index.html
│   ├── style.css                  (mejorado scroll/layout)
│   ├── script.js                  (actualizado con nuevo resumen)
│   ├── assets/
│   │   ├── background.png
│   │   ├── warrior.jpg
│   │   ├── orc.jpg
│   │   └── ...
│   └── modules/                   ← NUEVA STRUCTURE (Sprint 1)
│       ├── game-state.js          (por implementar)
│       ├── combat-engine.js       (por implementar)
│       ├── roguelike-system.js    (por implementar)
│       ├── ui-renderer.js         (por implementar)
│       ├── ads-manager.js         (por implementar)
│       └── index.js               (entry point module, por implementar)
└── ...
```

---

## 🚀 NEXT STEPS

### Para comenzar v3.0:

1. **Lee primero**: `GAME_DESIGN_DOCUMENT.md` (entender visión)
2. **Referencia técnica**: `TECHNICAL_SPECIFICATIONS.md` (desarrollo)
3. **Implementa**: `ROADMAP_IMPLEMENTATION.md` (Sprint a Sprint)

### Sprint 1 (Semana 1):

```bash
# Crear estructura modular
mkdir -p ui/modules
# Crear archivos base (ver TECHNICAL_SPECIFICATIONS.md)

# Inicio:
- [ ] game-state.js
- [ ] combat-engine.js
- [ ] roguelike-system.js
- [ ] ui-renderer.js
- [ ] ads-manager.js
```

---

## 🎯 OBJETIVOS v3.0

| Objetivo | Métrica |
|----------|---------|
| Roguelike completo | 30+ Perks, meta-progresión |
| Monetización | Ads hooks + ready AdMob |
| Mobile | APK funcional Play Store |
| Performance | Lighthouse > 85 |
| Engagement | D1 retention > 30% |

---

## 💡 VERSIÓN ACTUAL: CÓMO JUGAR

### 🌐 Web

```bash
python -m http.server 8080 --directory ui
# → http://localhost:8080
```

### 🐍 Consola (Legacy)

```bash
python batalla_rpg.py
```

---

## 🧪 TESTING v2.0

Cambios recientes aplicados:

✅ **Scroll & Layout**:
- `html, body`: Permite scroll vertical
- `.screen`: `align-items: flex-start` para mejor flujo
- `.intro-content`: Accesible con scroll interno

✅ **Resumen de Batalla**:
- `.end-log`: Panel con scroll organizado
- Historial con iconos (⚔️ 🔥 ✨ 🛡️)
- `.history-item`: Formato limpio y legible

---

## 📝 DOCUMENTACIÓN ADICIONAL

Todos los documentos MD están en la raíz del proyecto:

- **GAME_DESIGN_DOCUMENT.md**: Diseño del juego
- **TECHNICAL_SPECIFICATIONS.md**: API y Perks
- **ROADMAP_IMPLEMENTATION.md**: Timeline & Sprints

---

## 🤝 CONTACTO & FEEDBACK

- **GitHub**: [Diana-Bernardos/Coliseo_Python](https://github.com/Diana-Bernardos/Coliseo_Python)
- **Status**: En desarrollo (v2.0 stable, v3.0 planned)

---

**Versión README**: 2.0–3.0 Transition  
**Última actualización**: 2026-04-06  
**Ready for**: Production v3.0 MVP



---

## 📁 Estructura

```
Coliseo_Python/
├── batalla_rpg.py        # Versión consola (Python + POO)
├── README.md
└── ui/
    ├── index.html
    ├── style.css
    ├── script.js
    └── assets/
        ├── background.png
        ├── warrior.jpg
        ├── orc.jpg
        └── ...
```

---

## 🎯 ACTIVAR v3.0 MODULAR (Sprint 1)

### Paso 1: Actualizar HTML

En `ui/index.html`, reemplazar la línea:

```html
<!-- VIEJO -->
<script src="script.js"></script>

<!-- NUEVO -->
<script type="module" src="script-modular.js"></script>
```

### Paso 2: Testear en navegador

```bash
cd ui
python -m http.server 8080
# Navegar a http://localhost:8080
```

### Paso 3: Verificar en consola

```javascript
// En DevTools Console:
window.game          // { startGame, playerAction, restartGame, initGame }
window.game.startGame()
```

✅ **100% compatible** - Toda la funcionalidad de v2.0 se mantiene

**Documentación**: Ver `MIGRATION_GUIDE.md` para detalles completos.

---

## 🐍 Versión consola

```bash
python batalla_rpg.py
```

## 🌐 Versión web (v2.0 Legacy)

```bash
python -m http.server 8080 --directory ui
# → http://localhost:8080
# (Usa script.js antiguo si no cambias a script-modular.js)
```

---

## 💰 Hoja de ruta de monetización

### Tier 1 — Juego gratuito con anuncios (listo para implementar)
- Anuncio intersticial tras pantalla de fin (Google AdSense / AdMob si se porta a móvil nativo)
- Hook ya preparado: añadir ad container en `endGame()` antes del botón "Jugar de nuevo"
- **Estimación**: $2–5 CPM en web, $8–15 CPM en móvil nativo

### Tier 2 — Cosmético (contenido gratuito + desbloqueables)
- Personajes adicionales (Paladín, Brujo, Bárbaro) — unlock con puntuación acumulada o $0.99 cada uno
- Skins de arena (desbloqueable tras X victorias)
- Efectos de ataque especiales (partículas, shaders CSS)

### Tier 3 — Progresión (mayor retención)
- Sistema de niveles: experiencia ganada por batalla
- Árbol de habilidades por clase (3–5 habilidades por clase)
- Modo campaña: 5–10 enemigos distintos con dificultad escalada
- Torneo semanal con leaderboard online (requiere backend)

### Tier 4 — Premium / Suscripción
- "Pase de Coliseo" mensual: sin anuncios + 2 personajes exclusivos + modo infinito
- Precio sugerido: €2.99/mes

### Requisitos técnicos para escalar
- Backend mínimo para leaderboard global: Supabase (gratis hasta 500MB) + Edge Functions
- Login con Google para persistir progreso cross-device
- Portabilidad a móvil nativo: Capacitor.js (sin reescritura)

---

## ⚖️ Mecánicas v2 (web)

| Acción | Daño / Efecto | Cooldown |
|--------|--------------|---------|
| Ataque | 18–28 daño | — |
| Furia | 35–50 daño | 3 turnos |
| Magia | Cura 10–20 (Mago: 20–35) | 2 turnos |
| Escudo | 10–15 daño + 2 defensa permanente | 2 turnos |

| Clase | HP | Escudo | Especial |
|-------|----|--------|---------|
| Guerrero | 130 | 12 | Bloqueo ×1.5 |
| Mago | 85 | 4 | Curación ×1.75 |
| Pícaro | 100 | 7 | 20% crítico ×1.8, esquiva más frecuente |

---

## 👩‍💻 Tecnologías
- Python 3 (POO + servidor HTTP local)
- HTML5 / CSS3 / Vanilla JavaScript
- Web Audio API (SFX sintético sin assets)
- localStorage (persistencia de estadísticas)