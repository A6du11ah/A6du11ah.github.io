/* ═══════════════════════════════════════════════════════════════════════
   THEME — the zipper.

   Toggling skins runs the unzip: an overlay painted in the OUTGOING
   skin's background covers the viewport, a slider runs down the seam,
   and the two halves peel apart to reveal the incoming skin underneath.
   The skin swap happens behind the overlay, before the halves separate.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var root   = document.documentElement;
  var btn    = document.querySelector('[data-skin-toggle]');
  var label  = document.querySelector('[data-toggle-label]');
  var status = document.querySelector('[data-skin-status]');
  var unzip  = document.querySelector('[data-unzip]');

  if (!btn) return;

  // Stand Mode is part of the Japan variant only. Elsewhere the control is
  // removed outright rather than hidden — a hidden button still occupies the
  // tab order and is still announced by a screen reader.
  if (root.getAttribute('data-region') !== 'jp') {
    btn.remove();
    if (status) status.remove();
    var overlay = document.querySelector('[data-unzip]');
    if (overlay) overlay.remove();
    return;
  }

  var DURATION = 740;   // must match motion.css
  var SWAP_AT  = 180;   // before the halves start peeling (30% of 740ms)
  var busy     = false;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function current() {
    return root.getAttribute('data-skin') === 'stand' ? 'stand' : 'plain';
  }

  function paint(skin) {
    root.setAttribute('data-skin', skin);
    btn.setAttribute('aria-pressed', skin === 'stand' ? 'true' : 'false');
    var next = skin === 'stand' ? 'Plain Mode' : 'Stand Mode';
    if (label) label.textContent = next;
    // The visible label is hidden on small screens, so the button carries its
    // own name there.
    btn.setAttribute('aria-label', 'Switch to ' + next);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', skin === 'stand' ? '#0B0E14' : '#ffffff');

    try { localStorage.setItem('skin', skin); } catch (e) {}

    if (status) {
      status.textContent = skin === 'stand'
        ? 'Stand Mode on — Sticky Fingers theme.'
        : 'Plain Mode on — minimal black and white.';
    }
  }

  function swap() {
    var next = current() === 'stand' ? 'plain' : 'stand';

    // No animation when the visitor has asked for less motion.
    if (reduced.matches || !unzip) { paint(next); return; }
    if (busy) return;
    busy = true;

    // Freeze the outgoing skin's colours into the overlay before swapping.
    var cs = getComputedStyle(root);
    unzip.style.setProperty('--unzip-bg', cs.getPropertyValue('--bg').trim() || '#fff');
    unzip.style.setProperty('--unzip-teeth', cs.getPropertyValue('--accent').trim() || '#000');

    // Force a reflow so the animations restart cleanly on repeat toggles.
    unzip.classList.remove('is-running');
    void unzip.offsetWidth;
    unzip.classList.add('is-running');

    window.setTimeout(function () { paint(next); }, SWAP_AT);
    window.setTimeout(function () {
      unzip.classList.remove('is-running');
      busy = false;
    }, DURATION + 40);
  }

  btn.addEventListener('click', swap);

  // Sync the button to whatever the pre-paint script already applied.
  paint(current());

  // If the visitor switches on reduced motion mid-session, stop animating.
  if (reduced.addEventListener) {
    reduced.addEventListener('change', function () {
      if (reduced.matches && unzip) unzip.classList.remove('is-running');
    });
  }
})();
