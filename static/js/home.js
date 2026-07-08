/* ═══════════════════════════════════════════════════════════════
   HOME EXPERIENCE ENGINE
   - Hero: masked line reveal (καθαρό CSS) + xp-fade entrance
     συγχρονισμένη με το preloader.
   - About: τίτλος με word pull-up (μία φορά, IntersectionObserver).
   - Services/Projects/Contact: απλές, στατικές ενότητες — το
     reveal-up fade τους χειρίζεται ήδη το main.js σε όλη τη σελίδα.
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
})();
