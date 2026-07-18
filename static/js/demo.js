/* ═══════════════════════════════════════════════════════════════
   LIVE DEMO BUILDER — ο επισκέπτης περιγράφει την επιχείρησή του
   και μια mini landing page "χτίζεται" ζωντανά μέσα σε browser
   mockup: nav → hero (με typing) → κάρτες → footer.
   3 θεματικά templates (καφέ/εστίαση, ξενοδοχείο, κατάστημα)
   + γενικό fallback. Όλα client-side, κανένα request.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var input = document.getElementById('demo-input');
  var btn = document.getElementById('demo-btn');
  var frame = document.getElementById('dm-frame');
  var page = document.getElementById('dm-page');
  var urlEl = document.getElementById('dm-url');
  var after = document.getElementById('demo-after');
  if (!input || !btn || !frame) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var building = false;

  var THEMES = [
    {
      keys: ['καφ', 'coffee', 'cafe', 'εστιατ', 'ταβερν', 'μπαρ', 'bar', 'brunch', 'φαγητ', 'pizza', 'burger', 'ζαχαρ', 'φούρν', 'φουρν'],
      acc: '#b07d4a',
      kicker: 'CAFÉ & BRUNCH',
      headline: 'Ο καφές, όπως πρέπει.',
      sub: 'Specialty καφές, φρέσκα brunch plates και ο πιο φιλόξενος χώρος της γειτονιάς.',
      cta: 'Δες το Μενού',
      nav: ['Μενού', 'Ο χώρος', 'Επικοινωνία'],
      cards: [['☕', 'Freddo Espresso', '3.20€'], ['🥐', 'Brunch Plate', '9.50€'], ['🍰', 'Cheesecake', '5.80€']]
    },
    {
      keys: ['ξενοδοχ', 'δωμάτ', 'δωματ', 'σουίτ', 'σουιτ', 'διαμερ', 'καταλ', 'hotel', 'suites', 'apart', 'villa', 'βίλ', 'βιλ', 'airbnb', 'τουρισ'],
      acc: '#3e8f96',
      kicker: 'HOTEL & SUITES',
      headline: 'Η θέα που θα θυμάστε.',
      sub: 'Πολυτελή δωμάτια με θέα στη θάλασσα, ιδιωτικές βεράντες και πρωινό με τοπικά προϊόντα.',
      cta: 'Κράτηση τώρα',
      nav: ['Δωμάτια', 'Παροχές', 'Κράτηση'],
      cards: [['🌅', 'Deluxe Suite', 'από 95€'], ['🌊', 'Sea View Studio', 'από 70€'], ['👨‍👩‍👧', 'Family Room', 'από 110€']]
    },
    {
      keys: ['κατάστη', 'καταστη', 'shop', 'store', 'eshop', 'e-shop', 'ρούχ', 'ρουχ', 'παπού', 'παπου', 'κοσμή', 'κοσμη', 'προϊό', 'προιο', 'boutique'],
      acc: '#8d6ae0',
      kicker: 'ONLINE STORE',
      headline: 'Νέα collection, κάθε εβδομάδα.',
      sub: 'Επιλεγμένα κομμάτια, γρήγορη αποστολή σε όλη την Ελλάδα και εύκολες επιστροφές.',
      cta: 'Δες τα προϊόντα',
      nav: ['Προϊόντα', 'Προσφορές', 'Καλάθι'],
      cards: [['👗', 'Midi Dress', '49€'], ['👟', 'Urban Sneakers', '79€'], ['👜', 'Leather Bag', '95€']]
    },
    {
      keys: [],
      acc: '#6f80ea',
      kicker: 'BUSINESS',
      headline: 'Παρουσία που εμπνέει εμπιστοσύνη.',
      sub: 'Σύγχρονη εικόνα, ξεκάθαρες υπηρεσίες και εύκολη επικοινωνία για τους πελάτες σας.',
      cta: 'Ζητήστε προσφορά',
      nav: ['Υπηρεσίες', 'Έργα', 'Επικοινωνία'],
      cards: [['💼', 'Υπηρεσίες', ''], ['⭐', 'Αξιολογήσεις', ''], ['📞', 'Επικοινωνία', '']]
    }
  ];

  function pickTheme(text) {
    var t = text.toLowerCase();
    for (var i = 0; i < THEMES.length - 1; i++) {
      for (var k = 0; k < THEMES[i].keys.length; k++) {
        if (t.indexOf(THEMES[i].keys[k]) !== -1) return THEMES[i];
      }
    }
    return THEMES[THEMES.length - 1];
  }

  /* Greeklish slug για το URL του mockup */
  var GR = { 'α': 'a', 'ά': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'έ': 'e',
    'ζ': 'z', 'η': 'i', 'ή': 'i', 'θ': 'th', 'ι': 'i', 'ί': 'i', 'ϊ': 'i', 'κ': 'k',
    'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'ό': 'o', 'π': 'p', 'ρ': 'r',
    'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'ύ': 'y', 'ϋ': 'y', 'φ': 'f', 'χ': 'ch',
    'ψ': 'ps', 'ω': 'o', 'ώ': 'o' };
  function slug(text) {
    var out = '';
    var t = text.toLowerCase();
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (GR[c]) out += GR[c];
      else if (/[a-z0-9]/.test(c)) out += c;
    }
    return (out || 'yourbusiness').slice(0, 24);
  }

  function el(cls, html) {
    var d = document.createElement('div');
    d.className = 'dm-el ' + cls;
    d.innerHTML = html;
    return d;
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function build() {
    if (building) return;
    building = true;
    btn.disabled = true;
    btn.textContent = 'Χτίζεται…';

    var raw = input.value.trim() || 'Η Επιχείρησή σας';
    var brand = raw.slice(0, 32);
    var theme = pickTheme(raw);

    urlEl.textContent = slug(brand) + '.gr';
    page.innerHTML = '';
    page.style.setProperty('--dm-acc', theme.acc);
    frame.hidden = false;
    after.hidden = true;
    frame.classList.remove('dm-in');
    void frame.offsetWidth;
    frame.classList.add('dm-in');

    /* Δόμηση στοιχείων */
    var nav = el('dm-nav',
      '<span class="dm-logo">' + esc(brand) + '</span>' +
      '<span class="dm-links">' + theme.nav.map(function (n) { return '<i>' + esc(n) + '</i>'; }).join('') + '</span>' +
      '<span class="dm-cta-mini">' + esc(theme.cta) + '</span>');
    var hero = el('dm-hero',
      '<span class="dm-kicker">' + esc(theme.kicker) + '</span>' +
      '<h3 class="dm-h"><span id="dm-type"></span><i class="dm-caret"></i></h3>' +
      '<p class="dm-p">' + esc(theme.sub) + '</p>' +
      '<span class="dm-btn">' + esc(theme.cta) + '</span>');
    var cards = el('dm-cards', theme.cards.map(function (c) {
      return '<div class="dm-card"><span class="dm-card-ico">' + c[0] + '</span>' +
             '<span class="dm-card-name">' + esc(c[1]) + '</span>' +
             (c[2] ? '<span class="dm-card-price">' + esc(c[2]) + '</span>' : '') + '</div>';
    }).join(''));
    var foot = el('dm-foot', '© ' + esc(brand) + ' — φτιαγμένο με <strong>fkechagias.gr</strong>');

    page.appendChild(nav);
    page.appendChild(hero);
    page.appendChild(cards);
    page.appendChild(foot);

    var typeTarget = hero.querySelector('#dm-type');
    var caret = hero.querySelector('.dm-caret');
    var headline = theme.headline;

    function finish() {
      if (caret) caret.style.display = 'none';
      after.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Δοκίμασε ξανά ↻';
      building = false;
    }

    if (reduced) {
      [nav, hero, cards, foot].forEach(function (b) { b.classList.add('on'); });
      typeTarget.textContent = headline;
      finish();
      return;
    }

    /* Σκηνοθεσία: nav → hero → typing → κάρτες → footer */
    setTimeout(function () { nav.classList.add('on'); }, 350);
    setTimeout(function () { hero.classList.add('on'); }, 800);
    setTimeout(function () {
      var i = 0;
      var typer = setInterval(function () {
        typeTarget.textContent = headline.slice(0, ++i);
        if (i >= headline.length) {
          clearInterval(typer);
          setTimeout(function () { cards.classList.add('on'); }, 260);
          setTimeout(function () { foot.classList.add('on'); }, 620);
          setTimeout(finish, 1000);
        }
      }, 42);
    }, 1250);

    /* Scroll το mockup στο κάδρο */
    setTimeout(function () {
      if (window.__lenis) window.__lenis.scrollTo(frame, { offset: -110, duration: 0.9 });
      else frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  }

  btn.addEventListener('click', build);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); build(); }
  });

  /* Έτοιμα παραδείγματα */
  Array.prototype.slice.call(document.querySelectorAll('.xp-demo-chips [data-fill]')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      input.value = chip.dataset.fill;
      build();
    });
  });
})();
