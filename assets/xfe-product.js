/**
 * XFE Clothing — PDP interactions
 * Variant matching, quantity stepper, and an AJAX add-to-cart flow with
 * idle → loading → success/error states. Falls back to a native form
 * submit (full page request to /cart/add) if fetch is unavailable.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-xfe-product]');
  if (!root) return;

  var variantsDataEl = root.querySelector('[data-xfe-variants]');
  var variants = [];
  try {
    variants = JSON.parse(variantsDataEl.textContent);
  } catch (e) {
    variants = [];
  }

  var form = root.querySelector('[data-xfe-product-form]');
  var variantIdInput = root.querySelector('[data-xfe-variant-id]');
  var priceEl = root.querySelector('[data-xfe-price]');
  var addButton = root.querySelector('[data-xfe-add-to-cart]');
  var optionFieldsets = root.querySelectorAll('[data-xfe-option]');
  var quantityInput = root.querySelector('[data-xfe-quantity-input]');
  var errorEl = root.querySelector('[data-xfe-form-error]');

  function moneyFormat(cents) {
    return (cents / 100).toLocaleString(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD'
    });
  }

  function getSelectedOptions() {
    var selected = [];
    optionFieldsets.forEach(function (fieldset) {
      var checked = fieldset.querySelector('[data-xfe-option-input]:checked');
      selected.push(checked ? checked.value : null);
    });
    return selected;
  }

  function findVariant(selectedOptions) {
    return variants.filter(function (variant) {
      return variant.options.every(function (value, index) {
        return selectedOptions[index] === null || selectedOptions[index] === value;
      });
    })[0];
  }

  function refreshUnavailableOptions() {
    var selected = getSelectedOptions();

    optionFieldsets.forEach(function (fieldset, position) {
      var inputs = fieldset.querySelectorAll('[data-xfe-option-input]');
      inputs.forEach(function (input) {
        var trial = selected.slice();
        trial[position] = input.value;
        var match = findVariant(trial);
        var pill = fieldset.querySelector('label[for="' + input.id + '"]');
        if (pill) {
          pill.classList.toggle('is-unavailable', !match || match.available === false);
        }
      });

      var valueLabel = fieldset.querySelector('[data-xfe-option-value]');
      if (valueLabel && selected[position]) {
        valueLabel.textContent = selected[position];
      }
    });
  }

  function updateForVariant(variant) {
    if (!variant) {
      addButton.disabled = true;
      addButton.querySelector('[data-xfe-state="idle"]').textContent = 'No disponible';
      return;
    }

    variantIdInput.value = variant.id;

    if (priceEl) {
      var priceHtml = moneyFormat(variant.price);
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        priceHtml += ' <s class="xfe-product__price-compare">' + moneyFormat(variant.compare_at_price) + '</s>';
      }
      priceEl.innerHTML = priceHtml;
    }

    addButton.disabled = !variant.available;
    addButton.querySelector('[data-xfe-state="idle"]').textContent = variant.available ? 'Añadir al carrito' : 'Agotado';
  }

  optionFieldsets.forEach(function (fieldset) {
    fieldset.addEventListener('change', function () {
      refreshUnavailableOptions();
      var variant = findVariant(getSelectedOptions());
      updateForVariant(variant);
    });
  });

  refreshUnavailableOptions();

  var minusBtn = root.querySelector('[data-xfe-quantity-minus]');
  var plusBtn = root.querySelector('[data-xfe-quantity-plus]');

  if (minusBtn && quantityInput) {
    minusBtn.addEventListener('click', function () {
      var value = Math.max(1, (parseInt(quantityInput.value, 10) || 1) - 1);
      quantityInput.value = value;
    });
  }

  if (plusBtn && quantityInput) {
    plusBtn.addEventListener('click', function () {
      var value = (parseInt(quantityInput.value, 10) || 1) + 1;
      quantityInput.value = value;
    });
  }

  function setButtonState(state) {
    addButton.classList.remove('is-loading', 'is-success');
    if (state === 'loading' || state === 'success') {
      addButton.classList.add('is-' + state);
    }
  }

  if (form && window.fetch) {
    form.addEventListener('submit', function (event) {
      if (addButton.disabled) return;
      event.preventDefault();

      setButtonState('loading');
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = '';
      }

      var formData = new FormData(form);

      fetch((window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/') + 'cart/add.js', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error(result.data && result.data.description ? result.data.description : 'No se pudo añadir el producto.');
          }

          setButtonState('success');

          document.dispatchEvent(new CustomEvent('cart:updated'));

          window.setTimeout(function () {
            setButtonState('idle');
          }, 1800);
        })
        .catch(function (error) {
          setButtonState('idle');
          if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = error.message;
          }
        });
    });
  }
})();
