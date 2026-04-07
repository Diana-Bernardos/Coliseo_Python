export function updateRoguelikeButton(getRoguelikeMode, getById) {
  const btnRoguelike = getById('btn-roguelike-toggle');
  if (!btnRoguelike) return;
  const enabled = getRoguelikeMode();
  btnRoguelike.textContent = `Modo Roguelike: ${enabled ? 'ON' : 'OFF'}`;
  btnRoguelike.classList.toggle('selected', enabled);
}

export function updateDailyBonusButton(getById) {
  const btnDailyBonus = getById('btn-daily-bonus');
  if (!btnDailyBonus) return;
  const lastClaim = localStorage.getItem('DAILY_AD_CLAIM') || '0';
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const available = now - parseInt(lastClaim, 10) >= dayMs;
  btnDailyBonus.disabled = !available;
  btnDailyBonus.textContent = available ? 'Bonus Diario' : 'Bonus Reclamado';
}

export function bindMenuControls({
  getById,
  getRoguelikeMode,
  setRoguelikeMode,
  claimDailyBonus,
  analytics,
  refreshDailyBonus,
}) {
  const btnRoguelike = getById('btn-roguelike-toggle');
  const btnDailyBonus = getById('btn-daily-bonus');

  if (btnDailyBonus) {
    btnDailyBonus.addEventListener('click', async () => {
      await claimDailyBonus();
      refreshDailyBonus();
    });
  }

  if (btnRoguelike) {
    btnRoguelike.addEventListener('click', () => {
      setRoguelikeMode(!getRoguelikeMode());
      analytics.trackEvent('toggles_roguelike_mode', { enabled: getRoguelikeMode() });
    });
  }
}
