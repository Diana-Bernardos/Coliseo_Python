/**
 * UI RENDERER MODULE
 * Encapsula toda la lógica de renderización y actualización del DOM
 */

import { WEAPON_DEFINITIONS, PLAYER_SKINS } from './game-state.js';

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── HELPERS ───
export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── BATTLE LOG ───
export function addLog(message, type = '') {
  const log = $('battle-log');
  if (!log) return;
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = message;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// ─── FLOATING DAMAGE NUMBERS ───
export function spawnFloatingNumber(who, value, type = 'damage') {
  const card = who === 'warrior' ? $('card-warrior') : $('card-orc');
  if (!card) return;

  const el = document.createElement('div');
  el.className = `floating-number float-${type}`;
  const prefix = type === 'heal' ? '+' : (type === 'dodge' ? '' : '-');
  el.textContent = prefix + (typeof value === 'number' ? value : value);
  el.style.left = (30 + rand(10, 40)) + '%';
  el.style.top = '20%';
  card.style.position = 'relative';
  card.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

// ─── HP BARS ───
export function updateHP(state) {
  const wPct = Math.max(0, (state.playerHP / state.playerMaxHP) * 100);
  const wBar = $('warrior-hp-bar');
  if (wBar) {
    wBar.style.transition = 'width 0.6s cubic-bezier(0.4,0,0.2,1), background-color 0.4s';
    wBar.style.width = wPct + '%';
    wBar.classList.remove('danger', 'warning');
    if (wPct <= 25) wBar.classList.add('danger');
    else if (wPct <= 50) wBar.classList.add('warning');
  }
  const whpVal = $('warrior-hp-value');
  if (whpVal) whpVal.textContent = `${Math.max(0, state.playerHP)} / ${state.playerMaxHP}`;

  const oPct = Math.max(0, (state.orcHP / state.orcMaxHP) * 100);
  const oBar = $('orc-hp-bar');
  if (oBar) {
    oBar.style.transition = 'width 0.6s cubic-bezier(0.4,0,0.2,1), background-color 0.4s';
    oBar.style.width = oPct + '%';
    oBar.classList.remove('danger', 'warning');
    if (oPct <= 25) oBar.classList.add('danger');
    else if (oPct <= 50) oBar.classList.add('warning');
  }
  const ohpVal = $('orc-hp-value');
  if (ohpVal) ohpVal.textContent = `${Math.max(0, state.orcHP)} / ${state.orcMaxHP}`;

  const orcFury = $('orc-fury');
  if (orcFury) orcFury.textContent = state.orcFury;

  const shield = $('warrior-shield');
  if (shield) shield.textContent = state.playerShield;
}

// ─── COOLDOWN UI ───
export function updateCooldownUI(state) {
  const cds = {
    'btn-fury': state.furyCD,
    'btn-magic': state.magicCD,
    'btn-shield': state.shieldCD,
  };

  for (const [id, cd] of Object.entries(cds)) {
    const btn = $(id);
    if (!btn) continue;

    const badge = btn.querySelector('.cooldown-badge');
    if (cd > 0) {
      btn.classList.add('on-cooldown');
      if (badge) badge.textContent = cd;
    } else {
      btn.classList.remove('on-cooldown');
      if (badge) badge.textContent = '';
    }
  }
}

// ─── ACTION BUTTONS ───
export function setActionButtons(enabled) {
  const btnIds = ['btn-attack', 'btn-fury', 'btn-magic', 'btn-shield'];
  btnIds.forEach(id => {
    const btn = $(id);
    if (!btn) return;
    btn.disabled = !enabled;
  });
  const panel = $('action-panel');
  if (panel) panel.style.display = enabled ? 'block' : 'none';
}

export function showWaiting(show) {
  const panel = $('waiting-panel');
  if (panel) panel.classList.toggle('hidden', !show);
}

// ─── ANIMATIONS ───
export function shakeCard(who) {
  const card = who === 'warrior' ? $('card-warrior') : $('card-orc');
  if (!card) return;
  card.classList.remove('shake');
  void card.offsetWidth; // Trigger reflow
  card.classList.add('shake');
  setTimeout(() => card.classList.remove('shake'), 500);
}

export function healEffect(who) {
  const card = who === 'warrior' ? $('card-warrior') : $('card-orc');
  if (!card) return;
  card.classList.remove('heal-flash');
  void card.offsetWidth;
  card.classList.add('heal-flash');
  setTimeout(() => card.classList.remove('heal-flash'), 600);
}

export function showPerkNotification(perkName) {
  const notification = document.createElement('div');
  notification.className = 'perk-notification';
  notification.innerHTML = `
    <span class="notif-icon">✨</span>
    <div>
      <div><strong>Perk adquirido:</strong></div>
      <div>${perkName}</div>
    </div>
  `;

  document.body.appendChild(notification);
  requestAnimationFrame(() => notification.classList.add('show'));

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 400);
  }, 2600);
}

