(function () {
  'use strict';

  var isSlider = document.body.classList.contains('is-slider');

  /* ── Preloader ───────────────────────────────────────────────── */
  var preloader = document.getElementById('preloader');
  var preloaderBar = document.getElementById('preloader-bar');

  var bgVideo = document.querySelector('.bg-video');

  if (preloader) {
    var progress = 0;
    var barInterval = setInterval(function () {
      progress += Math.random() * 20 + 8;
      if (progress > 90) progress = 90;
      if (preloaderBar) preloaderBar.style.width = progress + '%';
    }, 120);

    window.addEventListener('load', function () {
      clearInterval(barInterval);
      if (preloaderBar) preloaderBar.style.width = '100%';
      setTimeout(function () {
        preloader.classList.add('hidden');
        if (isSlider) setTimeout(initSlider, 50);
      }, 500);
    });
  } else {
    if (isSlider) initSlider();
  }

  /* ═══════════════════════════════════════════════════════════════
     FULL-PAGE SLIDER ENGINE (manual navigation only, no auto-scroll)
  ═══════════════════════════════════════════════════════════════ */
  var slides = [];
  var currentSlide = 0;
  var totalSlides = 0;
  var transitioning = false;
  var scrollHint  = document.getElementById('scroll-hint');
  var dotsNav     = document.getElementById('slide-dots');
  var counterEl   = document.getElementById('slide-counter');
  var scCurrent   = counterEl ? counterEl.querySelector('.sc-current') : null;
  var scTotal     = counterEl ? counterEl.querySelector('.sc-total')   : null;

  function initSlider() {
    slides = Array.from(document.querySelectorAll('.story-section'));
    totalSlides = slides.length;
    if (!totalSlides) return;

    if (scTotal) scTotal.textContent = String(totalSlides).padStart(2, '0');
    initDots();

    currentSlide = 0;
    activateSlide(0, true);
  }

  function initDots() {
    if (!dotsNav) return;
    dotsNav.innerHTML = '';
    slides.forEach(function (_, i) {
      var btn = document.createElement('button');
      btn.className = 'sd-dot';
      btn.setAttribute('aria-label', 'Slide ' + (i + 1));
      btn.addEventListener('click', function () { activateSlide(i, false); });
      dotsNav.appendChild(btn);
    });
  }

  function activateSlide(index, instant) {
    if (index < 0 || index >= totalSlides) return;
    if (index === currentSlide && !instant) return;
    if (transitioning && !instant) return;

    slides[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    triggerReveals(slides[currentSlide]);

    if (!instant) {
      transitioning = true;
      setTimeout(function () { transitioning = false; }, 750);
    }

    updateNavState();
    updateScrollHint();
    updateCounter();
    updateDots();
  }

  function triggerReveals(slide) {
    var els = slide.querySelectorAll('.reveal-up');
    els.forEach(function (el) { el.classList.remove('visible'); });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.forEach(function (el) {
          var delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(function () { el.classList.add('visible'); }, delay * 140);
        });
      });
    });
  }

  function updateScrollHint() {
    if (!scrollHint || !isSlider) return;
    if (currentSlide >= totalSlides - 1) {
      scrollHint.classList.add('hidden');
    } else {
      scrollHint.classList.remove('hidden');
    }
  }

  function updateCounter() {
    if (scCurrent) scCurrent.textContent = String(currentSlide + 1).padStart(2, '0');
  }

  function updateDots() {
    if (!dotsNav) return;
    dotsNav.querySelectorAll('.sd-dot').forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function updateNavState() {
    // Regular nav links (slides 1–3)
    document.querySelectorAll('.nav-link').forEach(function (link) {
      var idx = parseInt(link.dataset.slide, 10);
      link.style.color = (idx === currentSlide) ? 'var(--c-white)' : '';
    });
    // CTA button (slide 4 = contact)
    var cta = document.querySelector('.nav-cta');
    if (cta) {
      var ctaIdx = parseInt(cta.dataset.slide, 10);
      if (ctaIdx === currentSlide) {
        cta.style.background = 'var(--c-blue)';
        cta.style.color = 'var(--c-white)';
      } else {
        cta.style.background = '';
        cta.style.color = '';
      }
    }
  }

  /* ── data-slide buttons ──────────────────────────────────────── */
  document.querySelectorAll('[data-slide]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var idx = parseInt(el.dataset.slide, 10);
      if (isNaN(idx)) return;

      if (isSlider) {
        e.preventDefault();
        e.stopPropagation();
        activateSlide(idx, false);
      } else {
        var urls = ['/', '/#vision', '/#services', '/#projects', '/#contact'];
        window.location.href = urls[idx] !== undefined ? urls[idx] : '/';
      }
    });
  });

  /* ── Wheel navigation ────────────────────────────────────────── */
  if (isSlider) {
    var wheelCooldown = false;
    window.addEventListener('wheel', function (e) {
      if (wheelCooldown || transitioning) return;
      wheelCooldown = true;
      setTimeout(function () { wheelCooldown = false; }, 900);

      if (e.deltaY > 20 && currentSlide < totalSlides - 1) {
        activateSlide(currentSlide + 1, false);
      } else if (e.deltaY < -20 && currentSlide > 0) {
        activateSlide(currentSlide - 1, false);
      }
    }, { passive: true });

    /* ── Touch swipe ─────────────────────────────────────────── */
    var touchStartY = 0;
    window.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      var diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 50) return;
      if (diff > 0 && currentSlide < totalSlides - 1) activateSlide(currentSlide + 1, false);
      else if (diff < 0 && currentSlide > 0) activateSlide(currentSlide - 1, false);
    }, { passive: true });

    /* ── Keyboard ────────────────────────────────────────────── */
    window.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.key === 'ArrowDown' || e.key === ' ') && currentSlide < totalSlides - 1) {
        e.preventDefault();
        activateSlide(currentSlide + 1, false);
      } else if (e.key === 'ArrowUp' && currentSlide > 0) {
        e.preventDefault();
        activateSlide(currentSlide - 1, false);
      }
    });
  }

  /* ── Non-slider reveal animations (project_list, project_detail) */
  if (!isSlider) {
    var revealEls = document.querySelectorAll('.reveal-up');
    if (revealEls.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = parseInt(entry.target.dataset.delay || '0', 10);
            setTimeout(function () { entry.target.classList.add('visible'); }, delay * 120);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { obs.observe(el); });
    }
  }

  /* ── Custom Cursor ───────────────────────────────────────────── */
  var cursorDot = document.getElementById('cursor-dot');
  var cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(hover: hover)').matches) {
    var cx = 0, cy = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', function (e) {
      cx = e.clientX;
      cy = e.clientY;
      cursorDot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) translate(-50%,-50%)';
    }, { passive: true });

    (function updateRing() {
      rx += (cx - rx) * 0.15;
      ry += (cy - ry) * 0.15;
      cursorRing.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(updateRing);
    })();

    document.querySelectorAll('a, button, [role="button"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorRing.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { cursorRing.classList.remove('hover'); });
    });
  }

  /* ── Mobile Menu ─────────────────────────────────────────────── */
  var hamburger = document.getElementById('nav-hamburger');
  var mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Background Video ───────────────────────────────────────── */
  if (bgVideo) {
    bgVideo.muted = true;
    if (bgVideo.paused) bgVideo.play().catch(function () {});
    setTimeout(function () {
      if (bgVideo.paused) bgVideo.play().catch(function () {});
    }, 800);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && bgVideo.paused) bgVideo.play().catch(function () {});
    });
  }

  /* ── Cookie Banner ──────────────────────────────────────────── */
  var cookieBanner = document.getElementById('cookie-banner');
  if (cookieBanner) {
    if (localStorage.getItem('cookie-consent')) {
      cookieBanner.classList.add('hidden');
    }
    document.getElementById('cookie-accept').addEventListener('click', function () {
      localStorage.setItem('cookie-consent', 'accepted');
      cookieBanner.classList.add('hidden');
    });
    document.getElementById('cookie-decline').addEventListener('click', function () {
      localStorage.setItem('cookie-consent', 'declined');
      cookieBanner.classList.add('hidden');
    });
  }

  /* ── Service Pill Selection ──────────────────────────────────── */
  var serviceHidden = document.getElementById('service-hidden');
  document.querySelectorAll('.sp-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      document.querySelectorAll('.sp-pill').forEach(function (p) { p.classList.remove('selected'); });
      pill.classList.add('selected');
      if (serviceHidden) serviceHidden.value = pill.dataset.service;
    });
  });

  /* ── Contact Form AJAX ───────────────────────────────────────── */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Αποστολή...'; }

      var data = {};
      Array.from(form.elements).forEach(function (el) {
        if (el.name && el.name !== 'csrfmiddlewaretoken') data[el.name] = el.value;
      });
      if (!data.message && data.service) data.message = data.service;

      var csrf = (form.querySelector('[name="csrfmiddlewaretoken"]') || {}).value || '';

      fetch('/contact/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
        body: JSON.stringify(data),
      })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json.success) {
          form.innerHTML = '<p style="font-family:var(--font-display);font-style:italic;font-size:clamp(18px,3vw,26px);color:var(--c-blue);text-align:center;padding:48px 0;font-weight:300;">Ευχαριστώ. Θα επικοινωνήσω σύντομα.</p>';
        } else {
          if (btn) { btn.disabled = false; btn.textContent = 'Σφάλμα — Δοκιμάστε ξανά'; }
        }
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Σφάλμα δικτύου'; }
      });
    });
  }

})();
