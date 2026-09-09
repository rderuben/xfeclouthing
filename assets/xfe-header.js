/**
 * XFE Clothing — Header interactions
 * Sticky shrink state, mobile nav toggle, and a live cart counter
 * that updates via the Ajax Cart API without a full page reload.
 */
(function () {
  'use strict';

  var header = document.querySelector('[data-xfe-header]');
  var menuToggle = document.querySelector('[data-xfe-menu-toggle]');
  var mobileNav = document.querySelector('[data-xfe-nav-mobile]');
  var cartCountEls = document.querySelectorAll('[data-xfe-cart-count]');

  function setScrolledState() {
    if (!header) return;
    var scrolled = (window.scrollY || document.documentElement.scrollTop) > 4;
    header.classList.toggle('is-scrolled', scrolled);
  }

  function toggleMobileNav(forceState) {
    if (!menuToggle || !mobileNav) return;
    var isOpen = typeof forceState === 'boolean' ? forceState : menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    mobileNav.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function updateCartCount(count) {
    cartCountEls.forEach(function (el) {
      el.textContent = count;
      el.classList.remove('is-bumped');
      // Force reflow so the animation can retrigger on repeated updates.
      void el.offsetWidth;
      el.classList.add('is-bumped');
    });
  }

  function fetchCartCount() {
    fetch(window.Shopify && window.Shopify.routes && window.Shopify.routes.root
      ? window.Shopify.routes.root + 'cart.js'
      : '/cart.js', { headers: { Accept: 'application/json' } })
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (cart) {
        if (cart && typeof cart.item_count === 'number') {
          updateCartCount(cart.item_count);
        }
      })
      .catch(function () {
        /* Silently ignore — the server-rendered count remains as a fallback. */
      });
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      toggleMobileNav();
    });
  }

  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleMobileNav(false);
      });
    });
  }

  window.addEventListener('scroll', setScrolledState, { passive: true });

  // Any part of the theme (product forms, cart drawer, quick add, etc.)
  // can broadcast this event after mutating the cart to keep the header in sync.
  document.addEventListener('cart:updated', function (event) {
    if (event.detail && typeof event.detail.itemCount === 'number') {
      updateCartCount(event.detail.itemCount);
    } else {
      fetchCartCount();
    }
  });

  setScrolledState();
  fetchCartCount();
})();
