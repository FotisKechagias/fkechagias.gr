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
})();
