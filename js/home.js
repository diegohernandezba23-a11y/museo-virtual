(() => {
  if (!window.MUSEO) return;
  const { icons } = MUSEO;
  const encode = (src) => encodeURI(src);
  const pad = (n) => String(n).padStart(2, "0");

  /* ---- Cifras ---- */
  const stats = MUSEO.stats();
  const statsRoot = document.querySelector("[data-stats]");
  if (statsRoot) {
    statsRoot.innerHTML = [
      { n: stats.eventos, l: "Eventos" },
      { n: stats.obras, l: "Obras" },
      { n: stats.voces, l: "Voces" },
    ]
      .map((item, i) => `<div class="stat" data-reveal style="--d:${i * 0.1}s">
          <strong data-count="${item.n}">${pad(item.n)}</strong>
          <span>${item.l}</span>
        </div>`)
      .join("");
  }

  /* ---- Salas (eventos) ---- */
  const descriptions = {
    "ecologia-integral": "Esta creación reúne las voces, aprendizajes y reflexiones surgidas durante el encuentro. Un mural que nos invita a comprender que el cuidado de la casa común comienza con nuestras acciones y decisiones cotidianas.",
  };
  const eventsRoot = document.querySelector("[data-events]");
  if (eventsRoot) {
    eventsRoot.innerHTML = MUSEO.events
      .map((event, index) => {
        const href = `evento.html?id=${event.id}`;
        const chips = [
          event.obrasCount ? `${event.obrasCount} obras` : "",
          event.videos.length ? `${event.videos.length} ${event.videos.length === 1 ? "video" : "videos"}` : "",
        ].filter(Boolean);
        const ig = event.artistInstagram;
        return `
        <article class="sala" aria-labelledby="sala-${event.id}">
          <a class="sala__media" href="${href}" data-reveal="clip" data-cursor="Entrar" tabindex="-1" aria-hidden="true">
            <img src="${encode(event.cover)}" alt="" loading="${index ? "lazy" : "eager"}" data-parallax>
            <span class="sala__num">${pad(index + 1)}</span>
            <span class="sala__badge">Entrar<br>a la sala</span>
          </a>
          <div class="sala__copy">
            <p class="eyebrow" data-reveal>${event.kicker}</p>
            <h3 id="sala-${event.id}" data-split>${event.name}</h3>
            <p data-reveal style="--d:.1s">${descriptions[event.id] || event.lead}</p>
            <ul class="chips" data-reveal style="--d:.18s" aria-label="Datos de la sala">${chips.map((c) => `<li>${c}</li>`).join("")}</ul>
            <div class="sala__actions" data-reveal style="--d:.26s">
              <a class="button" href="${href}" data-magnetic>Entrar al evento <span class="button__icon">${icons.arrow}</span></a>
              ${ig ? `<a class="button button--ghost" href="${ig.href}" target="_blank" rel="noopener noreferrer">${icons.instagram} ${ig.handle}<span class="visually-hidden"> (Instagram, abre en otra pestaña)</span></a>` : ""}
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  /* ---- Muro de obras: dos hileras infinitas ---- */
  const wall = document.querySelector("[data-obras-wall]");
  if (wall) {
    const tile = (obra, clone) => `
      <a class="wall__tile" href="museo.html?obra=${obra.n}" data-cursor="Ver"${clone ? ' tabindex="-1" aria-hidden="true"' : ` aria-label="Ver la obra ${pad(obra.n)} en la sala"`}>
        <img src="assets/img/Obras/Pintura-${obra.n}-thumb.webp" alt="" loading="lazy" width="240" height="320">
        <span>Obra ${pad(obra.n)}</span>
      </a>`;
    const half = Math.ceil(MUSEO.obras.length / 2);
    const rows = [MUSEO.obras.slice(0, half), MUSEO.obras.slice(half)];
    wall.innerHTML = rows
      .map((row, r) => {
        const items = row.map((o) => tile(o, false)).join("") + row.map((o) => tile(o, true)).join("");
        return `<div class="wall__row ${r ? "wall__row--reverse" : ""}" style="--wall-dur:${r ? 70 : 58}s">
          <div class="wall__track">${items}</div>
        </div>`;
      })
      .join("");
  }
})();
