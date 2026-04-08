/**
 * GAME STATE MODULE
 * Centraliza y gestiona todo el estado del juego
 * v3.0 Ready: Puede ser serializado/deserializado para perks y meta-progresión
 */

const SAVE_KEY = 'coliseo_v3';

// ─── CONSTANTES ───
export const CLASS_STATS = {
  warrior: {
    hp: 130,
    shield: 12,
    icon: '⚔️',
    desc: 'Alta defensa, ataques consistentes',
    victoryMove: 'Levanta su espada en un poderoso rugido.',
  },
  mage: {
    hp: 85,
    shield: 4,
    icon: '🔮',
    desc: 'Magia potente, curación superior',
    victoryMove: 'Invoca un destello mágico brillante.',
  },
  rogue: {
    hp: 100,
    shield: 7,
    icon: '🗡️',
    desc: 'Alta esquiva, ataques críticos 20%',
    victoryMove: 'Hace una voltereta sigilosa y desaparece.',
  },
  ranger: {
    hp: 110,
    shield: 5,
    icon: '🏹',
    desc: 'Ataques a distancia rápidos y letales',
    victoryMove: 'Dispara una flecha al cielo como celebración.',
  },
};

export const WEAPON_DEFINITIONS = {
  sword: { name: 'Espada Larga', icon: '🗡️', description: 'Añade +4 daño de ataque físico.', damageBonus: 4 },
  staff: { name: 'Báculo Arcano', icon: '✨', description: 'Aumenta la magia y la curación.', damageBonus: 3 },
  dagger: { name: 'Daga Sombría', icon: '🗡️', description: 'Rápido y letal, +2 daño crítico.', damageBonus: 2 },
  bow: { name: 'Arco del Guardabosques', icon: '🏹', description: 'Ataques a distancia con +3 daño.', damageBonus: 3 },
};

export const BATTLEBACKGROUNDS = {
  forest: { label: 'Bosque Encantado', className: 'bg-forest', description: 'Arboledas hechizadas, niebla y ruinas olvidadas.', image: 'assets/background.png' },
  ruins: { label: 'Ruinas Antiguas', className: 'bg-ruins', description: 'Vestigios de una civilización perdida bajo el polvo.', image: 'assets/background.png' },
  lava: { label: 'Río de Lava', className: 'bg-lava', description: 'Corrientes ardientes y cenizas danzantes en el aire.', image: 'assets/background.png' },
  snow: { label: 'Campos de Nieve', className: 'bg-snow', description: 'Mesetas heladas donde la luz corta como cuchillo.', image: 'assets/nieve1.jpg' },
  battle2: { label: 'Arena Ígnea', className: 'bg-battle2', description: 'Un coliseo candente forjado en furia y fuego.', image: 'assets/batalla2.jpg' },
  battle3: { label: 'Templo Arcano', className: 'bg-battle3', description: 'Pilares místicos y sellos de magia ancestral.', image: 'assets/batalla3.jpg' },
  battle4: { label: 'Fortaleza Tenebrosa', className: 'bg-battle4', description: 'Murallas sombrías que susurran pactos de guerra.', image: 'assets/batalla4.jpg' },
  battle5: { label: 'Ruinas Sagradas', className: 'bg-battle5', description: 'Altares rotos y reliquias bendecidas por tormentas.', image: 'assets/batalla5.jpg' },
  inecraf1: { label: 'Caverna Cristal', className: 'bg-inecraf1', description: 'Galerías brillantes donde los cristales laten a cada paso.', image: 'assets/inecraf1.jpg' },
  nieve1: { label: 'Ventisca Helada', className: 'bg-nieve1', description: 'Un viento mortal que transforma el terreno en hielo.', image: 'assets/nieve1.jpg' },
};

