/* ═══════════════════════════════════════════════════════════════════════
   NAV — reading progress and the section rail's current-section state.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Footer year ─────────────────────────────────────────────────── */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());


  /* ── Reading progress ────────────────────────────────────────────── */
  var bar = document.querySelector('[data-progress]');
  if (bar) {
    var ticking = false;

    var update = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)).toFixed(2) + '%';
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
    update();
  }


  /* ── Current section in the rail ─────────────────────────────────── */
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-rail]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  var map = {};
  var targets = [];

  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) { map[id] = a; targets.push(section); }
  });

  var visible = new Set();

  function mark() {
    // The topmost visible section wins, so the rail reads as a position
    // rather than flickering between two overlapping sections.
    var best = null;
    var bestTop = Infinity;

    visible.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var top = el.getBoundingClientRect().top;
      if (top < bestTop) { bestTop = top; best = id; }
    });

    links.forEach(function (a) {
      var on = best !== null && a.getAttribute('href') === '#' + best;
      if (on) { a.setAttribute('aria-current', 'true'); }
      else    { a.removeAttribute('aria-current'); }
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) visible.add(e.target.id);
      else visible.delete(e.target.id);
    });
    mark();
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  targets.forEach(function (t) { io.observe(t); });
})();
