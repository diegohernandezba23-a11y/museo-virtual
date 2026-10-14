const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = [...track.children];
  const prev = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  const dotsWrap = carousel.querySelector("[data-carousel-dots]");
  let current = 0;
  let autoplay;

  const go = (index) => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    track.style.transition = "transform 700ms cubic-bezier(.22,1,.36,1)";
    dotsWrap?.querySelectorAll("button").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === current);
    });
    const img = slides[current].querySelector("img");
    if (img && window.gsap) {
      gsap.fromTo(img, { scale: 1.14 }, { scale: 1.02, duration: 6, ease: "none" });
    }
  };

  if (dotsWrap) {
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Ir a la obra ${i + 1}`);
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => go(i));
      dotsWrap.appendChild(b);
    });
  }

  prev?.addEventListener("click", () => go(current - 1));
  next?.addEventListener("click", () => go(current + 1));

  let startX = 0;
  track.addEventListener("pointerdown", (e) => { startX = e.clientX; }, { passive: true });
  track.addEventListener("pointerup", (e) => {
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
  });

  const play = () => {
    stop();
    autoplay = setInterval(() => go(current + 1), 5200);
  };
  const stop = () => clearInterval(autoplay);
  carousel.addEventListener("pointerenter", stop);
  carousel.addEventListener("pointerleave", play);
  play();
  go(0);
}