export const PLAYER_SKINS = {
  classic: {
    label: 'Clásico',
    image: 'assets/warrior.jpg',
    description: 'Retrato estándar del campeón más icónico.',
    filter: 'none',
  },
  valor: {
    label: 'Coraza de Valor',
    image: 'assets/warrior.jpg',
    description: 'Armadura dorada con aura heroica.',
    filter: 'sepia(0.25) hue-rotate(180deg) saturate(1.2)',
  },
  sombra: {
    label: 'Guerrero Sombra',
    image: 'assets/warrior.jpg',
    description: 'Pátina oscura con energía sigilosa.',
    filter: 'brightness(0.85) contrast(1.1) saturate(0.8)',
  },
  berserker: {
    label: 'Berserker',
    image: 'assets/shrek.jpg',
    description: 'Furia brutal con mirada salvaje.',
    filter: 'contrast(1.2) saturate(1.3)',
  },
  místico: {
    label: 'Místico',
    image: 'assets/yoda.jpg',
    description: 'Sabiduría ancestral y poder interno.',
    filter: 'brightness(1.05) saturate(1.1)',
  },
  diplomático: {
    label: 'Diplomático',
    image: 'assets/leia.jpg',
    description: 'Presencia serena con liderazgo nato.',
    filter: 'contrast(1.05) saturate(1.05)',
  },
  cómico: {
    label: 'Cómodo',
    image: 'assets/jarjar.jpg',
    description: 'Estilo divertido y desenfadado en el campo.',
    filter: 'brightness(1.05) saturate(1.3)',
  },
  once: {
    label: 'Once',
    image: 'assets/once.jpg',
    description: 'Misterioso aspecto de energía resurgente.',
    filter: 'contrast(1.1) hue-rotate(10deg)',
  },
};

export const DIFFICULTY_MODS = {
  easy:   { orcHPMult: 0.75, orcDmgMult: 0.7,  smartWeight: 0.15 },
  normal: { orcHPMult: 1.0,  orcDmgMult: 1.0,  smartWeight: 0.40 },
  hard:   { orcHPMult: 1.35, orcDmgMult: 1.35, smartWeight: 0.75 },
  insane: { orcHPMult: 1.70, orcDmgMult: 1.50, smartWeight: 0.90 },
};

export function getDifficultyModifiers(diff) {
  return DIFFICULTY_MODS[diff] || DIFFICULTY_MODS.normal;
}

// ─── PERSISTENT STATS (Leaderboard, Streaks) ───
export class PersistentStats {
  constructor() {
    this.load();
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
      this.wins = saved.wins ? Math.max(saved.wins, 0) : 0;
      this.losses = saved.losses ? Math.max(saved.losses, 0) : 0;
      this.draws = saved.draws ? Math.max(saved.draws, 0) : 0;
      this.streak = saved.streak ? Math.max(saved.streak, 0) : 0;
      this.bestStreak = saved.bestStreak ? Math.max(saved.bestStreak, 0) : 0;
      this.scores = Array.isArray(saved.scores) ? saved.scores.slice(0, 10) : [];
    } catch (e) {
      this.wins = 0; this.losses = 0; this.draws = 0; this.streak = 0; this.bestStreak = 0; this.scores = [];
    }
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        wins: this.wins,
        losses: this.losses,
        draws: this.draws,
        streak: this.streak,
        bestStreak: this.bestStreak,
        scores: this.scores,
      }));
    } catch (e) {}
  }

  recordWin(playerName, score, difficulty) {
    this.wins++;
    this.streak++;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this.scores.push({ name: playerName, score, diff: difficulty });
    this.scores.sort((a, b) => b.score - a.score);
    if (this.scores.length > 10) this.scores = this.scores.slice(0, 10);
    this.save();
  }

  recordLoss() {
    this.losses++;
    this.streak = 0;
    this.save();
  }

  recordDraw() {
    this.draws++;
    this.streak = 0;
    this.save();
  }
}

// ─── GAME STATE (Battle) ───
export class GameState {
  constructor() {
    this.playerConfig = this.createDefaultPlayerConfig();
    this.resetBattle();
  }

  createDefaultPlayerConfig() {
    return {
      playerName: 'Guerrero',
      playerClass: 'warrior',
      playerWeapon: 'sword',
      playerSkin: 'classic',
      battleBackground: 'forest',
      difficulty: 'normal',
    };
  }

