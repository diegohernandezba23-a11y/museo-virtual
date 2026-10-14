/* Shared cinematic layer for inner pages */
(() => {
  const navigation = performance.getEntriesByType("navigation")[0];
  const isIntro = /(^|\/)index\.html$/.test(window.location.pathname);

  document.documentElement.classList.add("js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const overlay = document.querySelector(".page-transition");

  const fadeIn = () => {
    if (overlay) overlay.style.opacity = "0";
  };

  const go = (href) => {
    const nav = () => { window.location.assign(href); };
    if (!overlay || !window.gsap || reduce) {
      nav();
      return;
    }
    overlay.classList.add("is-active");
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      nav();
    };
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.35,
      ease: "power2.in",
      onComplete: finish,
    });
    setTimeout(finish, 500);
  };

  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = link.getAttribute("href");
      if (!url || url.startsWith("http") || url.startsWith("mailto:") || event.metaKey || event.ctrlKey) return;
      if (url.startsWith("#")) {
        document.body.classList.remove("nav-open");
        return;
      }
      const hashAt = url.indexOf("#");
      if (hashAt > 0) {
        const path = url.slice(0, hashAt).split("/").pop();
        const current = (location.pathname.split("/").pop() || "home.html");
        if (path === current) {
          document.body.classList.remove("nav-open");
          return;
        }
      }
      if (!url.includes(".html")) return;
      event.preventDefault();
      go(url);
    });
  });

  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");
  const closeNav = () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    if (navToggle) navToggle.setAttribute("aria-label", "Abrir menú");
  };
  navToggle?.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  siteNav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

  document.addEventListener("play", (e) => {
    if (e.target.tagName !== "VIDEO") return;
    document.querySelectorAll("video").forEach((video) => {
      if (video !== e.target) video.pause();
    });
  }, true);

  fadeIn();

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const gallery = document.querySelector(".filmstrip");
  const galleryCards = gallery?.querySelectorAll("[data-gallery-card]");
  if (galleryCards?.length) {
    const revealGallery = () => {
      if (!gallery || gallery.getBoundingClientRect().top > window.innerHeight * 0.85) return;
      gallery.classList.add("is-visible");
      window.removeEventListener("scroll", revealGallery);
    };
    if (reduce) {
      gallery.classList.add("is-visible");
    } else {
      window.addEventListener("scroll", revealGallery, { passive: true });
      revealGallery();
    }
  }

  if (window.gsap && !reduce) {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      const kids = el.querySelectorAll(".eyebrow, h1, h2, h3, .lead, .button, p");
      const targets = kids.length ? [el, ...kids] : [el];
      gsap.fromTo(
        el,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: window.ScrollTrigger ? { trigger: el, start: "top 88%", once: true } : undefined,
        }
      );
      if (kids.length) {
        gsap.from(kids, {
          opacity: 0,
          y: 18,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.08,
          scrollTrigger: window.ScrollTrigger ? { trigger: el, start: "top 88%", once: true } : undefined,
        });
      }
      void targets;
    });

    document.querySelectorAll(".scene-chapter").forEach((chapter) => {
      const photo = chapter.querySelector(".scene-chapter__photo");
      if (!photo || coarse) return;
      gsap.fromTo(
        photo,
        { scale: 1.08 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: window.ScrollTrigger
            ? { trigger: chapter, start: "top 90%", end: "bottom top", scrub: 0.6 }
            : undefined,
        }
      );
    });

    document.querySelectorAll("[data-parallax]").forEach((img) => {
      if (coarse) return;
      const host = img.closest("section") || img.parentElement;
      gsap.to(img, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: window.ScrollTrigger
          ? { trigger: host, start: "top bottom", end: "bottom top", scrub: 0.8 }
          : undefined,
      });
    });

    if (!document.querySelector(".hero--museum")) {
      document.querySelectorAll(".hero h1 .line span, .event-hero h1").forEach((span, i) => {
        span.style.animation = "none";
        gsap.fromTo(
          span,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.05, delay: 0.08 + i * 0.12, ease: "power4.out" }
        );
      });
    }

    const media = document.querySelector(".hero__media");
    const museumHero = document.querySelector(".hero--museum");
    if (media && !museumHero) {
      gsap.to(media, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: window.ScrollTrigger
          ? { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
          : undefined,
      });
    }

    document.querySelectorAll(".stat strong").forEach((el) => {
      const raw = el.textContent.trim();
      const num = parseInt(raw, 10);
      if (Number.isNaN(num)) return;
      const pad = raw.length;
      const obj = { n: 0 };
      gsap.to(obj, {
        n: num,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: window.ScrollTrigger ? { trigger: el, start: "top 90%", once: true } : undefined,
        onUpdate: () => {
          el.textContent = String(Math.round(obj.n)).padStart(pad, "0");
        },
      });
    });

  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  if (!coarse && !reduce) {
    const ring = document.querySelector(".cursor");
    const dot = document.querySelector(".cursor-dot");
    if (ring && dot) {
      document.body.classList.add("has-cursor");
      const pos = { x: 0, y: 0 };
      const ringPos = { x: 0, y: 0 };
      window.addEventListener("pointermove", (e) => {
        pos.x = e.clientX;
        pos.y = e.clientY;
        dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }, { passive: true });
      const follow = () => {
        ringPos.x += (pos.x - ringPos.x) * 0.18;
        ringPos.y += (pos.y - ringPos.y) * 0.18;
        ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
        requestAnimationFrame(follow);
      };
      follow();
    }
  }

  const canvas = document.querySelector(".fx-canvas");
  const museoPage = document.body.classList.contains("page-museo");
  if (canvas && !reduce && !museoPage) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
    const count = coarse ? 18 : 36;
    const dots = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      v: Math.random() * 0.00035 + 0.00012,
      c: Math.random() > 0.5 ? "#14e0c4" : "#ff2e88",
    }));
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      dots.forEach((d) => {
        d.y -= d.v;
        if (d.y < -0.02) d.y = 1.02;
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = d.c;
        ctx.beginPath();
        ctx.arc(d.x * window.innerWidth, d.y * window.innerHeight, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    };
    tick();
  }

  const filters = document.querySelectorAll("[data-filter]");
  if (filters.length) {
    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const key = btn.dataset.filter;
        document.querySelectorAll("[data-year]").forEach((card) => {
          const show = key === "all" || card.dataset.year === key;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    if (coarse || reduce) return;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
    });
  });
})();
