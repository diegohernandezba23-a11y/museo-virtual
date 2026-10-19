/* =========================================================
   NARRA MUROS — Sala de obras
   Anillo 3D: las obras viven sobre un muro circular que gira.
   Arrastre con inercia, imán al centro, parallax de mouse,
   entrada cinematográfica y reflejo en el piso.
   ========================================================= */

(() => {
  "use strict";

  const META = {
    1:  { titulo: "Social · Distrito",    autor: "Narración urbana" },
    2:  { titulo: "Enigmativo",           autor: "Visita desde otro cielo" },
    3:  { titulo: "Bajo la luna",         autor: "Dos siluetas, un territorio" },
    4:  { titulo: "El árbol",             autor: "Raíz y barrio" },
    5:  { titulo: "Case 143",             autor: "Personajes del muro" },
    6:  { titulo: "Máscara azul",         autor: "Identidad en la calle" },
    7:  { titulo: "Contra etiqueta",      autor: "Colectivo Contra Etiqueta" },
    8:  { titulo: "Trazo libre",          autor: "Joven artista" },
    9:  { titulo: "Río y bosque",         autor: "Paisaje que respira" },
    10: { titulo: "Atardecer",            autor: "Ukyu · 2024" },
    11: { titulo: "La avenida",           autor: "Perspectiva del territorio" },
    12: { titulo: "Engativá es arte",     autor: "Letra viva" },
    13: { titulo: "Flores",               autor: "Angie" },
    14: { titulo: "Pantera",              autor: "Nicolle" },
    15: { titulo: "Copa verde",           autor: "Kike" },
    16: { titulo: "Memoria del muro",     autor: "Joven artista" },
    17: { titulo: "Planta",               autor: "Dahian V" },
    18: { titulo: "Señal en la ciudad",   autor: "Emma" },
  };

  const TOTAL = 18;
  const STEP = 360 / TOTAL;                 // grados entre obras
  const EXT = [".webp", ".JPG", ".jpg", ".png", ".jpeg"];

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const G = window.gsap;

  const $ = (s) => document.querySelector(s);
  const stage = $("[data-stage]");
  const tilt = $("[data-tilt]");
  const ring = $("[data-ring]");
  const gallery = $("[data-gallery]");
  const alley = document.querySelector(".alley");
  const elIndex = $("[data-index]");
  const elTotal = $("[data-total]");
  const elProgress = $("[data-progress]");
  const lightbox = $("[data-lightbox]");
  const lightImg = $("[data-lightbox-img]");
  const lightTitle = $("[data-lightbox-title]");
  const lightAuthor = $("[data-lightbox-author]");

  if (!stage || !ring) return;
  if (elTotal) elTotal.textContent = String(TOTAL).padStart(2, "0");

  /* ---------------------------------------------------------
     1. Construcción de las obras
     --------------------------------------------------------- */

  const obras = [];
  const cards = [];

  const attachFallback = (img, mirror, n) => {
    let i = 0;
    img.addEventListener("error", () => {
      i += 1;
      if (i >= EXT.length) {
        img.closest(".art")?.classList.add("is-missing");
        img.removeAttribute("src");
        return;
      }
      const next = `assets/img/Obras/Pintura-${n}${EXT[i]}`;
      img.src = next;
      if (mirror) mirror.src = next;
    });
  };

  for (let n = 1; n <= TOTAL; n += 1) {
    const meta = META[n] || { titulo: `Obra ${n}`, autor: "Joven artista" };
    const src = `assets/img/Obras/Pintura-${n}${EXT[0]}`;
    obras.push({ n, src, ...meta });

    const card = document.createElement("button");
    card.type = "button";
    card.className = "art";
    card.dataset.cursor = "Ver";
    card.setAttribute("aria-label", `Ver ${meta.titulo}, de ${meta.autor}`);
    card.innerHTML = `
      <span class="art__lift">
        <span class="art__frame">
          <img alt="${meta.titulo}" draggable="false" loading="${n <= 4 ? "eager" : "lazy"}">
          <span class="art__shade" aria-hidden="true"></span>
        </span>
        <span class="art__mirror" aria-hidden="true"><img alt="" draggable="false"></span>
        <span class="art__info">
          <span class="art__tag">${meta.autor}</span>
          <span class="art__title">${meta.titulo}</span>
          <span class="art__cta">Ver obra</span>
        </span>
      </span>`;

    const img = card.querySelector(".art__frame img");
    const mirror = card.querySelector(".art__mirror img");
    attachFallback(img, mirror, n);
    img.src = src;
    if (mirror) mirror.src = src;

    card._info = card.querySelector(".art__info");
    ring.appendChild(card);
    cards.push(card);
  }

  /* ---------------------------------------------------------
     2. Geometría del anillo
     --------------------------------------------------------- */

  let R = 780;          // radio
  let cw = 300;         // ancho de obra
  let unitPx = 260;     // px de arrastre por obra

  const measure = () => {
    const vw = window.innerWidth;
    const vh = stage.clientHeight || window.innerHeight;
    const mobile = vw < 821;
    const short = window.innerHeight < 760;

    cw = mobile ? Math.min(vw * 0.84, 360) : Math.min(vw * 0.34, 440);
    let ch = cw * 1.34;

    // Banda de obras: más alta que antes, sin invadir el título ni el HUD.
    const maxH = vh * (mobile ? (short ? 0.44 : 0.52) : (short ? 0.44 : 0.47));
    if (ch > maxH) { ch = maxH; cw = ch / 1.34; }

    const spread = mobile ? 0.84 : 0.9;
    R = Math.round((cw * spread / 2) / Math.tan(Math.PI / TOTAL));
    unitPx = Math.max(120, cw * (mobile ? 0.72 : 0.82));

    const root = document.body;
    root.style.setProperty("--cw", `${Math.round(cw)}px`);
    root.style.setProperty("--ch", `${Math.round(ch)}px`);
    root.style.setProperty("--r", `${R}px`);

    cards.forEach((card, i) => {
      card.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`;
    });

    renderRing();
    updateStates(true);
  };

  /* ---------------------------------------------------------
     3. Estado y render
     --------------------------------------------------------- */

  // ?obra=7 abre la sala con esa obra al frente (enlaces del home)
  const requested = parseInt(new URLSearchParams(location.search).get("obra"), 10);
  const startIndex = requested >= 1 && requested <= TOTAL ? requested - 1 : 0;

  let pos = startIndex;     // posición continua (en índices)
  let targetPos = startIndex;
  let centerIndex = -1;
  let dragging = false;
  let introRunning = false;

  const wrapIndex = (i) => ((i % TOTAL) + TOTAL) % TOTAL;

  const renderRing = () => {
    ring.style.transform = `translate3d(0, 0, ${-R}px) rotateY(${(-pos * STEP).toFixed(3)}deg)`;
  };

  const VIS = coarse ? 2 : 3.4;

  const updateStates = (force) => {
    for (let i = 0; i < TOTAL; i += 1) {
      const card = cards[i];
      let d = wrapIndex(i - Math.round(pos)) + (Math.round(pos) - pos);
      if (d > TOTAL / 2) d -= TOTAL;
      const ad = Math.abs(d);

      const visible = ad <= VIS;
      const o = visible ? (ad <= 1 ? 1 : Math.max(0, 1 - (ad - 1) / (VIS - 1))) : 0;
      const shade = Math.min(0.55, Math.max(0, (ad - 0.45) * 0.28));

      const ro = Math.round(o * 20) / 20;
      const rs = Math.round(shade * 20) / 20;

      if (force || card._o !== ro) {
        card._o = ro;
        card.style.opacity = String(ro);
        card.style.visibility = ro < 0.02 ? "hidden" : "visible";
        card.style.pointerEvents = ro < 0.35 ? "none" : "auto";
      }
      if (force || card._s !== rs) {
        card._s = rs;
        card.style.setProperty("--shade", String(rs));
      }

      const isCenter = ad < 0.5;
      if (isCenter !== card.classList.contains("is-center")) {
        card.classList.toggle("is-center", isCenter);
      }
      // el reflejo solo se dibuja cerca del foco: 18 máscaras a la vez
      // es lo que hacía que la rueda se sintiera pesada.
      const isNear = ad < 1.6;
      if (isNear !== card.classList.contains("is-near")) {
        card.classList.toggle("is-near", isNear);
      }
    }

    const idx = wrapIndex(Math.round(pos));
    if (idx !== centerIndex) {
      const prev = centerIndex >= 0 ? cards[centerIndex] : null;
      centerIndex = idx;
      focusCard(cards[idx], prev);
      if (elIndex) elIndex.textContent = String(idx + 1).padStart(2, "0");
      if (elProgress) elProgress.style.width = `${((idx + 1) / TOTAL) * 100}%`;
    }
  };

  const focusCard = (card, prev) => {
    if (!card) return;
    if (G) {
      if (prev) G.to(prev._info, { opacity: 0, y: 10, duration: 0.25, overwrite: true });
      G.fromTo(card._info,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: reduce ? 0 : 0.42, delay: reduce ? 0 : 0.08, ease: "power3.out", overwrite: true, force3D: true });
    } else {
      if (prev) prev._info.style.opacity = "0";
      card._info.style.opacity = "1";
      card._info.style.transform = "none";
    }
  };

  /* ---------------------------------------------------------
     4. Movimiento: imán al centro + inercia
     --------------------------------------------------------- */

  const goTo = (p) => { targetPos = p; restartAuto(); };
  const next = () => goTo(Math.round(targetPos) + 1);
  const prev = () => goTo(Math.round(targetPos) - 1);

  let lastFrame = performance.now();
  document.addEventListener("visibilitychange", () => { lastFrame = performance.now(); });

  const tick = () => {
    const now = performance.now();
    // dt normalizado a 60fps y con tope, para que un frame perdido
    // no produzca un salto ni un frenazo.
    const dt = Math.min((now - lastFrame) / 16.667, 3);
    lastFrame = now;

    if (introRunning) { renderRing(); updateStates(); return; }

    if (!dragging) {
      const diff = targetPos - pos;
      if (Math.abs(diff) < 0.0006) {
        if (pos !== targetPos) { pos = targetPos; renderRing(); updateStates(); }
        return;
      }
      pos += diff * (reduce ? 1 : 1 - Math.pow(0.9, dt));
    }
    renderRing();
    updateStates();
  };

  /* ---------------------------------------------------------
     5. Interacción
     --------------------------------------------------------- */

  let startX = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0, moved = 0, pointerId = null, pointerCard = null;

  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    moved = 0;
    vel = 0;
    pointerId = e.pointerId;
    pointerCard = e.target.closest?.(".art") || null;
    startX = lastX = e.clientX;
    startPos = pos;
    lastT = performance.now();
    stage.classList.add("is-dragging");
    stage.setPointerCapture?.(e.pointerId);
    pauseAuto();
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    pos = startPos - dx / unitPx;

    const now = performance.now();
    const dt = now - lastT;
    if (dt > 8) {
      vel = ((e.clientX - lastX) / unitPx) / (dt / 1000);
      lastX = e.clientX;
      lastT = now;
    }
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("is-dragging");
    const fling = Math.max(-4, Math.min(4, -vel * 0.32));
    targetPos = Math.round(pos + fling);
    restartAuto();
  };

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  window.addEventListener("pointerup", endDrag);

  stage.addEventListener("click", (e) => {
    const card = e.target.closest?.(".art") || pointerCard;
    if (!card) return;
    if (moved > 10) { e.preventDefault(); return; }
    const i = cards.indexOf(card);
    if (i < 0) return;
    if (!card.classList.contains("is-center")) { goTo(nearestTo(i)); return; }
    openLightbox(obras[i]);
  });

  // Camino más corto hacia una obra concreta.
  const nearestTo = (i) => {
    const base = Math.round(targetPos);
    let d = wrapIndex(i - base);
    if (d > TOTAL / 2) d -= TOTAL;
    return base + d;
  };

  document.querySelector("[data-prev]")?.addEventListener("click", prev);
  document.querySelector("[data-next]")?.addEventListener("click", next);

  window.addEventListener("keydown", (e) => {
    if (lightbox && !lightbox.hidden) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
      if (e.key === "Tab") {
        // Foco atrapado dentro del visor
        const items = [...lightbox.querySelectorAll("button")];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Enter" && document.activeElement?.classList.contains("is-center")) {
      openLightbox(obras[centerIndex]);
    }
  });

  let wheelLock = false;
  stage.addEventListener("wheel", (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 10 || wheelLock) return;
    e.preventDefault();
    wheelLock = true;
    delta > 0 ? next() : prev();
    setTimeout(() => { wheelLock = false; }, reduce ? 0 : 520);
  }, { passive: false });

  /* ---------------------------------------------------------
     6. Recorrido automático (se detiene al primer gesto)
     --------------------------------------------------------- */

  let autoTimer = null;
  let autoStopped = false;

  const startAuto = () => {
    if (reduce || autoStopped) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (!document.hidden && (!lightbox || lightbox.hidden)) targetPos = Math.round(targetPos) + 1;
    }, 5600);
  };
  const pauseAuto = () => clearInterval(autoTimer);
  const restartAuto = () => { pauseAuto(); startAuto(); };

  // Tras la primera interacción real, la sala deja de moverse sola.
  ["pointerdown", "keydown", "wheel"].forEach((ev) => {
    window.addEventListener(ev, () => { autoStopped = true; pauseAuto(); }, { once: true, passive: true });
  });

  gallery?.addEventListener("pointerenter", pauseAuto);
  gallery?.addEventListener("pointerleave", startAuto);

  /* ---------------------------------------------------------
     7. Parallax de puntero (solo con mouse real)
     --------------------------------------------------------- */

  if (!coarse && !reduce) {
    let queued = false, mx = 0, my = 0;
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const ry = (mx * 5).toFixed(2);
        const rx = (-my * 3.4).toFixed(2);
        if (G) {
          G.to(document.body, { "--ty": `${ry}deg`, "--tx": `${rx}deg`, duration: 0.9, ease: "power3.out", overwrite: true });
          if (alley) G.to(alley, { "--px": `${(mx * 26).toFixed(1)}px`, "--py": `${(my * 16).toFixed(1)}px`, duration: 1.2, ease: "power3.out", overwrite: true });
        } else {
          document.body.style.setProperty("--ty", `${ry}deg`);
          document.body.style.setProperty("--tx", `${rx}deg`);
          alley?.style.setProperty("--px", `${(mx * 26).toFixed(1)}px`);
          alley?.style.setProperty("--py", `${(my * 16).toFixed(1)}px`);
        }
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     8. Lightbox
     --------------------------------------------------------- */

  let lastFocus = null;
  let lightIndex = 0;

  const fillLightbox = (obra) => {
    lightImg.src = obra.src;
    lightImg.alt = obra.titulo;
    lightTitle.textContent = obra.titulo;
    lightAuthor.textContent = obra.autor;
  };

  function stepLightbox(dir) {
    lightIndex = wrapIndex(lightIndex + dir);
    fillLightbox(obras[lightIndex]);
    goTo(nearestTo(lightIndex));
    if (G && !reduce) G.fromTo(lightImg, { opacity: 0, x: dir * 24 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" });
  }

  function openLightbox(obra) {
    if (!lightbox || !obra) return;
    lastFocus = document.activeElement;
    lightIndex = obras.indexOf(obra);
    fillLightbox(obra);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    pauseAuto();
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    if (G && !reduce) {
      G.fromTo(".lightbox__card", { scale: 0.94, y: 14, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
    }
    lightbox.querySelector(".lightbox__close")?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { lightbox.hidden = true; lastFocus?.focus(); }, 280);
  }

  document.querySelector("[data-lightbox-close]")?.addEventListener("click", closeLightbox);
  document.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => stepLightbox(-1));
  document.querySelector("[data-lightbox-next]")?.addEventListener("click", () => stepLightbox(1));
  lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

  /* ---------------------------------------------------------
     9. Niebla de partículas
     --------------------------------------------------------- */

  const initParticles = () => {
    const canvas = document.querySelector(".fx-canvas");
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const COUNT = coarse ? 8 : 22;
    let w = 0, h = 0, raf = null;
    const parts = [];

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i += 1) {
      parts.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.5 + 0.4,
        sp: Math.random() * 0.3 + 0.06,
        dr: (Math.random() - 0.5) * 0.22,
        hue: Math.random() > 0.5 ? "0, 245, 212" : "255, 46, 196",
        a: Math.random() * 0.3 + 0.06,
      });
    }

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.sp; p.x += p.dr;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue}, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else loop();
    });
  };

  /* ---------------------------------------------------------
     10. Arranque: entrada cinematográfica
     --------------------------------------------------------- */

  cards.forEach((c) => { if (c._info) c._info.style.opacity = "0"; });
  measure();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 140);
  });

  if (G) {
    G.ticker.add(tick);
  } else {
    const raf = () => { tick(); requestAnimationFrame(raf); };
    raf();
  }

  if (G && !reduce) {
    const spin = { v: startIndex - 2.6 };
    introRunning = true;

    const tl = G.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".gallery-kicker", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, force3D: true })
      .fromTo(".alley-title .w b",
        { y: "1.05em", opacity: 0 },
        { y: 0, opacity: 1, duration: 0.72, stagger: 0.045, ease: "power3.out", force3D: true, clearProps: "transform" }, "-=0.28")
      .fromTo(".alley-title__rule", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.55, ease: "power3.out" }, "-=0.45")
      .fromTo(tilt, { z: -720, rotationX: 7 },
        { z: 0, rotationX: 0, duration: 1.25, ease: "power3.out", clearProps: "transform" }, "-=0.95")
      .fromTo(".gallery__stage", { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power2.out" }, "<")
      .to(spin, {
        v: startIndex,
        duration: 1.45,
        ease: "power3.out",
        onUpdate: () => { pos = spin.v; },
        onComplete: () => {
          pos = startIndex;
          targetPos = startIndex;
          introRunning = false;
          document.body.classList.add("is-live");
          startAuto();
        },
      }, "<")
      .fromTo(".gallery__hud", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, force3D: true }, "-=0.55");

    pos = spin.v;
  } else {
    document.body.classList.add("is-live");
    updateStates(true);
    startAuto();
  }

  initParticles();
})();