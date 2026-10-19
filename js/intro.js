/* ============ js/intro.js — graffiti de logos sobre mural ya pintado ============ */

window.addEventListener('load', () => {
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');
  const cameraEl = document.getElementById('camera');
  const sceneEl = document.querySelector('.scene');
  const sceneGlow = document.querySelector('.scene-glow');
  const impactRing = document.querySelector('.impact-ring');
  const wallBg = document.getElementById('wall-bg');
  const paintGlow = document.getElementById('paint-glow');
  const logoHalo = document.querySelector('.logo-halo');
  const canEl = document.getElementById('spray-can');
  const canBody = document.getElementById('can-body');
  const sprayCone = canEl.querySelector('.spray-cone');
  const neonEls = gsap.utils.toArray('.urban-neon');
  const logoMain = document.querySelector('.logo-main');
  const logoImg = logoMain.querySelector('img');
  const stickers = gsap.utils.toArray('.sticker');
  const fadeOverlay = document.querySelector('.fade-overlay');
  const cinematicFlash = document.querySelector('.cinematic-flash');
  const audioEl = document.getElementById('spray-audio');
  const canvas = document.getElementById('spray-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const skipBtn = document.getElementById('skip-intro');
  const isMobile = window.innerWidth < 700 || coarse;

  const goHome = () => {
    try { sessionStorage.setItem('nm-intro', '1'); } catch (e) {}
    window.location.href = 'home.html?from=museum';
  };

  if (!reduceMotion) {
    gsap.timeline()
      .to('.start-logo', { opacity: 0.92, duration: 0.8, ease: 'power2.out' }, 0.1)
      .to('.start-btn', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.5);
  }

  const startFx = document.getElementById('start-fx');
  if (startFx && !reduceMotion) {
    const sctx = startFx.getContext('2d');
    const dots = Array.from({ length: isMobile ? 16 : 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.5,
      v: Math.random() * 0.0005 + 0.00018,
      c: Math.random() > 0.35 ? '#ff2e88' : '#f2ece0',
    }));
    const sizeFx = () => {
      startFx.width = window.innerWidth;
      startFx.height = window.innerHeight;
    };
    sizeFx();
    window.addEventListener('resize', sizeFx);
    const tickStart = () => {
      if (startScreen.classList.contains('is-hidden')) return;
      sctx.clearRect(0, 0, startFx.width, startFx.height);
      dots.forEach((d) => {
        d.y -= d.v;
        if (d.y < -0.02) d.y = 1.02;
        sctx.globalAlpha = 0.45;
        sctx.fillStyle = d.c;
        sctx.beginPath();
        sctx.arc(d.x * startFx.width, d.y * startFx.height, d.r, 0, Math.PI * 2);
        sctx.fill();
      });
      requestAnimationFrame(tickStart);
    };
    tickStart();
  }

  let pointerFrame = 0;
  const updateParallax = (event) => {
    if (pointerFrame || startScreen.classList.contains('is-hidden')) return;
    pointerFrame = requestAnimationFrame(() => {
      const x = ((event.clientX / window.innerWidth) - 0.5) * 12;
      const y = ((event.clientY / window.innerHeight) - 0.5) * 10;
      startScreen.style.setProperty('--parallax-x', `${x.toFixed(2)}px`);
      startScreen.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
      pointerFrame = 0;
    });
  };
  startScreen.addEventListener('pointermove', updateParallax, { passive: true });
  startScreen.addEventListener('pointerleave', () => {
    startScreen.style.setProperty('--parallax-x', '0px');
    startScreen.style.setProperty('--parallax-y', '0px');
  }, { passive: true });

  const PALETTE = ['#FF2E88', '#14E0C4', '#F2ECE0', '#FF6B9D'];
  let particles = [];
  let isPainting = false;
  let looping = false;
  const emitter = { x: 0, y: 0, angle: 1.4 };
  let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.1 : 1.5);
  const maxParticles = isMobile ? 64 : 170;

  function resizeCanvas() {
    // Medidas sin la escala de la cámara: el canvas vive dentro de la escena
    const w = sceneEl.clientWidth;
    const h = sceneEl.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle(x, y, opts = {}) {
    const base = opts.angle ?? emitter.angle;
    const spread = (Math.random() - 0.5) * (opts.spreadRad ?? 0.55);
    const angle = base + spread;
    const speed = opts.speed ?? (Math.random() * 2.8 + 1.2);
    const mist = !!opts.mist;
    const smoke = !!opts.smoke;
    const splash = !!opts.splash;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + (opts.fall ?? 0.22),
      size: smoke ? (Math.random() * 12 + 8) : mist ? (Math.random() * 7 + 5) : splash ? (Math.random() * 2.8 + 1.4) : (Math.random() * (opts.maxSize ?? 2.8) + 1.1),
      life: 1,
      decay: Math.random() * 0.015 + (opts.decay ?? 0.011),
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      mist, smoke, splash,
    };
  }

  function emitContinuous() {
    if (!isPainting) return;
    const n = isMobile ? 3 : 6;
    for (let i = 0; i < n; i++) {
      if (particles.length > maxParticles) break;
      particles.push(makeParticle(emitter.x + (Math.random() - 0.5) * 10, emitter.y, {
        speed: Math.random() * 3.6 + 1.6,
        spreadRad: 0.42,
        fall: 0.28,
        maxSize: 2.8,
      }));
    }
    if (particles.length < maxParticles && Math.random() < (isMobile ? 0.35 : 0.6)) {
      particles.push(makeParticle(emitter.x, emitter.y, {
        mist: true, speed: Math.random() * 1.6 + 0.6, spreadRad: 0.75, fall: 0.12, decay: 0.018,
      }));
    }
    if (!isMobile && particles.length < maxParticles && Math.random() < 0.2) {
      particles.push(makeParticle(emitter.x, emitter.y, {
        smoke: true, speed: Math.random() * 0.55 + 0.15, spreadRad: 0.7, fall: -0.02, decay: 0.009,
      }));
    }
    if (Math.random() < 0.28) {
      particles.push(makeParticle(emitter.x, emitter.y, {
        splash: true, speed: Math.random() * 5.5 + 2.2, spreadRad: 0.95, fall: 0.55, decay: 0.018,
      }));
    }
  }

  function emitAmbient() {
    if (isPainting || particles.length > (isMobile ? 12 : 24) || Math.random() > 0.14) return;
    particles.push(makeParticle(
      Math.random() * sceneEl.clientWidth,
      Math.random() * sceneEl.clientHeight,
      { speed: 0.16, spreadRad: 6, fall: -0.03, maxSize: 1.15, decay: 0.006 }
    ));
  }

  function emitBurst(x, y, count) {
    const n = isMobile ? Math.round(count * 0.45) : count;
    for (let i = 0; i < n; i++) {
      particles.push(makeParticle(x, y, {
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 5 + 1.8,
        spreadRad: 0,
        fall: 0.2,
        splash: Math.random() < 0.45,
        decay: 0.013,
      }));
    }
  }

  function tickParticles() {
    looping = true;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.globalCompositeOperation = 'lighter';
    emitContinuous();
    emitAmbient();

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.smoke ? 0.002 : 0.014;
      p.vx *= 0.99;
      p.life -= p.decay;
    });
    particles = particles.filter((p) => p.life > 0);

    particles.forEach((p) => {
      const alpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      if (p.smoke || p.mist) {
        ctx.globalAlpha = alpha * (p.smoke ? 0.08 : 0.16);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.globalAlpha = alpha * 0.92;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.splash ? 1.7 : 2.5), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    if (!document.hidden) requestAnimationFrame(tickParticles);
    else looping = false;
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !looping) requestAnimationFrame(tickParticles);
  });

  const unlockAudio = () => {
    if (!audioEl) return;
    audioEl.muted = false;
    const p = audioEl.play();
    if (p && p.then) {
      p.then(() => { audioEl.pause(); audioEl.currentTime = 0; }).catch(() => {});
    }
  };

  const playSpraySound = () => {
    if (!audioEl) return;
    audioEl.currentTime = 0;
    audioEl.muted = false;
    const p = audioEl.play();
    if (p && p.catch) p.catch(() => {});
  };

  const runIntro = () => {
    resizeCanvas();
    requestAnimationFrame(tickParticles);

    const sceneRect = sceneEl.getBoundingClientRect();
    const SW = sceneEl.clientWidth;
    const SH = sceneEl.clientHeight;
    // Origen real de la lata (top/left en % según el tamaño de pantalla)
    const originX = canEl.offsetLeft;
    const originY = canEl.offsetTop;
    const toXY = (sx, sy) => ({ x: sx - originX, y: sy - originY });
    const local = (el) => {
      const r = el.getBoundingClientRect();
      const s = sceneEl.getBoundingClientRect();
      const k = s.width / SW || 1; // la cámara escala la escena
      return { left: (r.left - s.left) / k, top: (r.top - s.top) / k, width: r.width / k, height: r.height / k };
    };

    const logoBox = local(logoMain);
    const logoLeft = logoBox.left;
    const logoTop = logoBox.top;
    const logoW = logoBox.width;
    const logoH = logoBox.height;
    const holdRotate = isMobile ? -16 : -20;
    const offX = isMobile ? 18 : 26;
    const offY = isMobile ? -18 : -24;
    const onLogo = (lx, ly) => toXY(logoLeft + logoW * lx + offX, logoTop + logoH * ly + offY);
    const setPaint = (el, pct) => el.style.setProperty('--paint', `${pct}%`);

    const drips = [];
    for (let i = 0; i < 6; i++) {
      const d = document.createElement('span');
      d.className = 'drip';
      d.style.left = `${logoLeft + logoW * (0.12 + i * 0.15) + gsap.utils.random(-8, 8)}px`;
      d.style.top = `${logoTop + logoH * gsap.utils.random(0.72, 0.9)}px`;
      d.style.height = '0px';
      d.style.background = i % 2 ? '#14e0c4' : '#ff2e88';
      sceneEl.appendChild(d); // coordenadas de escena, igual que el logo
      drips.push(d);
    }

    const updateEmitter = () => {
      const c = local(canEl);
      const rot = (gsap.getProperty(canEl, 'rotate') || holdRotate) * Math.PI / 180;
      emitter.x = c.left + c.width * 0.42 + Math.sin(rot) * 8;
      emitter.y = c.top + c.height * 0.1 + 8;
      emitter.angle = Math.PI * 0.58 + rot * 0.4;
      if (paintGlow) {
        paintGlow.style.left = `${emitter.x - paintGlow.offsetWidth / 2}px`;
        paintGlow.style.top = `${emitter.y - paintGlow.offsetHeight / 2}px`;
      }
    };

    let wrist;
    const startWrist = () => {
      if (wrist) wrist.kill();
      wrist = gsap.to(canBody, { x: isMobile ? 2 : 3.5, y: 2, rotate: 2.2, duration: 0.045, repeat: -1, yoyo: true, ease: 'none' });
    };
    const stopWrist = () => {
      if (wrist) wrist.kill();
      gsap.to(canBody, { x: 0, y: 0, rotate: 0, duration: 0.12 });
    };
    const sprayOn = () => {
      isPainting = true;
      startWrist();
      updateEmitter();
      gsap.to([sprayCone, paintGlow], { opacity: isMobile ? 0.6 : 0.85, duration: 0.15 });
    };
    const sprayOff = () => {
      isPainting = false;
      stopWrist();
      gsap.to([sprayCone, paintGlow], { opacity: 0, duration: 0.2 });
    };

    // Onomatopeya de cómic junto a la lata
    const clac = (dx, dy, rot) => {
      const el = document.createElement('span');
      el.className = 'clac';
      el.textContent = '¡clac!';
      el.setAttribute('aria-hidden', 'true');
      sceneEl.appendChild(el);
      const c = local(canEl);
      gsap.set(el, { left: c.left + c.width / 2 + dx, top: c.top + dy, rotate: rot, xPercent: -50, yPercent: -50 });
      gsap.timeline({ onComplete: () => el.remove() })
        .fromTo(el, { scale: 0, opacity: 0 }, { scale: 1.15, opacity: 1, duration: 0.14, ease: 'back.out(3)' })
        .to(el, { scale: 1, duration: 0.1 })
        .to(el, { opacity: 0, y: -14, duration: 0.3, ease: 'power1.in' }, '+=0.12');
    };

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const shakeCamera = (at, power = 4, reps = 6) => {
      tl.to(cameraEl, { x: power, y: -power * 0.6, duration: 0.04, repeat: reps, yoyo: true, ease: 'none' }, at)
        .to(cameraEl, { x: 0, y: 0, duration: 0.08 }, at + 0.04 * (reps + 1));
    };

    /* ---------- Estado inicial ---------- */
    const first = onLogo(0.06, 0.06);
    const center = toXY(SW * 0.5, SH * 0.46);
    gsap.set(canEl, {
      xPercent: -50, yPercent: -50,
      x: center.x, y: -SH * 0.7,
      rotate: -160, scale: 1.25, opacity: 0,
      filter: 'drop-shadow(0 16px 20px #000000b0) blur(6px)',
    });
    gsap.set(cameraEl, { scale: 1.16, y: 14 });
    logoMain.style.setProperty('--paint', '0%');
    stickers.forEach((el) => gsap.set(el, { autoAlpha: 0 }));
    const swoosh = document.querySelector('.tag-swoosh');
    const swooshPath = swoosh ? swoosh.querySelector('path') : null;
    const swooshLen = swooshPath ? swooshPath.getTotalLength() : 0;

    /* ---------- Acto 1: entra el muro ---------- */
    tl.to(wallBg, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.05)
      .to(cameraEl, { scale: 1.06, y: 0, duration: 1.6, ease: 'power2.out' }, 0.05)
      .to('.wall-bg img', { scale: 1, duration: 2.4, ease: 'power1.out' }, 0.08)
      .to(cinematicFlash, { opacity: 0.3, duration: 0.08 }, 0.08)
      .to(cinematicFlash, { opacity: 0, duration: 0.5 }, 0.16)
      .to(neonEls, { opacity: isMobile ? 0.16 : 0.24, duration: 1.1, stagger: 0.1 }, 0.18)
      .to(sceneGlow, { opacity: 0.45, scale: 1, duration: 1 }, 0.2);

    /* ---------- Acto 2: la lata cae girando y se agita ---------- */
    tl.to(canEl, {
      opacity: 1, y: center.y, rotate: -8,
      filter: 'drop-shadow(0 18px 22px #000000b0) blur(0px)',
      duration: 0.75, ease: 'back.out(1.6)', onUpdate: updateEmitter,
    }, 0.55)
      .to(impactRing, { opacity: 0.5, scale: 1.6, duration: 0.4 }, 1.18)
      .to(impactRing, { opacity: 0, duration: 0.25 }, 1.5);
    shakeCamera(1.2, isMobile ? 3 : 5, 3);

    // Agitar la lata: el gesto clásico antes de pintar
    tl.to(canBody, { y: -18, rotate: 14, duration: 0.07, repeat: 9, yoyo: true, ease: 'sine.inOut' }, 1.4)
      .to(canBody, { y: 0, rotate: 0, duration: 0.1 }, 2.1)
      .call(() => clac(-64, -10, -12), null, 1.48)
      .call(() => clac(68, 34, 10), null, 1.78);

    /* ---------- Acto 3: pintar el logo ---------- */
    tl.to(canEl, {
      x: first.x, y: first.y, rotate: holdRotate, scale: 1,
      duration: 0.45, ease: 'power3.inOut', onUpdate: updateEmitter,
    }, 2.1)
      .to(logoHalo, { opacity: 0.9, duration: 0.3 }, 2.5);

    const paintPath = [
      { lx: 0.08, ly: 0.08 }, { lx: 0.92, ly: 0.16 }, { lx: 0.08, ly: 0.30 }, { lx: 0.92, ly: 0.44 },
      { lx: 0.08, ly: 0.58 }, { lx: 0.92, ly: 0.72 }, { lx: 0.10, ly: 0.86 }, { lx: 0.80, ly: 0.98 },
    ].map((pt) => {
      const p = onLogo(pt.lx, pt.ly);
      return { x: p.x, y: p.y, rotate: holdRotate + (pt.lx > 0.5 ? 9 : -9), duration: 0.34, ease: 'sine.inOut' };
    });
    const cover = { p: 0 };
    const paintStart = 2.58;
    const paintDur = paintPath.length * 0.34;
    tl.call(() => { sprayOn(); playSpraySound(); }, null, paintStart)
      .to(cover, { p: 100, duration: paintDur, ease: 'none', onUpdate: () => setPaint(logoMain, cover.p) }, paintStart)
      .to(canEl, { keyframes: paintPath, onUpdate: updateEmitter }, paintStart);
    shakeCamera(paintStart + 0.05, 1.6, Math.round(paintDur / 0.08));

    const logoDone = paintStart + paintDur;
    tl.call(() => {
      setPaint(logoMain, 100);
      logoMain.classList.add('is-painted');
      sprayOff();
      emitBurst(logoLeft + logoW / 2, logoTop + logoH / 2, 60);
    }, null, logoDone)
      .to(logoHalo, { opacity: 0.4, duration: 0.35 }, logoDone)
      .to(logoMain, { '--shine-x': '220%', duration: 0.65, ease: 'power2.inOut' }, logoDone + 0.05)
      .to(drips, { height: () => gsap.utils.random(22, 54), opacity: 0.95, duration: 0.9, stagger: 0.06, ease: 'power1.in' }, logoDone + 0.05)
      .to(drips, { opacity: 0, duration: 0.4 }, logoDone + 1.6);

    /* ---------- Acto 4: firma bajo el logo + stickers pegados a mano ---------- */
    const tagStart = logoDone + 0.2;
    if (swoosh && swooshPath) {
      const box = local(swoosh);
      const vb = swoosh.viewBox.baseVal;
      const pts = Array.from({ length: 7 }, (_, i) => {
        const pt = swooshPath.getPointAtLength((swooshLen * i) / 6);
        const p = toXY(box.left + (pt.x / vb.width) * box.width + offX, box.top + (pt.y / vb.height) * box.height + offY);
        return { x: p.x, y: p.y, rotate: holdRotate + (i % 2 ? 6 : -6), duration: 0.11, ease: 'none' };
      });
      tl.to(canEl, { x: pts[0].x, y: pts[0].y, duration: 0.25, ease: 'power2.inOut', onUpdate: updateEmitter }, tagStart)
        .call(() => { sprayOn(); playSpraySound(); }, null, tagStart + 0.22)
        .to(canEl, { keyframes: pts.slice(1), onUpdate: updateEmitter }, tagStart + 0.25)
        .fromTo(swooshPath, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.66, ease: 'none' }, tagStart + 0.25)
        .call(sprayOff, null, tagStart + 0.92);
    }

    const slapStart = tagStart + 0.55;
    stickers.forEach((el, i) => {
      const at = slapStart + i * 0.24;
      const tilt = [-4, 3, -2][i] || 0;
      tl.set(el, { autoAlpha: 1 }, at)
        .call(() => el.classList.add('is-painted'), null, at)
        .fromTo(el,
          { scale: 2.2, rotate: tilt * 5, y: -40, filter: 'blur(6px) brightness(1.6)' },
          { scale: 1, rotate: tilt, y: 0, filter: 'blur(0px) brightness(1)', duration: 0.32, ease: 'back.out(2.2)' }, at)
        .call(() => {
          el.classList.add('is-stuck');
          const b = local(el);
          emitBurst(b.left + b.width / 2, b.top + b.height / 2, 22);
        }, null, at + 0.22);
      shakeCamera(at + 0.2, isMobile ? 3 : 5, 3);
    });

    /* ---------- Momento héroe: aberración cromática ---------- */
    const heroAt = slapStart + stickers.length * 0.24 + 0.35;
    tl.fromTo(logoMain,
      { filter: 'drop-shadow(-8px 0px 0px rgba(20,224,196,.8)) drop-shadow(8px 0px 0px rgba(255,46,136,.8))' },
      { filter: 'drop-shadow(0px 0px 0px rgba(20,224,196,0)) drop-shadow(0px 0px 0px rgba(255,46,136,0))', duration: 0.5, ease: 'power2.out' }, heroAt)
      .fromTo('.brand-lockup', { scale: 1.035 }, { scale: 1, duration: 0.6, ease: 'power2.out' }, heroAt)
      .to(cinematicFlash, { opacity: 0.22, duration: 0.06 }, heroAt)
      .to(cinematicFlash, { opacity: 0, duration: 0.4 }, heroAt + 0.06);

    /* ---------- Acto 5: la lata cubre la pantalla de negro ----------
       El home arranca negro y se revela con spray: la transición es continua. */
    const blackoutAt = heroAt + 0.55;
    const ink = document.createElement('canvas');
    ink.className = 'ink-canvas';
    ink.setAttribute('aria-hidden', 'true');
    sceneEl.appendChild(ink);
    const ictx = ink.getContext('2d');
    const idpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    ink.width = Math.round(SW * idpr);
    ink.height = Math.round(SH * idpr);
    ictx.scale(idpr, idpr);

    const R = Math.max(SW, SH) * (isMobile ? 0.2 : 0.17);
    const rows = Math.ceil(SH / (R * 1.2)) + 1;
    const INK_COLORS = ['#14e0c4', '#ff2e88', '#f2ece0'];
    const strokes = Array.from({ length: rows }, (_, i) => {
      const y = (i * SH) / (rows - 1);
      const ltr = i % 2 === 0;
      return { x0: ltr ? -R : SW + R, x1: ltr ? SW + R : -R, y0: y - R * 0.2, y1: y + R * 0.2, p: 0, last: 0 };
    });
    const head = (s, t) => ({ x: s.x0 + (s.x1 - s.x0) * t, y: s.y0 + (s.y1 - s.y0) * t });
    const stamp = (x, y) => {
      const g = ictx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, 'rgba(7,8,10,1)');
      g.addColorStop(0.6, 'rgba(7,8,10,.96)');
      g.addColorStop(1, 'rgba(7,8,10,0)');
      ictx.fillStyle = g;
      ictx.beginPath();
      ictx.arc(x, y, R, 0, Math.PI * 2);
      ictx.fill();
      for (let k = 0; k < (isMobile ? 6 : 12); k++) {
        const a = Math.random() * Math.PI * 2;
        const d = R * (0.9 + Math.random() * 0.45);
        ictx.globalAlpha = Math.random() * 0.7 + 0.25;
        ictx.fillStyle = INK_COLORS[(Math.random() * INK_COLORS.length) | 0];
        ictx.beginPath();
        ictx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.random() * 2.6 + 0.6, 0, Math.PI * 2);
        ictx.fill();
      }
      ictx.globalAlpha = 1;
    };

    // ~1,8 s en total sin importar cuántas pasadas necesite la pantalla
    const strokeDur = gsap.utils.clamp(0.24, 0.4, 1.8 / rows);
    tl.call(() => { sprayOn(); playSpraySound(); }, null, blackoutAt)
      .to(cameraEl, { scale: 1.12, duration: rows * strokeDur + 0.4, ease: 'power1.in' }, blackoutAt);
    strokes.forEach((s, i) => {
      tl.to(s, {
        p: 1,
        duration: strokeDur,
        ease: 'sine.inOut',
        onUpdate: () => {
          const n = Math.max(1, Math.ceil(((s.p - s.last) * (SW + R * 2)) / (R * 0.22)));
          for (let k = 1; k <= n; k++) {
            const q = head(s, s.last + ((s.p - s.last) * k) / n);
            stamp(q.x, q.y);
          }
          s.last = s.p;
          // La lata sigue la cabeza del trazo y gira según la dirección
          const h = head(s, s.p);
          const c = toXY(h.x + offX, h.y + offY - R * 0.15);
          gsap.set(canEl, { x: c.x, y: c.y, rotate: holdRotate + (s.x1 > s.x0 ? 10 : -26) });
          updateEmitter();
        },
      }, blackoutAt + 0.05 + i * strokeDur);
    });
    const blackoutEnd = blackoutAt + 0.05 + rows * strokeDur;
    tl.call(sprayOff, null, blackoutEnd - 0.05)
      .to(canEl, { y: `-=${SH * 0.4}`, x: `+=${SW * 0.2}`, rotate: 40, opacity: 0, duration: 0.4, ease: 'power3.in' }, blackoutEnd - 0.05)
      .to(fadeOverlay, { opacity: 1, duration: 0.25, ease: 'none' }, blackoutEnd + 0.1)
      .call(goHome, null, blackoutEnd + 0.38);

    if (skipBtn) {
      skipBtn.classList.add('is-visible');
      gsap.to(skipBtn, { opacity: 1, duration: 0.35, delay: 0.7 });
      skipBtn.addEventListener('click', () => {
        tl.pause();
        sprayOff();
        gsap.to(fadeOverlay, { opacity: 1, duration: 0.3, onComplete: goHome });
      }, { once: true });
    }
  };

  const startExperience = () => {
    startScreen.classList.add('is-pressed');
    unlockAudio();
    gsap.to(startScreen, {
      opacity: 0,
      duration: 0.4,
      onStart: () => startScreen.classList.add('is-hidden'),
      onComplete: () => { startScreen.style.display = 'none'; },
    });

    if (reduceMotion) {
      gsap.delayedCall(0.5, goHome);
      return;
    }

    if (logoImg.complete) runIntro();
    else logoImg.addEventListener('load', runIntro);
  };

  startScreen.addEventListener('pointerup', startExperience, { once: true });
  startBtn.addEventListener('pointerdown', () => startScreen.classList.add('is-pressed'), { once: true });

  window.addEventListener('resize', () => {
    dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.1 : 1.5);
    resizeCanvas();
  });
});
