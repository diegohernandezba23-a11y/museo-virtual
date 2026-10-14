(() => {
  if (!window.MUSEO) return;

  const stats = MUSEO.stats();
  const statsRoot = document.querySelector("[data-stats]");
  if (statsRoot) {
    statsRoot.innerHTML = [
      { n: String(stats.eventos).padStart(2, "0"), l: "Eventos" },
      { n: String(stats.obras).padStart(2, "0"), l: "Obras" },
      { n: String(stats.voces).padStart(2, "0"), l: "Voces" },
    ]
      .map(
        (item) => `<article class="stat" data-reveal>
          <strong>${item.n}</strong>
          <span>${item.l}</span>
        </article>`
      )
      .join("");
  }

  const eventsRoot = document.querySelector("[data-events]");
  if (eventsRoot) {
    const instagramLinks = {
      "narra-muros": {
        href: "https://instagram.com/h_umo_996?obrf=OHhvNzVsenZhemM%3D",
        handle: "@h_umo_996",
      },
      "ecologia-integral": {
        href: "https://instagram.com/el_arte_de_zenko?srtk=MTBlc2tvMzYzd2UzbA%3D%3D",
        handle: "@el_arte_de_zenko",
      },
    };
    eventsRoot.innerHTML = MUSEO.events
      .map((event, index) => {
        const encode = (src) => encodeURI(src);
        const isEcologiaIntegral = event.id === "ecologia-integral";
        const instagram = instagramLinks[event.id];
        const description = isEcologiaIntegral
          ? "Esta creación reúne las voces, aprendizajes y reflexiones surgidas durante el encuentro. Un mural que nos invita a comprender que el cuidado de la casa común comienza con nuestras acciones y decisiones cotidianas."
          : event.lead;
        const layout =
          event.id === "ecologia-integral"
            ? "event-feature--panel"
            : index % 2
              ? "event-feature--split"
              : "event-feature--panel";
        return `
        <article class="event-feature ${layout} event-feature--${event.id}" data-reveal>
          <a class="event-feature__visual" href="evento.html?id=${event.id}">
            <img src="${encode(event.cover)}" alt="${event.coverAlt}" loading="${index ? "lazy" : "eager"}">
            <span class="event-feature__index">${String(index + 1).padStart(2, "0")}</span>
          </a>
          <div class="event-feature__copy">
            <p class="eyebrow">${event.kicker}</p>
            <h3>${event.name}</h3>
            <p>${description}</p>
            <p class="event-feature__meta">${event.place}${event.obrasCount ? ` · ${event.obrasCount} obras` : ""}${event.videos.length ? ` · ${event.videos.length} ${event.videos.length === 1 ? "video" : "videos"}` : ""}</p>
            <div class="event-feature__actions">
            ${instagram ? `<a class="button button--ghost instagram-link" href="${instagram.href}" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                <circle cx="12" cy="12" r="4"></circle>
                <circle class="instagram-link__dot" cx="17.5" cy="6.5" r="1"></circle>
              </svg>
              <span>Instagram · ${instagram.handle}</span>
            </a>` : ""}
            <a class="button" href="evento.html?id=${event.id}">Entrar al evento</a>
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  const strip = document.querySelector("[data-obras-strip]");
  if (strip) {
    strip.innerHTML = MUSEO.obras
      .slice(0, 8)
      .map(
        (obra, index) => `
        <a class="film-card" href="museo.html" aria-label="${obra.alt}" data-gallery-card style="--gallery-index:${index}">
          <img src="${obra.src}" alt="${obra.alt}" loading="lazy">
          <span class="film-card__index" aria-hidden="true">${String(obra.n).padStart(2, "0")}</span>
          <span class="film-card__caption" aria-hidden="true">
            <span>Narra Muros</span>
            <strong>Obra ${String(obra.n).padStart(2, "0")}</strong>
            <span class="film-card__action">Ver en la sala <i aria-hidden="true">↗</i></span>
          </span>
        </a>`
      )
      .join("");
  }

})();
