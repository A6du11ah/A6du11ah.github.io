/* ═══════════════════════════════════════════════════════════════════════
   REGION — optional presentation variant via ?region=

     /            → no Japanese typographic layer
     /jp          → kanji rails, katakana, seal; alternate skin available
     /us          → English labels throughout

   Explicit rather than geolocated. An IP lookup is wrong exactly when it
   matters — a reader on a conference network, a VPN or an institutional
   proxy is served the wrong variant with no way to tell — and it would add
   a third-party dependency to a site that has none, leak visitor IPs to it,
   and delay first paint.

   Only the typographic layer changes. Every section — publications, skills,
   experience, everything — is identical in all three.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var ALIAS = { jp: 'jp', japan: 'jp', us: 'us', usa: 'us', uk: 'us', en: 'us' };
  var PRETTY = { jp: 'jp', us: 'us' };

  var params = new URLSearchParams(window.location.search);
  var raw = (params.get('region') || '').toLowerCase().trim();
  var region = ALIAS[raw] || 'default';

  var root = document.documentElement;
  root.setAttribute('data-region', region);
  root.setAttribute('data-jp-layer', region === 'jp' ? 'on' : 'off');

  // Restore the short path in the address bar. /jp redirects here to read the
  // parameter; putting /jp back means a reader who copies the URL passes on
  // the same clean link they were sent.
  if (PRETTY[region] && window.history && history.replaceState) {
    params.delete('region');
    var rest = params.toString();
    try {
      history.replaceState(null, '',
        '/' + PRETTY[region] + (rest ? '?' + rest : '') + window.location.hash);
    } catch (e) {}
  }
})();
