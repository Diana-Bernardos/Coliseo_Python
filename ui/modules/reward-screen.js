/**
 * REWARD SCREEN MODULE
 * Gestiona la pantalla de recompensas post-victoria
 * Permite al jugador seleccionar 1 de 3 perks
 */

import { getRewardPerks, PERKS_COMPLETE } from './roguelike-system.js';

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── SCREEN SETUP ───
export function initRewardScreen() {
  // Create reward screen in HTML if not exists
  if (!$('reward-screen')) {
    createRewardScreenHTML();
  }
}

function createRewardScreenHTML() {
  const body = document.body;
  const screen = document.createElement('div');
  screen.id = 'reward-screen';
  screen.className = 'screen';
  screen.innerHTML = `
    <div class="screen-content">
      <h1 style="text-align: center; margin-bottom: 30px;">🎉 ¡VICTORIA!</h1>
      
      <div class="reward-info" style="text-align: center; margin-bottom: 20px; color: #d0f7eb;"></div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <p style="font-size: 1.2rem; color: #4ecdc4;">Selecciona 1 mejora para tu próximo combate:</p>
      </div>
      
      <div id="reward-perks-container" style="
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin: 30px 0;
        justify-items: center;
      "></div>
      
      <div id="reward-continue-container" style="
        text-align: center;
        margin-top: 30px;
      "></div>
    </div>
  `;
  body.appendChild(screen);

  // Add CSS for reward screen
  addRewardScreenCSS();
}

function addRewardScreenCSS() {
  if (document.getElementById('reward-screen-styles')) return;

  const style = document.createElement('style');
  style.id = 'reward-screen-styles';
  style.textContent = `
    #reward-perks-container {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(3, minmax(180px, 1fr));
      gap: 18px;
      width: min(100%, 980px);
      margin: 0 auto;
    }

    @media (max-width: 840px) {
      #reward-perks-container {
        grid-template-columns: 1fr;
        gap: 14px;
      }
    }

    .reward-perk {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 2px solid #fff;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: center;
      min-width: 180px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .reward-perk:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      border-color: #ffd700;
    }

    .reward-perk-icon {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .reward-perk-name {
      font-weight: bold;
      font-size: 1.1rem;
      margin-bottom: 8px;
      color: #fff;
    }

    .reward-perk-rarity {
      font-size: 0.8rem;
      margin-bottom: 8px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .reward-perk-rarity.common { color: #aaa; }
    .reward-perk-rarity.uncommon { color: #4ecdc4; }
    .reward-perk-rarity.rare { color: #9d4edd; }
    .reward-perk-rarity.epic { color: #ffd700; }
    .reward-perk-rarity.legendary { color: #ff6348; }

    .reward-perk-description {
      font-size: 0.9rem;
      color: #e0e0e0;
      line-height: 1.4;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reward-perk.selected {
      border-color: #ffd700;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
      background: linear-gradient(135deg, #ff6348 0%, #e74c3c 100%);
    }

    .reward-continue-btn {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      color: white;
      border: none;
      padding: 15px 40px;
      font-size: 1.1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
    }

    .reward-continue-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(78, 205, 196, 0.5);
    }

    .reward-continue-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .reward-info {
      text-align: center;
      margin-bottom: 20px;
      color: #95e1d3;
      font-size: 0.95rem;
    }
  `;
  document.head.appendChild(style);
}

