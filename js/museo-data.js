(() => {
  const events = [
    {
      id: "narra-muros",
      name: "Narra Muros",
      kicker: "Engativá · Arte urbano",
      place: "Engativá, Bogotá",
      headline: "Jóvenes cuentan su territorio",
      lead: "Graffiti, hip hop y creación colectiva narran la memoria viva del barrio.",
      cover: "assets/img/evento/Narra Muros/Obra_principal.webp",
      coverAlt: "Mural de Engativá con graffiti, música, bici y paisaje urbano",
      introPhoto: "assets/img/evento/Narra Muros/Niños.webp",
      introMobilePhoto: "assets/img/evento/Narra Muros/Niños_celular.webp",
      introPhotoAlt: "Jóvenes y talleristas muestran las pinturas creadas frente al Parque Científico de Innovación Social",
      masterpieceCaption: "Obra principal del encuentro: Engativá como territorio, ritmo y color.",
      artistInstagram: {
        handle: "@h_umo_996",
        href: "https://instagram.com/h_umo_996?obrf=OHhvNzVsenZhemM%3D",
      },
      group: [
        {
          src: "assets/img/evento/Narra Muros/Grupo.webp",
          mobileSrc: "assets/img/evento/Narra Muros/Grupo_celular.webp",
          alt: "Jóvenes pintando en caballetes sobre un campo de Engativá",
        },
      ],
      groupTitle: "Crear en comunidad",
      groupLead: "La experiencia se construye en comunidad: jóvenes que pintan, comparten y se acompañan.",
      videos: [
        { src: "assets/video/optimized/evento/Narra muros/Test 1.mp4", label: "Testimonio 01" },
        { src: "assets/video/optimized/evento/Narra muros/Test 2.mp4", label: "Testimonio 02" },
        { src: "assets/video/optimized/evento/Narra muros/Test 3.mp4", label: "Testimonio 03" },
      ],
      videosTitle: "Voces de la experiencia",
      videosLead: "Tres relatos de quienes habitaron el encuentro. Reproduce cada video cuando quieras escuchar.",
      galleryHref: "museo.html",
      galleryLabel: "Entrar a la sala de obras",
      obrasCount: 18,
      accent: "#ff2e88",
    },
    {
      id: "ecologia-integral",
      name: "Ecología Integral",
      kicker: "Territorio · Cuidado",
      place: "DISBo",
      headline: "Un mural para imaginar el cuidado de la vida",
      introTitle: "Pintar para cuidar la vida",
      lead: "Un proceso colectivo que transforma el cuidado de la Tierra en color, movimiento y memoria.",
      cover: "assets/img/evento/Ecologia integral/Obra_principal.webp",
      coverAlt: "Mural Ecología Integral: figura con la Tierra entre las manos, molinos y personas unidas",
      introPhoto: "assets/img/evento/Ecologia integral/Grafitiando.webp",
      introDesktopPhoto: "assets/img/evento/Ecologia integral/Grafitiando_horizontal.webp",
      introPhotoAlt: "Artista pinta el mural de Ecología Integral en una pared",
      masterpieceCaption: "Agua, viento y naturaleza se unen en un mural que invita a cuidar la vida.",
      artistInstagram: {
        handle: "@el_arte_de_zenko",
        href: "https://instagram.com/el_arte_de_zenko?srtk=MTBlc2tvMzYzd2UzbA%3D%3D",
      },
      group: [],
      videos: [
        { src: "assets/video/optimized/evento/Ecologia integral/Test 4.mp4", label: "Proceso de creación" },
      ],
      videosTitle: "El mural cobra vida",
      videosLead: "Acompaña el proceso de creación y descubre cómo el cuidado del territorio se convierte en arte.",
      galleryHref: "",
      galleryLabel: "",
      obrasCount: 0,
      accent: "#14e0c4",
    },
  ];

  const obras = Array.from({ length: 18 }, (_, i) => {
    const n = i + 1;
    return {
      n,
      src: `assets/img/Obras/Pintura-${n}.webp`,
      alt: `Obra ${n} de participantes de Narra Muros`,
    };
  });

  const nav = [
    { href: "home.html?from=museum", label: "Inicio", key: "home" },
    { href: "home.html?from=museum#eventos", label: "Eventos", key: "eventos" },
    ...events.map((event) => ({
      href: `evento.html?id=${event.id}`,
      label: event.name,
      key: event.id,
    })),
    { href: "museo.html", label: "Obras", key: "obras" },
  ];

  const currentKey = () => {
    const path = (location.pathname.split("/").pop() || "home.html").toLowerCase();
    const params = new URLSearchParams(location.search);
    if (path === "evento.html") return params.get("id") || "";
    if (path === "museo.html") return "obras";
    if (path === "home.html" || path === "" || path === "index.html") return "home";
    return "";
  };

  const arrowIcon = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  const instagramIcon = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>`;

  const initShell = () => {
    const active = currentKey();
    const holder = document.querySelector("[data-site-nav]");
    if (holder) {
      holder.innerHTML =
        nav
          .map((item, i) => {
            const isActive = item.key === active;
            return `<a href="${item.href}" style="--i:${i}"${isActive ? ' aria-current="page"' : ""}><i aria-hidden="true">${String(i + 1).padStart(2, "0")}</i>${item.label}</a>`;
          })
          .join("") + `<p class="site-nav__foot">Arte urbano · Territorio vivo</p>`;
    }

    const footer = document.querySelector("[data-site-footer]");
    if (footer) {
      footer.innerHTML = `
        <div class="footer__grid">
          <div class="footer__brand">
            <img src="assets/img/logos/narramuros-logo.webp" alt="Narra Muros" width="120" height="86" loading="lazy">
            <p>Museo virtual de arte urbano, graffiti y creación colectiva. Engativá, Bogotá.</p>
          </div>
          <div>
            <p class="footer__title">Recorrido</p>
            <ul class="footer__links">${nav.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join("")}</ul>
          </div>
          <div>
            <p class="footer__title">Artistas</p>
            <ul class="footer__links">${events
              .filter((event) => event.artistInstagram)
              .map((event) => `<li><a href="${event.artistInstagram.href}" target="_blank" rel="noopener noreferrer">${event.artistInstagram.handle}<span class="visually-hidden"> (Instagram, abre en otra pestaña)</span></a></li>`)
              .join("")}</ul>
          </div>
        </div>
        <div class="footer__bottom">
          <span>Narra Muros · Museo Virtual</span>
          <span>Escanea. Entra. Recorre.</span>
          <button class="icon-button" type="button" data-to-top aria-label="Volver arriba">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M6 11l6-6 6 6"/></svg>
          </button>
        </div>`;
    }
  };

  window.MUSEO = {
    events,
    obras,
    nav,
    getEvent: (id) => events.find((event) => event.id === id) || null,
    stats() {
      return {
        eventos: events.length,
        obras: events.reduce((sum, event) => sum + (event.obrasCount || 0), 0),
        voces: events.reduce((sum, event) => sum + event.videos.length, 0),
      };
    },
    initShell,
    icons: { arrow: arrowIcon, instagram: instagramIcon },
  };

  initShell();
})();
