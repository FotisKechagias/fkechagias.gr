/* ═══════════════════════════════════════════════════════════════
   HERO 3D — σφαίρα σωματιδίων στη θέση του παλιού hero video.
   - Idle: αργή περιστροφή + ελαφρύ "breathing".
   - Scroll (μέσα στο ύψος του hero): επιτάχυνση περιστροφής,
     διαστολή της σφαίρας και σταδιακό fade — αίσθηση διάλυσης.
   - Παύση όταν το hero δεν είναι ορατό ή το tab είναι κρυφό.
   - prefers-reduced-motion: ένα στατικό render, χωρίς loop.
   Παλέτα: μόνο η muted accent οικογένεια του design system.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  var canvas = document.getElementById('hero-3d');
  var hero   = document.getElementById('hero');
  if (!canvas || !hero) return;

  var isMobile = window.innerWidth < 768;
  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COUNT = isMobile ? 2200 : 4500;
  var R     = 1.55;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
  camera.position.z = isMobile ? 5.0 : 4.4;

  function sizeToHero() {
    var w = hero.clientWidth;
    var h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  sizeToHero();

  /* ── Γεωμετρία: Fibonacci sphere + αραιή εξωτερική "σκόνη" ───── */
  var pos = new Float32Array(COUNT * 3);
  var col = new Float32Array(COUNT * 3);
  var sz  = new Float32Array(COUNT);

  /* Muted accent οικογένεια (ίδια απόχρωση, διαφορετική ένταση) */
  var palette = [
    [0.43, 0.52, 0.84],  /* #6e85d6 accent      */
    [0.55, 0.63, 0.91],  /* φωτεινότερο accent   */
    [0.35, 0.42, 0.66],  /* βαθύτερο accent      */
    [0.82, 0.84, 0.90]   /* ψυχρό σχεδόν-λευκό   */
  ];

  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < COUNT; i++) {
    var y   = 1 - (i / (COUNT - 1)) * 2;
    var rad = Math.sqrt(Math.max(0, 1 - y * y));
    var th  = golden * i;

    /* 8% των σωματιδίων: αχνή σκόνη πιο μακριά από την επιφάνεια */
    var dust = Math.random() < 0.08;
    var rr = dust
      ? R * (1.25 + Math.random() * 0.9)
      : R * (0.94 + Math.random() * 0.12);

    pos[i * 3]     = Math.cos(th) * rad * rr;
    pos[i * 3 + 1] = y * rr;
    pos[i * 3 + 2] = Math.sin(th) * rad * rr;

    var c = palette[(Math.random() * palette.length) | 0];
    col[i * 3]     = c[0];
    col[i * 3 + 1] = c[1];
    col[i * 3 + 2] = c[2];

    sz[i] = dust ? Math.random() * 0.5 + 0.2 : Math.random() * 0.9 + 0.35;
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sz,  1));

  var vert = [
    'attribute float size;',
    'attribute vec3 color;',
    'varying vec3 vColor;',
    'uniform float uPR;',
    'void main(){',
    '  vColor = color;',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  gl_PointSize = min(size * uPR * (34.0 / -mv.z), 9.0);',
    '  gl_Position  = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var frag = [
    'varying vec3 vColor;',
    'uniform float uFade;',
    'void main(){',
    '  float d = length(gl_PointCoord - 0.5);',
    '  if (d > 0.5) discard;',
    '  float a = 1.0 - smoothstep(0.08, 0.5, d);',
    '  gl_FragColor = vec4(vColor, a * 0.75 * uFade);',
    '}'
  ].join('\n');

  var mat = new THREE.ShaderMaterial({
    uniforms: {
      uPR:   { value: renderer.getPixelRatio() },
      uFade: { value: 1.0 }
    },
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  var sphere = new THREE.Points(geo, mat);
  var group  = new THREE.Group();
  group.add(sphere);
  /* Desktop: δεξιά από τον τίτλο. Mobile: κεντραρισμένη, λίγο ψηλά. */
  group.position.set(isMobile ? 0 : 1.0, isMobile ? 0.25 : -0.05, 0);
  group.rotation.x = -0.12;
  scene.add(group);

  /* ── Scroll progress μέσα στο ύψος του hero ──────────────────── */
  function bindScroll(handler) {
    if (window.__lenis && typeof window.__lenis.on === 'function') {
      window.__lenis.on('scroll', handler);
    } else {
      window.addEventListener('scroll', handler, { passive: true });
    }
  }

  var prog = 0, targetProg = 0;
  function onScroll() {
    var h = hero.clientHeight || 1;
    var y = window.scrollY || window.pageYOffset || 0;
    targetProg = Math.min(Math.max(y / h, 0), 1);
  }
  bindScroll(onScroll);
  onScroll();

  /* ── Διακριτικό mouse tilt (μόνο fine pointer) ───────────────── */
  var tiltX = 0, tiltY = 0, curX = 0, curY = 0;
  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      tiltX = (e.clientX / window.innerWidth  - 0.5) * 0.25;
      tiltY = (e.clientY / window.innerHeight - 0.5) * 0.18;
    });
  }

  var clock = new THREE.Clock();

  function render() {
    var t = clock.getElapsedTime();
    prog += (targetProg - prog) * 0.07;
    curX += (tiltX - curX) * 0.04;
    curY += (tiltY - curY) * 0.04;

    group.rotation.y = t * 0.07 + prog * 2.4 + curX;
    group.rotation.x = -0.12 + prog * 0.5 + curY;

    var s = (1 + Math.sin(t * 0.5) * 0.015) * (1 + prog * 1.5);
    group.scale.set(s, s, s);

    mat.uniforms.uFade.value = Math.max(0, 1 - prog * 0.95);

    renderer.render(scene, camera);
  }

  /* ── Loop: τρέχει μόνο όταν το hero είναι ορατό και το tab ενεργό */
  var heroVisible = true;
  var running = false;

  function loop() {
    if (!running) return;
    render();
    requestAnimationFrame(loop);
  }
  function setRunning(on) {
    if (on && !running) { running = true; requestAnimationFrame(loop); }
    else if (!on) { running = false; }
  }

  if (reduced) {
    /* Στατικό: ένα render, ξανά μόνο σε resize */
    render();
  } else {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        setRunning(heroVisible && !document.hidden);
      }, { rootMargin: '80px' }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      setRunning(heroVisible && !document.hidden);
    });
    setRunning(true);
  }

  window.addEventListener('resize', function () {
    sizeToHero();
    mat.uniforms.uPR.value = renderer.getPixelRatio();
    if (reduced) render();
  });
})();
