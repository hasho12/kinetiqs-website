/* Kinetiqs shared frame scheduler. No user data, storage or network calls. */
(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const tasks = new Set();
  let raf = 0, previous = 0, elapsed = 0, audio;
  const K = window.Kinetiqs = {
    motion: !preference.matches,
    sound: false,
    clamp: (n, a, b) => Math.min(b, Math.max(a, n)),
    setMotion(value) {
      K.motion = Boolean(value);
      document.documentElement.classList.toggle('motion-paused', !K.motion);
      if (!K.motion) { cancelAnimationFrame(raf); raf = 0; }
      previous = 0;
      document.dispatchEvent(new CustomEvent('kinetiqs:motion', {detail: K.motion}));
      for (const task of tasks) if (task.visible && task.enabled) task.fn(elapsed, 0, false);
      schedule();
    },
    addFrame(element, fn) {
      const task = {fn, visible: !element, enabled: true};
      tasks.add(task);
      const observer = element ? new IntersectionObserver(entries => {
        task.visible = entries[0].isIntersecting;
        if (task.visible) fn(elapsed, 0, false);
        schedule();
      }, {rootMargin: '80px'}) : null;
      observer?.observe(element);
      schedule();
      return {
        render: () => fn(elapsed, 0, false),
        enable(value) { task.enabled = value; schedule(); },
        destroy() { observer?.disconnect(); tasks.delete(task); }
      };
    },
    async setSound(value) {
      if (!value) { K.sound = false; return false; }
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return false;
        audio ||= new Audio();
        await audio.resume();
        K.sound = audio.state === 'running';
        return K.sound;
      } catch { K.sound = false; return false; }
    },
    pulse(locked = true) {
      if (!K.sound || !audio || audio.state !== 'running') return;
      const now = audio.currentTime;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(locked ? 170 : 380, now);
      oscillator.frequency.exponentialRampToValueAtTime(locked ? 65 : 190, now + .35);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.085, now + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .55);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(now); oscillator.stop(now + .6);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      try { navigator.vibrate?.(locked ? [16, 35, 20] : 10); } catch { /* Optional feedback. */ }
    }
  };
  function schedule() {
    if (raf || !K.motion || document.hidden || ![...tasks].some(t => t.visible && t.enabled)) return;
    raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    raf = 0;
    const dt = previous ? Math.min((now - previous) / 1000, .05) : 1 / 60;
    previous = now; elapsed += dt;
    for (const task of tasks) if (task.visible && task.enabled) task.fn(elapsed, dt, true);
    schedule();
  }
  document.addEventListener('visibilitychange', () => {
    previous = 0;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else schedule();
  });
  preference.addEventListener('change', e => K.setMotion(!e.matches));
  document.documentElement.classList.toggle('motion-paused', !K.motion);
})();
