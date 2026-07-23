(function () {
  'use strict';

  window.navigateToTopLevelCheckout = function navigateToTopLevelCheckout(checkoutUrl) {
    const url = String(checkoutUrl || '').trim();

    if (!url.startsWith('https://buy.stripe.com/')) {
      throw new Error('Invalid Stripe checkout URL.');
    }

    const checkoutWindow = window.open('about:blank', '_blank');

    if (!checkoutWindow) {
      throw new Error(
        'Stripe Checkout was blocked. Please allow pop-ups for GalviCare and try again.'
      );
    }

    try {
      checkoutWindow.opener = null;
    } catch (_) {}

    checkoutWindow.location.replace(url);

    return {
      success: true,
      navigation: 'new_tab'
    };
  };
})();
