/* ═══════════════════════════════════════════════════════════════
   MINI WEBSITE BUILDER — live demo (πλήρως client-side)
   - Prompt → fake AI generation (console μηνύματα + progress)
   - 8 θεματικά templates: διαφορετικό layout/χρώμα/τυπογραφία
   - Morph transition ανάμεσα σε templates (blur + scale swap)
   - Ζωντανά controls: χρώμα, γωνίες, γραμματοσειρά, dark, glass
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var input = document.getElementById('demo-input');
  var btn = document.getElementById('demo-btn');
  var frame = document.getElementById('dm-frame');
  var page = document.getElementById('dm-page');
  var urlEl = document.getElementById('dm-url');
  var after = document.getElementById('demo-after');
  var consoleBox = document.getElementById('dmb-console');
  var linesBox = document.getElementById('dmb-lines');
  var progBar = document.getElementById('dmb-progress-bar');
  var controls = document.getElementById('dmb-controls');
  if (!input || !btn || !page) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var building = false;
  var generated = false;

  /* ── Template library ────────────────────────────────────────── */
  var THEMES = [
    { id: 'cafe',
      keys: ['καφ', 'coffee', 'cafe', 'brunch', 'ζαχαρ', 'φούρν', 'φουρν', 'bakery'],
      acc: '#b07d4a', font: 'sans', layout: 'center', dark: false,
      kicker: 'CAFÉ & BRUNCH', headline: 'Ο καφές, όπως πρέπει.',
      sub: 'Specialty καφές, φρέσκα brunch plates και ο πιο φιλόξενος χώρος της γειτονιάς.',
      cta: 'Δες το Μενού', nav: ['Μενού', 'Ο χώρος', 'Επικοινωνία'],
      cards: [['☕', 'Freddo Espresso', '3.20€'], ['🥐', 'Brunch Plate', '9.50€'], ['🍰', 'Cheesecake', '5.80€']] },

    { id: 'restaurant',
      keys: ['εστιατ', 'ταβερν', 'restaurant', 'φαγητ', 'κουζίν', 'κουζιν', 'grill', 'pizza', 'burger', 'μεζ'],
      acc: '#c05f4e', font: 'serif', layout: 'split', dark: false,
      kicker: 'FINE DINING', headline: 'Γεύσεις που θυμάσαι.',
      sub: 'Σύγχρονη ελληνική κουζίνα με πρώτες ύλες από μικρούς παραγωγούς.',
      cta: 'Κράτηση τραπεζιού', nav: ['Μενού', 'Ιστορία', 'Κρατήσεις'],
      cards: [['🐟', 'Λαβράκι σχάρας', '18€'], ['🥗', 'Χωριάτικη 2.0', '9€'], ['🍷', 'Κρασιά αμπελώνα', 'λίστα']] },

    { id: 'realestate',
      keys: ['μεσιτ', 'ακίνητ', 'ακινητ', 'κατοικ', 'real estate', 'villa', 'βίλ', 'βιλ', 'estate', 'ξενοδοχ', 'σουίτ', 'σουιτ', 'διαμερ', 'καταλ', 'hotel', 'suites', 'airbnb', 'luxury'],
      acc: '#a08b5f', font: 'serif', layout: 'split', dark: false,
      kicker: 'LUXURY PROPERTIES', headline: 'Κατοικίες με άποψη.',
      sub: 'Επιλεγμένα ακίνητα και κατοικίες υψηλής αισθητικής, με προσωπική εξυπηρέτηση.',
      cta: 'Δείτε τα ακίνητα', nav: ['Ακίνητα', 'Υπηρεσίες', 'Επικοινωνία'],
      cards: [['🏛️', 'Penthouse Κέντρο', '450.000€'], ['🌊', 'Βίλα με θέα', '780.000€'], ['🌿', 'Μεζονέτα Πανόραμα', '320.000€']] },

    { id: 'gym',
      keys: ['γυμναστ', 'gym', 'fitness', 'crossfit', 'yoga', 'pilates', 'προπον', 'sport'],
      acc: '#4ca66b', font: 'sans', layout: 'center', dark: true,
      kicker: 'TRAIN HARDER', headline: 'Γίνε η καλύτερη εκδοχή σου.',
      sub: 'Σύγχρονος εξοπλισμός, personal training και ομαδικά προγράμματα κάθε μέρα.',
      cta: 'Δωρεάν δοκιμαστικό', nav: ['Προγράμματα', 'Coaches', 'Συνδρομές'],
      cards: [['🏋️', 'Personal Training', 'από 25€'], ['🔥', 'HIIT Classes', '10€/είσοδος'], ['🧘', 'Yoga & Mobility', '8€/είσοδος']] },

    { id: 'law',
      keys: ['δικηγορ', 'νομικ', 'law', 'legal', 'συμβολαιογρ', 'λογιστ'],
      acc: '#3f5e8f', font: 'serif', layout: 'left', dark: false,
      kicker: 'ΔΙΚΗΓΟΡΙΚΟ ΓΡΑΦΕΙΟ', headline: 'Το δίκιο σας, με σχέδιο.',
      sub: 'Εξειδίκευση σε αστικό, εμπορικό και εργατικό δίκαιο — με διαφάνεια σε κάθε βήμα.',
      cta: 'Κλείστε ραντεβού', nav: ['Τομείς', 'Η ομάδα', 'Επικοινωνία'],
      cards: [['⚖️', 'Αστικό Δίκαιο', ''], ['🏢', 'Εμπορικό Δίκαιο', ''], ['🤝', 'Διαμεσολάβηση', '']] },

    { id: 'medical',
      keys: ['ιατρ', 'οδοντ', 'κλινικ', 'γιατρ', 'dental', 'medical', 'φυσιοθερ', 'φυσικοθερ', 'ψυχολ'],
      acc: '#47a3b5', font: 'sans', layout: 'center', dark: false,
      kicker: 'ΣΥΓΧΡΟΝΗ ΦΡΟΝΤΙΔΑ', headline: 'Το χαμόγελό σας, πρώτα.',
      sub: 'Σύγχρονος εξοπλισμός, ανώδυνες θεραπείες και προσωπικό πλάνο για κάθε ασθενή.',
      cta: 'Κλείστε ραντεβού', nav: ['Υπηρεσίες', 'Η ομάδα', 'Ραντεβού'],
      cards: [['🦷', 'Λεύκανση', 'από 120€'], ['✨', 'Ορθοδοντική', 'πλάνο'], ['🪥', 'Καθαρισμός', '50€']] },

    { id: 'photo',
      keys: ['φωτογρ', 'photo', 'studio', 'portfolio', 'βίντεο', 'βιντεο', 'video', 'δημιουργ', 'design studio'],
      acc: '#d6a2c4', font: 'sans', layout: 'split', dark: true,
      kicker: 'VISUAL STORIES', headline: 'Στιγμές που μένουν.',
      sub: 'Φωτογράφιση γάμων, portraits και brands — με κινηματογραφική ματιά.',
      cta: 'Δες το portfolio', nav: ['Portfolio', 'Πακέτα', 'Επικοινωνία'],
      cards: [['💍', 'Γάμοι', 'από 900€'], ['👤', 'Portraits', 'από 150€'], ['🏷️', 'Brands', 'custom']] },

    { id: 'shop',
      keys: ['κατάστη', 'καταστη', 'shop', 'store', 'eshop', 'e-shop', 'ρούχ', 'ρουχ', 'παπού', 'παπου', 'κοσμή', 'κοσμη', 'boutique', 'προϊό', 'προιο'],
      acc: '#8d6ae0', font: 'sans', layout: 'center', dark: false,
      kicker: 'ONLINE STORE', headline: 'Νέα collection, κάθε εβδομάδα.',
      sub: 'Επιλεγμένα κομμάτια, γρήγορη αποστολή σε όλη την Ελλάδα και εύκολες επιστροφές.',
      cta: 'Δες τα προϊόντα', nav: ['Προϊόντα', 'Προσφορές', 'Καλάθι'],
      cards: [['👗', 'Midi Dress', '49€'], ['👟', 'Urban Sneakers', '79€'], ['👜', 'Leather Bag', '95€']] },

    { id: 'startup',
      keys: [],
      acc: '#6f80ea', font: 'sans', layout: 'center', dark: false,
      kicker: 'DIGITAL PRODUCT', headline: 'Παρουσία που εμπνέει εμπιστοσύνη.',
      sub: 'Σύγχρονη εικόνα, ξεκάθαρες υπηρεσίες και εύκολη επικοινωνία για τους πελάτες σας.',
      cta: 'Ζητήστε προσφορά', nav: ['Υπηρεσίες', 'Έργα', 'Επικοινωνία'],
      cards: [['💼', 'Υπηρεσίες', ''], ['⭐', 'Αξιολογήσεις', ''], ['📞', 'Επικοινωνία', '']] }
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

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function el(cls, html) {
    var d = document.createElement('div');
    d.className = 'dm-el ' + cls;
    d.innerHTML = html;
    return d;
  }

  /* ── Rendering ───────────────────────────────────────────────── */
  function renderTemplate(theme, brand) {
    page.style.setProperty('--dm-acc', theme.acc);
    page.classList.toggle('dm-serif', theme.font === 'serif');
    page.classList.toggle('dm-dark', !!theme.dark);
    syncControls(theme);

    var nav = el('dm-nav',
      '<span class="dm-logo">' + esc(brand) + '</span>' +
      '<span class="dm-links">' + theme.nav.map(function (n) { return '<i>' + esc(n) + '</i>'; }).join('') + '</span>' +
      '<span class="dm-cta-mini">' + esc(theme.cta) + '</span>');

    var heroInner =
      '<span class="dm-kicker">' + esc(theme.kicker) + '</span>' +
      '<h3 class="dm-h"><span class="dm-type"></span><i class="dm-caret"></i></h3>' +
      '<p class="dm-p">' + esc(theme.sub) + '</p>' +
      '<span class="dm-btn">' + esc(theme.cta) + '</span>';
    var hero;
    if (theme.layout === 'split') {
      hero = el('dm-hero dm-hero-split',
        '<div class="dm-hero-copy">' + heroInner + '</div>' +
        '<div class="dm-visual" aria-hidden="true"><span>✦</span></div>');
    } else if (theme.layout === 'left') {
      hero = el('dm-hero dm-hero-left', heroInner);
    } else {
      hero = el('dm-hero', heroInner);
    }

    var cards = el('dm-cards', theme.cards.map(function (c) {
      return '<div class="dm-card"><span class="dm-card-ico">' + c[0] + '</span>' +
             '<span class="dm-card-name">' + esc(c[1]) + '</span>' +
             (c[2] ? '<span class="dm-card-price">' + esc(c[2]) + '</span>' : '') + '</div>';
    }).join(''));

    var foot = el('dm-foot', '© ' + esc(brand) + ' — φτιαγμένο με <strong>fkechagias.gr</strong>');

    page.innerHTML = '';
    page.appendChild(nav);
    page.appendChild(hero);
    page.appendChild(cards);
    page.appendChild(foot);

    return { nav: nav, hero: hero, cards: cards, foot: foot,
             typeTarget: hero.querySelector('.dm-type'),
             caret: hero.querySelector('.dm-caret'),
             headline: theme.headline };
  }

  /* Συγχρονισμός των controls με το τρέχον template */
  function syncControls(theme) {
    var sw = document.querySelectorAll('#dmb-swatches button');
    sw.forEach(function (b) { b.classList.toggle('is-on', b.dataset.acc === theme.acc); });
    setOpt('font', theme.font === 'serif' ? 'serif' : 'sans');
    setOpt('mode', theme.dark ? 'dark' : 'light');
  }
  function setOpt(group, val) {
    var wrap = document.querySelector('.dmb-opts[data-var="' + group + '"]');
    if (!wrap) return;
    Array.prototype.slice.call(wrap.children).forEach(function (c) {
      c.classList.toggle('is-selected', c.dataset.val === val);
    });
  }

  /* ── Fake AI console ─────────────────────────────────────────── */
  var AI_STEPS = [
    'Κατανοώ την επιχείρηση…',
    'Σχεδιάζω το layout…',
    'Διαλέγω τυπογραφία & χρώματα…',
    'Χτίζω τα sections…',
    'Βελτιστοποιώ για κινητά…',
    'Έτοιμο ✓'
  ];

  function runConsole(done) {
    consoleBox.hidden = false;
    linesBox.innerHTML = '';
    progBar.style.width = '0%';
    var i = 0;
    function step() {
      if (i > 0) {
        var prev = linesBox.children[i - 1];
        if (prev) prev.classList.add('done');
      }
      if (i >= AI_STEPS.length) { done(); return; }
      var line = document.createElement('div');
      line.className = 'dmb-line';
      line.innerHTML = '<i></i>' + esc(AI_STEPS[i]);
      linesBox.appendChild(line);
      requestAnimationFrame(function () { line.classList.add('in'); });
      progBar.style.width = Math.round(((i + 1) / AI_STEPS.length) * 100) + '%';
      i++;
      setTimeout(step, i === AI_STEPS.length ? 340 : 430);
    }
    step();
  }

  /* ── Build flow ──────────────────────────────────────────────── */
  function build() {
    if (building) return;
    building = true;
    btn.disabled = true;
    btn.textContent = 'Χτίζεται…';
    after.hidden = true;

    var raw = input.value.trim() || 'Η Επιχείρησή σας';
    var brand = raw.slice(0, 32);
    var theme = pickTheme(raw);

    var start = function () {
      urlEl.textContent = slug(brand) + '.gr';
      var parts = renderTemplate(theme, brand);
      reveal(parts);
    };

    /* Morph out το προηγούμενο template */
    var hasContent = page.querySelector('.dm-nav');
    if (reduced) {
      urlEl.textContent = slug(brand) + '.gr';
      var parts = renderTemplate(theme, brand);
      [parts.nav, parts.hero, parts.cards, parts.foot].forEach(function (b) { b.classList.add('on'); });
      parts.typeTarget.textContent = parts.headline;
      if (parts.caret) parts.caret.style.display = 'none';
      finish();
      return;
    }

    runConsole(function () {
      setTimeout(function () { consoleBox.hidden = true; }, 550);
      if (hasContent) {
        page.classList.add('dm-swap');
        setTimeout(function () {
          start();
          page.classList.remove('dm-swap');
        }, 380);
      } else {
        var empty = document.getElementById('dm-empty');
        if (empty) empty.remove();
        start();
      }
    });

    /* Φέρε το preview στο κάδρο σε κινητά */
    if (window.innerWidth < 900) {
      setTimeout(function () {
        if (window.__lenis) window.__lenis.scrollTo(frame, { offset: -100, duration: 0.9 });
        else frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }

  function reveal(parts) {
    setTimeout(function () { parts.nav.classList.add('on'); }, 120);
    setTimeout(function () { parts.hero.classList.add('on'); }, 420);
    setTimeout(function () {
      var i = 0;
      var typer = setInterval(function () {
        parts.typeTarget.textContent = parts.headline.slice(0, ++i);
        if (i >= parts.headline.length) {
          clearInterval(typer);
          setTimeout(function () { parts.cards.classList.add('on'); }, 200);
          setTimeout(function () { parts.foot.classList.add('on'); }, 480);
          setTimeout(finish, 800);
        }
      }, 38);
    }, 750);
  }

  function finish() {
    var caret = page.querySelector('.dm-caret');
    if (caret) caret.style.display = 'none';
    after.hidden = false;
    controls.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Generate ξανά ↻';
    building = false;
    generated = true;
  }

  /* ── Controls ────────────────────────────────────────────────── */
  document.querySelectorAll('#dmb-swatches button').forEach(function (b) {
    b.addEventListener('click', function () {
      page.style.setProperty('--dm-acc', b.dataset.acc);
      document.querySelectorAll('#dmb-swatches button').forEach(function (o) {
        o.classList.toggle('is-on', o === b);
      });
    });
  });

  document.querySelectorAll('.dmb-opts').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var chip = e.target.closest('.bw-chip');
      if (!chip) return;
      Array.prototype.slice.call(group.children).forEach(function (c) {
        c.classList.toggle('is-selected', c === chip);
      });
      var v = chip.dataset.val;
      switch (group.dataset.var) {
        case 'rad':   page.style.setProperty('--dm-rad', v); break;
        case 'font':  page.classList.toggle('dm-serif', v === 'serif'); break;
        case 'mode':  page.classList.toggle('dm-dark', v === 'dark'); break;
        case 'glass': page.classList.toggle('dm-glass', v === 'on'); break;
      }
    });
  });

  /* ── Είσοδοι ─────────────────────────────────────────────────── */
  btn.addEventListener('click', build);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); build(); }
  });
  document.querySelectorAll('#dmb-suggest [data-fill]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      input.value = chip.dataset.fill;
      build();
    });
  });
})();
