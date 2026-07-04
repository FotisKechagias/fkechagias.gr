/* ═══════════════════════════════════════════════════════════════
   HOME EXPERIENCE ENGINE
   - Hero entrance (masked lines μετά το preloader)
   - Manifesto: αποκάλυψη λέξη-λέξη στο scroll
   - Services: βάθος στις sticky κάρτες
   - Projects: οριζόντιο ταξίδι (desktop μόνο)
   - Stats: ζωντανοί μετρητές
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopH = window.matchMedia('(min-width: 900px)');

  /* ── Hero entrance: συγχρονισμένο με το preloader (~500ms after load) ── */
  function heroIn() { document.body.classList.add('xp-loaded'); }
  if (document.readyState === 'complete') {
    setTimeout(heroIn, 250);
  } else {
    window.addEventListener('load', function () { setTimeout(heroIn, 650); });
  }

  /* ── Manifesto: σπάσιμο σε λέξεις (κρατάει τα <em>) ──────────── */
  function splitWords(root) {
    Array.prototype.slice.call(root.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          var s = document.createElement('span');
          s.className = 'xp-w';
          s.textContent = part;
          frag.appendChild(s);
        });
        root.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        splitWords(node);
      }
    });
  }

  var manifestoSec = document.getElementById('vision');
  var mEl = document.querySelector('.xp-manifesto-text');
  var mWords = [];
  if (mEl && !reduced) {
    splitWords(mEl);
    mWords = Array.prototype.slice.call(mEl.querySelectorAll('.xp-w'));
  }

  /* ── Services stack ──────────────────────────────────────────── */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.xp-card'));
  var CARD_TOP = 104; /* ίδιο με το CSS sticky top */

  /* ── Horizontal projects ─────────────────────────────────────── */
  var hSec   = document.querySelector('.xp-projects');
  var hTrack = document.querySelector('.xp-htrack');
  var hMax   = 0;

  /* Dwell ζώνες: η οθόνη μένει "κλειδωμένη" πριν ξεκινήσει
     και αφού τελειώσει η οριζόντια κίνηση */
  function hStartDwell() { return Math.round(window.innerHeight * 0.25); }
  function hEndDwell()   { return Math.round(window.innerHeight * 0.5); }

  function refreshH() {
    if (!hSec || !hTrack) return;
    var on = desktopH.matches && !reduced;
    hSec.classList.toggle('xp-h-on', on);
    if (on) {
      hMax = hTrack.scrollWidth - window.innerWidth;
      if (hMax < 0) hMax = 0;
      hSec.style.height = (window.innerHeight + hStartDwell() + hMax + hEndDwell()) + 'px';
    } else {
      hMax = 0;
      hSec.style.height = '';
      hTrack.style.transform = '';
    }
  }

  /* ── Counters ────────────────────────────────────────────────── */
  function runCount(el) {
    var target = parseInt(el.dataset.target || '0', 10);
    var suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suffix; return; }
    var t0 = null, DUR = 1700;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / DUR, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.xp-count');
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        runCount(en.target);
        cio.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) { runCount(c); });
  }

  /* ── Ενιαίο rAF scroll loop ──────────────────────────────────── */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function update() {
    ticking = false;
    var vh = window.innerHeight;

    /* Manifesto: πόσες λέξεις είναι ενεργές.
       Συντελεστής 1.3 → ολοκλήρωση στο ~77% του section,
       το υπόλοιπο 23% είναι pinned dwell (κρατάει την οθόνη) */
    if (manifestoSec && mWords.length) {
      var r = manifestoSec.getBoundingClientRect();
      var total = r.height - vh;
      var p = total > 0 ? clamp01(-r.top / total) : 1;
      var active = Math.floor(p * mWords.length * 1.3);
      for (var i = 0; i < mWords.length; i++) {
        if (i < active) mWords[i].classList.add('on');
        else mWords[i].classList.remove('on');
      }
    }

    /* Services: η κάρτα που καλύπτεται μικραίνει & σκοτεινιάζει */
    if (!reduced && cards.length > 1) {
      for (var j = 0; j < cards.length - 1; j++) {
        var nr = cards[j + 1].getBoundingClientRect();
        var cp = clamp01((vh - nr.top) / (vh - CARD_TOP));
        cards[j].style.transform = cp > 0 ? 'scale(' + (1 - cp * 0.05) + ')' : '';
        cards[j].style.filter    = cp > 0 ? 'brightness(' + (1 - cp * 0.35) + ')' : '';
      }
    }

    /* Projects: οριζόντια μετατόπιση 1:1 px με start/end dwell —
       η οθόνη κλειδώνει πριν και μετά την κίνηση της γκαλερί */
    if (hSec && hTrack && hMax > 0 && hSec.classList.contains('xp-h-on')) {
      var hr = hSec.getBoundingClientRect();
      var scrolled = -hr.top;
      if (scrolled < 0) scrolled = 0;
      var x = scrolled - hStartDwell();
      if (x < 0) x = 0;
      if (x > hMax) x = hMax;
      hTrack.style.transform = 'translate3d(' + (-x) + 'px, 0, 0)';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { refreshH(); onScroll(); });
  if (desktopH.addEventListener) {
    desktopH.addEventListener('change', function () { refreshH(); onScroll(); });
  }
  /* ξανά-μέτρημα όταν φορτώσουν fonts/εικόνες */
  window.addEventListener('load', function () { refreshH(); update(); });

  refreshH();
  update();
})();
