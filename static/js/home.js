/* ═══════════════════════════════════════════════════════════════
   HOME EXPERIENCE ENGINE
   - Hero: masked line reveal (καθαρό CSS) + xp-fade entrance
     συγχρονισμένη με το preloader.
   - About: τίτλος με word pull-up (μία φορά, IntersectionObserver).
   - Projects: staggered entrance (εναλλάξ από αριστερά/δεξιά).
     Οι εικόνες εμφανίζονται ολόκληρες — χωρίς parallax/zoom που
     θα έκρυβε μέρος του screenshot.
   - Services/Contact: το reveal-up fade τους χειρίζεται ήδη το
     main.js σε όλη τη σελίδα.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero entrance: συγχρονισμένο με το preloader ────────────── */
  function heroIn() { document.body.classList.add('xp-loaded'); }
  if (document.readyState === 'complete') {
    setTimeout(heroIn, 250);
  } else {
    window.addEventListener('load', function () { setTimeout(heroIn, 650); });
  }

  /* ── About: τίτλος με word pull-up (μία φορά) ────────────────── */
  var aboutHeading = document.getElementById('about-heading');
  if (aboutHeading) {
    var aboutWords = [];
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

    if (reduced || !('IntersectionObserver' in window)) {
      aboutHeading.classList.add('in');
    } else {
      var aboutObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          aboutWords.forEach(function (w, i) { w.style.transitionDelay = (i * 0.08) + 's'; });
          aboutHeading.classList.add('in');
          aboutObs.unobserve(aboutHeading);
        });
      }, { threshold: 0.3 });
      aboutObs.observe(aboutHeading);
    }
  }

  /* ── Projects: staggered entrance + parallax εικόνων ─────────── */
  var projs = Array.prototype.slice.call(document.querySelectorAll('.xp-proj'));
  if (projs.length && !reduced && 'IntersectionObserver' in window) {

    /* Entrance: το .xp-anim κρύβει την κάρτα (CSS), το .in την εμφανίζει.
       Μπαίνει από JS ώστε χωρίς JS οι κάρτες να μένουν πάντα ορατές.
       Το stagger delay καθαρίζεται μετά την είσοδο, αλλιώς θα
       καθυστερούσε και τα hover transitions. */
    projs.forEach(function (p, i) {
      p.classList.add('xp-anim');
      p.style.transitionDelay = ((i % 2) * 0.1) + 's';
      p.addEventListener('transitionend', function clearDelay() {
        p.style.transitionDelay = '';
        p.removeEventListener('transitionend', clearDelay);
      });
    });
    var projObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        projObs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    projs.forEach(function (p) { projObs.observe(p); });
  }

  /* ── Testimonials: fade carousel (αν υπάρχουν >1) ────────────── */
  var tstStage = document.getElementById('tst-stage');
  if (tstStage) {
    var tstCards = Array.prototype.slice.call(tstStage.querySelectorAll('.xp-tst-card'));
    var tstDots = Array.prototype.slice.call(tstStage.querySelectorAll('.xp-tst-dot'));
    if (tstCards.length > 1) {
      var tstIdx = 0;
      var tstTimer = null;

      var tstShow = function (n) {
        tstIdx = (n + tstCards.length) % tstCards.length;
        tstCards.forEach(function (c, i) { c.classList.toggle('is-on', i === tstIdx); });
        tstDots.forEach(function (d, i) { d.classList.toggle('is-on', i === tstIdx); });
      };
      var tstPlay = function () {
        if (reduced) return;
        tstTimer = setInterval(function () { tstShow(tstIdx + 1); }, 6000);
      };
      var tstStop = function () { if (tstTimer) { clearInterval(tstTimer); tstTimer = null; } };

      tstDots.forEach(function (d, i) {
        d.addEventListener('click', function () { tstStop(); tstShow(i); tstPlay(); });
      });
      tstStage.addEventListener('mouseenter', tstStop);
      tstStage.addEventListener('mouseleave', function () { tstStop(); tstPlay(); });
      tstPlay();
    }
  }

  /* ── Hero: εναλλασσόμενη λέξη τίτλου ─────────────────────────── */
  var heroWord = document.getElementById('hero-word');
  if (heroWord && !reduced) {
    var words = ['Εμπειρίες.', 'Ιστοσελίδες.', 'E-shops.', 'Εντυπώσεις.'];
    var wIdx = 0;
    setTimeout(function () {
      setInterval(function () {
        heroWord.classList.add('is-swapping');
        setTimeout(function () {
          wIdx = (wIdx + 1) % words.length;
          heroWord.textContent = words[wIdx];
          heroWord.classList.toggle('is-long', words[wIdx].length > 10);
          heroWord.classList.remove('is-swapping');
        }, 380);
      }, 4200);
    }, 3600);
  }

  /* ── Hero: ζωντανό ρολόι Ελλάδας ─────────────────────────────── */
  var heroClock = document.getElementById('hero-clock');
  if (heroClock) {
    var tickClock = function () {
      try {
        heroClock.textContent = 'GR ' + new Intl.DateTimeFormat('el-GR', {
          hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Athens'
        }).format(new Date());
      } catch (err) { /* παλιοί browsers χωρίς timeZone support */ }
    };
    tickClock();
    setInterval(tickClock, 30000);
  }

  /* ── Scroll cue: εξαφανίζεται μετά το πρώτο scroll ───────────── */
  var cue = document.querySelector('.xp-scroll-cue');
  if (cue) {
    var cueHide = function () {
      if ((window.scrollY || 0) > 120) cue.classList.add('is-gone');
      else cue.classList.remove('is-gone');
    };
    window.addEventListener('scroll', cueHide, { passive: true });
  }

  /* ── About card: διακριτικό 3D tilt (μόνο pointer:fine) ──────── */
  var aboutCard = document.querySelector('.xp-about-card');
  if (aboutCard && !reduced && window.matchMedia('(pointer: fine)').matches) {
    aboutCard.addEventListener('mousemove', function (e) {
      var r = aboutCard.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      aboutCard.style.transform =
        'perspective(1100px) rotateY(' + (x * 3.5) + 'deg) rotateX(' + (-y * 2.5) + 'deg)';
    });
    aboutCard.addEventListener('mouseleave', function () {
      aboutCard.style.transform = '';
    });
  }

  /* ── Services: stagger ανά στήλη στο reveal ──────────────────── */
  Array.prototype.slice.call(document.querySelectorAll('.xp-sitem')).forEach(function (item, i) {
    if (!item.dataset.delay) item.dataset.delay = String(i % 2);
  });

  /* ── Projects: shimmer μέχρι να φορτώσει η εικόνα ────────────── */
  projs.forEach(function (p) {
    var img = p.querySelector('img');
    if (!img) { p.classList.add('img-loaded'); return; }
    if (img.complete && img.naturalWidth) { p.classList.add('img-loaded'); return; }
    img.addEventListener('load', function () { p.classList.add('img-loaded'); });
    img.addEventListener('error', function () { p.classList.add('img-loaded'); });
  });

  /* ── Pricing: ζωντανό σύνολο με animated μετρητή ─────────────── */
  var prAmount = document.getElementById('pr-amount');
  if (prAmount) {
    var BASE = 390;
    var prBoxes = Array.prototype.slice.call(
      document.querySelectorAll('.pr-row input[type="checkbox"]'));
    var prMonthlyWrap = document.getElementById('pr-monthly');
    var prMonthlyNum = document.getElementById('pr-monthly-num');
    var shownTotal = BASE;
    var tweenRaf = null;

    function prTween(to) {
      if (reduced) { shownTotal = to; prAmount.textContent = to; return; }
      if (tweenRaf) cancelAnimationFrame(tweenRaf);
      var from = shownTotal;
      var t0 = null;
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 400, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        shownTotal = Math.round(from + (to - from) * eased);
        prAmount.textContent = shownTotal;
        if (p < 1) tweenRaf = requestAnimationFrame(frame);
      }
      tweenRaf = requestAnimationFrame(frame);
    }

    function prUpdate() {
      var total = BASE;
      var monthly = 0;
      prBoxes.forEach(function (b) {
        if (!b.checked) return;
        if (b.dataset.price) total += parseInt(b.dataset.price, 10);
        if (b.dataset.monthly) monthly += parseInt(b.dataset.monthly, 10);
      });
      prTween(total);
      prMonthlyWrap.hidden = monthly === 0;
      prMonthlyNum.textContent = monthly;
    }
    prBoxes.forEach(function (b) { b.addEventListener('change', prUpdate); });
  }
})();
