# 🎮 COLISEO ROGUELIKE — GAME DESIGN DOCUMENT v1.0

**Tipo de Proyecto**: Mobile Game / Web Game (Progressive Web App)  
**Género**: Turn-Based Strategy Roguelike  
**Target**: Casual / Mid-Core Players (edad 14+)  
**Plataforma primaria**: Web (Responsive) + Android (Capacitor)  
**Duración sesión**: 3–7 minutos (combate) + 1–2 minutos (selección de mejoras)

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Mecánicas Core](#mecánicas-core)
3. [Sistema Roguelike](#sistema-roguelike)
4. [Sistema de Progresión](#sistema-de-progresión)
5. [Monetización](#monetización)
6. [Arquitectura Técnica](#arquitectura-técnica)
7. [UI/UX Specifications](#uiux-specifications)
8. [Timeline de Implementación](#timeline-de-implementación)

---

## 🎯 VISIÓN GENERAL

### Pitch

**"Coliseo Roguelike"** es un juego de combate por turnos 1v1 con meta-progresión donde el jugador enfrenta oleadas de enemigos, acumula mejoras roguelike y compite en leaderboards globales. Cada muerte es una oportunidad para elegir nuevas habilidades y volver más fuerte.

### Core Loop

```
Pantalla Inicio → Elegir Clase/Dificultad → Combate → [VICTORIA] 
  ↓
Seleccionar 1 de 3 Mejoras → Nueva Clase/Perks → Próximo Combate
  ↓
[DERROTA] → Revisor con RewardAd → Leaderboard → Reintentar
```

### Propuesta de Valor

- ✅ Combates estratégicos cortos (2–4 min)
- ✅ Meta-progresión adictiva (roguelike)
- ✅ Replayabilidad infinita
- ✅ Monetización no-intrusiva (ads recompensados)
- ✅ Mobile-first diseño
- ✅ Estadísticas persistentes (leaderboards)

---

## ⚔️ MECÁNICAS CORE

### 1. Sistema de Combate

#### Acciones del Jugador

| Acción | Daño | Efecto | Cooldown | Costo |
|--------|------|--------|----------|-------|
| **Ataque** | 18–28 | Daño base | Ninguno | 0 |
| **Furia** | 35–50 | Alto daño + -2 defensa propia (1 turno) | 3 turnos | 0 |
| **Magia** | +10–20 HP | Curación (escalable por clase/perks) | 2 turnos | 0 |
| **Escudo** | 10–15 dmg | +defensa permanente +2 | 2 turnos | 0 |

**Modificadores por Clase**:

```
GUERRERO:
  - HP base: 130
  - Escudo base: 12
  - Especial: +1.5x bloqueo en Escudo
  
MAGO:
  - HP base: 85
  - Escudo base: 4
  - Curación: +1.75x (20–35 en lugar de 10–20)
  
PÍCARO:
  - HP base: 100
  - Escudo base: 7
  - Crítico: 20% chance × 1.8 daño
  - Esquiva: +15% en Escudo
```

#### IA del Enemigo (Thrall)

**Lógica Adaptativa**:

```javascript
if (orcHP < orcMaxHP * 0.3) {
  // Defensivo: Curación o Escudo
  return AI.DEFENSIVE;
} else if (orcFury >= 2) {
  // Ofensivo: Furia encadenada
  return AI.AGGRESSIVE;
} else if (playerHP < playerMaxHP * 0.4) {
  // Oportunista: Ataque potente
  return AI.OPPORTUNISTIC;
} else {
  // Balanceado: Rotación de acciones
  return AI.BALANCED;
}
```

**Estados IA**: Defensive, Aggressive, Opportunistic, Balanced

---

### 2. Sistema de Cooldowns

- Visual: Círculo naranja en botón con número regresivo
- Reducción: Por perks específicos (cooldown reduction)
- Duración: Se reduce 1 turno al final del turno del jugador

---

## 🧬 SISTEMA ROGUELIKE

### 1. Meta-Progresión (Nueva en v3.0)

Tras **cada combate ganado**, el jugador accede a la pantalla de **"Recompensas"**:

```
┌─────────────────────────────────┐
│   ⭐ ELIGE 1 DE 3 MEJORAS ⭐    │
├─────────────────────────────────┤
│ [1] +10 HP Máx (por combate)    │
│ [2] +2 Daño Base                │
│ [3] +1 Defensa Permanente       │
│ [4] +15% Crítico                │
│ [5] Lifesteal 25%               │
│ [6] -1 Cooldown Magia           │
│ [7] +10% Velocidad Ataque       │
│ ... (30+ mejoras posibles)      │
└─────────────────────────────────┘
```

### 2. Sistema de Perks

Los perks son bonificadores pasivos acumulables. Se seleccionan tras cada victoria.

#### Categorías de Perks

**A) Estadísticas**
- `+HP_MAX_10`: +10 HP máximos (acumulable)
- `+DMG_BASE_2`: +2 daño base (acumulable)
- `+DEF_BASE_1`: +1 defensa permanente (acumulable)

**B) Críticos & Evasión**
- `CRIT_CHANCE_15`: +15% probabilidad de crítico
- `CRIT_MULT_1_5x`: Crítico × 1.5 daño extra (multiplicador)
- `DODGE_CHANCE_10`: +10% esquiva (reduce daño 50%)

**C) Lifesteal & Sostenibilidad**
- `LIFESTEAL_25`: Cura 25% del daño infligido
- `HEAL_BONUS_15`: +15% eficiencia de curación
- `REGEN_5_TURN`: Regenera 5 HP cada turno

**D) Cooldowns & Velocidad**
- `CD_MAGIC_1`: Reduce cooldown Magia de 2 → 1 turno
- `CD_FURY_1`: Reduce cooldown Furia de 3 → 2 turnos
- `CD_ALL_MINUS_1`: Todos los cooldowns −1 turno

**E) Especiales & Combos**
- `FURY_CHAIN`: Furia cuesta 0 cooldown si daño > 50
- `SHIELD_REFLECT`: Escudo refleja 20% daño recibido
- `LOW_HP_BOOST`: +50% daño si HP < 30%
- `CARRY_OVER`: Daño no utilizado se acumula (max 2 turnos)

### 3. Progresión por Nivel

```
SISTEMA DE EXPERIENCIA (XP)

XP por combate = daño_total × 1 + 50 × (dificultad_mult)

Tabla de Niveles (Cap: 20):
Nivel 1: 0 XP
Nivel 2: 100 XP
Nivel 3: 250 XP
...
Nivel 20: 10,000 XP

Bonus por Nivel:
- L1-3:   +5 HP
- L4-6:   +1 Ataque Base
- L7-10:  +1 Defensa
- L11-15: +1 Perk disponible
- L16-20: Acceso a perks exclusivos
```

### 4. Corrida (Run)

Una **corrida** = secuencia de combates hasta muerte.

```
Inicio Run:
├─ Dificultad (Easy/Normal/Hard)
├─ Clase seleccionada
└─ 0 Perks, HP Base

Combate 1 → Victoria → +1 Perk → Combate 2 → ... → Derrota
│                                                         │
└─────────────────────Fin Run, Guardar Stats─────────────┘

Métricas Run:
- Combates ganados
- Perks seleccionados
- Daño total infligido
- Sanación total
- Racha actual
```

---

## 📈 SISTEMA DE PROGRESIÓN

### 1. Puntuación (Score)

```javascript
FINAL_SCORE = daño_total 
            + (curación_total × 0.5)
            + (combates_ganados × 100)
            + (perks_usando × 25)
            + (HP_restante × 2)
            × dificultad_multiplicador

Multiplicadores Dificultad:
- Easy:   1.0
- Normal: 1.5
- Hard:   2.5
```

### 2. Estadísticas Persistentes

```javascript
STATS = {
  totalWins: 0,
  totalDeaths: 0,
  totalDraws: 0,
  
  currentStreak: 0,
  bestStreak: 0,
  
  totalDamage: 0,
  totalHeals: 0,
  totalPerksCollected: 0,
  
  leaderboard: [ /* top 10 */ ],
  achievements: [ /* badges */ ],
  
  levelPlayer: 1,
  totalXP: 0,
}
```

### 3. Leaderboard Local (localStorage)

```javascript
LEADERBOARD = [
  {
    rank: 1,
    name: "Uthred",
    score: 8245,
    difficulty: "hard",
    perks: ["LIFESTEAL_25", "CRIT_CHANCE_15"],
    timestamp: Date.now(),
  },
  // ... (hasta 50 registros, mostrar top 10)
]
```

---

## 💰 MONETIZACIÓN

### Filosofía

✅ **Free-to-Play + Anuncios Recompensados**  
❌ NO pay-to-win  
❌ NO anuncios intrusivos  
✅ Experiencia completa SIN pagar

### 1. Anuncios Recompensados

#### a) **Revivir Tras Derrota**

```
GAMEOVER SCREEN:
┌──────────────────────────────┐
│   💀 DERROTA (Turno 8)      │
│                              │
│   [⏰ REVIVIR + AD] ← 30% HP │
│   [❌ Fin del Juego]         │
│   [🔄 Reintentar]            │
└──────────────────────────────┘

Reglas:
- 1 pase por sesión
- Restaura 30% HP
- Mantiene perks recolectados
```

**Reward Ad**: Google Ad (video de 15–30s)

#### b) **Duplicar Recompensa Final**

```
LEVELUP SCREEN (después de victoria):
┌──────────────────────────────┐
│   ⭐ ¡VICTORIA! Score: 1250  │
│                              │
│   [🎁 x2 Mejoras + AD]       │
│   [✓ Aceptar Mejora Normal]  │
└──────────────────────────────┘

Reglas:
- 1 oportunidad por combate
- El jugador ve 2 × 3 = 6 opciones en vez de 3
- Solo ads recompensados
```

#### c) **Bonus Diario**

```
LOGIN BONUS:
┌──────────────────────────────┐
│  📅 Bonus Diario (+200 XP)   │
│                              │
│  [🎬 Ver AD + bonus]         │
│  [⏭️  Omitir]                │
└──────────────────────────────┘

Reglas:
- 1 vez por día (medianoche reset)
- +200 XP sin efecto en gameplay
```

### 2. Hooks de Monetización

**Ubicación en Código**:

```javascript
// hooks/ads.js
function showRewardAd(reason, onComplete) {
  // 'reason': 'revive', 'double-reward', 'daily-bonus'
  
  if (reason === 'revive') {
    // Mostrar revivir tras derrota
    playerHP = Math.ceil(playerMaxHP * 0.3);
    STATE.busy = false;
  } else if (reason === 'double-reward') {
    // Duplicar opciones de perks (6 en vez de 3)
  }
  
  onComplete();
}

// En endGame():
if (winner === 'warrior') {
  // Ofrecimiento: duplicar recompensa
  showRewardAd('double-reward', () => {
    showRewardSelectionScreen(doubleRewards: true);
  });
}

// En playerDefeat():
showRewardAd('revive', () => {
  continueGame();
});
```

### 3. Integración AdMob (Google)

Preparar estructura para:
- Interstitial Ads (entre combates, opcional)
- Rewarded Video (ver especificaciones arriba)
- Banner Ads (inferior/superior, en versión posterior)

**Nota**: NO forzar anuncios. El juego es completamente jugable sin gastar ni ver un solo ad.

---

## 🏗️ ARQUITECTURA TÉCNICA

### 1. Estructura de Directorios

```
Coliseo_Roguelike/
├── index.html
├── app/
│   ├── style.css
│   ├── script.js
│   └── modules/
│       ├── game-state.js       [Centralizado STATE + STATS]
│       ├── combat-engine.js    [Lógica de combate]
│       ├── ai-engine.js        [Lógica IA]
│       ├── roguelike-system.js [Perks + Mejoras]
│       ├── ui-renderer.js      [Renderizado de pantallas]
│       ├── audio-engine.js     [SFX Web Audio]
│       ├── ads-manager.js      [Integración ads]
│       └── leaderboard.js      [localStorage + sync]
├── assets/
│   ├── background.png
│   ├── warrior.jpg
│   ├── orc.jpg
│   └── ...
└── README.md
```

### 2. STATE GLOBAL (Centralizado)

```javascript
// modules/game-state.js

const GAME_VERSION = '3.0-roguelike';

const META = {
  playerName: '',
  playerClass: 'warrior',
  difficulty: 'normal',
  level: 1,
  totalXP: 0,
  collectedPerks: [], // ["LIFESTEAL_25", "CRIT_CHANCE_15"]
};

const BATTLE = {
  turn: 1,
  maxTurns: 15,
  playerHP: 130,
  playerMaxHP: 130,
  playerShield: 12,
  playerAlive: true,
  orcHP: 120,
  orcMaxHP: 120,
  orcShield: 5,
  orcAlive: true,
  busy: false,
  // Cooldowns...
};

const STATS = {
  totalWins: 0,
  totalDeaths: 0,
  currentStreak: 0,
  bestStreak: 0,
  leaderboard: [],
};

const PERKS_POOL = {
  // Todas las mejoras disponibles
};

// Funciones globales
function saveState() { /* localStorage */ }
function loadState() { /* localStorage */ }
function resetBattle() { /* reset BATTLE */ }
```

### 3. Combat Engine

```javascript
// modules/combat-engine.js

class CombatEngine {
  constructor(gameState) {
    this.state = gameState;
    this.history = [];
  }
  
  executeAction(who, action) {
    // Calcula daño, aplica modificadores, perks, etc.
    // Retorna: { damage, isCrit, isDodge, description }
  }
  
  applyDamage(target, damage) {
    // Aplica escudo, lifesteal, regeneración, etc.
  }
  
  checkWinCondition() {
    // Retorna: 'player', 'enemy', 'draw', null
  }
}
```

### 4. Roguelike System

```javascript
// modules/roguelike-system.js

class RoguelikeSystem {
  constructor(gameState) {
    this.state = gameState;
  }
  
  selectPerk(perkID) {
    // Aplica el perk al state
    this.state.META.collectedPerks.push(perkID);
    this.applyPerkBonuses(perkID);
  }
  
  applyPerkBonuses(perkID) {
    // Modifica stats según el perk
    // Ej: +10 HP, +1 DMG, etc.
  }
  
  generateRewardOptions(count = 3) {
    // Elige 3 perks aleatorios (sin duplicados)
    // Retorna opciones ponderadas por rarity
  }
}
```

### 5. UI Renderer

```javascript
// modules/ui-renderer.js

class UIRenderer {
  renderIntroScreen() { /* pantalla inicio */ }
  renderBattleScreen() { /* pantalla combate */ }
  renderRewardScreen(options) { /* pantalla mejoras */ }
  renderLeaderboard() { /* tabla puntuaciones */ }
  renderGameOverScreen() { /* pantalla fin */ }
}
```

### 6. Ads Manager

```javascript
// modules/ads-manager.js

class AdsManager {
  showRewardAd(reason, callback) {
    // reason: 'revive' | 'double-reward' | 'daily-bonus'
    // callback: función al completar
  }
  
  isAdSupported() {
    // Detecta si Google Ad SDK está cargado
  }
}
```

---

## 🎨 UI/UX SPECIFICATIONS

### 1. Pantallas Principales

#### A) **INTRO SCREEN** (Selección)

```
┌─────────────────────┐
│  ⚔️ COLISEO ROGUELIKE │
│                       │
│ [Guerrero VS Orco]    │
│                       │
│ Nombre: [____]        │
│                       │
│ ELIGE CLASE:          │
│ [⚔️ Guerrero] [🔮 Mago] [🗡️ Pícaro] │
│                       │
│ DIFICULTAD:           │
│ [Fácil] [Normal*] [Difícil] │
│                       │
│ [⚔️ EMPEZAR BATALLA] │
└─────────────────────┘
```

**Elementos**:
- Título animado (titlePulse)
- Preview de clase seleccionada
- Input nombre customizable
- Selector dificultad con colores

---

#### B) **BATTLE SCREEN** (Combate)

```
┌──────────────────────────────┐
│      TURNO 5 / 15            │
│                              │
│  [Guerrero: 85/130 HP]  VS  [Thrall: 60/120 HP] │
│                              │
│  📜 Crónica de Batalla:      │
│  ├─ ⚔️ T1: Ataque 23 dmg    │
│  ├─ 🔥 T2: Furia 48 dmg    │
│  ├─ ✨ T3: Magia +15 HP    │
│  └─ 🛡️  T4: Escudo +2 def  │
│                              │
│  ¿Es tu turno!              │
│  [⚔️ Ataque] [🔥 Furia]    │
│  [✨ Magia] [🛡️ Escudo]    │
└──────────────────────────────┘
```

**Elementos**:
- Barras de vida animadas (transición 600ms)
- Log de batalla con scroll
- Números flotantes de daño (rojo/verde/amarillo)
- Botones action con cooldown badge (naranja)

---

#### C) **REWARD SCREEN** (Mejoras Roguelike)

```
┌──────────────────────────┐
│  ⭐ SELECCIONA 1 MEJORA ⭐ │
│  (Victoria Turno 6)      │
│                          │
│  [1] +10 HP Max (12)     │
│      Aumenta vida máxima │
│                          │
│  [2] Lifesteal 25%       │
│      Cura 25% del daño  │
│                          │
│  [3] +15% Crítico        │
│      Probabilidad crítica│
│                          │
│  📊 Perks Actuales: 3    │
│  🎯 Score: 1240          │
│                          │
│  [CONTINUAR → Combate 7] │
└──────────────────────────┘
```

**Elementos**:
- 3 opciones ponderadas
- Descripción de cada perk
- Contador de perks recolectados
- Score acumulado

---

#### D) **GAMEOVER SCREEN** (Derrota)

```
┌──────────────────────────┐
│    💀 DERROTA 💀         │
│  Thrall te ha vencido.   │
│                          │
│  📊 Estadísticas:        │
│  • Combates ganados: 6   │
│  • Daño total: 1245      │
│  • Perks usados: 4       │
│  • Score final: 2850     │
│  • Racha: 6 ⭐           │
│                          │
│  🏅 TOP 10:              │
│  1. Uthred - 8245 🔴     │
│  2. Arturo - 6120        │
│  ...                     │
│                          │
│  [🎬 REVIVIR + AD]       │
│  [🔄 REINTENTAR]         │
│  [🏠 INICIO]             │
└──────────────────────────┘
```

**Elementos**:
- Resumen final con iconos
- Leaderboard visible
- Botones revivir/reintentar/inicio
- Estadísticas globales (racha, máxima, etc.)

---

### 2. Paleta de Colores

```css
--gold: #d4a017
--gold-light: #f0c420
--warrior-blue: #1a4a7a
--orc-green: #1a4a1a
--blood-red: #8B0000
--text-light: #e8dcc8
--dark-bg: #0a0a0a
--panel-bg: rgba(10, 8, 5, 0.84)
```

### 3. Tipografía

```css
--font-title: 'Cinzel', serif (700, 900)
--font-body: 'Crimson Text', serif (400, 600)
```

### 4. Animaciones Clave

```css
/* Código CSS */

@keyframes titlePulse {
  0%, 100% { text-shadow: 0 0 20px var(--gold); }
  50% { text-shadow: 0 0 45px var(--gold-light); }
}

@keyframes floatUp {
  0% { transform: translateY(0) scale(1.2); opacity: 1; }
  100% { transform: translateY(-70px) scale(0.8); opacity: 0; }
}

@keyframes shake {
  0% { transform: none; }
  20% { transform: translateX(-9px); }
  40% { transform: translateX(9px); }
  100% { transform: none; }
}

@keyframes healFlash {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.7); }
}
```

---

## 🌐 OPTIMIZACIÓN MOBILE

### 1. Responsive Breakpoints

```css
/* Desktop: 1200px+ */
.battle-arena {
  grid-template-columns: 260px 1fr 260px;
}

/* Tablet: 768px – 1199px */
@media (max-width: 1024px) {
  .battle-arena {
    grid-template-columns: 1fr;
  }
}

/* Mobile: < 768px */
@media (max-width: 768px) {
  .battle-arena {
    grid-template-columns: 1fr;
    padding: 55px 12px 12px;
  }
  
  .fighter-card {
    flex-direction: row;
    height: auto;
  }
  
  .action-buttons {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .btn-action {
    min-width: 60px;
    padding: 8px 6px;
    font-size: 0.7rem;
  }
}
```

### 2. Performance

- **Lazy Loading**: Assets bajo demanda (Capacitor)
- **Reducir Audio**: Web Audio API sintético (sin archivos MP3)
- **Minify CSS/JS**: En producción
- **LocalStorage**: Máximo 5MB (suficiente para 1000 leaderboard entries)
- **SFX**: Pre-generadas en memoria (no disco)

### 3. Capacitor Config (Próxima Fase)

```json
{
  "appId": "com.coliseo.roguelike",
  "appName": "Coliseo Roguelike",
  "webDir": "ui",
  "plugins": {
    "AdMob": {
      "APP_ID": "ca-app-pub-xxxxxxxxxxxxxxxx",
      "ANDROID_AD_UNIT_ID": "...",
      "IOS_AD_UNIT_ID": "..."
    },
    "LocalNotifications": {
      "enabled": true,
      "dailyBonus": "08:00"
    }
  }
}
```

---

## 📱 EXPERIENCIA USUARIO (UX FLOW)

```
1️⃣ PRIMER ARRANQUE
   └─ Intro tutorial simulado
   └─ Seleccionar nombre + clase
   └─ Empezar combate Fácil

2️⃣ FLUJO VICTORIA
   └─ Animation naranja (victoria)
   └─ SFX victorio
   └─ Pantalla recompensa (elegir perk)
   └─ Score mostrado
   └─ Continuar → próximo combate

3️⃣ FLUJO DERROTA
   └─ Animation negra (derrota)
   └─ SFX derrota
   └─ Opción RevivAd (30% HP)
   │  └─ SI: Continuar mismo combate
   │  └─ NO: Gameover screen
   └─ Mostrar leaderboard
   └─ Opción reintentar (reset run)

4️⃣ META PROGRESIÓN
   └─ Racha activa persiste entre carreras
   └─ Leaderboard va acumulando
   └─ XP y nivel globales
```

---

## 🔧 TIMELINE DE IMPLEMENTACIÓN

### FASE 1: Refactor Base (Semana 1)

- [x] HTML5 modular
- [x] CSS responsive (mobile-first)
- [x] JavaScript modular (game-state.js, etc.)
- [x] Combat engine mejorado
- [x] AI adaptativa

**Status**: ✅ COMPLETADO (v2.0)

---

### FASE 2: Roguelike System (Semana 2–3)

- [ ] Reward screen (selección de 3 perks)
- [ ] Perk system (30+ perks definidos)
- [ ] Run persistencia (localStorage)
- [ ] Meta-progresión (XP, niveles)
- [ ] Dificultad escalada por run

**Effort**: 15–20 horas

---

### FASE 3: Monetización (Semana 3–4)

- [ ] Ads manager (hooks preparados)
- [ ] Revive con reward ad
- [ ] Double reward con video ad
- [ ] Daily bonus ad
- [ ] Analytics integration (Firebase)

**Effort**: 8–10 horas

---

### FASE 4: Pulido & Optimización (Semana 4–5)

- [ ] Leaderboard sync (servidor simple)
- [ ] Achievementss/badges
- [ ] Sonido mejorado (más SFX)
- [ ] Animaciones sutiles
- [ ] Mobile testing (iOS/Android)

**Effort**: 12–15 horas

---

### FASE 5: Lanzamiento Capacitor (Semana 5–6)

- [ ] Build Capacitor Android
- [ ] Build Capacitor iOS (dev)
- [ ] Testeo real en dispositivos
- [ ] AdMob integración real
- [ ] Publishing a Play Store

**Effort**: 10–12 horas

---

## 📊 DEFINICIONES DE HECHO (DoD)

### Cada Feature debe cumplir:

✅ Código limpio, comentado, modular  
✅ Mobile-responsive confirmado  
✅ Testeado en Chrome/Safari/iPhone  
✅ Performance > 60 FPS  
✅ Leaderboard persistente (localStorage)  
✅ Ads hooks implementadas (sin ads reales aún)  
✅ Documentación inline en código  

---

## 🚀 MVP-V3 CARACTERÍSTICAS CLAVE

| Feature | Priority | Status | Effort |
|---------|----------|--------|--------|
| Reward Screen | P0 | ❌ Pending | 4h |
| 30+ Perks Pool | P0 | ❌ Pending | 8h |
| Run Persistence | P0 | ❌ Pending | 3h |
| XP/Level System | P1 | ❌ Pending | 3h |
| Ads Manager | P1 | ❌ Pending | 2h |
| Achievements | P2 | ❌ Pending | 4h |
| Leaderboard Sync | P2 | ❌ Pending | 5h |
| Capacitor Build | P3 | ❌ Pending | 8h |

**Total Effort**: ~40–50 horas para MVP v3 completo

---

## 📝 RECURSOS EXTERNOS

- Google AdMob: https://admob.google.com
- Capacitor Docs: https://capacitorjs.com
- Firebase Analytics: https://firebase.google.com
- GitHub Pages (hosting gratis): https://pages.github.com

---

## ✅ CONCLUSIÓN

Este documento define el **Coliseo Roguelike v3.0** como un juego profesional, completo y listo para monetizar. La arquitectura modular permite escalar fácilmente a nuevas plataformas (iOS, Android) sin reescribir código core.

**Next Steps**:
1. Implementar FASE 2 (Roguelike system)
2. Testing exhaustivo en mobile
3. Integración AdMob real
4. Publishing Play Store/App Store

---

**Documento creado**: 2026-04-06  
**Versión**: 1.0 (GDD v3.0 Roguelike)  
**Autor**: Game Design Team

