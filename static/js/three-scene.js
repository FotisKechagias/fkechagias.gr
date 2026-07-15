/* ═══════════════════════════════════════════════════════════════
   XP SCENE — κυματιστό πεδίο σωματιδίων ("ωκεανός") ως σταθερό
   WebGL φόντο για ΟΛΟ το site (ο καμβάς ζει στο base.html).
   - Τα κύματα κυλούν συνεχώς· το scroll επιταχύνει τη φάση,
     μεγαλώνει το πλάτος τους και ταξιδεύει την κάμερα μπροστά.
   - Στην αρχική: εμφανίζεται σταδιακά ΜΕΤΑ το hero, ώστε να μην
     ανταγωνίζεται τη σφαίρα του hero-3d.js. Σε άλλες σελίδες
     είναι ορατό από την αρχή.
   - prefers-reduced-motion: στατικό render, ενημέρωση μόνο στο scroll.
   Παλέτα: μόνο η muted accent οικογένεια του design system.
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
  var heroEl   = document.getElementById('hero');

  /* Πλέγμα σημείων στο επίπεδο XZ */
  var NX = isMobile ? 90 : 150;
  var NZ = isMobile ? 45 : 70;
  var COUNT = NX * NZ;
  var SIZE_X = 96;
  var SIZE_Z = 64;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 120);
  var CAM_Z0 = 26;
  camera.position.set(0, 5.5, CAM_Z0);
  camera.lookAt(0, 0.5, -12);

  var pos = new Float32Array(COUNT * 3);
  var sz  = new Float32Array(COUNT);

  var idx = 0;
  for (var iz = 0; iz < NZ; iz++) {
    for (var ix = 0; ix < NX; ix++) {
      pos[idx * 3]     = (ix / (NX - 1) - 0.5) * SIZE_X;
      pos[idx * 3 + 1] = 0;
      pos[idx * 3 + 2] = (iz / (NZ - 1) - 0.5) * SIZE_Z;
      sz[idx] = Math.random() * 0.8 + 0.6;
      idx++;
    }
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sz,  1));

  /* Το κύμα υπολογίζεται στο vertex shader (GPU) — μηδενικό κόστος CPU */
  var vert = [
    'attribute float size;',
    'uniform float uTime;',
    'uniform float uScroll;',
    'uniform float uPR;',
    'varying float vMix;',
    'varying float vDepth;',
    'void main(){',
    '  vec3 p = position;',
    '  float t = uTime * 0.55 + uScroll * 5.0;',
    '  float w = sin(p.x * 0.16 + t) * 0.6 + cos(p.z * 0.13 + t * 0.8) * 0.4;',
    '  p.y += w * (1.1 + uScroll * 1.6);',
    '  vMix = w * 0.5 + 0.5;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  vDepth = -mv.z;',
    '  gl_PointSize = min(size * uPR * (46.0 / -mv.z), 7.0);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var frag = [
    'precision mediump float;',
    'uniform float uFade;',
    'varying float vMix;',
    'varying float vDepth;',
    'void main(){',
    '  float d = length(gl_PointCoord - 0.5);',
    '  if (d > 0.5) discard;',
    '  float a = 1.0 - smoothstep(0.1, 0.5, d);',
    /* βαθύ → φωτεινό accent ανάλογα με το ύψος του κύματος */
    '  vec3 deep  = vec3(0.24, 0.29, 0.45);',
    '  vec3 crest = vec3(0.55, 0.63, 0.91);',
    '  vec3 col = mix(deep, crest, vMix);',
    /* ομίχλη βάθους: τα μακρινά σημεία σβήνουν απαλά */
    '  float fog = 1.0 - smoothstep(20.0, 60.0, vDepth);',
    '  gl_FragColor = vec4(col, a * 0.55 * fog * uFade);',
    '}'
  ].join('\n');

  var mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uScroll: { value: 0 },
      uFade:   { value: heroEl ? 0 : 1 },
      uPR:     { value: renderer.getPixelRatio() }
    },
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  var field = new THREE.Points(geo, mat);
  scene.add(field);

  /* ── Mouse parallax (μόνο fine pointer) ── */
  var mx = 0, my = 0, tx = 0, ty = 0;
  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      tx = (e.clientX / W - 0.5) * 1.2;
      ty = -(e.clientY / H - 0.5) * 0.6;
    });
  }

  /* ── Scroll: πρόοδος σελίδας + fade μετά το hero ──
     Ακούει lenis.on('scroll') αντί για native window scroll ώστε
     να μένει συγχρονισμένο με το smooth-scroll του Lenis. */
  function bindScroll(handler) {
    if (window.__lenis && typeof window.__lenis.on === 'function') {
      window.__lenis.on('scroll', handler);
    } else {
      window.addEventListener('scroll', handler, { passive: true });
    }
  }

  var prog = 0, targetProg = 0;
  var fade = heroEl ? 0 : 1, targetFade = heroEl ? 0 : 1;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    targetProg = max > 0 ? y / max : 0;
    if (heroEl) {
      /* 0 στην κορυφή → 1 όταν το hero έχει σχεδόν φύγει από την οθόνη */
      var hh = heroEl.offsetHeight || window.innerHeight;
      targetFade = Math.min(Math.max((y - hh * 0.35) / (hh * 0.45), 0), 1);
    }
  }
  bindScroll(onScroll);
  onScroll();

  var clock = new THREE.Clock();

  function render() {
    var t = clock.getElapsedTime();
    prog += (targetProg - prog) * 0.06;
    fade += (targetFade - fade) * 0.08;
    mx   += (tx - mx) * 0.04;
    my   += (ty - my) * 0.04;

    mat.uniforms.uTime.value   = t;
    mat.uniforms.uScroll.value = prog;
    mat.uniforms.uFade.value   = fade;

    camera.position.z = CAM_Z0 - prog * 9;
    camera.position.x = mx;
    camera.position.y = 5.5 + my;

    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  if (reduced) {
    /* Στατικό: render μόνο όταν αλλάζει το scroll, χωρίς συνεχές loop */
    prog = targetProg;
    fade = targetFade;
    render();
    bindScroll(function () {
      prog = targetProg;
      fade = targetFade;
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