// ─── SHOW REWARD SCREEN ───
export async function showRewardScreen(run, stats) {
  const screen = $('reward-screen');
  if (!screen) {
    initRewardScreen();
    return showRewardScreen(run, stats);
  }

  // Get 3 reward perks based on run stats
  const rewards = getRewardPerks(run, 3);

  // Update stats display
  const runStats = run.getStats();

  if (rewards.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.style.color = '#ffcc80';
    emptyMessage.style.fontSize = '1rem';
    emptyMessage.style.padding = '24px';
    emptyMessage.style.background = 'rgba(255,255,255,0.05)';
    emptyMessage.style.borderRadius = '10px';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.textContent = 'No hay mejoras nuevas disponibles. Sigue la batalla con las habilidades actuales.';

    const container = $('reward-perks-container');
    container.innerHTML = '';
    container.appendChild(emptyMessage);
  }
  const infoDiv = screen.querySelector('.reward-info');
  if (infoDiv) {
    infoDiv.innerHTML = `
      <p>Racha: <strong>${runStats.wins} victorias</strong> | Perks: <strong>${runStats.perksCount}</strong></p>
      <p>Dificultad: <strong>${run.difficulty}</strong> | Puntuación total: <strong>${run.totalScore.toLocaleString()}</strong></p>
    `;
  }

  // Render perk cards
  const container = $('reward-perks-container');
  container.innerHTML = '';

  // Hide any other screen and ensure reward screen is the only active one
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  screen.classList.add('active');

  let selectedPerk = null;

  rewards.forEach((perk, index) => {
    const card = document.createElement('div');
    card.className = 'reward-perk';
    card.style.animationDelay = `${index * 0.1}s`;
    card.innerHTML = `
      <div class="reward-perk-icon">${perk.icon}</div>
      <div class="reward-perk-name">${perk.name}</div>
      <div class="reward-perk-rarity ${perk.rarity}">${perk.rarity}</div>
      <div class="reward-perk-description">${perk.description}</div>
    `;

    card.addEventListener('click', () => {
      // Deselect previous
      document.querySelectorAll('.reward-perk').forEach(c => c.classList.remove('selected'));
      // Select this one
      card.classList.add('selected');
      selectedPerk = perk.id;
    });

    container.appendChild(card);
  });

  // Show continue button (disabled until selection)
  const continueContainer = screen.querySelector('#reward-continue-container');
  continueContainer.innerHTML = `
    <button class="reward-continue-btn" id="reward-continue-btn" disabled>
      Selecciona una mejora para continuar...
    </button>
  `;

  const continueBtn = $('reward-continue-btn');

  return new Promise((resolve) => {
    continueBtn.disabled = true;
    continueBtn.onclick = async () => {
      if (rewards.length === 0) {
        continueBtn.textContent = 'Siguiendo...';
        continueBtn.disabled = true;
        continueBtn.onclick = null;
        await sleep(600);
        resolve(null);
        return;
      }
      if (!selectedPerk) return;
      run.selectPerk(selectedPerk);
      continueBtn.textContent = 'Siguiendo...';
      continueBtn.disabled = true;
      continueBtn.onclick = null;
      await sleep(600);
      resolve(selectedPerk);
    };

    if (rewards.length === 0) {
      continueBtn.disabled = false;
      continueBtn.textContent = 'Continuar al próximo combate';
    }

    document.querySelectorAll('.reward-perk').forEach(card => {
      card.addEventListener('click', () => {
        continueBtn.disabled = false;
        continueBtn.textContent = '✓ Continuar al próximo combate';
      });
    });

    // Show screen with fade in
    screen.classList.add('active');
  });
}

// ─── HIDE REWARD SCREEN ───
export function hideRewardScreen() {
  const screen = $('reward-screen');
  if (screen) {
    screen.classList.remove('active');
  }
}

// ─── STATS POPUP (Mostrar resumen de perks recolectados) ───
export function showPerksSummary(run) {
  const stats = run.getStats();

  if (stats.perksCount === 0) {
    return { message: 'Aún no tienes perks. ¡Gana tu primer combate!' };
  }

  const perksList = stats.perks.map(p => `  • ${p.icon} ${p.name} (${p.rarity})`).join('\n');

  return {
    title: `Perks Recolectados (${stats.perksCount})`,
    perks: perksList,
    totalScore: stats.totalScore,
    wins: stats.wins,
  };
}

// ─── RUN SUMMARY (Mostrar resumen de toda la run) ───
export function showRunSummary(run) {
  const stats = run.getStats();
  const duration = Math.floor(stats.duration / 1000); // Convert to seconds
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return {
    playerName: stats.playerName,
    playerClass: stats.playerClass,
    difficulty: stats.difficulty,
    wins: stats.wins,
    losses: stats.losses,
    totalScore: stats.totalScore,
    perksCount: stats.perksCount,
    durationText: `${minutes}:${String(seconds).padStart(2, '0')}`,
    perks: stats.perks.map(p => p.name),
  };
}
