(function () {
  'use strict';

  window.navigateToTopLevelCheckout = function navigateToTopLevelCheckout(checkoutUrl) {
    const url = String(checkoutUrl || '').trim();

    if (!url.startsWith('https://buy.stripe.com/')) {
      throw new Error('Invalid Stripe checkout URL');
    }

    const checkoutWindow = window.open('about:blank', '_blank');

    if (!checkoutWindow) {
      throw new Error(
        'Stripe Checkout was blocked. Please allow pop-ups for GalviCare and try again.'
      );
    }

    try {
      checkoutWindow.opener = null;
    } catch (error) {
      // Non-blocking hardening only.
    }

    checkoutWindow.location.replace(url);
    return { navigation: 'new_tab' };
  };

  function rebindStripeCta(id, product, getUrl) {
    const original = document.getElementById(id);
    if (!original || original.dataset.embeddedCheckoutFixed === 'true') return;

    const replacement = original.cloneNode(true);
    replacement.dataset.embeddedCheckoutFixed = 'true';
    original.replaceWith(replacement);

    replacement.addEventListener('click', function () {
      const url = getUrl();
      window.navigateToTopLevelCheckout(url);

      try {
        const sessionId = typeof getStoredSessionId === 'function'
          ? (getStoredSessionId() || (typeof getOrCreateSessionId === 'function' ? getOrCreateSessionId() : ''))
          : '';

        if (typeof fireGalviEvent === 'function') {
          fireGalviEvent('stripe_click', {
            product,
            session_id: sessionId,
            stage: product === 'galviscore' ? 'GalviScore Paywall' : 'GalviShot Paywall'
          });
        }
      } catch (error) {
        console.warn('Non-blocking Stripe analytics event failed.', error);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    rebindStripeCta(
      'galviscore-stripe-cta',
      'galviscore',
      function () { return window.GALVISCORE_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/test_bJe7sM5Ze9jdc8qgG253O01'; }
    );

    rebindStripeCta(
      'galvishot-stripe-cta',
      'galvishot',
      function () {
        return window.GSHOT?.PAYMENT_LINK || 'https://buy.stripe.com/test_00w14odrG1QLdcu9dA53O02';
      }
    );
  });
})();
