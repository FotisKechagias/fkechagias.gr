/* ═══════════════════════════════════════════════════════════════
   XP SCENE — σταθερό WebGL φόντο για όλη την αρχική.
   Η κάμερα ταξιδεύει μπροστά μέσα στο πεδίο σωματιδίων
   καθώς ο χρήστης κάνει scroll — αίσθηση "πτήσης".
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  var canvas = document.getElementById('xp-canvas');
  if (!canvas) return;

  var W = window.innerWidth;
  var H = window.innerHeight;
  var isMobile = W < 768;
  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COUNT  = isMobile ? 380 : 780;
  var DEPTH  = 110;  /* βάθος πεδίου σωματιδίων */
  var TRAVEL = 60;   /* πόσο ταξιδεύει η κάμερα σε όλο το scroll */
  var CAM_Z0 = 8;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(62, W / H, 0.1, 160);
  camera.position.set(0, 0, CAM_Z0);

  /* ── Particles ── */
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(COUNT * 3);
  var col = new Float32Array(COUNT * 3);
  var sz  = new Float32Array(COUNT);

  /* blue / purple / cyan palette */
  var palette = [
    [0.33, 0.52, 0.94],
    [0.60, 0.40, 0.93],
    [0.25, 0.76, 0.84],
    [0.46, 0.44, 0.97],
    [0.80, 0.55, 0.98],
  ];

  for (var i = 0; i < COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 2] = 6 - Math.random() * DEPTH;

    var c = palette[(Math.random() * palette.length) | 0];
    col[i * 3]     = c[0];
    col[i * 3 + 1] = c[1];
    col[i * 3 + 2] = c[2];

    sz[i] = Math.random() * 0.8 + 0.25;
  }

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
    '  gl_PointSize = min(size * uPR * (55.0 / -mv.z), 11.0);',
    '  gl_Position  = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var frag = [
    'varying vec3 vColor;',
    'void main(){',
    '  float d = length(gl_PointCoord - 0.5);',
    '  if (d > 0.5) discard;',
    '  float a = 1.0 - smoothstep(0.1, 0.5, d);',
    '  gl_FragColor = vec4(vColor, a * 0.6);',
    '}'
  ].join('\n');

  var mat = new THREE.ShaderMaterial({
    uniforms: { uPR: { value: renderer.getPixelRatio() } },
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  var points = new THREE.Points(geo, mat);
  scene.add(points);

  /* ── Mouse parallax ── */
  var mx = 0, my = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', function (e) {
    tx = (e.clientX / W - 0.5) * 0.8;
    ty = -(e.clientY / H - 0.5) * 0.5;
  });

  /* ── Scroll → ταξίδι κάμερας ──
     Ακούει lenis.on('scroll') αντί για native window scroll ώστε η
     κάμερα να μένει συγχρονισμένη με το smooth-scroll του Lenis. */
  function bindScroll(handler) {
    if (window.__lenis && typeof window.__lenis.on === 'function') {
      window.__lenis.on('scroll', handler);
    } else {
      window.addEventListener('scroll', handler, { passive: true });
    }
  }

  var prog = 0, targetProg = 0;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    targetProg = max > 0 ? window.scrollY / max : 0;
  }
  bindScroll(onScroll);
  onScroll();

  var clock = new THREE.Clock();

  function render() {
    var t = clock.getElapsedTime();
    prog += (targetProg - prog) * 0.06;
    mx   += (tx - mx) * 0.04;
    my   += (ty - my) * 0.04;

    camera.position.z = CAM_Z0 - prog * TRAVEL;
    camera.position.x = mx;
    camera.position.y = my;
    points.rotation.z = t * 0.02;

    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  if (reduced) {
    /* Στατικό: ένα render + follow στο scroll χωρίς συνεχές loop */
    prog = targetProg;
    render();
    bindScroll(function () {
      prog = targetProg;
      render();
    });
  } else {
    animate();
  }

  window.addEventListener('resize', function () {
    W = window.innerWidth;
    H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    mat.uniforms.uPR.value = renderer.getPixelRatio();
  });
})();
