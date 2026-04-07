# 🚀 ROADMAP DE IMPLEMENTACIÓN — COLISEO ROGUELIKE v3.0

**Duración Total**: 6–8 semanas  
**Equipo Estimado**: 2–3 desarrolladores  
**Status Sprint**: Sprint 2 completo, Sprint 3 en progreso

---

## 📋 TABLA DE CONTENIDOS

1. [Sprint Overview](#sprint-overview)
2. [Sprint 1: Refactor Base](#sprint-1-refactor-base)
3. [Sprint 2: Roguelike Core](#sprint-2-roguelike-core)
4. [Sprint 3: UI/UX Refinement](#sprint-3-uiux-refinement)
5. [Sprint 4: Monetización](#sprint-4-monetización)
6. [Sprint 5: Mobile & Optimization](#sprint-5-mobile--optimization)
7. [Sprint 6: Launch Prep](#sprint-6-launch-prep)
8. [Métricas de Éxito](#métricas-de-éxito)

---

## 📊 SPRINT OVERVIEW

| Sprint | Semana | Objetivo Clave | Output |
|--------|--------|----------------|--------|
| **1** | W1 | Refactor a arquitectura modular | 4 módulos base listos |
| **2** | W2–W3 | Sistema roguelike completo | 30+ perks, reward screen |
| **3** | W3–W4 | UI/UX pulida | Animaciones, responsivo |
| **4** | W4–W5 | Ads integration | Hooks monetización preparados |
| **5** | W5–6 | Mobile build & test | APK/IPA testeable |
| **6** | W6–8 | Launch & refinement | Publicación Play Store |

---

## ⚙️ SPRINT 1: REFACTOR BASE (SEMANA 1)

**Objetivo**: Convertir `script.js` monolítico a arquitectura modular  
**DRI**: Lead Developer  
**Effort**: 16 horas

### Tasks

#### T1.1: Crear módulos base (3h)

```javascript
// modules/game-state.js
export class GameState {
  static load() { /* load from localStorage */ }
  static save() { /* save to localStorage */ }
}

// modules/combat-engine.js
export class CombatEngine {
  constructor(gameState) { }
  playerAction(action) { }
}

// modules/roguelike-system.js
export class RoguelikeSystem {
  generateRewardOptions() { }
  selectPerk(perkID) { }
}

// modules/ui-renderer.js
export class UIRenderer {
  renderBattleScreen() { }
  renderRewardScreen() { }
}

// modules/ads-manager.js
export class AdsManager {
  showRewardAd(reason, callback) { }
}
```

**Checklist**:
- [ ] 5 módulos creados con exported classes
- [ ] Imports/exports funcionando
- [ ] Estado global centralizado

---

#### T1.2: Migrar lógica de combate (5h)

Mover `playerAction()`, `executeAction()`, etc. a `CombatEngine`:

```javascript
// OLD (script.js)
function playerAction(action) {
  // 200 líneas...
}

// NEW (combat-engine.js)
class CombatEngine {
  playerAction(action) {
    // Misma lógica, mejor estructurada
  }
}
```

**Checklist**:
- [ ] Todos los métodos de combate migrados
- [ ] No hay conflictos con referencias
- [ ] Tests manuales: atacar, curar, escudo, furia

---

#### T1.3: Migrar UI rendering (4h)

Mover toda lógica de DOM a `UIRenderer`:

```javascript
function updateUI() {
  $('warrior-hp-bar').style.width = pct + '%';
  // ... 50 líneas
}

// BECOMES:
uiRenderer.updateBattleUI(gameState);
```

**Checklist**:
- [ ] Todos los `$().innerHTML` = en UIRenderer
- [ ] Funciones `update*()` son métodos de UIRenderer
- [ ] Animaciones mantienen timing

---

#### T1.4: Integrar con state centralizado (4h)

Reemplazar `STATE.playerHP++` por:

```javascript
gameState.battle.playerHP++;
gameState.save(); // Auto-save
```

**Checklist**:
- [ ] No hay variables globales sueltas
- [ ] Todo state pasa por GameState
- [ ] localStorage sincroniza correctamente

---

### Deliverables Sprint 1

```
ui/modules/
├── game-state.js           ✅ 150 lineas
├── combat-engine.js        ✅ 200 lineas
├── roguelike-system.js     ✅ 100 lineas (stub)
├── ui-renderer.js          ✅ 300 lineas
├── ads-manager.js          ✅ 50 lineas (stub)
└── index.js                ✅ Entry point

Cambios en index.html:
└── <script type="module" src="ui/modules/index.js"></script>

✅ Juego funcional SIN cambios visibles para el usuario
✅ Arquitectura lista para expander
✅ Tests manuales passed
```

---

## 🧬 SPRINT 2: ROGUELIKE CORE (SEMANAS 2–3)

**Objetivo**: Implementar sistema roguelike completo  
**DRI**: Lead Developer + Game Designer  
**Effort**: 30 horas

### T2.1: Definir 30+ perks pool (4h)

En `modules/roguelike-system.js`:

```javascript
const PERKS_COMPLETE = {
  // Tier 1: 6 comunes
  HP_PLUS_10: { ... },
  DMG_PLUS_2: { ... },
  
  // Tier 2: 5 sin comunes
  CRIT_CHANCE_15: { ... },
  
  // Tier 3: 6 raros
  LIFESTEAL_25: { ... },
  
  // Tier 4: 5 épicos
  CD_MAGIC_1: { ... },
  
  // Tier 5: 5+ legendarios
  FURY_CHAIN: { ... },
  SHIELD_REFLECT: { ... },
  
  // Total: 30+ perks
};
```

**Checklist**:
- [ ] 30+ perks definidos (con `apply()`, `icon`, `description`)
- [ ] Balance check (tier spread)
- [ ] Sin duplicados lógicos

---

### T2.2: Reward Screen (6h)

Nueva pantalla HTML + CSS:

```html
<!-- index.html -->
<div id="reward-screen" class="screen">
  <div class="reward-content">
    <h2>⭐ SELECCIONA 1 MEJORA</h2>
    <div id="reward-options" class="reward-options">
      <!-- 3 opciones generadas dinámicamente -->
    </div>
    <div class="reward-footer">
      <p>Perks: <span id="perk-count">0</span></p>
      <p>Score: <span id="run-score">0</span></p>
    </div>
  </div>
</div>
```

**CSS**:
```css
.reward-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px;
  /* ... estilo similar a intro-content */
}

.reward-option {
  background: rgba(212,160,23,0.1);
  border: 1px solid rgba(212,160,23,0.3);
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.reward-option:hover {
  background: rgba(212,160,23,0.2);
  border-color: var(--gold);
}
```

**Checklist**:
- [ ] Pantalla se muestra tras victoria
- [ ] 3 opciones generadas aleatoriamente
- [ ] Click selecciona perk y continúa
- [ ] Score mostrado correctamente

---

### T2.3: Run Persistence (5h)

Guardar estado de run en localStorage:

```javascript
class RoguelikeSystem {
  startNewRun(difficulty) {
    this.state.run = {
      active: true,
      difficulty,
      combatesWon: 0,
      collectedPerks: [],
      score: 0,
    };
    this.saveState(); // Auto-save
  }

  selectPerk(perkID) {
    this.state.meta.collectedPerks.push(perkID);
    PERKS_COMPLETE[perkID].apply(this.state);
    this.saveState();
  }

  endRun() {
    this.state.run.active = false;
    const score = this.calculateScore();
    this.addToLeaderboard({ name, score, perks: [...] });
    this.saveState();
  }
}
```

**Checklist**:
- [ ] Run data persiste entre reloads
- [ ] Perks se mantienen entre combates
- [ ] Score calcula correctamente
- [ ] Leaderboard guarda top 50

---

### T2.4: Perk Application Logic (8h)

Integrar efectos de perks en combate:

```javascript
// combat-engine.js
playerAttackWithPerks() {
  let baseDamage = this.randomInt(18, 28);
  
  // Aplicar perks
  for (const perkID of this.state.meta.collectedPerks) {
    const perk = PERKS_COMPLETE[perkID];
    if (perk.applyOnAttack) {
      baseDamage = perk.applyOnAttack(baseDamage, this.state);
    }
  }
  
  return this.applyDamageToOrc(baseDamage);
}
```

Cada perk necesita hooks:
- `apply(state)` — aplicar al inicio
- `applyOnAttack(dmg, state)` — modificar daño
- `applyOnDefense(dmg, state)` — modificar defensa
- `applyOnHeal(heal, state)` — modificar curación
- `applyPerTurn(state)` — efecto cada turno

**Checklist**:
- [ ] Perks comunes funcionales (HP, DMG, DEF)
- [ ] Perks Sin comunes funcionales (crítico, esquiva)
- [ ] Perks raros funcionales (lifesteal, regen)
- [ ] Tests: verificar que perks se aplican

---

### T2.5: Score Calculation (3h)

```javascript
calculateFinalScore() {
  const diffMult = {
    easy: 1.0,
    normal: 1.5,
    hard: 2.5,
  }[this.state.run.difficulty];

  const baseScore =
    this.state.run.totalDamageDealt +
    (this.state.battle.playerHP * 2) +
    (this.state.run.combatesWon * 100) +
    (this.state.meta.collectedPerks.length * 50);

  return Math.round(baseScore * diffMult);
}
```

**Checklist**:
- [ ] Score aumenta con dificultad
- [ ] Score recompensa HP restante
- [ ] Perks contribuyen a score

---

### T2.6: Mejorar IA (4h)

AI ahora adaptativa con perks:

```javascript
// ai-engine.js
oracleAction() {
  const state = this.state;
  
  // Si jugador tiene DESPERADO activado, ser más defensivo
  if (state.meta.collectedPerks.includes('LOW_HP_BOOST')) {
    if (state.battle.playerHP / state.battle.playerMaxHP < 0.4) {
      return this.defensiveAction();
    }
  }
  
  // Lógica normal...
}
```

**Checklist**:
- [ ] AI detecta perks del jugador
- [ ] Estrategia se adapta

---

### Deliverables Sprint 2

```
✅ 30+ perks definidos y balanceados
✅ Reward Screen implementada
✅ Run persistence funciona
✅ Perks se aplican en batalla
✅ Score calcula correctamente
✅ AI adaptativa a perks
✅ Juego completamente jugable con roguelike

Test: Jugar 3 carreras completas sin errores
```

---

## 🎨 SPRINT 3: UI/UX REFINEMENT (SEMANAS 3–4)

**Objetivo**: Pulida visual y experiencia  
**DRI**: UX Designer + Frontend Dev  
**Effort**: 20 horas

### T3.1: Animaciones & Efectos (6h)

Mejorar animations existentes:

```css
/* Mejorar */
@keyframes rewardShow {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.reward-option {
  animation: rewardShow 0.4s cubic-bezier(0.22,1,0.36,1);
}

/* Efecto premio seleccionado */
.reward-option.selected {
  animation: rewardSelected 0.5s ease;
}

@keyframes rewardSelected {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1) translateY(-20px); }
}
```

**Checklist**:
- [ ] Reward screen entra con transición
- [ ] Perk seleccionado tiene efecto
- [ ] Próximo combate comienza suave
- [ ] 60 FPS en animaciones

---

### T3.2: Responsive Design Mobile (6h)

Mejorar breakpoints para móvil:

```css
@media (max-width: 480px) {
  .reward-option {
    padding: 12px;
    font-size: 0.85rem;
  }
  
  .reward-option .icon {
    font-size: 2rem;
  }
}
```

Testear en:
- iPhone SE (375px)
- iPhone 12 (390px)
- Pixel 4 (412px)
- iPad (768px)

**Checklist**:
- [ ] Testeo en 5 dispositivos diferentes
- [ ] Layout no se quiebra en ninguno
- [ ] Botones touchables (mín 44px)

---

### T3.3: Feedback Visual Mejorado (5h)

```javascript
// ui-renderer.js
showPerkNotification(perkName) {
  const notif = document.createElement('div');
  notif.className = 'perk-notification';
  notif.innerHTML = `
    <span class="notif-icon">✨</span>
    <span class="notif-text">+${perkName}</span>
  `;
  document.body.appendChild(notif);
  
  // Animación entrada + salida
  setTimeout(() => notif.classList.add('show'), 0);
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Al seleccionar perk
roguelike.selectPerk(perkID);
uiRenderer.showPerkNotification(perk.name);
```

**CSS**:
```css
.perk-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(212,160,23,0.9);
  padding: 12px 20px;
  border-radius: 8px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.perk-notification.show {
  opacity: 1;
  transform: translateY(0);
}
```

**Checklist**:
- [ ] Notificación perk al seleccionar
- [ ] Sonido perk (SFX)
- [ ] Animación suave

---

### T3.4: Leaderboard UI (3h)

Mejorar visual del leaderboard:

```javascript
renderLeaderboard() {
  const lb = $('leaderboard-list');
  lb.innerHTML = '';
  
  STATS.scores.slice(0, 10).forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row';
    
    const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || `${i+1}.`;
    const diffColor = {
      easy: '#6de86d',
      normal: '#f0c420',
      hard: '#ff6060',
    }[entry.diff];
    
    row.innerHTML = `
      <span class="lb-medal">${medal}</span>
      <span class="lb-name">${entry.name}</span>
      <span class="lb-diff" style="color: ${diffColor}">${entry.diff}</span>
      <span class="lb-score">${entry.score.toLocaleString()}</span>
    `;
    
    lb.appendChild(row);
  });
}
```

**Checklist**:
- [ ] Medals para top 3
- [ ] Color por dificultad
- [ ] Scores formateados (1.000)

---

### T3.5: Optimizar CSS (0h)

```bash
# Minify antes de ship (hecho en build)
npx cleancss -o style.min.css style.css
```

No modificar, solo usar en build.

**Checklist**:
- [ ] CSS modular y bien comentado
- [ ] Sin reglas duplicadas

---

### Deliverables Sprint 3

```
✅ Animaciones suaves en toda la UI
✅ Responsive testeado en 5+ dispositivos
✅ Notificaciones de perk
✅ Leaderboard visual mejorado
✅ SFX perk integrado
✅ 60 FPS en todas las animaciones
```

---

## 💰 SPRINT 4: MONETIZACIÓN (SEMANAS 4–5)

**Objetivo**: Ads hooks listos, testeable sin ads reales  
**DRI**: Backend Dev + Monetization Expert  
**Effort**: 15 horas

### T4.1: AdsManager Completo (4h)

```javascript
// modules/ads-manager.js
export class AdsManager {
  constructor() {
    this.adMobReady = false;
    this.devMode = true; // Cambiar en producción
  }

  showRewardAd(reason, callback) {
    if (this.devMode) {
      // DEV: Simular ad con delay
      console.log(`[AD] Reward Ad: ${reason}`);
      setTimeout(() => {
        callback();
      }, 2000);
    } else {
      // PROD: Google AdMob real
      admob.showRewardedVideo(
        this.getAdUnitId(reason),
        callback,
        this.onAdError
      );
    }
  }

  getAdUnitId(reason) {
    return {
      revive: 'ca-app-pub-..../revive',
      double_reward: 'ca-app-pub-..../double',
      daily_bonus: 'ca-app-pub-..../daily',
    }[reason];
  }

  onAdError(errorCode) {
    console.error(`[AD ERROR] ${errorCode}`);
  }
}
```

**Checklist**:
- [ ] Dev mode funciona sin ads
- [ ] 3 tipos de ads con ad units
- [ ] Error handling

---

### T4.2: Revive Hook (3h)

```javascript
// En battle-screen.js, cuando jugador pierde:
function handlePlayerDefeat() {
  const gameOverScreen = $('end-screen');
  
  const reviveBtn = document.createElement('button');
  reviveBtn.className = 'btn-gold';
  reviveBtn.innerHTML = '🎬 REVIVIR + VER AD (30% HP)';
  reviveBtn.onclick = () => {
    ADS_MANAGER.showRewardAd('revive', () => {
      // Callback post-ad
      STATE.battle.playerHP = Math.ceil(STATE.battle.playerMaxHP * 0.3);
      STATE.battle.playerAlive = true;
      STATE.battle.busy = false;
      
      // Reanudar combate
      gameOverScreen.classList.remove('active');
      $('battle-screen').classList.add('active');
      setActionButtons(true);
    });
  };
  
  gameOverScreen.appendChild(reviveBtn);
}
```

**Checklist**:
- [ ] Botón Revivir visible en derrota
- [ ] Click muestra ad (o simula en dev)
- [ ] Post-ad: juego continúa con 30% HP

---

### T4.3: Double Reward Hook (4h)

```javascript
// En reward-screen.js, cuando victoria:
function showRewardScreenWithOption() {
  const rewardScreen = $('reward-screen');
  
  // Opción 1: Ver AD para x2 opciones
  const doubleBtn = document.createElement('button');
  doubleBtn.innerHTML = '🎬 x2 OPCIONES + AD';
  doubleBtn.onclick = () => {
    ADS_MANAGER.showRewardAd('double_reward', () => {
      // Generar 6 opciones en lugar de 3
      const options = RoguelikeSystem.generateRewardOptions(6);
      renderRewardOptions(options);
    });
  };
  
  // Opción 2: Aceptar 3 opciones normales
  const normalBtn = document.createElement('button');
  normalBtn.innerHTML = '✓ ACEPTAR OPCIÓN';
  normalBtn.onclick = () => {
    const options = RoguelikeSystem.generateRewardOptions(3);
    renderRewardOptions(options);
  };
  
  rewardScreen.appendChild(doubleBtn);
  rewardScreen.appendChild(normalBtn);
}
```

**Checklist**:
- [ ] Botones x2 y normal visibles
- [ ] x2 genera 6 opciones
- [ ] Normal genera 3 opciones
- [ ] Ad hook funciona

---

### T4.4: Daily Bonus Hook (2h)

```javascript
// En intro-screen.js, al cargar el juego:
function checkDailyBonus() {
  const lastDaily = parseInt(localStorage.getItem('lastDailyTime') || 0);
  const now = Date.now();
  const dayInMs = 86400000; // 24h

  if (now - lastDaily > dayInMs) {
    // Mostrar bonus
    const bonusModal = document.createElement('div');
    bonusModal.className = 'daily-bonus-modal';
    bonusModal.innerHTML = `
      <div class="modal-content">
        <h3>📅 BONUS DIARIO</h3>
        <p>+200 XP</p>
        <button onclick="showDailyBonusAd()">🎬 Ver AD</button>
        <button onclick="closeDailyBonus()">⏭️ Omitir</button>
      </div>
    `;
    document.body.appendChild(bonusModal);
  }
}

function showDailyBonusAd() {
  ADS_MANAGER.showRewardAd('daily_bonus', () => {
    STATE.meta.totalXP += 200;
    localStorage.setItem('lastDailyTime', Date.now());
    closeDailyBonus();
  });
}
```

**Checklist**:
- [ ] Modal bonus diario
- [ ] Reset cada 24h
- [ ] XP se suma correctamente

---

### T4.5: Analytics Hooks (2h)

Preparar posiciones para Firebase (no implementar aún):

```javascript
// modules/analytics.js
export class Analytics {
  trackEvent(eventName, params = {}) {
    // DEV: Log to console
    console.log(`[ANALYTICS] ${eventName}`, params);
    
    // PROD: Firebase
    // firebase.analytics().logEvent(eventName, params);
  }
}

// En game:
analytics.trackEvent('game_start', {
  difficulty: 'normal',
  class: 'warrior',
});

analytics.trackEvent('ad_shown', {
  type: 'revive',
  success: true,
});

analytics.trackEvent('game_over', {
  combates: 5,
  perks: 4,
  score: 1250,
});
```

**Checklist**:
- [ ] Hooks ready para Firebase
- [ ] Console logging en dev

---

### Deliverables Sprint 4

```
✅ AdsManager funcional (dev mode)
✅ Revive hook integrado
✅ Double reward hook integrado
✅ Daily bonus hook integrado
✅ Analytics hooks ready
✅ Dev mode permite juego sin ads
✅ Producción lista para AdMob real (solo cambiar URLs)
```

---

## 📱 SPRINT 5: MOBILE & OPTIMIZATION (SEMANAS 5–6)

**Objetivo**: Build capac itor, optimizar performance, testear dispositivo real  
**DRI**: Mobile Engineer  
**Effort**: 18 horas

### T5.1: Capacitor Setup (3h)

```bash
# Instalación
npm install @capacitor/core @capacitor/cli
npx cap init

# Configuración capacitor.config.ts
{
  appId: 'com.coliseo.roguelike',
  appName: 'Coliseo',
  webDir: 'ui',
  plugins: {
    AdMob: {
      APP_ID: 'ca-app-pub-xxxxxxxxxxxxxxxx',
      ANDROID_AD_UNIT_ID: 'ca-app-pub-...',
    },
  },
}

# Build
npm run build
npx cap add android
npx cap open android
```

**Checklist**:
- [ ] Proyecto Capacitor creado
- [ ] Android Studio abre proyecto
- [ ] Gradle sync exitoso

---

### T5.2: Performance Audit (4h)

```bash
# Lighthouse audit
npx lighthouse http://localhost:8080 --view

# Metrics to check:
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90

# Optimizations:
# - Minify JS/CSS
# - Lazy load images (nunca, solo 3)
# - Remove console logs en prod
# - Cache strategy localStorage
```

**Checklist**:
- [ ] Lighthouse score > 85
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

---

### T5.3: Memory Leak Testing (3h)

Usando Chrome DevTools:

```javascript
// Antes de cerrar combate, limpiar:
function cleanupBattle() {
  // Remover event listeners
  document.querySelectorAll('.btn-action').forEach(btn => {
    btn.onclick = null; // Remover
  });
  
  // Limpiar timers
  clearAllTimeouts();
  clearAllIntervals();
  
  // Remover referencias
  STATE.battle = null;
  BATTLE = null;
}
```

**Checklist**:
- [ ] No memory leaks en Chrome DevTools
- [ ] Juego funciona 30+ min sin lag
- [ ] RAM < 100MB en dispositivo

---

### T5.4: Android Build & Testing (5h)

```bash
# Build APK debugging
npx cap build android

# Generar APK:
# Android Studio → Build → Build Bundle(s) / APK(s) → Build APK(s)

# Transferir a dispositivo
adb install app-debug.apk

# Testeo:
# - Jugar 5 corridas
# - Ads mock funciona
# - Leaderboard guarda
# - Performance aceptable
```

**Devices para testear**:
- Pixel 4 (2160x1080, high-end)
- Pixel 3a (2220x1080, mid-range)
- Samsung A51 (2400x1080, mid-range)

**Checklist**:
- [ ] Instalación funciona en 3 dispositivos
- [ ] Sin crashes
- [ ] Touch response < 100ms
- [ ] Battery drain < 5% en 30 min de juego

---

### T5.5: Network Optimization (3h)

Para Capacitor + offline:

```javascript
// Service Worker for offline play
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    console.log('Service Worker registered');
  });
}

// En sw.js:
const CACHE_NAME = 'coliseo-v3';
const urlsToCache = [
  'index.html',
  'ui/style.css',
  'ui/modules/**/*.js',
  'assets/**/*',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});
```

**Checklist**:
- [ ] Juego funciona offline
- [ ] Cache strategy correcta
- [ ] localStorage sincroniza en línea

---

### Deliverables Sprint 5

```
✅ Proyecto Capacitor creado
✅ APK building funcional
✅ Performance audit passed
✅ Testeo en 3 dispositivos passed
✅ Sin memory leaks
✅ Offline mode funciona
```

---

## 🚀 SPRINT 6: LAUNCH PREP (SEMANAS 6–8)

**Objetivo**: Publicación Play Store, versión web definitiva  
**DRI**: Launch Manager  
**Effort**: 15–20 horas

### T6.1: Store Listing Preparation (4h)

**Play Store Metadata**:
```
Nombre: Coliseo Roguelike
Descripción corta: Combate por turnos con roguelike
Descripción larga: [300–4000 chars]
Categoría: Games
Contenido: +3 (batallas)
Calificación: PEGI 3

Screenshots:
- Pantalla inicio
- Combate
- Reward screen
- Leaderboard

Icon: 512x512 PNG
Banner: 1024x500 PNG
Video promo: 30s YouTube
```

**Checklist**:
- [ ] Todos los assets preparados
- [ ] Texto de descripción aprobado
- [ ] Screenshots revisados

---

### T6.2: Store Build & Release APK (4h)

```bash
# Generar signed APK
npx cap build android --prod

# En Android Studio:
# Build → Generate Signed App Bundle → Crear keystore → Build

# Verificar antes de subir:
# - versión >= 1.0.0
# - versionCode >= 1
# - Todas las permisos necesarios en AndroidManifest.xml
```

**AndroidManifest.xml**:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<!-- Para AdMob -->
```

**Checklist**:
- [ ] APK signed correctamente
- [ ] Versión 1.0.0
- [ ] Permisos configurados
- [ ] Min SDK 21, Target 33+

---

### T6.3: Play Store Submission (3h)

1. Crear cuenta Google Play Developer ($25)
2. Crear app en Play Console
3. Llenar metadata (descripción, screenshots, icono)
4. Subir APK / Bundle
5. Configurar precios (Gratis)
6. Aceptar términos Google Play
7. Submit para review

**Timeline**: 24–48h para approval

**Checklist**:
- [ ] App creada en Play Console
- [ ] Metadata completa
- [ ] APK/Bundle subida
- [ ] Termsaceptados

---

### T6.4: Web Version Final (3h)

Versión web en GitHub Pages:

```bash
# Deploy a GitHub Pages
git checkout -b gh-pages
cp ui/* .
git add .
git commit -m "v3.0-release"
git push origin gh-pages

# Habilitar en GitHub repo settings:
# Settings → Pages → Source: gh-pages
# URL: https://diana-bernardos.github.io/Coliseo_Python
```

**Checklist**:
- [ ] Web version en GitHub Pages
- [ ] HTTPS funciona
- [ ] localStorage funciona
- [ ] Ads mocking en web

---

### T6.5: Post-Launch Support (1h)

Crear roadmap público y comunicación:

```markdown
## Roadmap v3.1+

- [ ] Más enemigos (variados)
- [ ] Modo campaña (5 bosses)
- [ ] Leaderboard online (Supabase)
- [ ] Logros / Achievements
- [ ] Skins de arena
- [ ] Personajes adicionales

## Feedback
- Discord: [link]
- Twitter: @diana_coliseo
- Email: support@coliseo.dev
```

**Checklist**:
- [ ] Roadmap público
- [ ] Discord/social setup
- [ ] Email support disponible

---

### Deliverables Sprint 6

```
✅ App publicada en Play Store
✅ Web version en GitHub Pages
✅ 1.0.0 versión stable
✅ Documentación publica
✅ Community channels activos
```

---

## 📊 MÉTRICAS DE ÉXITO

### Métricas de Calidad

| Métrica | Target | Current |
|---------|--------|---------|
| Crashes (Play Store) | < 0.1% | N/A |
| Leaderboard entries | > 50 | N/A |
| Ads impressions/día | 100–500 | N/A |
| Retention D1 | > 30% | N/A |
| Retention D7 | > 10% | N/A |
| Lighthouse score | > 85 | 78 |
| Mobile FPS | 60 | 55 |

### Métricas de Monetización

| Métrica | Target |
|---------|--------|
| CPM (ad revenue) | $2–5 |
| Ad fill rate | > 70% |
| Revenue/user/month | $0.05–0.15 |
| MAU (Monthly Active Users) | 1000+ |
| Conversion ads | > 50% |

### Métricas de Engagement

| Métrica | Target |
|---------|--------|
| Sesiones/usuario | > 5 |
| Ejecuciones/sesión | > 3 |
| Duración promedio | 5 min |
| Score promedio | 1000+ |
| Perks coleccionados | 10+ |

---

## 📅 TIMELINE FINAL

```
SEMANA 1 (ABR 8–14):  Sprint 1 — Refactor Base
SEMANA 2 (ABR 15–21): Sprint 2 — Roguelike Core (Parte 1)
SEMANA 3 (ABR 22–28): Sprint 2 — Roguelike Core (Parte 2) + Sprint 3 (Inicio)
SEMANA 4 (ABR 29-MAY4): Sprint 3 — UI/UX + Sprint 4 (Inicio)
SEMANA 5 (MAY 5–11):  Sprint 4 — Monetización + Sprint 5 (Inicio)
SEMANA 6 (MAY 12–18): Sprint 5 — Mobile + Sprint 6 (Inicio)
SEMANA 7 (MAY 19–25): Sprint 6 — Launch Prep
SEMANA 8 (MAY 26–JUN1): Sprint 6 — Publishing + Support

🎯 LANCH TARGET: Finales de Mayo / Inicio Junio
```

---

## ✅ CHECKLIST FINAL

- [ ] Todos los sprints completados
- [ ] Tests passed (manual + automatizado)
- [ ] Documentación actualizada
- [ ] Deploy a producción exitoso
- [ ] Play Store approval obtenido
- [ ] Web version live en GitHub Pages
- [ ] Community channels activos
- [ ] Feedback inicial recolectado
- [ ] Roadmap v3.1 publicado
- [ ] Post-launch support in place

---

**Documento Roadmap v1.0** | 2026-04-06  
**Status**: Ready for Implementation  
**Next Step**: Iniciar Sprint 1 (Refactor Base)

