/* ═══════════════════════════════════════════════════════════════
   HOME EXPERIENCE ENGINE
   - Hero: masked line reveal (καθαρό CSS) + xp-fade entrance
     συγχρονισμένη με το preloader.
   - About: τίτλος με word pull-up (μία φορά, IntersectionObserver).
   - Projects: staggered entrance (εναλλάξ από αριστερά/δεξιά) +
     parallax στις εικόνες των καρτών, οδηγούμενο από το scroll.
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

    /* Parallax: η εικόνα κάθε κάρτας μετατοπίζεται ελαφρά (±6%)
       ανάλογα με τη θέση της κάρτας στο viewport. */
    var projImgs = projs.map(function (p) { return p.querySelector('img'); });
    var parTick = false;
    function parallax() {
      parTick = false;
      var vh = window.innerHeight || 1;
      projs.forEach(function (p, i) {
        var img = projImgs[i];
        if (!img) return;
        var r = p.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        /* -1 (κάρτα κάτω από το viewport) … +1 (κάρτα πάνω) */
        var t = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        img.style.setProperty('--par', (t * -6).toFixed(2) + '%');
      });
    }
    function queueParallax() {
      if (!parTick) { parTick = true; requestAnimationFrame(parallax); }
    }
    if (window.__lenis && typeof window.__lenis.on === 'function') {
      window.__lenis.on('scroll', queueParallax);
    } else {
      window.addEventListener('scroll', queueParallax, { passive: true });
    }
    window.addEventListener('resize', queueParallax);
    parallax();
  }
})();
