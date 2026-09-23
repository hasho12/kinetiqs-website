/* Navigation, accessible controls, and restrained page choreography. */
(() => {
  'use strict';
  const K = window.Kinetiqs;
  if (!K) return;
  document.getElementById('year').textContent = new Date().getFullYear();
  const menuButton = document.querySelector('.menu-button');
  const menu = document.getElementById('mobile-menu');
  const menuLabel = menuButton.querySelector('.menu-label');
  const html = document.documentElement;
  function closeMenu() {
    if (menu.open) menu.close();
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    menuLabel.textContent = 'Menu';
    html.classList.remove('menu-open');
  }
  menuButton.addEventListener('click', () => {
    if (menu.open) { closeMenu(); return; }
    menu.showModal();
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Close navigation');
    menuLabel.textContent = 'Close';
    html.classList.add('menu-open');
  });
  menu.querySelector('.menu-close').addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  menu.addEventListener('close', closeMenu);
  menu.addEventListener('cancel', () => { html.classList.remove('menu-open'); });

  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialog);
    if (dialog && !dialog.open) dialog.showModal();
  }));
  document.querySelectorAll('dialog:not(.navigation-overlay)').forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
  });
  document.getElementById('copy-email').addEventListener('click', async () => {
    const result = document.getElementById('copy-status');
    try { await navigator.clipboard.writeText('care@kinetiqs.app'); result.textContent = 'Email address copied.'; }
    catch { result.textContent = 'Select and copy care@kinetiqs.app, or use the email link above.'; }
  });
  const sample = {_notice: 'Illustrative concept only. Not a valid FitTrack90 import.', format: 'kinetiqs-demo', version: 1, app: 'FitTrack90', data: {habits: [{name: 'Evening walk', completed: true}], hydration: {unit: 'ml', sample_total: 1500}, notes: 'Fictional sample records. No personal information.'}};
  const json = JSON.stringify(sample, null, 2);
  document.getElementById('backup-code').textContent = json;
  // A static file remains the download fallback if Blob URLs are unavailable.
  if (typeof URL.createObjectURL === 'function') {
    const blobURL = URL.createObjectURL(new Blob([json + '\n'], {type: 'application/json'}));
    document.getElementById('download-backup').href = blobURL;
    window.addEventListener('pagehide', e => { if (!e.persisted) URL.revokeObjectURL(blobURL); });
  }
  const motionButton = document.getElementById('motion-button');
  function updateMotion() {
    motionButton.setAttribute('aria-pressed', String(!K.motion));
    document.getElementById('motion-label').textContent = K.motion ? 'Pause motion' : 'Motion paused';
    motionButton.querySelector('.dock-icon').textContent = K.motion ? 'Ⅱ' : '▷';
  }
  motionButton.addEventListener('click', () => K.setMotion(!K.motion));
  document.addEventListener('kinetiqs:motion', updateMotion); updateMotion();
  const soundButton = document.getElementById('sound-button');
  soundButton.addEventListener('click', async () => {
    soundButton.disabled = true;
    const enabled = await K.setSound(!K.sound);
    soundButton.disabled = false;
    soundButton.setAttribute('aria-pressed', String(enabled));
    document.getElementById('sound-label').textContent = enabled ? 'Sound on' : 'Sound off';
    if (enabled) K.pulse(false);
  });
  const backupToggle = document.getElementById('backup-toggle');
  backupToggle.addEventListener('change', () => {
    document.querySelector('.architecture').classList.toggle('backup-active', backupToggle.checked);
    document.getElementById('architecture-note').textContent = backupToggle.checked ? 'Optional backup adds a connection you choose. Core records remain local in this illustration.' : 'Core records stay on the device in this illustration.';
  });

  // Native scrolling with a single optional art reveal. Content is never hidden on load.
  if (window.gsap) {
    const seen = new WeakSet();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        if (K.motion) gsap.fromTo(entry.target, {y: 38, opacity: .35}, {y: 0, opacity: 1, duration: 1.15, ease: 'power3.out', clearProps: 'transform,opacity'});
        observer.unobserve(entry.target);
      });
    }, {threshold: .1});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    if (K.motion) gsap.fromTo('.hero-content', {y: 22, opacity: .1}, {y: 0, opacity: 1, duration: 1.4, ease: 'power3.out', clearProps: 'transform,opacity'});
    let artContext;
    function setupChoreography() {
      artContext?.revert();
      if (!K.motion) {
        gsap.killTweensOf('.reveal,.hero-content');
        gsap.set('.reveal,.hero-content', {clearProps: 'transform,opacity'});
        return;
      }
      if (!window.ScrollTrigger || innerWidth <= 760) return;
      gsap.registerPlugin(ScrollTrigger);
      artContext = gsap.context(() => {
        gsap.fromTo('.fittrack-art', {clipPath: 'inset(0% 4% round 28px)'}, {clipPath: 'inset(0% 0% round 10px)', ease: 'none', scrollTrigger: {trigger: '.fittrack-art', start: 'top 95%', end: 'top 27%', scrub: .7}});
        gsap.fromTo('.art-word', {y: 30}, {y: -45, ease: 'none', scrollTrigger: {trigger: '.fittrack-art', start: 'top bottom', end: 'bottom top', scrub: .8}});
      }, document.querySelector('.ecosystem'));
    }
    document.addEventListener('kinetiqs:motion', setupChoreography);
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setupChoreography, 180); }, {passive: true});
    document.fonts.ready.then(setupChoreography);
  }
  const reading = document.querySelector('.reading-progress');
  const header = document.querySelector('.header');
  let pending = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    reading.style.transform = `scaleX(${max > 0 ? K.clamp(scrollY / max, 0, 1) : 0})`;
    header.classList.toggle('scrolled', scrollY > 40);
    pending = false;
  }
  window.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(updateProgress); } }, {passive: true});
  updateProgress();

  const cursor = document.querySelector('.cursor-orbit');
  if (matchMedia('(pointer:fine)').matches) {
    let px = -100, py = -100, cx = -100, cy = -100, lastMove = 0;
    const cursorFrame = K.addFrame(null, (_time, dt) => {
      if (!K.motion) { cursor.style.opacity = '0'; return; }
      const smoothing = dt ? 1 - Math.exp(-dt * 16) : 1;
      cx += (px - cx) * smoothing; cy += (py - cy) * smoothing;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
      if (performance.now() - lastMove > 1200) cursorFrame.enable(false);
    });
    cursorFrame.enable(false);
    window.addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY; lastMove = performance.now();
      if (!K.motion || e.pointerType === 'touch') return;
      cursor.style.opacity = '1';
      cursor.classList.toggle('is-link', Boolean(e.target.closest('button,a,input,label')));
      cursor.classList.toggle('is-drag', e.target.id === 'lab-canvas');
      cursorFrame.enable(true);
    }, {passive: true});
    document.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; cursorFrame.enable(false); });
    const magnets = [...document.querySelectorAll('.magnetic')];
    magnets.forEach(el => {
      el.addEventListener('pointermove', e => {
        if (!K.motion) return;
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .08}px,${(e.clientY - r.top - r.height / 2) * .08}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    const device = document.querySelector('[data-tilt]');
    const art = device.closest('.app-visual');
    art.addEventListener('pointermove', e => {
      if (!K.motion) return;
      const r = art.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      device.style.transform = `translateX(30%) rotate(${-13 + x * 6}deg) rotateY(${-24 + x * 16}deg) rotateX(${10 - y * 12}deg)`;
    }, {passive: true});
    art.addEventListener('pointerleave', () => { device.style.transform = ''; });
    document.addEventListener('kinetiqs:motion', () => {
      if (K.motion) return;
      cursor.style.opacity = '0'; magnets.forEach(el => el.style.transform = ''); device.style.transform = '';
    });
  }
})();