  resetBattle() {
    // Player stats
    this.playerHP = 100;
    this.playerMaxHP = 100;
    this.playerShield = 10;
    this.playerAlive = true;
    this.furyCD = 0;
    this.magicCD = 0;
    this.shieldCD = 0;

    // Weapon / perk / bonus state
    this.weaponDamageBonus = 0;
    this.damageBonus = 0;
    this.defenseBonus = 0;
    this.critChance = 0;
    this.critMultiplier = 1.8;
    this.extraDodgeChance = 0;
    this.blockMultiplier = 1.5;
    this.lifestealPercent = 0;
    this.healBonus = 0;
    this.regenPerTurn = 0;
    this.shieldPersistent = false;
    this.magicCDReduction = 0;
    this.furyCDReduction = 0;
    this.shieldCDReduction = 0;
    this.allCDReduction = 0;
    this.furyBonus = 0;
    this.highHealthBonus = 0;
    this.berserk = false;
    this.furyChain = false;
    this.shieldReflect = 0;
    this.desperateMode = false;
    this.carryOverDamage = false;
    this.accumulatedDamage = 0;
    this.secondWind = false;
    this.secondWindUsed = false;

    // Orc stats
    this.orcHP = 120;
    this.orcMaxHP = 120;
    this.orcShield = 5;
    this.orcAlive = true;
    this.orcFury = 0;

    // Battle tracking
    this.turn = 1;
    this.maxTurns = 15;
    this.historial = [];
    this.busy = false;
    this.score = 0;
  }

  get playerName() {
    return this.playerConfig.playerName;
  }

  set playerName(value) {
    this.playerConfig.playerName = value;
  }

  get playerClass() {
    return this.playerConfig.playerClass;
  }

  set playerClass(value) {
    this.playerConfig.playerClass = value;
  }

  get playerWeapon() {
    return this.playerConfig.playerWeapon;
  }

  set playerWeapon(value) {
    this.playerConfig.playerWeapon = value;
  }

  get playerSkin() {
    return this.playerConfig.playerSkin;
  }

  set playerSkin(value) {
    this.playerConfig.playerSkin = value;
  }

  get battleBackground() {
    return this.playerConfig.battleBackground;
  }

  set battleBackground(value) {
    this.playerConfig.battleBackground = value;
  }

  get difficulty() {
    return this.playerConfig.difficulty;
  }

  set difficulty(value) {
    this.playerConfig.difficulty = value;
  }

  applyPlayerConfig(config = {}) {
    this.playerConfig = {
      ...this.playerConfig,
      ...config,
    };
  }

  getPlayerConfig() {
    return { ...this.playerConfig };
  }

  applyPlayerClass(classType) {
    const stats = CLASS_STATS[classType] || CLASS_STATS.warrior;
    this.playerClass = classType;
    this.playerHP = stats.hp;
    this.playerMaxHP = stats.hp;
    this.playerShield = stats.shield;
    this.playerVictoryMove = stats.victoryMove || '';
  }

  applyWeapon(weaponId) {
    const weapon = WEAPON_DEFINITIONS[weaponId] || WEAPON_DEFINITIONS.sword;
    this.playerWeapon = weaponId;
    this.weaponDamageBonus = weapon.damageBonus || 0;
  }

  setBattleBackground(backgroundId) {
    this.battleBackground = backgroundId;
  }

  getVictoryAction() {
    const charDef = CLASS_STATS[this.playerClass] || CLASS_STATS.warrior;
    const weaponDef = WEAPON_DEFINITIONS[this.playerWeapon] || WEAPON_DEFINITIONS.sword;
    return `${charDef.victoryMove} Celebró con su ${weaponDef.name}.`;
  }

  applyDifficulty(diff) {
    const validDifficulty = DIFFICULTY_MODS[diff] ? diff : 'normal';
    const mods = getDifficultyModifiers(validDifficulty);
    this.difficulty = validDifficulty;
    this.orcMaxHP = Math.round(120 * mods.orcHPMult);
    this.orcHP = this.orcMaxHP;
  }

  incrementTurn() {
    this.turn++;
    return this.turn <= this.maxTurns;
  }

  tickCooldowns() {
    const extra = this.allCDReduction || 0;
    if (this.furyCD > 0) this.furyCD = Math.max(0, this.furyCD - 1 - extra);
    if (this.magicCD > 0) this.magicCD = Math.max(0, this.magicCD - 1 - extra);
    if (this.shieldCD > 0) this.shieldCD = Math.max(0, this.shieldCD - 1 - extra);
  }

  addHistory(turn, action, playerName) {
    this.historial.push({ turn, action, playerName });
  }
}
