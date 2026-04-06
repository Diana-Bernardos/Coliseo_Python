# 🏗️ ARQUITECTURA v3.0 MODULAR - DIAGRAMA

## Visualización de la estructura modular

### 📦 Antes (v2.0 - Monolito):

```
┌─────────────────────────────────────────┐
│         script.js (~750 líneas)         │
├─────────────────────────────────────────┤
│                                         │
│  ├─ Audio System                        │
│  ├─ Game State (monolítico)             │
│  ├─ Combat Logic                        │
│  ├─ ORC AI                              │
│  ├─ UI Rendering                        │
│  ├─ DOM Manipulation                    │
│  └─ Stats Persistence                   │
│                                         │
└─────────────────────────────────────────┘
   ↑ Difícil de testear
   ↑ Difícil de mantener
   ↑ Difícil de expandir
```

### ✨ Después (v3.0 - Modular):

```
                    ┌──────────────────────────────┐
                    │    index.html (sin cambios)  │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  script-modular.js (15 L)   │◄─ Entry point
                    │  <type="module">            │
                    └──────────────┬───────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
    ┌────▼────┐             ┌──────▼───────┐          ┌──────▼──────┐
    │plsSFX   │             │  Import      │          │ Window.game │
    │Web Audio │             │  Modules     │          │ (debug)     │
    └─────────┘             └──────┬───────┘          └─────────────┘
                                   │
         ┌─────────────────────────┼──────────────────────────┬───────────────┐
         │                         │                          │               │
    ┌────▼──────────────┐  ┌──────▼──────────┐       ┌───────▼────┐   ┌──────▼────┐
    │  ui-renderer.js   │  │ game-state.js   │       │combat-    │   │roguelike- │
    │  (189 líneas)     │  │ (157 líneas)    │       │engine.js  │   │system.js  │
    │                   │  │                 │       │(142 L)    │   │(74 líneas)│
    │ ├─ addLog()       │  │ ├─ GameState    │       │           │   │           │
    │ ├─ updateHP()     │  │ ├─ Persistent  │       │ ├─ Dmg     │   │ ├─ PERKS  │
    │ ├─ updateCool()   │  │ │   Stats       │       │ ├─Heal    │   │ ├─ Run    │
    │ ├─ shakeCard()    │  │ ├─ CLASS_STATS │       │ ├─ AI      │   │ ├─ Reward │
    │ ├─ healEffect()   │  │ │  const       │       │ └─ Crits  │   │ └─ Scale │
    │ ├─ rendering()    │  │ └─ DIFFICULTY  │       └───────────┘   └───────────┘
    │ └─ leaderboard()  │  │                │
    └──────────────────┘  └─────────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │   index.js (451 líneas)      │
                    │   Orquestador Principal      │
                    │                              │
                    │  ├─ initGame()               │
                    │  ├─ startGame()              │
                    │  ├─ playerAction()           │
                    │  ├─ endGame()                │
                    │  ├─ restartGame()            │
                    │  ├─ playSfx() Web Audio      │
                    │  └─ Event binding            │
                    └──────────────┬───────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────┐
         │                         │                     │
    ┌────▼───────┐          ┌──────▼─────────┐    ┌─────▼──────┐
    │html/body   │          │   Event Loop    │    │ localStorage
    │viewport    │          │   Game Loop    │    │  (v2.0 compat)
    └────────────┘          └────────────────┘    └────────────┘
```

---

## 🔄 FLUJO DE DATOS

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT (HTML)                         │
│              <button onclick="game.playerAction()">          │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    index.js                                  │
│              playerAction(action)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────────┐ ┌──────────────────────┐
│  game-state.js   │ │ combat-engine.js     │
│  Update STATE    │ │ Calculate damage     │
│  ┌─ playerHP     │ │ Apply effects        │
│  ├─ cooldowns    │ │ Return result        │
│  └─ turn         │ └──────────┬───────────┘
└──────────────────┘            │
        │                       │
        ├───────────┬───────────┤
        │           │           │
        ▼           ▼           ▼
    ┌─────────────────────────────────────┐
    │       ui-renderer.js                │
    │  Update DOM based on state change   │
    │  ├─ updateHP()                      │
    │  ├─ addLog()                        │
    │  ├─ spawnFloatingNumber()           │
    │  ├─ shakeCard()                     │
    │  └─ showTurnOverlay()               │
    └─────────────────────────────────────┘
        │
        ▼
    ┌─────────────────┐
    │  HTML Updated   │
    │   (player sees  │
    │    the game)    │
    └─────────────────┘
```

---

## 📊 DEPENDENCIAS

```
index.js (Orquestador)
│
├─→ game-state.js (GameState, PersistentStats)
│
├─→ combat-engine.js (requires: game-state.js, combat functions)
│
├─→ ui-renderer.js (requires: document, DOM APIs)
│
├─→ roguelike-system.js (requires: game-state.js for future)
│
├─→ ads-manager.js (no external dependencies)
│
└─→ Web Audio System (native browser API)

