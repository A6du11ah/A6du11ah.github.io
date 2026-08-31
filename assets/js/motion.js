/* ═══════════════════════════════════════════════════════════════════════
   MOTION — scroll reveals, character splits, zipline unzips, and the
   ゴゴゴゴ drift.

   Safety rule throughout: if anything here cannot run — no
   IntersectionObserver, reduced motion, an unexpected error — every
   element is left fully visible. Motion is only ever added on top of a
   page that already reads.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supported = 'IntersectionObserver' in window;

  /* ── Fail-safe ───────────────────────────────────────────────────── */
  function revealAll() {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-in');
    });
    document.querySelectorAll('[data-zipline]').forEach(function (el) {
      el.classList.add('is-in');
    });
    document.querySelectorAll('[data-split], [data-rush]').forEach(function (el) {
      el.classList.add('is-in');
    });
  }

  if (!supported) { revealAll(); return; }

  // A visitor who has asked for reduced motion gets the finished page at
  // once. There is no animation left worth gating content behind, and it
  // removes the observer as a point of failure for exactly the people
  // least able to work around it.
  if (reduced) { revealAll(); return; }


  /* ── Character split for display headings ────────────────────────── */
  // The original string is kept as the accessible name, so assistive
  // technology reads "Publications & Research", not P-u-b-l-i-...
  function split(el) {
    var text = el.textContent;
    if (!text || el.dataset.splitDone) return;

    el.setAttribute('aria-label', text.trim());
    el.dataset.splitDone = '1';

    var frag = document.createDocumentFragment();
    var i = 0;

    Array.prototype.forEach.call(text, function (chr) {
      if (chr === ' ') {
        frag.appendChild(document.createTextNode(' '));
        return;
      }
      var s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--c', String(i++));
      s.textContent = chr;
      frag.appendChild(s);
    });

    el.textContent = '';
    el.appendChild(frag);
  }

  if (!reduced) {
    document.querySelectorAll('[data-split], [data-rush]').forEach(split);
  }


  /* ── Stagger index within each group ─────────────────────────────── */
  // Siblings share a parent, so the index resets per list — a section
  // with 6 cards staggers 0..5 rather than continuing a page-wide count.
  // Capped at 5: beyond that the last item lags the scroll badly, and a
  // reader scrolling fast is left looking at blank space.
  var groups = new Map();
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.setProperty('--i', String(Math.min(n, 5)));
    groups.set(parent, n + 1);
  });


  /* ── Reveal ──────────────────────────────────────────────────────── */
  // Three independent mechanisms, any one of which is sufficient. Content
  // going permanently invisible is the worst failure this page can have,
  // so it is guarded three deep rather than trusted to the observer alone.
  var SEL = '[data-reveal], [data-zipline], [data-split]';

  function show(el) {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    if (io) io.unobserve(el);
  }

  // 1 — the observer. threshold 0 and a small fixed bottom margin, never a
  //     percentage: a percentage of a short viewport can exceed an element's
  //     distance from the page bottom, so the last items never intersect.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) show(e.target);
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });

  var watched = Array.prototype.slice.call(document.querySelectorAll(SEL));
  watched.forEach(function (el) { io.observe(el); });

  // 2 — a sweep. Anything on screen, or anywhere above it, is shown
  //     unconditionally: if the reader has already scrolled past an element,
  //     no animation is worth withholding it for.
  function sweep() {
    var vh = window.innerHeight;
    watched.forEach(function (el) {
      if (el.classList.contains('is-in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > -vh) show(el);   // visible, or just above
      else if (r.bottom <= 0) show(el);             // scrolled past entirely
    });
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () { sweep(); pending = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  window.requestAnimationFrame(sweep);
  window.addEventListener('load', sweep);

  // The hero is above the fold — run it immediately rather than waiting.
  document.querySelectorAll('[data-rush]').forEach(function (el) {
    el.classList.add('is-in');
  });

  // 3 — the backstop. If anything at all has gone wrong above, everything
  //     on the page becomes visible. A page that shows all its content with
  //     no animation beats an elegant page with holes in it.
  window.setTimeout(function () {
    var missed = document.querySelectorAll('[data-reveal]:not(.is-in)');
    if (missed.length && !document.querySelector('[data-reveal].is-in')) {
      revealAll();                    // observer never fired at all
    }
  }, 2500);

  // Printing must never produce blank sections.
  if (window.matchMedia) {
    var mq = window.matchMedia('print');
    if (mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) revealAll(); });
  }
  window.addEventListener('beforeprint', revealAll);


  /* ── ゴゴゴゴ drift ──────────────────────────────────────────────── */
  // Purely decorative, aria-hidden, and display:none in plain mode —
  // which also stops the animations rather than merely hiding them.
  // Only the Japan variant can ever display these — Stand Mode is gated to
  // it — so elsewhere the container is removed rather than filled with nodes
  // that are permanently display:none.
  var menacing = document.querySelector('[data-menacing]');
  if (menacing && root.getAttribute('data-region') !== 'jp') {
    menacing.remove();
    menacing = null;
  }
  if (menacing && !reduced) {
    var COUNT = 9;
    var out = '';

    for (var i = 0; i < COUNT; i++) {
      var left = (Math.random() * 94).toFixed(2);
      var size = (1.6 + Math.random() * 3.4).toFixed(2);
      var dur = (17 + Math.random() * 20).toFixed(1);
      var delay = (-Math.random() * 30).toFixed(1);
      var chars = 'ゴ'.repeat(2 + Math.floor(Math.random() * 3));

      out += '<span style="left:' + left + '%;font-size:' + size + 'rem;' +
             'animation-duration:' + dur + 's;animation-delay:' + delay + 's">' +
             chars + '</span>';
    }
    menacing.innerHTML = out;
  }


  /* ── Pointer-reactive tilt on panels (fine pointers only) ────────── */
  if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.card, .pillar').forEach(function (el) {
      el.addEventListener('pointermove', function (ev) {
        if (root.getAttribute('data-skin') !== 'stand') return;
        var r = el.getBoundingClientRect();
        var dx = ((ev.clientX - r.left) / r.width - 0.5) * 2;
        var dy = ((ev.clientY - r.top) / r.height - 0.5) * 2;
        el.style.setProperty('--tilt-x', (dx * 3).toFixed(2) + 'px');
        el.style.setProperty('--tilt-y', (dy * 3).toFixed(2) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.removeProperty('--tilt-x');
        el.style.removeProperty('--tilt-y');
      });
    });
  }
})();
