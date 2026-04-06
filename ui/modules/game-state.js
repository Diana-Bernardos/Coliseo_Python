/**
 * GAME STATE MODULE
 * Centraliza y gestiona todo el estado del juego
 * v3.0 Ready: Puede ser serializado/deserializado para perks y meta-progresión
 */

const SAVE_KEY = 'coliseo_v3';

// ─── CONSTANTES ───
export const CLASS_STATS = {
  warrior: { hp: 130, shield: 12, icon: '⚔️', desc: 'Alta defensa, ataques consistentes' },
  mage:    { hp: 85,  shield: 4,  icon: '🔮', desc: 'Magia potente, curación superior' },
  rogue:   { hp: 100, shield: 7,  icon: '🗡️', desc: 'Alta esquiva, ataques críticos 20%' },
};

export const DIFFICULTY_MODS = {
  easy:   { orcHPMult: 0.75, orcDmgMult: 0.7,  smartWeight: 0.15 },
  normal: { orcHPMult: 1.0,  orcDmgMult: 1.0,  smartWeight: 0.40 },
  hard:   { orcHPMult: 1.35, orcDmgMult: 1.35, smartWeight: 0.75 },
};

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
    this.resetBattle();
  }

  resetBattle() {
    this.playerName = 'Guerrero';
    this.playerClass = 'warrior';
    this.difficulty = 'normal';

    // Player stats
    this.playerHP = 100;
    this.playerMaxHP = 100;
    this.playerShield = 10;
    this.playerAlive = true;
    this.furyCD = 0;
    this.magicCD = 0;
    this.shieldCD = 0;

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

  applyPlayerClass(classType) {
    const stats = CLASS_STATS[classType] || CLASS_STATS.warrior;
    this.playerClass = classType;
    this.playerHP = stats.hp;
    this.playerMaxHP = stats.hp;
    this.playerShield = stats.shield;
  }

  applyDifficulty(diff) {
    const mods = DIFFICULTY_MODS[diff] || DIFFICULTY_MODS.normal;
    this.difficulty = diff;
    this.orcMaxHP = Math.round(120 * mods.orcHPMult);
    this.orcHP = this.orcMaxHP;
  }

  incrementTurn() {
    this.turn++;
    return this.turn <= this.maxTurns;
  }

  tickCooldowns() {
    if (this.furyCD > 0) this.furyCD--;
    if (this.magicCD > 0) this.magicCD--;
    if (this.shieldCD > 0) this.shieldCD--;
  }

  addHistory(turn, action, playerName) {
    this.historial.push({ turn, action, playerName });
  }
}
