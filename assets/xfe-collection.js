/**
 * XFE Clothing — Collection grid
 * Auto-submits the sort dropdown by navigating to the same collection
 * URL with an updated sort_by param (native <select>, no JS framework needed).
 */
(function () {
  'use strict';

  var select = document.querySelector('[data-xfe-sort-select]');
  if (!select) return;

  select.addEventListener('change', function () {
    var url = new URL(window.location.href);
    url.searchParams.set('sort_by', select.value);
    url.searchParams.delete('page');
    window.location.href = url.toString();
  });
})();
