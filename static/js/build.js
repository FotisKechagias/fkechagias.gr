/* ═══════════════════════════════════════════════════════════════
   ΑΣ ΧΤΙΣΟΥΜΕ ΜΑΖΙ — λογική διαδραστικού οδηγού
   - Ένα βήμα τη φορά, με progress bar και μετρητή.
   - Enter ↵ προχωράει· τα chips προχωράνε μόνα τους (auto-advance).
   - Logo: drag & drop + προεπισκόπηση.
   - Review: σύνοψη όλων, click σε γραμμή = επιστροφή στο βήμα.
   - Υποβολή: multipart FormData στο /xtisoume-mazi/submit/.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var form = document.getElementById('bw-form');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.bw-step'));
  var bar = document.getElementById('bw-progress-bar');
  var counter = document.getElementById('bw-counter');
  var current = 0;
  /* Τα intro/done δεν μετράνε στο progress */
  var countable = steps.filter(function (s) {
    var d = s.dataset.step;
    return d !== 'intro' && d !== 'done';
  });

  function stepIndexByName(name) {
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].dataset.step === name) return i;
    }
    return -1;
  }

  function show(idx) {
    if (idx < 0 || idx >= steps.length) return;
    steps[current].classList.remove('is-active');
    current = idx;
    var step = steps[current];
    step.classList.add('is-active');

    /* progress */
    var ci = countable.indexOf(step);
    if (ci === -1) {
      bar.style.width = step.dataset.step === 'done' ? '100%' : '0%';
      counter.textContent = '';
    } else {
      var pct = Math.round(((ci + 1) / countable.length) * 100);
      bar.style.width = pct + '%';
      counter.textContent = (ci + 1) + ' / ' + countable.length + ' · ' + pct + '%';
    }

    /* focus στο πρώτο input του βήματος */
    var inp = step.querySelector('.bw-input:not([hidden])');
    if (inp) setTimeout(function () { inp.focus(); }, 120);

    if (step.dataset.step === 'review') buildReview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setError(step, msg) {
    var el = step.querySelector('.bw-error');
    if (el) el.textContent = msg || '';
    if (msg) {
      step.classList.remove('bw-shake');
      void step.offsetWidth; /* restart animation */
      step.classList.add('bw-shake');
    }
  }

  function validate(step) {
    setError(step, '');
    var req = step.dataset.required;
    if (!req) return true;
    var field = form.elements[req];
    var val = (field && field.value || '').trim();
    if (!val) {
      setError(step, req === 'business_type' || req === 'service_needed'
        ? 'Επιλέξτε μία από τις επιλογές.'
        : 'Το πεδίο είναι υποχρεωτικό.');
      return false;
    }
    if (req === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
      setError(step, 'Γράψτε ένα έγκυρο email.');
      return false;
    }
    return true;
  }

  function next() {
    var step = steps[current];
    if (!validate(step)) return;
    show(current + 1);
  }
  function back() { show(current - 1); }

  form.addEventListener('click', function (e) {
    if (e.target.closest('.bw-next')) next();
    else if (e.target.closest('.bw-back')) back();
  });

  /* Enter ↵ = επόμενο (όχι μέσα σε textarea) */
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
    var step = steps[current];
    var name = step.dataset.step;
    if (name !== 'review' && name !== 'done') next();
  });

  /* ── Chips ─────────────────────────────────────────────────── */
  Array.prototype.slice.call(form.querySelectorAll('.bw-chips')).forEach(function (group) {
    var hidden = form.elements[group.dataset.name];
    var stay = group.classList.contains('bw-chips-stay');
    var step = group.closest('.bw-step');
    var other = step ? step.querySelector('.bw-other-input') : null;

    group.addEventListener('click', function (e) {
      var chip = e.target.closest('.bw-chip');
      if (!chip) return;
      Array.prototype.slice.call(group.children).forEach(function (c) {
        c.classList.remove('is-selected');
      });
      chip.classList.add('is-selected');

      if (chip.dataset.other) {
        if (other) {
          other.hidden = false;
          hidden.value = other.value.trim();
          other.focus();
        }
      } else {
        if (other) other.hidden = true;
        hidden.value = chip.textContent.trim();
        setError(step, '');
        /* auto-advance: μικρή παύση να φανεί η επιλογή */
        if (!stay) setTimeout(next, 260);
      }
    });

    if (other) {
      other.addEventListener('input', function () {
        hidden.value = other.value.trim();
      });
    }
  });

  /* ── Logo: drag & drop + preview ───────────────────────────── */
  var drop = document.getElementById('bw-drop');
  var fileInput = document.getElementById('bw-logo-input');
  var idleView = document.getElementById('bw-drop-idle');
  var previewView = document.getElementById('bw-drop-preview');
  var previewImg = document.getElementById('bw-logo-preview');
  var logoName = document.getElementById('bw-logo-name');
  var removeBtn = document.getElementById('bw-logo-remove');

  function setLogo(file) {
    var step = drop.closest('.bw-step');
    setError(step, '');
    if (!file) return;
    if (!/^image\//.test(file.type)) { setError(step, 'Επιλέξτε αρχείο εικόνας (PNG, JPG, SVG).'); return; }
    if (file.size > 5 * 1024 * 1024) { setError(step, 'Το αρχείο ξεπερνά τα 5MB.'); return; }
    var dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    var reader = new FileReader();
    reader.onload = function (ev) {
      previewImg.src = ev.target.result;
      logoName.textContent = file.name;
      idleView.hidden = true;
      previewView.hidden = false;
    };
    reader.readAsDataURL(file);
  }

  if (drop) {
    fileInput.addEventListener('change', function () { setLogo(fileInput.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files.length) setLogo(e.dataTransfer.files[0]);
    });
    removeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      fileInput.value = '';
      previewImg.src = '';
      idleView.hidden = false;
      previewView.hidden = true;
    });
  }

  /* ── Review ────────────────────────────────────────────────── */
  var reviewMap = [
    ['Όνομα',           'contact_name',   'name'],
    ['Επιχείρηση',      'business_name',  'business'],
    ['Τύπος',           'business_type',  'type'],
    ['Χρειάζεστε',      'service_needed', 'service'],
    ['Υπάρχον site',    'current_url',    'current'],
    ['Email',           'email',          'contact'],
    ['Κινητό',          'phone',          'contact'],
    ['Πόλη',            'city',           'contact'],
    ['Διεύθυνση',       'address',        'contact'],
    ['Budget',          'budget',         'budget'],
    ['Χρόνος',          'timeline',       'budget'],
    ['Όραμα',           'vision',         'vision']
  ];

  function buildReview() {
    var wrap = document.getElementById('bw-review');
    wrap.innerHTML = '';
    reviewMap.forEach(function (row) {
      var val = (form.elements[row[1]] && form.elements[row[1]].value || '').trim();
      if (!val) return;
      var div = document.createElement('div');
      div.className = 'bw-review-row';
      var dt = document.createElement('dt');
      dt.textContent = row[0];
      var dd = document.createElement('dd');
      dd.textContent = val;
      div.appendChild(dt);
      div.appendChild(dd);
      div.addEventListener('click', function () { show(stepIndexByName(row[2])); });
      wrap.appendChild(div);
    });
    /* Logo thumbnail */
    if (fileInput && fileInput.files.length) {
      var div2 = document.createElement('div');
      div2.className = 'bw-review-row';
      var dt2 = document.createElement('dt');
      dt2.textContent = 'Logo';
      var dd2 = document.createElement('dd');
      var img = document.createElement('img');
      img.src = previewImg.src;
      img.alt = 'Logo';
      dd2.appendChild(img);
      div2.appendChild(dt2);
      div2.appendChild(dd2);
      div2.addEventListener('click', function () { show(stepIndexByName('logo')); });
      wrap.appendChild(div2);
    }
  }

  /* ── Autosave στο localStorage (χωρίς το logo) ─────────────────
     Αν ο χρήστης φύγει και ξανάρθει, τα πεδία τον περιμένουν. */
  var BW_KEY = 'bw-draft';
  var savedFields = ['contact_name', 'business_name', 'business_type',
    'service_needed', 'current_url', 'email', 'phone', 'city',
    'address', 'budget', 'timeline', 'vision'];

  function bwSave() {
    try {
      var data = {};
      savedFields.forEach(function (n) {
        var f = form.elements[n];
        if (f && f.value) data[n] = f.value;
      });
      localStorage.setItem(BW_KEY, JSON.stringify(data));
    } catch (err) {}
  }

  (function bwRestore() {
    try {
      var raw = localStorage.getItem(BW_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      var restored = false;
      savedFields.forEach(function (n) {
        if (!data[n]) return;
        var f = form.elements[n];
        if (f) { f.value = data[n]; restored = true; }
      });
      if (!restored) return;
      /* Σημάδεψε και τα αντίστοιχα chips ως επιλεγμένα */
      Array.prototype.slice.call(form.querySelectorAll('.bw-chips')).forEach(function (group) {
        var val = data[group.dataset.name];
        if (!val) return;
        Array.prototype.slice.call(group.children).forEach(function (c) {
          if (c.textContent.trim() === val) c.classList.add('is-selected');
        });
      });
      var hint = form.querySelector('.bw-hint');
      if (hint) hint.textContent = 'Βρήκα την πρόοδό σας από πριν — τα πεδία σας περιμένουν συμπληρωμένα.';
    } catch (err) {}
  })();

  form.addEventListener('input', bwSave);
  form.addEventListener('change', bwSave);

  /* ── Υποβολή ───────────────────────────────────────────────── */
  var submitBtn = document.getElementById('bw-submit');
  submitBtn.addEventListener('click', function () {
    var step = steps[current];
    setError(step, '');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Αποστολή…';

    var fd = new FormData(form);
    var csrf = form.querySelector('[name=csrfmiddlewaretoken]');

    fetch('/xtisoume-mazi/submit/', {
      method: 'POST',
      headers: { 'X-CSRFToken': csrf ? csrf.value : '' },
      body: fd
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.success) {
          try { localStorage.removeItem(BW_KEY); } catch (err) {}
          show(stepIndexByName('done'));
        } else {
          throw new Error(res.j.error || 'Σφάλμα');
        }
      })
      .catch(function (err) {
        setError(steps[current], err.message || 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Αποστολή →';
      });
  });
})();
