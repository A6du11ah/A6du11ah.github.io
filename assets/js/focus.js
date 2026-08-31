/* ═══════════════════════════════════════════════════════════════════════
   FOCUS — optional emphasis via ?focus=

   A shared link may carry an optional emphasis:

     /                 → NLP + HCI, balanced   (default)
     /?focus=nlp       → language modeling framing
     /?focus=hci       → human-AI interaction framing
     /?focus=nlp+hci   → explicit form of the default

   SCOPE — deliberately narrow. This changes only the opening line and the
   research statement. It never reorders, hides, dims or de-emphasises anything
   else. Publications, research focus areas, skills, experience,
   projects, education and service are identical under every value, because
   every reader should see the complete record — the parameter only decides
   which sentence introduces it.

   An unknown or absent value falls back to the default, so a mistyped
   link cannot produce a broken or half-empty page.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var DEFAULT = 'nlp+hci';
  var KNOWN = { 'nlp+hci': 1, 'nlp': 1, 'hci': 1 };

  function normalise(raw) {
    if (!raw) return DEFAULT;
    var v = String(raw).toLowerCase().trim().replace(/[\s,]+/g, '+');
    if (v === 'hci+nlp') v = 'nlp+hci';
    if (v === 'both' || v === 'all') v = DEFAULT;
    return Object.prototype.hasOwnProperty.call(KNOWN, v) ? v : DEFAULT;
  }

  // Show the variant matching `focus`; fall back to the default variant if
  // this group has no such variant, so a group can never end up empty.
  function pick(attr, focus) {
    var all = document.querySelectorAll('[' + attr + ']');
    if (!all.length) return;

    var shown = false;
    Array.prototype.forEach.call(all, function (el) {
      var match = el.getAttribute(attr) === focus;
      el.hidden = !match;
      if (match) shown = true;
    });

    if (!shown) {
      var fallback = document.querySelector('[' + attr + '="' + DEFAULT + '"]');
      if (fallback) fallback.hidden = false;
    }
  }

  var focus = normalise(new URLSearchParams(window.location.search).get('focus'));
  document.documentElement.setAttribute('data-focus', focus);

  pick('data-pitch', focus);        // hero opening line
  pick('data-statement', focus);    // research statement
})();