// ─── TURN OVERLAY ───
export async function showTurnOverlay(who, state) {
  const overlay = $('turn-overlay');
  const img = $('turn-portrait-img');
  const text = $('turn-text');

  if (!overlay || !img || !text) return;

  overlay.classList.remove('hidden');

  if (who === 'warrior') {
    const skin = PLAYER_SKINS[state.playerSkin] || PLAYER_SKINS.classic;
    img.src = skin.image;
    img.style.filter = skin.filter || 'none';
    text.textContent = `⚔️ TURNO DE ${state.playerName.toUpperCase()} · ${skin.label.toUpperCase()}`;
    text.className = 'turn-text warrior-text';
    const portraitW = $('portrait-warrior');
    const portraitO = $('portrait-orc');
    if (portraitW) portraitW.classList.add('active-turn');
    if (portraitO) portraitO.classList.remove('active-turn');
  } else {
    img.src = 'assets/orc.jpg';
    img.style.filter = 'none';
    text.textContent = '🔥 TURNO DE THRALL';
    text.className = 'turn-text orc-text';
    const portraitO = $('portrait-orc');
    const portraitW = $('portrait-warrior');
    if (portraitO) portraitO.classList.add('active-turn');
    if (portraitW) portraitW.classList.remove('active-turn');
  }

  await sleep(1400);
  overlay.classList.add('hidden');
}

export function updateBattleBackground(state) {
  const battleBg = $('battle-bg');
  if (!battleBg) return;
  const classes = ['bg-forest', 'bg-ruins', 'bg-lava', 'bg-snow', 'bg-battle2', 'bg-battle3', 'bg-battle4', 'bg-battle5', 'bg-inecraf1', 'bg-nieve1'];
  battleBg.classList.remove(...classes);
  if (state.battleBackground) {
    battleBg.classList.add(`bg-${state.battleBackground}`);
  }
}

export function updateWeaponOverlay(state) {
  const overlay = $('weapon-overlay');
  if (!overlay) return;

  const weapon = WEAPON_DEFINITIONS[state.playerWeapon];
  if (weapon) {
    overlay.textContent = weapon.icon;
    overlay.classList.add('visible');
  } else {
    overlay.classList.remove('visible');
  }
}

export function updatePlayerSkin(state) {
  const portraitW = $('portrait-warrior');
  const turnImg = $('turn-portrait-img');
  const previewImg = $('skin-preview-image');
  const previewName = $('skin-preview-name');
  const previewDesc = $('skin-preview-desc');
  const skinNameLabel = $('warrior-skin-name');
  const skin = PLAYER_SKINS[state.playerSkin] || PLAYER_SKINS.classic;

  if (portraitW) {
    portraitW.innerHTML = `
      <img src="${skin.image}" alt="${skin.label}" />
      <div class="active-frame warrior-frame"></div>
      <div id="weapon-overlay" class="weapon-overlay"></div>
      <span id="warrior-class-icon" class="class-badge"></span>
    `;
    const img = portraitW.querySelector('img');
    if (img) img.style.filter = skin.filter || 'none';
  }

  if (turnImg) {
    turnImg.src = skin.image;
    turnImg.style.filter = skin.filter || 'none';
  }

  if (previewImg) {
    previewImg.src = skin.image;
    previewImg.alt = skin.label;
    previewImg.style.filter = skin.filter || 'none';
  }

  if (previewName) previewName.textContent = skin.label;
  if (previewDesc) previewDesc.textContent = skin.description;
  if (skinNameLabel) skinNameLabel.textContent = skin.label.toUpperCase();
}

