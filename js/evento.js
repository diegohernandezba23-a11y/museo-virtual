(() => {
  const root = document.querySelector("[data-evento]");
  if (!root || !window.MUSEO) return;

  const params = new URLSearchParams(location.search);
  const event = MUSEO.getEvent(params.get("id")) || MUSEO.events[0];
  if (!event) return;

  document.title = `${event.name} | Museo Virtual`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", event.lead);

  const { icons } = MUSEO;
  const encode = (src) => encodeURI(src);
  const pad = (n) => String(n).padStart(2, "0");
  const next = MUSEO.events.filter((item) => item.id !== event.id)[0];
  const group = event.group[0];
  const ig = event.artistInstagram;
  const videoCount = event.videos.length;

  const heroSources = [
    event.introDesktopPhoto ? `<source media="(min-width: 901px)" srcset="${encode(event.introDesktopPhoto)}">` : "",
    event.introMobilePhoto ? `<source media="(max-width: 900px)" srcset="${encode(event.introMobilePhoto)}">` : "",
  ].join("");

  const facts = [
    event.obrasCount ? { t: "Obras", d: pad(event.obrasCount) } : null,
    videoCount ? { t: videoCount === 1 ? "Video" : "Voces", d: pad(videoCount) } : null,
  ].filter(Boolean);

  const igButton = (label) => ig
    ? `<a class="button button--ghost" href="${ig.href}" target="_blank" rel="noopener noreferrer">${icons.instagram} ${label} ${ig.handle}<span class="visually-hidden"> (Instagram, abre en otra pestaña)</span></a>`
    : "";

  const voicesMarkup = videoCount
    ? `
    <section class="section voices voices--${event.id}" id="voces" aria-labelledby="voices-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow" data-reveal>Audiovisual</p>
          <h2 id="voices-title" data-split>${event.videosTitle}</h2>
        </div>
        <p class="lead" data-reveal style="--d:.12s">${event.videosLead}</p>
      </div>
      <div class="voices__layout ${videoCount === 1 ? "is-single" : ""}" data-reveal>
        <div class="voices__stage">
          <video data-voice-main controls playsinline preload="metadata" aria-label="${event.videos[0].label}">
            <source src="${encode(event.videos[0].src)}#t=0.1" type="video/mp4">
          </video>
        </div>
        ${videoCount > 1
          ? `<div class="voices__rail" role="group" aria-label="Seleccionar testimonio">
              ${event.videos.map((video, i) => `
                <button class="voices__pick ${i === 0 ? "is-active" : ""}" type="button" data-voice-src="${encode(video.src)}" data-voice-label="${video.label}" aria-pressed="${i === 0}">
                  <span>${pad(i + 1)}</span>
                  <div><strong>${video.label}</strong><em>${i === 0 ? "En pantalla" : "Reproducir"}</em></div>
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z"/></svg>
                </button>`).join("")}
            </div>`
          : ""}
      </div>
    </section>`
    : "";

  root.innerHTML = `
    <section class="ev-hero ev-hero--${event.id}" aria-labelledby="ev-title">
      <div class="ev-hero__media">
        <picture>
          ${heroSources}
          <img src="${encode(event.introPhoto || event.cover)}" alt="${event.introPhotoAlt || event.coverAlt}" fetchpriority="high" data-parallax>
        </picture>
      </div>
      <div class="ev-hero__copy">
        <p class="hero__kicker" data-reveal><i></i> ${event.kicker}</p>
        <h1 id="ev-title" data-split>${event.name}</h1>
        <p class="lead" data-reveal style="--d:.25s">${event.headline}</p>
        <div class="hero__actions" data-reveal style="--d:.35s">
          <a class="button" href="#obra" data-magnetic>Ver la obra <span class="button__icon">${icons.arrow}</span></a>
          ${event.galleryHref
            ? `<a class="button button--ghost" href="${event.galleryHref}" data-magnetic>Sala de obras</a>`
            : videoCount ? `<a class="button button--ghost" href="#voces" data-magnetic>Ver el video</a>` : ""}
        </div>
      </div>
    </section>

    <section class="section ev-intro" aria-labelledby="encuentro-title">
      <div>
        <p class="eyebrow" data-reveal>El encuentro</p>
        <h2 id="encuentro-title" data-split>${event.introTitle || event.headline}</h2>
      </div>
      <div data-reveal style="--d:.12s">
        <p class="lead">${event.lead}</p>
        <dl class="facts">${facts.map((f) => `<div><dt>${f.t}</dt><dd>${f.d}</dd></div>`).join("")}</dl>
      </div>
    </section>

    <section class="section ev-exhibit" id="obra" aria-labelledby="obra-title">
      <figure class="exhibit__frame" data-reveal="clip" data-cursor="Obra">
        <img src="${encode(event.cover)}" alt="${event.coverAlt}" loading="lazy">
      </figure>
      <div class="placard" data-reveal style="--d:.2s">
        <p class="eyebrow">Obra principal</p>
        <h2 id="obra-title">${event.name}</h2>
        <p>${event.masterpieceCaption}</p>
        ${igButton("Visita al artista ·")}
      </div>
    </section>

    ${group
      ? `<section class="ev-community" aria-labelledby="community-title">
          <figure class="ev-community__media">
            <picture>
              ${group.mobileSrc ? `<source media="(max-width: 900px)" srcset="${encode(group.mobileSrc)}">` : ""}
              <img src="${encode(group.src)}" alt="${group.alt}" loading="lazy" data-parallax>
            </picture>
          </figure>
          <div class="ev-community__copy">
            <p class="eyebrow" data-reveal>Quienes hicieron posible esta experiencia</p>
            <h2 id="community-title" data-split>${event.groupTitle}</h2>
            <p class="lead" data-reveal style="--d:.15s">${event.groupLead}</p>
          </div>
        </section>`
      : ""}

    ${voicesMarkup}

    ${event.galleryHref
      ? `<section class="section ev-invite" aria-labelledby="invite-title">
          <div>
            <p class="eyebrow" data-reveal>${pad(event.obrasCount)} obras</p>
            <h2 id="invite-title" data-split>Las creaciones de quienes participaron</h2>
            <p class="lead" data-reveal style="--d:.12s">Una sala inmersiva recorre las pinturas realizadas durante el encuentro. Gira el muro, acerca cada obra y mírala completa.</p>
            <div data-reveal style="--d:.2s">
              <a class="button" href="${event.galleryHref}" data-magnetic>${event.galleryLabel} <span class="button__icon">${icons.arrow}</span></a>
            </div>
          </div>
          <a class="fan" href="${event.galleryHref}" data-cursor="Abrir" aria-label="${event.galleryLabel}" data-reveal style="--d:.15s">
            ${[3, 7, 1, 12, 14].map((n, i) => `<img src="assets/img/Obras/Pintura-${n}-thumb.webp" alt="" loading="lazy" style="--k:${i - 2}">`).join("")}
          </a>
        </section>`
      : ""}

    ${next
      ? `<section class="section ev-next" aria-labelledby="next-title">
          <a class="ev-next__card" href="evento.html?id=${next.id}" data-cursor="Ir" data-reveal="clip">
            <img src="${encode(next.cover)}" alt="" loading="lazy">
            <div>
              <p class="eyebrow" id="next-title">Siguiente sala · ${next.kicker}</p>
              <strong>${next.name} ${icons.arrow}</strong>
            </div>
          </a>
        </section>`
      : ""}
  `;

  /* ---- Selector de testimonios ---- */
  const main = root.querySelector("[data-voice-main]");
  const picks = [...root.querySelectorAll("[data-voice-src]")];
  picks.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!main) return;
      main.querySelector("source")?.setAttribute("src", btn.dataset.voiceSrc);
      main.src = btn.dataset.voiceSrc;
      main.setAttribute("aria-label", btn.dataset.voiceLabel);
      main.load();
      picks.forEach((pick) => {
        const on = pick === btn;
        pick.classList.toggle("is-active", on);
        pick.setAttribute("aria-pressed", String(on));
        const label = pick.querySelector("em");
        if (label) label.textContent = on ? "En pantalla" : "Reproducir";
      });
      main.play?.().catch(() => {});
    });
  });
})();
