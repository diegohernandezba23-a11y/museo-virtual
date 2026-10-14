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
  const dripsContainer = document.querySelector('.drips');
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
    window.location.href = 'home.html';
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
    const rect = sceneEl.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
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
    const originX = sceneRect.width * 0.62;
    const originY = sceneRect.height * 0.42;
    const toXY = (sx, sy) => ({ x: sx - originX, y: sy - originY });

    const logoRect = logoMain.getBoundingClientRect();
    const logoLeft = logoRect.left - sceneRect.left;
    const logoTop = logoRect.top - sceneRect.top;
    const logoW = logoRect.width;
    const logoH = logoRect.height;
    const holdRotate = isMobile ? -16 : -20;
    const offX = isMobile ? 18 : 26;
    const offY = isMobile ? -18 : -24;

    const onLogo = (lx, ly) => toXY(logoLeft + logoW * lx + offX, logoTop + logoH * ly + offY);

    const drips = [];
    for (let i = 0; i < 4; i++) {
      const d = document.createElement('span');
      d.className = 'drip';
      d.style.left = `${logoLeft + logoW * (0.18 + i * 0.22) + gsap.utils.random(-8, 8)}px`;
      d.style.top = `${logoTop + logoH - 8}px`;
      d.style.height = '0px';
      dripsContainer.appendChild(d);
      drips.push(d);
    }

    const updateEmitter = () => {
      const canRect = canEl.getBoundingClientRect();
      const sRect = sceneEl.getBoundingClientRect();
      const rot = (gsap.getProperty(canEl, 'rotate') || holdRotate) * Math.PI / 180;
      const cx = canRect.left - sRect.left + canRect.width * 0.42;
      const cy = canRect.top - sRect.top + canRect.height * 0.1;
      emitter.x = cx + Math.sin(rot) * 8;
      emitter.y = cy + 8;
      emitter.angle = Math.PI * 0.58 + rot * 0.4;
      if (paintGlow) {
        paintGlow.style.left = `${emitter.x - paintGlow.offsetWidth / 2}px`;
        paintGlow.style.top = `${emitter.y - paintGlow.offsetHeight / 2}px`;
      }
    };

    let wrist;
    const startWrist = () => {
      if (wrist) wrist.kill();
      wrist = gsap.to(canBody, {
        x: isMobile ? 2 : 3.5,
        y: 2,
        rotate: 2.2,
        duration: 0.045,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      });
    };
    const stopWrist = () => {
      if (wrist) wrist.kill();
      gsap.to(canBody, { x: 0, y: 0, rotate: 0, duration: 0.12 });
    };

    const first = onLogo(0.06, 0.06);
    gsap.set(canEl, {
      xPercent: -50,
      yPercent: -50,
      x: first.x,
      y: -sceneRect.height * 0.58,
      rotate: -8,
      scale: 0.88,
      opacity: 0,
      filter: 'drop-shadow(0 16px 20px #000000b0) blur(5px)',
    });

    gsap.set(cameraEl, { scale: 1.1, y: 10 });
    gsap.set(logoMain, { opacity: 1, scale: 1 });
    logoMain.style.setProperty('--paint', '0%');
    stickers.forEach((el) => {
      gsap.set(el, { autoAlpha: 0 });
      el.style.setProperty('--paint', '0%');
    });

    const setPaint = (el, pct) => el.style.setProperty('--paint', `${pct}%`);
    const cover = { p: 0 };

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(startScreen, { opacity: 0, duration: 0.38, ease: 'power2.in' }, 0)
      .to(wallBg, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.06)
      .to(cameraEl, { scale: 1.04, y: 0, duration: 1.35, ease: 'power2.out' }, 0.06)
      .to('.wall-bg img', { scale: 1, duration: 2.4, ease: 'power1.out' }, 0.08)
      .to(cinematicFlash, { opacity: 0.28, duration: 0.08 }, 0.08)
      .to(cinematicFlash, { opacity: 0, duration: 0.5 }, 0.16)
      .to(neonEls, { opacity: isMobile ? 0.14 : 0.22, duration: 1.1, stagger: 0.1 }, 0.18)
      .to(sceneGlow, { opacity: 0.45, scale: 1, duration: 1 }, 0.2);

    tl.to(canEl, {
      opacity: 1,
      x: first.x,
      y: first.y,
      rotate: holdRotate,
      scale: 1,
      duration: 0.78,
      ease: 'expo.out',
      filter: 'drop-shadow(0 12px 16px #000000a8) blur(0px)',
      onStart: playSpraySound,
      onUpdate: updateEmitter,
    }, 0.8)
      .to(canEl, { y: first.y + 8, duration: 0.14, ease: 'power2.in', onUpdate: updateEmitter }, 1.52)
      .to(canEl, { y: first.y, duration: 0.26, ease: 'power3.out', onUpdate: updateEmitter }, 1.64)
      .to(impactRing, { opacity: 0.45, scale: 1.4, duration: 0.36 }, 1.58)
      .to(impactRing, { opacity: 0, duration: 0.22 }, 1.84)
      .to(sprayCone, { opacity: isMobile ? 0.55 : 0.85, duration: 0.16 }, 1.66)
      .to(paintGlow, { opacity: isMobile ? 0.55 : 0.8, duration: 0.16 }, 1.66)
      .to(logoHalo, { opacity: 0.9, duration: 0.3 }, 1.7);

    const paintPath = [
      { lx: 0.08, ly: 0.08 },
      { lx: 0.92, ly: 0.16 },
      { lx: 0.08, ly: 0.30 },
      { lx: 0.92, ly: 0.44 },
      { lx: 0.08, ly: 0.58 },
      { lx: 0.92, ly: 0.72 },
      { lx: 0.10, ly: 0.86 },
      { lx: 0.80, ly: 0.98 },
    ].map((pt) => {
      const pos = onLogo(pt.lx, pt.ly);
      return {
        x: pos.x,
        y: pos.y,
        rotate: holdRotate + (pt.lx > 0.5 ? 9 : -9),
        duration: 0.42,
        ease: 'sine.inOut',
      };
    });

    tl.call(() => { isPainting = true; startWrist(); updateEmitter(); }, null, 1.68)
      .to(cover, {
        p: 100,
        duration: 3.36,
        ease: 'none',
        onUpdate: () => setPaint(logoMain, cover.p),
      }, 1.7)
      .to(canEl, {
        keyframes: paintPath,
        onUpdate: updateEmitter,
      }, 1.7);

    const logoDone = 5.12;
    tl.to(cameraEl, { x: 2, y: -2, duration: 0.05, repeat: 14, yoyo: true, ease: 'none' }, 1.75)
      .call(() => {
        setPaint(logoMain, 100);
        logoMain.classList.add('is-painted');
        stopWrist();
        isPainting = false;
        emitBurst(logoLeft + logoW / 2, logoTop + logoH / 2, 56);
      }, null, logoDone)
      .to(logoHalo, { opacity: 0.4, duration: 0.35 }, logoDone)
      .to(logoMain, { filter: 'drop-shadow(0 0 28px #FF2E88aa)', duration: 0.22 }, logoDone)
      .to(logoMain, { filter: 'drop-shadow(0 14px 28px #00000090)', duration: 0.55 }, logoDone + 0.25)
      .to(logoMain, { '--shine-x': '220%', duration: 0.65, ease: 'power2.inOut' }, logoDone + 0.05)
      .to(drips, {
        height: () => gsap.utils.random(16, 32),
        opacity: 0.9,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power1.out',
      }, logoDone + 0.08)
      .to(drips, { opacity: 0, y: 14, duration: 0.5, stagger: 0.05, ease: 'power1.in' }, logoDone + 0.55);

    const sprayStamp = (el, startTime) => {
      const r = el.getBoundingClientRect();
      const s = sceneEl.getBoundingClientRect();
      const left = r.left - s.left;
      const top = r.top - s.top;
      const a = toXY(left + r.width * 0.18 + offX, top + r.height * 0.18 + offY);
      const b = toXY(left + r.width * 0.82 + offX, top + r.height * 0.55 + offY);
      const c = toXY(left + r.width * 0.2 + offX, top + r.height * 0.92 + offY);
      const sp = { p: 0 };

      tl.set(el, { autoAlpha: 1 }, startTime)
        .call(() => { el.classList.add('is-spraying'); el.style.setProperty('--paint', '0%'); }, null, startTime)
        .to(canEl, { x: a.x, y: a.y, rotate: holdRotate, duration: 0.38, ease: 'power2.inOut', onUpdate: updateEmitter }, startTime)
        .call(() => { isPainting = true; startWrist(); playSpraySound(); }, null, startTime + 0.3)
        .to(canEl, { x: b.x, y: b.y, rotate: holdRotate + 8, duration: 0.5, ease: 'sine.inOut', onUpdate: updateEmitter }, startTime + 0.32)
        .to(canEl, { x: c.x, y: c.y, rotate: holdRotate - 7, duration: 0.46, ease: 'sine.inOut', onUpdate: updateEmitter }, startTime + 0.82)
        .to(sp, {
          p: 100,
          duration: 0.96,
          ease: 'none',
          onUpdate: () => setPaint(el, sp.p),
        }, startTime + 0.32)
        .call(() => {
          setPaint(el, 100);
          el.classList.add('is-painted');
          el.classList.add('is-stuck');
          stopWrist();
          isPainting = false;
          emitBurst(left + r.width / 2, top + r.height / 2, 18);
        }, null, startTime + 1.3);
    };

    if (stickers[0]) sprayStamp(stickers[0], 5.7);
    if (stickers[1]) sprayStamp(stickers[1], 7.05);
    if (stickers[2]) sprayStamp(stickers[2], 8.4);

    tl.to(sprayCone, { opacity: 0, duration: 0.2 }, 9.7)
      .to(paintGlow, { opacity: 0, duration: 0.2 }, 9.7)
      .to(canEl, {
        x: isMobile ? 150 : 200,
        y: '-=36',
        rotate: 14,
        opacity: 0,
        duration: 0.48,
        ease: 'power3.in',
      }, 9.73)
      .to(cameraEl, { scale: 1.1, x: 0, y: 0, duration: 0.9, ease: 'power1.inOut' }, 9.65)
      .to(fadeOverlay, { opacity: 1, duration: 0.75, ease: 'power1.in' }, 10.5)
      .call(goHome, null, 10.9);

    if (skipBtn) {
      skipBtn.classList.add('is-visible');
      gsap.to(skipBtn, { opacity: 1, duration: 0.35, delay: 0.7 });
      skipBtn.addEventListener('click', () => {
        tl.pause();
        isPainting = false;
        stopWrist();
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
