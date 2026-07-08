/* ═══════════════════════════════════════════════════════════════
   HOME EXPERIENCE ENGINE
   - JS-driven pinning (ΔΕΝ βασίζεται σε position:sticky — δουλεύει
     παντού): το section είναι ψηλός "διάδρομος", το stage καρφώνεται
     με position:fixed όσο το section διασχίζει το viewport.
   - About: word pull-up τίτλος + character-reveal σώμα (χωρίς pin)
   - Services: απλή λίστα με reveal-up (χωρίς pin)
   - Projects: οριζόντιο ταξίδι (pinned) · Stats: pinned μετρητές
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopH = window.matchMedia('(min-width: 900px)');

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  function remap(v, inLo, inHi, outLo, outHi) {
    var t = (v - inLo) / (inHi - inLo);
    return outLo + t * (outHi - outLo);
  }

  /* Ακούει lenis.on('scroll') αντί για native window scroll ώστε το
     progress να μη "τρέχει μπροστά" από το οπτικό smooth-scroll του Lenis */
  function bindScroll(handler) {
    if (window.__lenis && typeof window.__lenis.on === 'function') {
      window.__lenis.on('scroll', handler);
    } else {
      window.addEventListener('scroll', handler, { passive: true });
    }
  }

  /* ── Hero entrance: συγχρονισμένο με το preloader ────────────── */
  function heroIn() { document.body.classList.add('xp-loaded'); }
  if (document.readyState === 'complete') {
    setTimeout(heroIn, 250);
  } else {
    window.addEventListener('load', function () { setTimeout(heroIn, 650); });
  }

  /* ═══ PIN ENGINE ═══════════════════════════════════════════════
     Κρατάει το stage καρφωμένο στο viewport όσο το section
     (ο "διάδρομος") το διασχίζει:
       πριν   → absolute top:0      (κυλάει μαζί με το section)
       μέσα   → fixed top:0         (ΚΛΕΙΔΩΜΕΝΟ στην οθόνη)
       μετά   → absolute bottom:0   (ξεκολλάει και συνεχίζει)      */
  function Pin(section, stage, isOn) {
    this.sec   = section;
    this.stage = stage;
    this.isOn  = isOn || function () { return true; };
    this.state = null;
  }
  Pin.prototype.setState = function (s) {
    if (s === this.state) return;
    this.state = s;
    var st = this.stage.style;
    if (s === 'pinned') {
      st.position = 'fixed';    st.top = '0'; st.bottom = '';
    } else if (s === 'after') {
      st.position = 'absolute'; st.top = 'auto'; st.bottom = '0';
    } else if (s === 'before') {
      st.position = 'absolute'; st.top = '0'; st.bottom = '';
    } else {
      st.position = ''; st.top = ''; st.bottom = '';
    }
  };
  /* Επιστρέφει το rect του section και progress 0..1 του pin */
  Pin.prototype.update = function (vh) {
    if (!this.sec || !this.stage) return null;
    var r = this.sec.getBoundingClientRect();
    var runway = r.height - vh;
    if (!this.isOn() || runway <= 1) {
      this.setState(null);
      return { rect: r, p: 1 };
    }
    if (r.top > 0)          this.setState('before');
    else if (r.bottom < vh) this.setState('after');
    else                    this.setState('pinned');
    return { rect: r, p: clamp01(-r.top / runway) };
  };
  Pin.prototype.reset = function () { this.state = null; };

  function makePin(secSel, isOn) {
    var sec = document.querySelector(secSel);
    if (!sec) return null;
    var stage = sec.querySelector('.xp-pin-stage');
    if (!stage) return null;
    return new Pin(sec, stage, isOn);
  }

  var pinsEnabled = !reduced;
  function pinsOn() { return pinsEnabled; }

  /* ── About: τίτλος (word pull-up μία φορά) + σώμα (character reveal
     συνεχώς οδηγούμενο από το scroll, χωρίς pin) ─────────────────── */
  var aboutHeading = document.getElementById('about-heading');
  var aboutWords = [];
  if (aboutHeading) {
    Array.prototype.slice.call(aboutHeading.querySelectorAll('.xp-about-seg')).forEach(function (seg) {
      var text = seg.textContent;
      seg.textContent = '';
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          seg.appendChild(document.createTextNode(' '));
          return;
        }
        var w = document.createElement('span');
        w.className = 'xp-about-word';
        w.textContent = part;
        seg.appendChild(w);
        aboutWords.push(w);
      });
    });

    if (reduced) {
      aboutHeading.classList.add('in');
    } else if ('IntersectionObserver' in window) {
      var aboutObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          aboutWords.forEach(function (w, i) { w.style.transitionDelay = (i * 0.08) + 's'; });
          aboutHeading.classList.add('in');
          aboutObs.unobserve(aboutHeading);
        });
      }, { threshold: 0.3 });
      aboutObs.observe(aboutHeading);
    } else {
      aboutHeading.classList.add('in');
    }
  }

  var aboutBody = document.getElementById('about-body');
  var aboutChars = [];
  if (aboutBody && !reduced) {
    var bodyText = aboutBody.textContent;
    aboutBody.textContent = '';
    var bodyFrag = document.createDocumentFragment();
    for (var bi = 0; bi < bodyText.length; bi++) {
      var cs = document.createElement('span');
      cs.className = 'xp-about-char';
      cs.textContent = bodyText[bi] === ' ' ? ' ' : bodyText[bi];
      bodyFrag.appendChild(cs);
    }
    aboutBody.appendChild(bodyFrag);
    aboutChars = Array.prototype.slice.call(aboutBody.querySelectorAll('.xp-about-char'));
  }

  /* ── Horizontal projects ─────────────────────────────────────── */
  var hSec   = document.querySelector('.xp-projects');
  var hTrack = document.querySelector('.xp-htrack');
  var hMax   = 0;

  function hOn() { return !!hSec && hSec.classList.contains('xp-h-on'); }
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

  /* ── Pins ────────────────────────────────────────────────────── */
  var statsPin = makePin('.xp-stats', pinsOn);
  var projPin  = makePin('#projects', function () { return pinsEnabled && hOn(); });
  var allPins = [statsPin, projPin];

  /* ── Counters ────────────────────────────────────────────────── */
  function runCount(el) {
    var target = parseInt(el.dataset.target || '0', 10);
    var suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suffix; return; }
    var t0 = null, DUR = 1600;
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
    Array.prototype.forEach.call(counters, function (c) { runCount(c); });
  }

  /* ── Ενιαίο rAF scroll loop ──────────────────────────────────── */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function update() {
    ticking = false;
    var vh = window.innerHeight;

    /* 0.5 · About body: character-by-character αδιαφάνεια, υπολογισμένη
       απευθείας από τη θέση της παραγράφου στο viewport (χωρίς pin) —
       ισοδύναμο του useScroll offset ['start 0.8','end 0.2'] */
    if (aboutBody && aboutChars.length) {
      var abRect  = aboutBody.getBoundingClientRect();
      var abStart = vh * 0.8;
      var abTotal = vh * 0.6 + abRect.height;
      var abP     = clamp01((abStart - abRect.top) / abTotal);
      var an = aboutChars.length;
      for (var ai = 0; ai < an; ai++) {
        var charProg = ai / an;
        var abEnd = Math.min(charProg + 0.05, 1);
        aboutChars[ai].style.opacity = clamp(remap(abP, charProg - 0.1, abEnd, 0.2, 1), 0.2, 1);
      }
    }

    /* 1 · Projects: οριζόντια μετατόπιση 1:1 px με start/end dwell */
    if (projPin) {
      var pj = projPin.update(vh);
      if (pj && hMax > 0 && hOn()) {
        var scrolled = -pj.rect.top;
        if (scrolled < 0) scrolled = 0;
        var x = scrolled - hStartDwell();
        if (x < 0) x = 0;
        if (x > hMax) x = hMax;
        hTrack.style.transform = 'translate3d(' + (-x) + 'px, 0, 0)';
      }
    }

    /* 4 · Stats: απλό pin — οι μετρητές τρέχουν όσο είναι καρφωμένο */
    if (statsPin) statsPin.update(vh);
  }

  function refreshAll() {
    refreshH();
    allPins.forEach(function (p) { if (p) p.reset(); });
    update();
  }

  bindScroll(onScroll);
  window.addEventListener('resize', refreshAll);
  if (desktopH.addEventListener) {
    desktopH.addEventListener('change', refreshAll);
  }
  /* ξανά-μέτρημα όταν φορτώσουν fonts/εικόνες */
  window.addEventListener('load', refreshAll);

  refreshAll();
})();
