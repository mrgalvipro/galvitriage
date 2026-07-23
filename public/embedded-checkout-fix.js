(function () {
  'use strict';

  window.navigateToTopLevelCheckout = function navigateToTopLevelCheckout(checkoutUrl) {
    const url = String(checkoutUrl || '').trim();

    if (!url.startsWith('https://buy.stripe.com/')) {
      throw new Error('Invalid Stripe Checkout URL.');
    }

    if (window.top === window.self) {
      window.location.assign(url);
      return { navigation: 'top_navigation' };
    }

    const checkoutWindow = window.open(
      'about:blank',
      '_blank',
      'noopener,noreferrer'
    );

    if (!checkoutWindow) {
      throw new Error(
        'Checkout could not open. Please allow pop-ups and try again.'
      );
    }

    try {
      checkoutWindow.opener = null;
    } catch (error) {
      // Intentionally ignored.
    }

    checkoutWindow.location.replace(url);

    return { navigation: 'new_tab' };
  };
})();