✅ Zero external libraries
✅ Pure vanilla JavaScript
✅ ES6 modules ready
```

---

##  💾 STATE MANAGEMENT

```
┌────────────────────────────────────────┐
│        GameState (per battle)           │
├────────────────────────────────────────┤
│ • playerName                            │
│ • playerClass (warrior|mage|rogue)     │
│ • playerHP, playerMaxHP                 │
│ • furyCD, magicCD, shieldCD (cooldowns)│
│ • orcHP, orcMaxHP                       │
│ • orcFury                               │
│ • turn, maxTurns                        │
│ • historial[] (battle log)              │
│ • score                                 │
└────────────────────────────────────────┘
           ↓ serializable
      (ready for v3.0)
┌────────────────────────────────────────┐
│    PersistentStats (global)             │
├────────────────────────────────────────┤
│ • wins, losses, draws                   │
│ • streak, bestStreak                    │
│ • scores[] (top 10 leaderboard)        │
│                                         │
│ 💾 localStorage (auto-saved)            │
└────────────────────────────────────────┘
```

---

## 🎮 GAME LOOP

```
┌─ INIT ─────────────────────────────────┐
│ initGame()                              │
│ - Setup event listeners                 │
│ - Bind buttons                          │
│ - Load persistent state                 │
└─────────────────────────────────────────┘
           │
           ▼
┌─ SETUP SCREEN ──────────────────────────┐
│ selectClass() → selectDifficulty()     │
│ startGame()                             │
│ - Reset GameState                       │
│ - Apply class/difficulty mods           │
│ - Show battle screen                    │
└─────────────────────────────────────────┘
           │
           ▼
┌─ BATTLE LOOP ───────────────────────────┐
│ playerAction(action)                    │
│ - Calculate damage (combat-engine)      │
│ - Update state (game-state)             │
│ - Render updated UI (ui-renderer)       │
│ - ORC turn                              │
│ - Check win condition                   │
└─────────────────────────────────────────┘
           │
      ┌─────┴──────┐
      │             │
   (win)         (continue)
      │             │
      ▼             └─→ Loop back
┌─ END GAME ──────────────────────────────┐
│ endGame(winner)                         │
│ - Update PersistentStats                │
│ - Render end screen                     │
│ - Show leaderboard                      │
│ - Show ads (if applicable)              │
└─────────────────────────────────────────┘
           │
           ▼
┌─ RESTART ───────────────────────────────┐
│ restartGame()                           │
│ - Clear state                           │
│ - Reset to setup screen                 │
└─────────────────────────────────────────┘
           │
           └─→ Back to SETUP SCREEN
```

---

## 📂 DIRECTORY TREE

```
Coliseo_Python/
├── README.md                           (updated with Sprint 1)
├── GAME_DESIGN_DOCUMENT.md
├── TECHNICAL_SPECIFICATIONS.md
├── ROADMAP_IMPLEMENTATION.md
├── MIGRATION_GUIDE.md                  ✨ NEW
├── README_SPRINT1.md                   ✨ NEW
├── IMPLEMENTATION_CHECKLIST.md         ✨ NEW
├── batalla_rpg.py                      (legacy console)
│
└── ui/
    ├── index.html                      (unchanged)
    ├── style.css                       (improved scroll/layout)
    ├── script.js                       (v2.0 legacy, keep for fallback)
    ├── script-modular.js               ✨ NEW (entry point)
    │
    └── modules/                        ✨ NEW
        ├── game-state.js               (157 lines)
        ├── combat-engine.js            (142 lines)
        ├── ui-renderer.js              (189 lines)
        ├── roguelike-system.js         (74 lines, placeholder)
        ├── ads-manager.js              (138 lines, placeholder)
        ├── index.js                    (451 lines, orquestador)
        └── EXAMPLE_USAGE.js            ✨ NEW (10 examples)
    
    └── assets/
        ├── background.png
        ├── warrior.jpg
        ├── orc.jpg
        └── ...
```

---

## 🔀 IMPORT GRAPH

```
script-modular.js
    │
    └─→ modules/index.js
            ├─→ game-state.js (exports: GameState, PersistentStats, CLASS_STATS, DIFFICULTY_MODS)
            ├─→ combat-engine.js (imports: game-state.js)
            ├─→ ui-renderer.js (no imports of modules)
            ├─→ roguelike-system.js (placeholder)
            └─→ ads-manager.js (placeholder)

✅ No circular dependencies
✅ Clear unidirectional flow
✅ Easy to test each module
```

---

## 🚀 READY FOR v3.0

```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
  ✅ Sprint 1: Modular Architecture
  ✅ v2.0: Fully Compatible
  
  📋 Próximos Sprints:
  
  Sprint 2: Roguelike Core (30+ perks)
  Sprint 3: UI/UX Refinement
  Sprint 4: Monetization (Google AdMob)
  Sprint 5: Mobile (Capacitor)
  Sprint 6: Launch
  
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
```

---

**Last Updated**: 2026-04-06  
**Sprint 1 Status**: ✅ COMPLETADO  
**v3.0 Refactor**: 🚀 LISTO PARA SPRINTS POSTERIORES
