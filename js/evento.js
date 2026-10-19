(() => {
  const root = document.querySelector("[data-evento]");
  if (!root || !window.MUSEO) return;

  const params = new URLSearchParams(location.search);
  const event = MUSEO.getEvent(params.get("id")) || MUSEO.events[0];
  if (!event) return;

  const usesPanelLayout = ["narra-muros", "ecologia-integral"].includes(event.id);
  document.title = `${event.name} | Museo Virtual`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", event.lead);

  const others = MUSEO.events.filter((item) => item.id !== event.id);
  const group = event.group[0];
  const encode = (src) => encodeURI(src);
  const introPhoto = event.introPhoto || event.cover;
  const introDesktopPhotoSource = event.introDesktopPhoto
    ? `<source media="(min-width: 901px)" srcset="${encode(event.introDesktopPhoto)}">`
    : "";
  const introAlt = event.introPhotoAlt || event.coverAlt;
  const introPhotoSource = event.introMobilePhoto
    ? `<source media="(max-width: 900px)" srcset="${encode(event.introMobilePhoto)}">`
    : "";
  const artistLink = event.artistInstagram
    ? `<a class="button button--ghost instagram-link" href="${event.artistInstagram.href}" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="3" width="18" height="18" rx="5"></rect>
            <circle cx="12" cy="12" r="4"></circle>
            <circle class="instagram-link__dot" cx="17.5" cy="6.5" r="1"></circle>
          </svg>
          <span>Visita al artista · ${event.artistInstagram.handle}</span>
        </a>`
      : "";
  const videosMarkup = event.videos.length
    ? `
    <section class="voices voices--${event.id}" id="voces" aria-labelledby="voices-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Audiovisual</p>
          <h2 id="voices-title">${event.videosTitle}</h2>
          <p class="lead">${event.videosLead}</p>
        </div>
      </div>
      <div class="voices__layout ${event.videos.length === 1 ? "is-single" : ""}" data-voices>
        <div class="voices__stage voices__stage--${event.id}">
          <video data-voice-main controls playsinline preload="metadata">
            <source src="${encode(event.videos[0].src)}" type="video/mp4">
          </video>
        </div>
        ${
          event.videos.length > 1
            ? `<div class="voices__rail" role="group" aria-label="Seleccionar testimonio">
                ${event.videos
                  .map(
                    (video, i) => `
                  <button class="voices__pick ${i === 0 ? "is-active" : ""}" type="button" data-voice-src="${encode(video.src)}" aria-pressed="${i === 0 ? "true" : "false"}">
                    <span>${String(i + 1).padStart(2, "0")}</span>
                    <strong>${video.label}</strong>
                    <em>Reproducir</em>
                  </button>`
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>
    </section>`
    : "";

  root.innerHTML = `
    <section class="event-hero event-hero--${event.id}" style="--event-accent:${event.accent}">
      <div class="event-hero__media" aria-hidden="true">
        <img class="event-hero__wash" src="${encode(event.cover)}" alt="">
        <img class="event-hero__photo" src="${encode(event.cover)}" alt="">
      </div>
      <div class="event-hero__veil"></div>
      <div class="event-hero__copy" data-reveal>
        <p class="hero__kicker"><i></i> ${event.kicker}</p>
        <h1>${event.name}</h1>
        <p class="lead">${event.headline}</p>
        <div class="hero__actions">
          <a class="button" href="#obra">${event.videos.length ? "Ver la obra" : "Recorrer"}</a>
          ${event.galleryHref ? `<a class="button button--ghost" href="${event.galleryHref}">Sala de obras</a>` : event.videos.length ? `<a class="button button--ghost" href="#voces">Ver el video</a>` : ""}
        </div>
      </div>
      <p class="hero__meta">${event.place}</p>
    </section>

    <section class="scene-chapter ${usesPanelLayout ? "event-feature event-feature--panel" : ""} scene-chapter--intro scene-chapter--${event.id}" aria-labelledby="encuentro-title">
      <figure class="scene-chapter__media ${usesPanelLayout ? "event-feature__visual" : ""}">
        <img class="scene-chapter__wash" src="${encode(introPhoto)}" alt="" aria-hidden="true">
        <picture class="scene-chapter__picture">
          ${introDesktopPhotoSource}
          ${introPhotoSource}
          <img class="scene-chapter__photo" src="${encode(introPhoto)}" alt="${introAlt}" width="1600" height="900" loading="lazy">
        </picture>
      </figure>
      <div class="scene-chapter__veil" aria-hidden="true"></div>
      <div class="scene-chapter__copy ${usesPanelLayout ? "event-feature__copy" : ""}" data-reveal>
        <p class="eyebrow">El encuentro</p>
        <h2 id="encuentro-title">${event.introTitle || event.headline}</h2>
        <p class="lead">${event.lead}</p>
      </div>
    </section>

    <section class="scene-chapter scene-chapter--obra scene-chapter--${event.id}" id="obra" aria-labelledby="obra-title">
      <figure class="scene-chapter__media">
        <img class="scene-chapter__wash" src="${encode(event.cover)}" alt="" aria-hidden="true">
        <img class="scene-chapter__photo" src="${encode(event.cover)}" alt="${event.coverAlt}" loading="eager">
      </figure>
      <div class="scene-chapter__veil" aria-hidden="true"></div>
      <div class="scene-chapter__copy" data-reveal>
        <p class="eyebrow">Obra principal</p>
        <h2 id="obra-title">${event.name}</h2>
        <p class="lead">${event.masterpieceCaption}</p>
        ${artistLink}
      </div>
    </section>

    ${
      group
        ? `<section class="scene-chapter ${event.id === "narra-muros" ? "event-feature event-feature--panel" : ""} scene-chapter--community scene-chapter--${event.id}" aria-labelledby="community-title">
            <figure class="scene-chapter__media ${event.id === "narra-muros" ? "event-feature__visual" : ""}">
              <img class="scene-chapter__wash" src="${encode(group.src)}" alt="" aria-hidden="true">
              <picture class="scene-chapter__picture">
                ${group.mobileSrc ? `<source media="(max-width: 900px)" srcset="${encode(group.mobileSrc)}">` : ""}
                <img class="scene-chapter__photo" src="${encode(group.src)}" alt="${group.alt}" width="1600" height="895" loading="lazy">
              </picture>
            </figure>
            <div class="scene-chapter__veil" aria-hidden="true"></div>
            <div class="scene-chapter__copy ${event.id === "narra-muros" ? "event-feature__copy" : ""}" data-reveal>
              <p class="eyebrow">Quienes hicieron posible esta experiencia</p>
              <h2 id="community-title">${event.groupTitle}</h2>
              <p class="lead">${event.groupLead}</p>
            </div>
          </section>`
        : ""
    }

    ${videosMarkup}

    ${
      event.galleryHref
        ? `<section class="section gallery-invite" data-reveal>
            <p class="eyebrow">${String(event.obrasCount).padStart(2, "0")} obras</p>
            <h2>Las creaciones de quienes participaron</h2>
            <p class="lead">Una sala inmersiva recorre las pinturas realizadas durante el encuentro. Gira el muro, acerca cada obra y mírala completa.</p>
            <a class="button" href="${event.galleryHref}">${event.galleryLabel}</a>
          </section>`
        : ""
    }

    ${
      others.length
        ? `<section class="section more-events" aria-labelledby="more-title">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Continúa el recorrido</p>
                <h2 id="more-title">Otros eventos del museo</h2>
              </div>
              <a class="button button--ghost" href="home.html?from=museum#eventos">Todos los eventos</a>
            </div>
            <div class="more-events__grid">
              ${others
                .map(
                  (item) => `
                <a class="more-card" href="evento.html?id=${item.id}">
                  <img src="${encode(item.cover)}" alt="${item.coverAlt}" loading="lazy">
                  <span>${item.kicker}</span>
                  <strong>${item.name}</strong>
                </a>`
                )
                .join("")}
            </div>
          </section>`
        : ""
    }
  `;

  const main = root.querySelector("[data-voice-main]");
  const picks = [...root.querySelectorAll("[data-voice-src]")];

  const loadVoice = (src, btn) => {
    if (!main) return;
    const source = main.querySelector("source");
    if (source) source.src = src;
    main.src = src;
    main.load();
    picks.forEach((pick) => {
      const on = pick === btn;
      pick.classList.toggle("is-active", on);
      pick.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };

  picks.forEach((btn) => {
    btn.addEventListener("click", () => {
      loadVoice(btn.dataset.voiceSrc, btn);
      main?.play?.().catch((error) => {
        console.error("No se pudo reproducir el testimonio seleccionado.", error);
      });
    });
  });
})();
