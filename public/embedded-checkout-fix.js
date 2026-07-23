(function () {
  'use strict';

  const STRIPE_LINKS = Object.freeze({
    'galviscore-stripe-cta': 'https://buy.stripe.com/test_bJe7sM5Ze9jdc8qgG253O01',
    'galvishot-stripe-cta': 'https://buy.stripe.com/test_00w14odrG1QLdcu9dA53O02'
  });

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

  function resolveCheckoutUrl(target) {
    const configuredUrl = String(
      target?.dataset?.checkoutUrl ||
      target?.getAttribute?.('href') ||
      STRIPE_LINKS[target?.id] ||
      ''
    ).trim();

    return configuredUrl;
  }

  document.addEventListener('click', function enforceTopLevelStripeCheckout(event) {
    const target = event.target?.closest?.('#galviscore-stripe-cta, #galvishot-stripe-cta');
    if (!target) return;

    const checkoutUrl = resolveCheckoutUrl(target);

    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      window.navigateToTopLevelCheckout(checkoutUrl);

      if (typeof window.fireGalviEvent === 'function') {
        const product = target.id === 'galviscore-stripe-cta' ? 'galviscore' : 'galvishot';
        window.fireGalviEvent('stripe_click', {
          product,
          stage: product === 'galviscore' ? 'GalviScore Paywall' : 'GalviShot Paywall',
          navigation: 'new_tab'
        });
      }
    } catch (error) {
      console.error('Stripe Checkout navigation failed.', error);
      window.alert(error?.message || 'Stripe Checkout could not open.');
    }
  }, true);
})();
