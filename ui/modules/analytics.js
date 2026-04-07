/**
 * ANALYTICS MODULE
 * Stub para eventos de Analytics que funciona en modo desarrollo
 * y se puede escalar a Firebase / Google Analytics en producción.
 */

export class Analytics {
  constructor(isProduction = false) {
    this.isProduction = isProduction;
  }

  trackEvent(eventName, params = {}) {
    if (!eventName) return;

    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...(params || {}),
    };

    if (!this.isProduction) {
      console.log(`[ANALYTICS] ${eventName}`);
      return;
    }

    try {
      // Futuro: integrar Firebase / Google Analytics aquí
      // firebase.analytics().logEvent(eventName, params);
    } catch (error) {
      console.error('[ANALYTICS ERROR]', error);
    }
  }
}