// ─── SCREEN TRANSITIONS ───
export function showScreen(screenName) {
  const screens = ['intro-screen', 'battle-screen', 'end-screen', 'reward-screen'];
  screens.forEach(screen => {
    const el = $(screen);
    if (el) el.classList.toggle('active', el.id === screenName);
  });
}

// ─── LEADERBOARD ───
export function renderLeaderboard(stats) {
  const lb = $('leaderboard-list');
  if (!lb) return;

  lb.innerHTML = '';
  if (stats.scores.length === 0) {
    lb.innerHTML = '<p style="opacity:0.5;font-size:0.8rem;text-align:center;margin:20px 0">Sin registros aún</p>';
    return;
  }

  stats.scores.slice(0, 5).forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row';
    row.style.animationDelay = `${i * 0.1}s`;
    row.style.animation = 'slideInLeft 0.5s ease forwards';
    row.style.opacity = '0';

    const medal = ['🥇', '🥈', '🥉', '4.', '5.'][i];
    const rankClass = i < 3 ? 'top-rank' : '';
    const scoreFormatted = entry.score.toLocaleString();

    row.innerHTML = `
      <span class="lb-rank ${rankClass}">${medal}</span>
      <span class="lb-name">${entry.name}</span>
      <span class="lb-diff diff-${entry.diff}">${entry.diff.toUpperCase()}</span>
      <span class="lb-score">${scoreFormatted}</span>
    `;

    lb.appendChild(row);
  });
}

// ─── END GAME SCREEN ───
export function renderEndScreen(state, winner) {
  const endPortrait = $('result-portrait');
  const resultTitle = $('result-title');
  const resultSub = $('result-subtitle');
  const endLog = $('end-log');

  if (!endPortrait || !resultTitle || !resultSub || !endLog) return;

  // Clear previous history
  endLog.innerHTML = '';

  if (winner === 'warrior') {
    const skin = PLAYER_SKINS[state.playerSkin] || PLAYER_SKINS.classic;
    endPortrait.innerHTML = `<img src="${skin.image}" alt="${skin.label} Victorioso"/>`;
    const endImg = endPortrait.querySelector('img');
    if (endImg) endImg.style.filter = skin.filter || 'none';
    resultTitle.textContent = `⚔️ ¡VICTORIA!`;
    resultSub.textContent = `¡${state.playerName} ha derrotado a Thrall! Puntuación: ${state.score.toLocaleString()}`;
    const resultAction = $('result-action');
    if (resultAction) {
      resultAction.textContent = state.getVictoryAction ? state.getVictoryAction() : `Celebró su victoria con estilo.`;
    }
  } else if (winner === 'orc') {
    endPortrait.innerHTML = `<img src="assets/orc.jpg" alt="Thrall Victorioso"/>`;
    resultTitle.textContent = `💀 DERROTA`;
    resultSub.textContent = `${state.playerName} ha sido vencido por Thrall...`;
  } else {
    endPortrait.innerHTML = `<img src="assets/background.png" alt="Empate"/>`;
    resultTitle.textContent = `⚖️ EMPATE`;
    resultSub.textContent = `El combate terminó sin un vencedor...`;
  }

  // Render history with icons
  state.historial.forEach(evt => {
    let icon = '⚔️';
    if (evt.action.includes('FURIA')) icon = '🔥';
    else if (evt.action.includes('Magia')) icon = '✨';
    else if (evt.action.includes('Escudo')) icon = '🛡️';
    else if (evt.action.includes('Ataque')) icon = '🗡️';

    const item = document.createElement('div');
    item.className = 'history-item';

    const badge = document.createElement('span');
    badge.className = 'history-icon';
    badge.textContent = icon;

    const text = document.createElement('div');
    text.className = 'history-text';
    text.innerHTML = `<strong>T${evt.turn}</strong> ${evt.action}`;

    item.appendChild(badge);
    item.appendChild(text);
    endLog.appendChild(item);
  });
}

// ─── STATS UI ───
export function updateStatsUI(stats) {
  const winEl = $('stat-wins');
  const lossEl = $('stat-losses');
  const streakEl = $('stat-best-streak');

  if (winEl) winEl.textContent = stats.wins;
  if (lossEl) lossEl.textContent = stats.losses;
  if (streakEl) streakEl.textContent = stats.bestStreak;
}
