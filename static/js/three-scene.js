(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  var W = window.innerWidth;
  var H = window.innerHeight;
  var isMobile = W < 768;
  var COUNT = isMobile ? 420 : 900;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 100);
  camera.position.z = 4.5;

  /* ── Particle geometry ── */
  var geo = new THREE.BufferGeometry();
  var pos  = new Float32Array(COUNT * 3);
  var col  = new Float32Array(COUNT * 3);
  var sz   = new Float32Array(COUNT);

  /* blue / purple / cyan palette (linear RGB) */
  var palette = [
    [0.33, 0.52, 0.94],
    [0.60, 0.40, 0.93],
    [0.25, 0.76, 0.84],
    [0.46, 0.44, 0.97],
    [0.80, 0.55, 0.98],
  ];

  for (var i = 0; i < COUNT; i++) {
    var theta = Math.random() * Math.PI * 2;
    var phi   = Math.acos(2 * Math.random() - 1);
    var r     = 2.2 + Math.random() * 2.8;

    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
    pos[i * 3 + 2] = r * Math.cos(phi);

    var c = palette[Math.floor(Math.random() * palette.length)];
    col[i * 3]     = c[0];
    col[i * 3 + 1] = c[1];
    col[i * 3 + 2] = c[2];

    sz[i] = Math.random() * 1.8 + 0.4;
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
    '  gl_PointSize = size * uPR * (280.0 / -mv.z);',
    '  gl_Position  = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var frag = [
    'varying vec3 vColor;',
    'void main(){',
    '  float d = length(gl_PointCoord - 0.5);',
    '  if (d > 0.5) discard;',
    '  float a = 1.0 - smoothstep(0.15, 0.5, d);',
    '  gl_FragColor = vec4(vColor, a * 0.72);',
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
    tx = (e.clientX / W - 0.5) * 0.55;
    ty = -(e.clientY / H - 0.5) * 0.35;
  });

  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;
    points.rotation.y = t * 0.035 + mx * 0.18;
    points.rotation.x = t * 0.010 + my * 0.12;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    W = window.innerWidth; H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    mat.uniforms.uPR.value = renderer.getPixelRatio();
  });
})();
