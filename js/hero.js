/* An original procedural sculpture. One WebGL context; no models or texture requests. */
(() => {
  'use strict';
  const K = window.Kinetiqs;
  const host = document.getElementById('hero-art');
  const journey = document.querySelector('.journey');
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('core-canvas');
  const burstButton = document.getElementById('burst-button');
  const sceneStatus = document.getElementById('scene-status');
  if (!K || !host || !canvas) return;

  let expanded = false, progressTarget = 0, journeyTop = 0, sectionHeight = 1;
  let frame, renderer, lost = false, resizeScene = () => {};
  const narrow = () => innerWidth <= 760;
  const fallback = host.querySelector('.core-fallback');
  function changeOrbit() {
    expanded = !expanded;
    host.classList.toggle('orbit-expanded', expanded);
    burstButton.setAttribute('aria-pressed', String(expanded));
    document.getElementById('burst-label').textContent = expanded ? 'Restore the orbit' : 'Disrupt the orbit';
    sceneStatus.textContent = expanded ? 'Orbit expanded. Activate again to restore it.' : 'Orbit restored.';
    K.pulse(expanded);
    if (!K.motion) frame?.render();
  }
  burstButton.disabled = false;
  burstButton.setAttribute('aria-pressed', 'false');
  burstButton.addEventListener('click', changeOrbit);
  function scrollPosition() {
    if (K.motion) progressTarget = K.clamp((scrollY - journeyTop) / sectionHeight, 0, 1);
    if (!host.classList.contains('webgl-ready')) {
      fallback.style.left = (narrow() ? -5 - progressTarget * 15 : 40 - progressTarget * 50) + '%';
      fallback.style.opacity = narrow() ? String(1 - progressTarget * .65) : '1';
    }
  }
  function measure() {
    journeyTop = journey.getBoundingClientRect().top + scrollY;
    sectionHeight = hero.offsetHeight || host.clientHeight || innerHeight;
    scrollPosition();
    resizeScene();
  }
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollPosition(); scrollQueued = false; });
  }, {passive: true});
  window.addEventListener('resize', measure, {passive: true});
  document.addEventListener('kinetiqs:motion', () => { scrollPosition(); frame?.render(); });
  measure();

  const T = window.THREE;
  if (!T) return;
  try {
    renderer = new T.WebGLRenderer({canvas, alpha: true, antialias: devicePixelRatio < 2, powerPreference: 'low-power'});
  } catch {
    sceneStatus.textContent = 'Static sculpture displayed. All page content and orbit controls remain available.';
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, narrow() ? 1.4 : 1.7));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(37, 1, .1, 70);
  camera.position.set(0, 0, 9.3);
  const root = new T.Group();
  scene.add(root);

  // A tiny, locally painted studio light map supplies broad metallic reflections.
  const studio = document.createElement('canvas');
  studio.width = 1024; studio.height = 512;
  const ctx = studio.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, 512);
  bg.addColorStop(0, '#131814'); bg.addColorStop(.22, '#394338');
  bg.addColorStop(.48, '#050806'); bg.addColorStop(.54, '#b5bbae');
  bg.addColorStop(.7, '#2d3627'); bg.addColorStop(1, '#070b07');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1024, 512);
  [[55, 30, 135, 370, '#f7fff1'], [240, 70, 22, 285, '#dcfccc'], [455, 35, 240, 135, '#edf3ee'], [735, 90, 27, 300, '#bacfc3'], [850, 210, 150, 105, '#a9c55a']].forEach(([x, y, w, h, color]) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); });
  const texture = new T.CanvasTexture(studio);
  texture.mapping = T.EquirectangularReflectionMapping;
  texture.colorSpace = T.SRGBColorSpace;
  const generator = new T.PMREMGenerator(renderer);
  const environment = generator.fromEquirectangular(texture);
  scene.environment = environment.texture;
  texture.dispose(); generator.dispose();
  scene.add(new T.AmbientLight(0xc8d6bf, .65));
  const keyLight = new T.DirectionalLight(0xf5fff5, 4.5);
  keyLight.position.set(-3, 5, 6); scene.add(keyLight);
  const edgeLight = new T.PointLight(0xccff00, 32, 14, 2);
  edgeLight.position.set(4, -1, 2.8); scene.add(edgeLight);
  const fillLight = new T.PointLight(0x6ccac9, 9, 12, 2);
  fillLight.position.set(-3, 1, 1); scene.add(fillLight);

  const metal = new T.MeshPhysicalMaterial({color: 0xb7c1b1, metalness: 1, roughness: .19, clearcoat: .65, clearcoatRoughness: .13, envMapIntensity: 1.6});
  const accent = new T.MeshStandardMaterial({color: 0xccff00, metalness: .38, roughness: .26, emissive: 0x556600, emissiveIntensity: .42});
  class KnotCurve extends T.Curve {
    getPoint(t, target = new T.Vector3()) {
      const u = t * Math.PI * 4;
      const r = 1.24, wave = Math.cos(1.5 * u);
      return target.set(r * (2 + wave) * .5 * Math.cos(u), r * (2 + wave) * .5 * Math.sin(u), r * .5 * Math.sin(1.5 * u));
    }
  }
  class SliceCurve extends T.Curve {
    constructor(path, from, to) { super(); this.path = path; this.from = from; this.to = to; }
    getPoint(t, target) { return this.path.getPoint(this.from + (this.to - this.from) * t, target); }
  }
  const sculpture = new T.Group(); root.add(sculpture);
  const path = new KnotCurve();
  const knot = new T.Mesh(new T.TubeGeometry(path, narrow() ? 180 : 264, .35, narrow() ? 20 : 28, true), metal);
  sculpture.add(knot);
  [.065, .402, .74].forEach(offset => {
    const collar = new T.Mesh(new T.TubeGeometry(new SliceCurve(path, offset, offset + .023), 14, .355, 28, false), accent);
    sculpture.add(collar);
  });
  const fineMaterial = new T.MeshBasicMaterial({color: 0xa7b994, transparent: true, opacity: .24});
  const orbit = new T.Mesh(new T.TorusGeometry(2.75, .004, 4, 180), fineMaterial);
  orbit.rotation.set(1.13, -.4, -.2); root.add(orbit);
  const orbitAccent = new T.Mesh(new T.TorusGeometry(2.75, .012, 6, 36, .32), accent);
  orbitAccent.rotation.copy(orbit.rotation); root.add(orbitAccent);

  // Instancing keeps the satellite field to two draw calls.
  const total = narrow() ? 44 : 76;
  const chromeCount = Math.floor(total * .82);
  const chrome = new T.InstancedMesh(new T.SphereGeometry(1, 16, 12), metal, chromeCount);
  const green = new T.InstancedMesh(new T.SphereGeometry(1, 12, 10), accent, total - chromeCount);
  chrome.instanceMatrix.setUsage(T.DynamicDrawUsage); green.instanceMatrix.setUsage(T.DynamicDrawUsage);
  chrome.frustumCulled = false; green.frustumCulled = false;
  root.add(chrome, green);
  const satellites = Array.from({length: total}, (_, i) => ({
    angle: i * 2.39996323,
    radius: 2.35 + ((i * 47) % 83) / 83 * 1.6,
    depth: Math.sin(i * 3.71) * 1.8,
    size: .038 + ((i * 37) % 31) / 31 * .102,
    speed: .025 + (i % 5) * .008,
    stretch: i % 3 === 0 ? 1.7 : 1
  }));
  const dummy = new T.Object3D();
  const mist = new Float32Array(100 * 3);
  for (let i = 0; i < 100; i++) { mist[i * 3] = Math.sin(i * 127.1) * 9; mist[i * 3 + 1] = Math.cos(i * 73.3) * 5; mist[i * 3 + 2] = -2 - Math.abs(Math.sin(i * 17.7)) * 4; }
  const mistGeo = new T.BufferGeometry(); mistGeo.setAttribute('position', new T.BufferAttribute(mist, 3));
  const dust = new T.Points(mistGeo, new T.PointsMaterial({color: 0xa1b88f, size: .014, transparent: true, opacity: .45, depthWrite: false})); scene.add(dust);
  const pointer = new T.Vector2(), eased = new T.Vector2();
  const raycaster = new T.Raycaster();
  let progress = 0, spread = 0, widthAtDepth = 10, interactive = false;
  let measuredFrameTime = 0, measuredFrames = 0, qualityReduced = false;
  journey.addEventListener('pointermove', e => {
    if (!K.motion || e.pointerType === 'touch') return;
    const rect = host.getBoundingClientRect();
    pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, 1 - (e.clientY - rect.top) / rect.height * 2);
    interactive = true;
  }, {passive: true});
  journey.addEventListener('pointerleave', () => { pointer.set(0, 0); interactive = false; });
  journey.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || e.button !== 0 || e.target.closest('a,button,input,nav')) return;
    const rect = host.getBoundingClientRect();
    const target = new T.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, 1 - (e.clientY - rect.top) / rect.height * 2);
    raycaster.setFromCamera(target, camera);
    if (raycaster.intersectObject(knot, false).length) changeOrbit();
  });
  resizeScene = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h || lost) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = narrow() ? 11.9 : 9.3;
    camera.updateProjectionMatrix();
    widthAtDepth = 2 * Math.tan(camera.fov * Math.PI / 360) * camera.position.z * camera.aspect;
    frame?.render();
  };
  resizeScene();
  frame = K.addFrame(journey, (time, dt, moving) => {
    if (lost) return;
    const smoothing = moving ? 1 - Math.exp(-dt * 5) : 1;
    progress += (progressTarget - progress) * smoothing;
    spread += ((expanded ? 1 : 0) - spread) * (moving ? 1 - Math.exp(-dt * 3.2) : 1);
    if (moving) eased.lerp(pointer, 1 - Math.exp(-dt * 3));
    const phase = progress * progress * (3 - 2 * progress);
    const mobileScale = narrow() ? Math.min(1.02, widthAtDepth / 5.3) : 1;
    root.position.x = narrow() ? -.25 * phase : widthAtDepth * (.215 - .44 * phase);
    root.position.y = narrow() ? -.08 - .5 * phase : -.03 + .14 * phase;
    root.scale.setScalar(mobileScale * (1 - .08 * phase));
    root.rotation.set(-eased.y * .09, eased.x * .12, 0);
    sculpture.rotation.set(.43 + Math.sin(time * .14) * .12 + phase * .25, -.15 + phase * .75 + time * .045, -.22 + phase * .55 + spread * .4);
    sculpture.scale.setScalar(1 - spread * .13);
    orbit.scale.setScalar(1 + spread * .35);
    orbitAccent.scale.copy(orbit.scale);
    orbit.rotation.z = -.2 + phase * .8 + time * .028;
    orbitAccent.rotation.copy(orbit.rotation); orbitAccent.rotateZ(time * .09);
    satellites.forEach((s, i) => {
      const angle = s.angle + time * s.speed + phase * .7;
      const r = s.radius + spread * (1.8 + (i % 4) * .45);
      const scale = s.size * (1 + spread * .35);
      dummy.position.set(Math.cos(angle) * r, Math.sin(angle) * r * .77, s.depth + Math.sin(angle * 1.8) * .25 + spread * Math.sin(i * 1.4));
      if (interactive && K.motion) { dummy.position.x += eased.x * (i % 3) * .035; dummy.position.y += eased.y * (i % 3) * .035; }
      dummy.rotation.set(angle, angle * .5, i + angle);
      dummy.scale.set(scale, scale * s.stretch, scale);
      dummy.updateMatrix();
      (i < chromeCount ? chrome : green).setMatrixAt(i < chromeCount ? i : i - chromeCount, dummy.matrix);
    });
    chrome.instanceMatrix.needsUpdate = true; green.instanceMatrix.needsUpdate = true;
    edgeLight.position.x = root.position.x + 3 + eased.x;
    edgeLight.intensity = 28 + spread * 28;
    dust.rotation.z = phase * .12;
    renderer.render(scene, camera);
    // Lower fill cost after sustained slow frames. No benchmark or device data leaves the page.
    if (moving && !qualityReduced && dt > 0) {
      measuredFrameTime += dt; measuredFrames++;
      if (measuredFrames === 150) {
        if (measuredFrameTime / measuredFrames > .028) { renderer.setPixelRatio(1); renderer.setSize(host.clientWidth, host.clientHeight, false); qualityReduced = true; }
        measuredFrameTime = 0; measuredFrames = 0;
      }
    }
  });
  frame.render();
  fallback.style.opacity = '';
  host.classList.add('webgl-ready');
  new ResizeObserver(measure).observe(host);
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault(); lost = true; frame.enable(false);
    host.classList.remove('webgl-ready'); scrollPosition();
    sceneStatus.textContent = 'Static sculpture displayed. All controls and page content remain available.';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false; fallback.style.opacity = ''; host.classList.add('webgl-ready');
    resizeScene(); frame.enable(true);
  });
  const gyroButton = document.getElementById('gyro-button');
  if ('DeviceOrientationEvent' in window && matchMedia('(pointer:coarse)').matches) {
    gyroButton.hidden = false;
    let enabled = false;
    const onTilt = e => {
      if (K.motion) { pointer.x = K.clamp((e.gamma || 0) / 40, -1, 1); pointer.y = K.clamp(((e.beta || 0) - 40) / 50, -1, 1); }
    };
    gyroButton.addEventListener('click', async () => {
      if (enabled) { window.removeEventListener('deviceorientation', onTilt); enabled = false; pointer.set(0, 0); gyroButton.textContent = 'Enable motion tilt ↗'; return; }
      try {
        const permission = typeof DeviceOrientationEvent.requestPermission === 'function' ? await DeviceOrientationEvent.requestPermission() : 'granted';
        if (permission !== 'granted') { gyroButton.textContent = 'Motion permission declined'; return; }
        window.addEventListener('deviceorientation', onTilt, {passive: true}); enabled = true; gyroButton.textContent = 'Disable motion tilt ×';
      } catch { gyroButton.textContent = 'Motion tilt unavailable'; }
    });
  }
})();
