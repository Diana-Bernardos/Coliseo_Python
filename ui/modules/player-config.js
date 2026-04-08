import {
  CLASS_STATS,
  DIFFICULTY_MODS,
  WEAPON_DEFINITIONS,
  BATTLEBACKGROUNDS,
  PLAYER_SKINS,
} from './game-state.js';

const CONFIG_KEY = 'coliseo_v3_config';
const SKIN_CHARACTER_NAMES = {
  classic: 'Uthred',
  valor: 'Uthred',
  sombra: 'Uthred',
  berserker: 'Shrek',
  mistico: 'Yoda',
  diplomatico: 'Leia',
  comico: 'Jar Jar',
  once: 'Once',
  'místico': 'Yoda',
  'diplomático': 'Leia',
  'cómico': 'Jar Jar',
};

export function getCharacterNameForSkin(skinId) {
  return SKIN_CHARACTER_NAMES[skinId] || 'Uthred';
}

export function loadPlayerConfig(state, roguelikeModeRef) {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
    state.applyPlayerConfig({
      playerName: saved.playerName || state.playerName,
      playerClass: saved.playerClass && CLASS_STATS[saved.playerClass] ? saved.playerClass : state.playerClass,
      playerWeapon: saved.playerWeapon && WEAPON_DEFINITIONS[saved.playerWeapon] ? saved.playerWeapon : state.playerWeapon,
      playerSkin: saved.playerSkin && PLAYER_SKINS[saved.playerSkin] ? saved.playerSkin : state.playerSkin,
      battleBackground: saved.battleBackground && BATTLEBACKGROUNDS[saved.battleBackground] ? saved.battleBackground : state.battleBackground,
      difficulty: saved.difficulty && DIFFICULTY_MODS[saved.difficulty] ? saved.difficulty : state.difficulty,
    });
    if (typeof saved.roguelikeMode === 'boolean') {
      roguelikeModeRef.set(saved.roguelikeMode);
    }
    return saved;
  } catch (e) {
    return {};
  }
}

export function savePlayerConfig(state, getPlayerName, getRoguelikeMode) {
  try {
    const config = state.getPlayerConfig();
    localStorage.setItem(CONFIG_KEY, JSON.stringify({
      ...config,
      playerName: getPlayerName() || config.playerName || '',
      roguelikeMode: getRoguelikeMode(),
    }));
  } catch (e) {}
}

export function selectClass(state, cls, getById, saveConfig) {
  state.playerClass = cls;
  document.querySelectorAll('.class-btn').forEach(b =>
    b.classList.toggle('selected', b.dataset.class === cls)
  );
  const s = CLASS_STATS[cls];
  const preview = getById('class-preview');
  if (preview) preview.innerHTML = `<span>${s.icon}</span> <strong>${cls.toUpperCase()}</strong>: ${s.desc}`;
  saveConfig();
}

export function selectDifficulty(state, diff, saveConfig) {
  state.difficulty = DIFFICULTY_MODS[diff] ? diff : 'normal';
  document.querySelectorAll('.diff-btn').forEach(b =>
    b.classList.toggle('selected', b.dataset.diff === state.difficulty)
  );
  saveConfig();
}

export function selectWeapon(state, weaponId, getById, saveConfig) {
  state.playerWeapon = weaponId;
  const weaponSelect = getById('weapon-options');
  if (weaponSelect) {
    weaponSelect.value = weaponId;
  }
  const weaponInfo = WEAPON_DEFINITIONS[weaponId];
  const preview = getById('weapon-preview');
  if (preview && weaponInfo) {
    preview.textContent = `${weaponInfo.icon} ${weaponInfo.name}: ${weaponInfo.description}`;
  }
  saveConfig();
}

export function selectBackground(state, backgroundId, getById, saveConfig) {
  state.battleBackground = backgroundId;
  const bgSelect = getById('background-options');
  if (bgSelect) {
    bgSelect.value = backgroundId;
  }
  const preview = getById('background-preview');
  const bgInfo = BATTLEBACKGROUNDS[backgroundId];
  if (preview && bgInfo) {
    preview.textContent = `${bgInfo.label} - ${bgInfo.description}`;
  }
  saveConfig();
}

export function selectSkin(state, skinId, getById, uiRenderer, saveConfig) {
  const previousDefaultName = getCharacterNameForSkin(state.playerSkin);
  state.playerSkin = skinId;
  const skinSelect = getById('skin-options');
  if (skinSelect) {
    skinSelect.value = skinId;
  }
  const nameInput = getById('player-name');
  const nextDefaultName = getCharacterNameForSkin(skinId);
  if (nameInput) {
    const currentValue = nameInput.value.trim();
    if (!currentValue || currentValue === previousDefaultName || currentValue === 'Uthred') {
      nameInput.value = nextDefaultName;
    }
  }
  const preview = getById('skin-preview');
  const previewCharacter = getById('skin-preview-character');
  const skinInfo = PLAYER_SKINS[skinId];
  if (preview && skinInfo) {
    preview.textContent = `${skinInfo.label} - ${skinInfo.description}`;
  }
  if (previewCharacter) {
    previewCharacter.textContent = `Personaje: ${nextDefaultName}`;
  }
  uiRenderer.updatePlayerSkin(state);
  saveConfig();
}

export function renderSkinOptions(state, getById) {
  const skinSelect = getById('skin-options');
  if (!skinSelect) return;

  // Clear existing options except the placeholder
  skinSelect.innerHTML = '<option value="">Selecciona una skin...</option>';

  Object.entries(PLAYER_SKINS).forEach(([id, skin]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${skin.label} - ${skin.description}`;
    if (state.playerSkin === id) {
      option.selected = true;
    }
    skinSelect.appendChild(option);
  });
}

export function renderSelectionOptions(state, getById, onSelectWeapon) {
  const weaponSelect = getById('weapon-options');
  const bgSelect = getById('background-options');

  if (weaponSelect) {
    weaponSelect.innerHTML = '<option value="">Selecciona un arma...</option>';
    Object.entries(WEAPON_DEFINITIONS).forEach(([id, weapon]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = `${weapon.icon} ${weapon.name}: ${weapon.description}`;
      if (state.playerWeapon === id) {
        option.selected = true;
      }
      weaponSelect.appendChild(option);
    });
    weaponSelect.addEventListener('change', (e) => onSelectWeapon(e.target.value));
  }

  if (bgSelect) {
    bgSelect.innerHTML = '<option value="">Selecciona un campo de batalla...</option>';
    Object.entries(BATTLEBACKGROUNDS).forEach(([id, bg]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = `${bg.label} - ${bg.description}`;
      if (state.battleBackground === id) {
        option.selected = true;
      }
      bgSelect.appendChild(option);
    });
  }
}
