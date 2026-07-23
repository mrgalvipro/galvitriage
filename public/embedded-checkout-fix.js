(function () {
  'use strict';

  const PRODUCTION_WORKER_ORIGIN = 'https://galvicare-triage-intake.mrgalvipro.workers.dev';
  const IS_WORKER_PREVIEW =
    window.location.hostname.endsWith('.workers.dev') &&
    window.location.origin !== PRODUCTION_WORKER_ORIGIN;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = function galviCareEnvironmentAwareFetch(input, init) {
    const requestUrl = typeof input === 'string' ? input : input?.url;

    if (
      IS_WORKER_PREVIEW &&
      typeof requestUrl === 'string' &&
      requestUrl.startsWith(PRODUCTION_WORKER_ORIGIN)
    ) {
      const parsedUrl = new URL(requestUrl);
      const sameOriginUrl = `${window.location.origin}${parsedUrl.pathname}${parsedUrl.search}`;

      if (typeof input === 'string') {
        input = sameOriginUrl;
      } else if (input instanceof Request) {
        input = new Request(sameOriginUrl, input);
      }
    }

    return nativeFetch(input, init);
  };

  const STRIPE_LINKS = Object.freeze({
    'galviscore-stripe-cta': 'https://buy.stripe.com/test_bJe7sM5Ze9jdc8qgG253O01',
    'galvishot-stripe-cta': 'https://buy.stripe.com/test_00w14odrG1QLdcu9dA53O02'
  });

  window.navigateToTopLevelCheckout = function navigateToTopLevelCheckout(checkoutUrl) {
    const url = String(checkoutUrl || '').trim();

    if (!url.startsWith('https://buy.stripe.com/')) {
      throw new Error('Invalid Stripe Checkout URL.');
      throw new Error('Invalid Stripe checkout URL.');
    }

    if (window.top === window.self) {
      window.location.assign(url);
      return { navigation: 'top_navigation' };
    }

    const checkoutWindow = window.open(
      url,
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

    return { navigation: 'new_tab' };
  };
    checkoutWindow.location.replace(url);

    return { navigation: 'new_tab' };
  };
    } catch (_) {}

    checkoutWindow.location.replace(url);

    return {
      success: true,
      navigation: 'new_tab'
    };
  };

  function resolveCheckoutUrl(target) {
    return String(
      target?.dataset?.checkoutUrl ||
      target?.getAttribute?.('href') ||
      STRIPE_LINKS[target?.id] ||
      ''
    ).trim();
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
