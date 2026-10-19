/* =========================================================
   NARRA MUROS — capa compartida: navegación, transiciones,
   revelados, scroll y microinteracciones.
   ========================================================= */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;

  root.classList.add("js");

  /* ---- Iconos declarados con data-icon ---- */
  if (window.MUSEO?.icons) {
    document.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = MUSEO.icons[el.dataset.icon] || "";
    });
  }

  /* ---- Transición entre páginas: cortina de pintura ---- */
  const curtain = document.querySelector(".page-transition");
  const go = (href) => {
    if (!curtain || reduce) { window.location.assign(href); return; }
    try { sessionStorage.setItem("nm-curtain", "1"); } catch (e) {}
    curtain.classList.add("is-active");
    let done = false;
    const nav = () => { if (!done) { done = true; window.location.assign(href); } };
    setTimeout(nav, 640);
  };
  // Al volver con el botón "atrás" (bfcache) la cortina no debe quedar cerrada.
  window.addEventListener("pageshow", (e) => { if (e.persisted) curtain?.classList.remove("is-active"); });

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || link.target === "_blank") return;
    const url = new URL(link.getAttribute("href"), window.location.href);
    if (url.origin !== window.location.origin) return;
    const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
    if (samePage && url.hash) { closeNav(); return; }
    if (!/\.html$/.test(url.pathname)) return;
    event.preventDefault();
    closeNav();
    go(url.href);
  });

  /* ---- Menú: pantalla completa, inerte cuando está cerrado ---- */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");
  const navLabel = navToggle?.querySelector("[data-nav-label]");
  const mobileNav = window.matchMedia("(max-width: 1080px)");
  let lastFocus = null;

  const syncInert = () => {
    if (!siteNav) return;
    const hidden = mobileNav.matches && !body.classList.contains("nav-open");
    siteNav.toggleAttribute("inert", hidden);
  };
  function openNav() {
    lastFocus = document.activeElement;
    body.classList.add("nav-open", "is-locked");
    navToggle?.setAttribute("aria-expanded", "true");
    if (navLabel) navLabel.textContent = "Cerrar";
    syncInert();
    setTimeout(() => siteNav?.querySelector("a")?.focus(), 250);
  }
  function closeNav() {
    if (!body.classList.contains("nav-open")) return;
    body.classList.remove("nav-open", "is-locked");
    navToggle?.setAttribute("aria-expanded", "false");
    if (navLabel) navLabel.textContent = "Menú";
    syncInert();
    if (lastFocus && siteNav?.contains(document.activeElement)) navToggle?.focus();
  }
  navToggle?.addEventListener("click", () => (body.classList.contains("nav-open") ? closeNav() : openNav()));
  mobileNav.addEventListener?.("change", () => { closeNav(); syncInert(); });
  syncInert();

  window.addEventListener("keydown", (e) => {
    if (!body.classList.contains("nav-open")) return;
    if (e.key === "Escape") { closeNav(); navToggle?.focus(); return; }
    if (e.key !== "Tab") return;
    // Foco atrapado entre el botón y los enlaces del menú
    const items = [navToggle, ...siteNav.querySelectorAll("a")].filter(Boolean);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---- Cabecera inteligente + barra de progreso ---- */
  const header = document.querySelector(".site-header");
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  body.appendChild(progress);

  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    if (header) {
      header.classList.toggle("is-scrolled", y > 24);
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingDown && y > window.innerHeight * 0.6) header.classList.add("is-hidden");
      else if (goingUp || y < 80) header.classList.remove("is-hidden");
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  header?.addEventListener("focusin", () => header.classList.remove("is-hidden"));

  document.addEventListener("click", (e) => {
    if (!e.target.closest?.("[data-to-top]")) return;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.querySelector(".skip-link")?.focus({ preventScroll: true });
  });

  /* ---- Titulares divididos en palabras ---- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.innerHTML = text
      .split(/\s+/)
      .map((w, i) => `<span class="split-word" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`)
      .join(" ");
  });

  /* ---- Revelados al entrar en pantalla ---- */
  const revealables = document.querySelectorAll("[data-reveal], [data-split]");
  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealables.forEach((el) => io.observe(el));
  }

  /* ---- Contadores ---- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const pad = el.textContent.trim().length;
    if (!G || reduce || Number.isNaN(target)) return;
    const obj = { n: 0 };
    el.textContent = "0".padStart(pad, "0");
    G.to(obj, {
      n: target,
      duration: 1.6,
      ease: "power3.out",
      scrollTrigger: ST ? { trigger: el, start: "top 90%", once: true } : undefined,
      onUpdate: () => { el.textContent = String(Math.round(obj.n)).padStart(pad, "0"); },
    });
  });

  /* ---- Manifiesto: las palabras se encienden con el scroll ---- */
  document.querySelectorAll("[data-scrub-text]").forEach((el) => {
    if (reduce || !G || !ST) { el.classList.add("no-scrub"); return; }
    const wrapWords = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement("span");
            s.className = "mw";
            s.textContent = part;
            frag.appendChild(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          wrapWords(child);
        }
      });
    };
    wrapWords(el);
    const words = [...el.querySelectorAll(".mw")];
    ST.create({
      trigger: el,
      start: "top 78%",
      end: "bottom 45%",
      scrub: true,
      onUpdate: (self) => {
        const lit = Math.round(self.progress * words.length);
        words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
      },
    });
  });

  /* ---- Parallax sutil en imágenes grandes (solo con mouse) ---- */
  if (G && ST && !reduce && finePointer) {
    document.querySelectorAll("[data-parallax]").forEach((img) => {
      const host = img.parentElement;
      G.fromTo(img, { yPercent: -5 }, {
        yPercent: 5,
        ease: "none",
        scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    });
  }

  /* ---- Botones magnéticos ---- */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.32;
        el.style.setProperty("--mx", `${x.toFixed(1)}px`);
        el.style.setProperty("--my", `${y.toFixed(1)}px`);
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---- Cursor de spray: aro que sigue al mouse + estela de pintura ----
     Solo con mouse real y sin "reducir movimiento". El cursor nativo no se oculta. */
  if (finePointer && !reduce) {
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    ring.innerHTML = "<span></span>";
    const ringLabel = ring.firstChild;
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");
    const trail = document.createElement("canvas");
    trail.className = "spray-trail";
    trail.setAttribute("aria-hidden", "true");
    body.append(trail, ring, dot);

    const ctx = trail.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const sizeTrail = () => {
      trail.width = Math.round(window.innerWidth * dpr);
      trail.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeTrail();
    window.addEventListener("resize", sizeTrail);

    const COLORS = ["#14e0c4", "#ff2e88", "#f2ece0"];
    const mouse = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let drops = [];
    let running = false;
    let lastMove = 0;

    const emit = (x, y, speed) => {
      const n = Math.min(6, 1 + Math.floor(speed / 9));
      for (let i = 0; i < n && drops.length < 140; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = Math.random() * 0.9 + 0.2;
        drops.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v + 0.15,
          r: Math.random() * 1.8 + 0.6,
          life: 1,
          c: COLORS[(Math.random() * COLORS.length) | 0],
        });
      }
    };

    const loop = () => {
      pos.x += (mouse.x - pos.x) * 0.2;
      pos.y += (mouse.y - pos.y) * 0.2;
      ring.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drops = drops.filter((d) => (d.life -= 0.028) > 0);
      for (const d of drops) {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.02;
        ctx.globalAlpha = d.life * 0.85;
        ctx.fillStyle = d.c;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Se detiene solo cuando el aro llegó y no quedan gotas: cero gasto en reposo
      const settled = Math.abs(mouse.x - pos.x) < 0.3 && Math.abs(mouse.y - pos.y) < 0.3;
      if (drops.length || !settled || performance.now() - lastMove < 120) requestAnimationFrame(loop);
      else running = false;
    };
    const wake = () => { if (!running) { running = true; requestAnimationFrame(loop); } };

    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const speed = Math.hypot(e.clientX - mouse.x, e.clientY - mouse.y);
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMove = performance.now();
      // El punto va pegado al mouse (precisión); el aro lo sigue con retraso
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      if (!ring.classList.contains("is-visible")) {
        pos.x = mouse.x;
        pos.y = mouse.y;
        ring.classList.add("is-visible");
        dot.classList.add("is-visible");
        // La flecha nativa solo se oculta cuando ya hay un mouse real moviendo el aro
        body.classList.add("has-spray-cursor");
      }
      if (speed > 2 && speed < 400) emit(mouse.x, mouse.y, speed);
      wake();
    }, { passive: true });

    document.addEventListener("pointerover", (e) => {
      const labeled = e.target.closest?.("[data-cursor]");
      const interactive = e.target.closest?.("a, button, [role='button'], input, video, .art");
      ring.classList.toggle("is-label", !!labeled);
      ring.classList.toggle("is-hover", !labeled && !!interactive);
      ringLabel.textContent = labeled ? labeled.dataset.cursor : "";
    });
    document.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      ring.classList.add("is-down");
      for (let i = 0; i < 4; i++) emit(e.clientX, e.clientY, 40);
      wake();
    });
    window.addEventListener("pointerup", () => ring.classList.remove("is-down"));
    document.documentElement.addEventListener("pointerleave", () => {
      ring.classList.remove("is-visible");
      dot.classList.remove("is-visible");
    });
    document.addEventListener("visibilitychange", () => { drops = []; });
  }

  /* ---- Un solo video sonando a la vez ---- */
  document.addEventListener("play", (e) => {
    if (e.target.tagName !== "VIDEO") return;
    document.querySelectorAll("video").forEach((video) => { if (video !== e.target) video.pause(); });
  }, true);
})();
