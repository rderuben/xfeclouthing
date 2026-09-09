/**
 * XFE Clothing — Bento manifesto
 * Tracks the pointer position inside each card to drive the CSS
 * radial-gradient glow (--glow-x / --glow-y) defined in xfe-bento.css.
 */
(function () {
  'use strict';

  var cards = document.querySelectorAll('[data-xfe-bento-card]');
  if (!cards.length || !window.matchMedia('(pointer: fine)').matches) return;

  cards.forEach(function (card) {
    card.addEventListener('pointermove', function (event) {
      var rect = card.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * 100;
      var y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--glow-x', x + '%');
      card.style.setProperty('--glow-y', y + '%');
    });
  });
})();
