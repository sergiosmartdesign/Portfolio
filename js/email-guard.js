/**
 * Email obfuscation guard
 * ---------------------------------------------------------------------------
 * Keeps the contact address out of the static HTML/JSON so scraper bots can't
 * harvest it, while assembling it at runtime so humans use it normally.
 *
 * Opt an element in with the `data-eml` attribute:
 *   <a data-eml> …                       → sets href="mailto:<addr>"
 *   <a data-eml data-eml-subject="Hi"> … → adds ?subject=Hi
 *   <span data-eml data-eml-text></span> → sets textContent to the address
 *
 * Re-runs on the i18n `languagechanged` event, because that re-injects the
 * innerHTML of [data-i18n-html] nodes (which would wipe an assembled href).
 *
 * NOTE: the schema.org JSON-LD keeps the address in plaintext on purpose — it
 * is SEO metadata that good bots (Google) need. That is the accepted trade-off.
 */
(function () {
  // Split so the literal address never appears in this source file either.
  var ADDR = ['mail', 'sergio-ayala.com'].join('@');

  function apply(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[data-eml]').forEach(function (el) {
      if (el.tagName === 'A') {
        var subj = el.getAttribute('data-eml-subject');
        el.setAttribute(
          'href',
          'mailto:' + ADDR + (subj ? '?subject=' + encodeURIComponent(subj) : '')
        );
      }
      if (el.hasAttribute('data-eml-text')) {
        el.textContent = ADDR;
      }
    });
  }

  if (document.readyState !== 'loading') apply();
  else document.addEventListener('DOMContentLoaded', function () { apply(); });

  // i18n swaps overwrite innerHTML (and it dispatches on `document`, not window)
  // → restore the assembled hrefs/text after every render, including the first.
  document.addEventListener('languagechanged', function () { apply(); });
})();
