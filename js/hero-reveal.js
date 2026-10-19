/* ============ js/hero-reveal.js — el home se "pinta" con spray al llegar ============ */
(() => {
  const root = document.documentElement;
  const hero = document.querySelector(".hero--museum");
  const release = () => root.classList.remove("hero-intro", "hero-paint");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!hero || !window.gsap || reduce) { release(); return; }

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const fromIntro = root.classList.contains("hero-paint");
  try { sessionStorage.removeItem("nm-intro"); } catch (e) {}

  const media = hero.querySelector(".hero__media");
  const photo = hero.querySelector(".hero__photo");
  const copy = hero.querySelector(".hero__copy");
  const kicker = hero.querySelector(".hero__kicker");
  const kickerBar = kicker?.querySelector("i");
  const title = hero.querySelector("h1");
  const lines = [...hero.querySelectorAll("h1 .line")];
  const lineText = lines.map((line) => line.querySelector("span"));
  const lead = hero.querySelector(".lead");
  const actions = hero.querySelectorAll(".hero__actions .button");
  const extras = [hero.querySelector(".hero__meta"), hero.querySelector(".scroll-hint"), document.querySelector(".site-header")].filter(Boolean);

  const wipes = lines.map((line) => {
    const wipe = document.createElement("i");
    wipe.className = "line-wipe";
    wipe.setAttribute("aria-hidden", "true");
    line.appendChild(wipe);
    return wipe;
  });

  /* Trazos de spray en zigzag que borran una capa negra sobre la foto */
  const sprayReveal = (tl) => {
    const canvas = document.createElement("canvas");
    canvas.className = "hero-reveal-canvas";
    canvas.setAttribute("aria-hidden", "true");
    media.after(canvas);
    const ctx = canvas.getContext("2d");
    const W = hero.clientWidth;
    const H = hero.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#07080a";
    ctx.fillRect(0, 0, W, H);

    const COLORS = ["#14e0c4", "#ff2e88", "#f2ece0", "#ff6b9d"];
    const R = Math.max(W, H) * (coarse ? 0.17 : 0.15);
    const rows = Math.ceil(H / (R * 1.25));
    const step = R * 0.22;
    const len = W + R * 2;
    const speckles = coarse ? 8 : 16;
    const strokeDur = coarse ? 0.62 : 0.72;
    const gap = 0.16;

    const strokes = Array.from({ length: rows }, (_, i) => {
      const y = ((i + 0.5) * H) / rows;
      const ltr = i % 2 === 0;
      const tilt = (Math.random() - 0.5) * R * 0.6;
      return {
        x0: ltr ? -R : W + R, y0: y - tilt,
        x1: ltr ? W + R : -R, y1: y + tilt,
        cx: W / 2, cy: y + R * 0.25 * (Math.random() < 0.5 ? -1 : 1),
        p: 0, last: 0,
      };
    });

    const point = (s, t) => {
      const u = 1 - t;
      return {
        x: u * u * s.x0 + 2 * u * t * s.cx + t * t * s.x1,
        y: u * u * s.y0 + 2 * u * t * s.cy + t * t * s.y1,
      };
    };

    const stamp = (x, y) => {
      ctx.globalCompositeOperation = "destination-out";
      const g = ctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.62, "rgba(0,0,0,.95)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();

      // Salpicaduras de color en el borde del trazo
      ctx.globalCompositeOperation = "source-over";
      for (let k = 0; k < speckles; k++) {
        const a = Math.random() * Math.PI * 2;
        const d = R * (0.85 + Math.random() * 0.5);
        ctx.globalAlpha = Math.random() * 0.7 + 0.2;
        ctx.fillStyle = COLORS[(Math.random() * COLORS.length) | 0];
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.random() * 2.4 + 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    strokes.forEach((s, i) => {
      tl.to(s, {
        p: 1,
        duration: strokeDur,
        ease: "power2.inOut",
        onUpdate: () => {
          const n = Math.max(1, Math.ceil(((s.p - s.last) * len) / step));
          for (let k = 1; k <= n; k++) {
            const q = point(s, s.last + ((s.p - s.last) * k) / n);
            stamp(q.x + (Math.random() - 0.5) * R * 0.1, q.y + (Math.random() - 0.5) * R * 0.1);
          }
          s.last = s.p;
        },
      }, 0.1 + i * gap);
    });

    const end = 0.1 + (rows - 1) * gap + strokeDur;
    tl.to(canvas, { opacity: 0, duration: 0.5, ease: "power1.out", onComplete: () => canvas.remove() }, end - 0.15);
    return end;
  };

  const parallaxOnScroll = () => {
    if (coarse || !window.ScrollTrigger) return;
    const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 };
    gsap.to(media, { yPercent: 14, ease: "none", scrollTrigger: scrub });
    gsap.to(copy, { y: -80, autoAlpha: 0.15, ease: "none", scrollTrigger: { ...scrub } });
  };

  const run = () => {
    // Estados iniciales en línea, luego se suelta el ocultamiento por CSS
    lineText.forEach((span) => { span.style.animation = "none"; });
    // y: 0 descarta el translate que GSAP leería del CSS de ocultamiento
    gsap.set(lineText, { y: 0, yPercent: 105 });
    gsap.set(wipes, { scaleX: 0, transformOrigin: "left center" });
    gsap.set([kicker, lead, ...extras].filter(Boolean), { autoAlpha: 0 });
    gsap.set(lead, { y: 20 });
    gsap.set(actions, { autoAlpha: 0, y: 18, scale: 0.94 });
    if (kickerBar) gsap.set(kickerBar, { scaleX: 0, transformOrigin: "left center" });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        wipes.forEach((w) => w.remove());
        parallaxOnScroll();
      },
    });

    let t0;
    if (fromIntro) {
      gsap.set(media, { scale: 1.22 });
      const end = sprayReveal(tl);
      release();
      tl.to(media, { scale: 1, duration: end + 0.6 }, 0);
      if (!coarse) {
        tl.fromTo(media,
          { filter: "brightness(1.5) saturate(1.35)" },
          { filter: "brightness(1) saturate(1)", duration: 1.2, clearProps: "filter" },
          end - 0.6);
      }
      t0 = end - 0.45;
    } else {
      release();
      tl.fromTo(media, { scale: 1.1, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.4 }, 0);
      t0 = 0.15;
    }

    tl.to(kicker, { autoAlpha: 1, duration: 0.5 }, t0);
    if (kickerBar) tl.to(kickerBar, { scaleX: 1, duration: 0.7, ease: "expo.out" }, t0 + 0.1);

    // Cada línea entra bajo un barrido de pintura cian→rosa
    lines.forEach((_, i) => {
      const at = t0 + 0.25 + i * 0.14;
      tl.to(wipes[i], { scaleX: 1, duration: 0.38, ease: "power4.inOut" }, at)
        .set(lineText[i], { yPercent: 0 }, at + 0.38)
        .set(wipes[i], { transformOrigin: "right center" }, at + 0.38)
        .to(wipes[i], { scaleX: 0, duration: 0.42, ease: "power4.inOut" }, at + 0.4);
    });

    const tEnd = t0 + 0.25 + (lines.length - 1) * 0.14 + 0.82;
    tl.fromTo(title,
      { textShadow: "-6px 0px 0px rgba(20,224,196,.8), 6px 0px 0px rgba(255,46,136,.8)" },
      { textShadow: "0px 0px 0px rgba(20,224,196,0), 0px 0px 0px rgba(255,46,136,0)", duration: 0.6, ease: "power2.out", clearProps: "textShadow" },
      tEnd - 0.25)
      .to(lead, { autoAlpha: 1, y: 0, duration: 0.7 }, tEnd - 0.35)
      .to(actions, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.8)", clearProps: "transform" }, tEnd - 0.2)
      .to(extras, { autoAlpha: 1, duration: 0.6, stagger: 0.06 }, tEnd);
  };

  // Espera a que la foto esté decodificada para no revelar un fondo vacío
  const ready = photo?.decode ? photo.decode().catch(() => {}) : Promise.resolve();
  Promise.race([ready, new Promise((r) => setTimeout(r, 1200))]).then(run);
})();
