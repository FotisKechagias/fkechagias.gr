(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  var W = window.innerWidth;
  var H = window.innerHeight;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.set(0, 0, 6);

  /* ── Lights (Slightly softer/cinematic) ───────────────────── */
  var ambient = new THREE.AmbientLight(0xffffff, 0.15); // Πιο διακριτικό
  scene.add(ambient);

  var blueLight = new THREE.PointLight(0x3b82f6, 3.5, 25);
  blueLight.position.set(2, 2, 4);
  scene.add(blueLight);

  var purpleLight = new THREE.PointLight(0x6366f1, 2, 20);
  purpleLight.position.set(-4, -2, 3);
  scene.add(purpleLight);

  var rimLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
  rimLight.position.set(0, 5, -3);
  scene.add(rimLight);

  /* ── Glass Spheres (Slower speeds) ───────────────────────── */
  var sphereConfigs = [
    { pos: [-3.5, 2.2, -3.0],  r: 1.20, speedY: 0.30, speedR: 0.3  },
    { pos: [ 3.2, -0.8, -2.5], r: 0.85, speedY: 0.45, speedR: -0.4 },
    { pos: [-0.5, -2.8, -1.5], r: 0.60, speedY: 0.50, speedR: 0.25 },
    { pos: [ 0.8,  1.8, -4.5], r: 1.55, speedY: 0.20, speedR: 0.2  },
    { pos: [ 4.5,  2.8, -5.0], r: 1.00, speedY: 0.35, speedR: -0.3 },
  ];

  var spheres = sphereConfigs.map(function (cfg) {
    var geo = new THREE.SphereGeometry(cfg.r, 48, 48);

    var mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0x2563eb),
      emissive: new THREE.Color(0x1e3a8a),
      emissiveIntensity: 0.15, // Λιγότερο έντονο glow
      shininess: 200,
      specular: new THREE.Color(0x93c5fd),
      transparent: true,
      opacity: 0.15, // Πιο "glassy"
    });

    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    scene.add(mesh);

    var wGeo = new THREE.SphereGeometry(cfg.r * 1.02, 16, 16);
    var wMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    var wire = new THREE.Mesh(wGeo, wMat);
    wire.position.copy(mesh.position);
    scene.add(wire);

    return { mesh: mesh, wire: wire, cfg: cfg, baseY: cfg.pos[1] };
  });

  /* ── Particles ───────────────────────────────────────────── */
  var pCount = window.innerWidth < 768 ? 600 : 1200; // Ελαφρώς λιγότερα για performance
  var pPositions = new Float32Array(pCount * 3);

  for (var i = 0; i < pCount; i++) {
    pPositions[i * 3]     = (Math.random() - 0.5) * 22;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
  }

  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

  var pMat = new THREE.PointsMaterial({
    color: 0x60a5fa,
    size: window.innerWidth < 768 ? 0.02 : 0.015,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
  });

  var particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ── Ring decoration ─────────────────────────────────────── */
  var ringGeo = new THREE.TorusGeometry(2.5, 0.015, 8, 120);
  var ringMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.08,
  });
  var ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI * 0.35;
  ring.position.set(3, -2, -4);
  scene.add(ring);

  var ring2Geo = new THREE.TorusGeometry(1.8, 0.012, 8, 80);
  var ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.06,
  });
  var ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI * 0.6;
  ring2.rotation.y = Math.PI * 0.2;
  ring2.position.set(-3.5, 1, -3);
  scene.add(ring2);

  /* ── Mouse tracking ──────────────────────────────────────── */
  var mouse = { x: 0, y: 0 };
  var target = { x: 0, y: 0 };

  document.addEventListener('mousemove', function (e) {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ── Scroll opacity (μόνο σε non-slider σελίδες) ────────────── */
  if (!document.body.classList.contains('is-slider')) {
    var heroH = window.innerHeight;
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY || window.pageYOffset;
      var fade = 1 - Math.min(scrollY / (heroH * 1.2), 1);
      canvas.style.opacity = Math.max(fade, 0).toFixed(3);
    }, { passive: true });
  }

  /* ── Resize ──────────────────────────────────────────────── */
  window.addEventListener('resize', function () {
    W = window.innerWidth;
    H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    heroH = H;
  });

  /* ── Animation loop ──────────────────────────────────────── */
  var clock = { t: 0 };
  var camX = 0, camY = 0;

  function animate() {
    requestAnimationFrame(animate);

    var now = Date.now() * 0.001;
    clock.t = now;

    mouse.x += (target.x - mouse.x) * 0.05; // Ελαφρώς πιο snapy
    mouse.y += (target.y - mouse.y) * 0.05;

    spheres.forEach(function (s) {
      s.mesh.position.y = s.baseY + Math.sin(now * s.cfg.speedY + s.cfg.pos[0]) * 0.28;
      s.wire.position.y = s.mesh.position.y;
      s.mesh.rotation.y += 0.003 * s.cfg.speedR;
      s.mesh.rotation.x += 0.001;
      s.wire.rotation.y -= 0.002 * s.cfg.speedR;
      s.wire.rotation.x += 0.0015;
    });

    particles.rotation.y = now * 0.01; // Πιο αργή περιστροφή particles
    particles.rotation.x = Math.sin(now * 0.03) * 0.05;

    ring.rotation.z  = now * 0.03;
    ring2.rotation.z = -now * 0.02;

    blueLight.position.x = mouse.x * 4 + Math.sin(now * 0.4) * 1;
    blueLight.position.y = mouse.y * 3 + Math.cos(now * 0.3) * 1;

    camX += (mouse.x * 0.4 - camX) * 0.025;
    camY += (mouse.y * 0.25 - camY) * 0.025;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
})();