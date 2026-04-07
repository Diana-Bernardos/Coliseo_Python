/**
 * ADS MANAGER MODULE
 * Gestiona integración de anuncios (v3.0 ready para Google AdMob)
 */

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export class AdsManager {
  constructor(isProduction = false) {
    this.isProduction = isProduction;
    this.adUnitIds = {
      banner: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx', // TODO: Replace with real IDs
      interstitial: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
      rewarded: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    };
  }

  /**
   * Show interstitial ad after battle end
   * v3.0: Integra Google AdMob
   */
  async showInterstitialAd() {
    if (!this.isProduction) {
      console.log('[ADS] Interstitial ad would show here');
      await sleep(400);
      return true;
    }

    try {
      // Google AdMob plugin (future)
      /*
      if (window.admob) {
        await admob.interstitial.load({ adUnitId: this.adUnitIds.interstitial });
        await admob.interstitial.show();
      }
      */
      return true;
    } catch (e) {
      console.error('Ad error:', e);
      return false;
    }
  }

  /**
   * Show rewarded ad for revival / double reward
   * Returns true if user watched full ad
   */
  async showRewardedAd(rewardType = 'revive') {
    if (!this.isProduction) {
      const adLabel = this.getAdUnitId(rewardType);
      console.log(`[ADS] Rewarded ad (${rewardType}) would show here -> ${adLabel}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return true; // Simulate success in dev mode
    }

    try {
      // Google AdMob plugin (future)
      /*
      if (window.admob) {
        await admob.rewarded.load({ adUnitId: this.getAdUnitId(rewardType) });
        await admob.rewarded.show();
        return true;
      }
      */
      return true;
    } catch (e) {
      console.error('Rewarded ad error:', e);
      return false;
    }
  }

  getAdUnitId(reason = 'rewarded') {
    return {
      revive: this.adUnitIds.rewarded,
      'double-reward': this.adUnitIds.rewarded,
      'daily-bonus': this.adUnitIds.rewarded,
      interstitial: this.adUnitIds.interstitial,
      banner: this.adUnitIds.banner,
      rewarded: this.adUnitIds.rewarded,
    }[reason] || this.adUnitIds.rewarded;
  }

  /**
   * Show banner ad (persistent, non-intrusive)
   */
  async showBannerAd() {
    if (!this.isProduction) {
      let banner = document.getElementById('ad-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'ad-banner';
        banner.className = 'ad-banner';
        banner.innerHTML = `<span>📣 Mock Ad — Monetización activa (dev mode)</span>`;
        document.body.appendChild(banner);
      }
      banner.classList.add('visible');
      console.log('[ADS] Banner ad mock visible');
      return true;
    }

    try {
      // Google AdMob plugin (future)
      /*
      if (window.admob) {
        await admob.banner.load({ adUnitId: this.adUnitIds.banner });
        await admob.banner.show();
      }
      */
      return true;
    } catch (e) {
      console.error('Banner ad error:', e);
      return false;
    }
  }

  /**
   * Hide banner ad
   */
  async hideBannerAd() {
    try {
      const banner = document.getElementById('ad-banner');
      if (banner) {
        banner.classList.remove('visible');
      }
      // Google AdMob plugin (future)
      /*
      if (window.admob) {
        await admob.banner.hide();
      }
      */
    } catch (e) {
      console.error('Hide banner error:', e);
    }
  }

  /**
   * Check if ad is ready to show
   */
  async isAdReady() {
    return this.isProduction; // Simplified for v2.0
  }
}

// ─── MONETIZATION HOOKS ───

/**
 * Hook 1: Show interstitial after battle end
 * Usually after 2-3 battles to avoid ad fatigue
 */
export function shouldShowInterstitial(battleCount = 0) {
  return battleCount > 0 && battleCount % 3 === 0;
}

/**
 * Hook 2: Offer revive with ad (double HP)
 * Shows when player loses
 */
export async function offerReviveWithAd(adsManager) {
  const userAccepts = confirm('Ver anuncio para revivir con 30% salud?');
  if (userAccepts) {
    const watched = await adsManager.showRewardedAd('revive');
    if (watched) {
      return 0.30; // Revive with 30% HP
    }
  }
  return 0;
}

/**
 * Hook 3: Double reward offer (after victory)
 * Gives 2x score for watching ad
 */
export async function offerDoubleRewardWithAd(adsManager, score) {
  const userAccepts = confirm('Ver anuncio para duplicar recompensa?');
  if (userAccepts) {
    const watched = await adsManager.showRewardedAd('double-reward');
    if (watched) {
      return score * 2;
    }
  }
  return score;
}

/**
 * Hook 4: Daily bonus with ad
 * Claim free bonus by watching short ad daily
 */
export async function claimDailyBonusWithAd(adsManager) {
  const lastClaim = localStorage.getItem('DAILY_AD_CLAIM') || '0';
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (now - parseInt(lastClaim) < dayMs) {
    return { claimed: false, message: 'Ya reclamaste tu bonus hoy' };
  }

  const watched = await adsManager.showRewardedAd('daily-bonus');
  if (watched) {
    localStorage.setItem('DAILY_AD_CLAIM', String(now));
    return { claimed: true, bonus: { gold: 100, xp: 50 } };
  }

  return { claimed: false, message: 'Anuncio cancelado' };
}
