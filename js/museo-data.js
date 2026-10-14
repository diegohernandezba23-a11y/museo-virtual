(() => {
  const events = [
    {
      id: "narra-muros",
      name: "Narra Muros",
      kicker: "Engativá · Arte urbano",
      place: "Engativá, Bogotá",
      headline: "Jóvenes cuentan su territorio",
      lead: "Graffiti, hip hop y creación colectiva narran la memoria viva del barrio.",
      cover: "assets/img/evento/Narra Muros/Obra_principal.PNG",
      coverAlt: "Mural de Engativá con graffiti, música, bici y paisaje urbano",
      introPhoto: "assets/img/evento/Narra Muros/Niños.JPG",
      introMobilePhoto: "assets/img/evento/Narra Muros/Niños_celular.png",
      introPhotoAlt: "Jóvenes y talleristas muestran las pinturas creadas frente al Parque Científico de Innovación Social",
      masterpieceCaption: "Obra principal del encuentro: Engativá como territorio, ritmo y color.",
      artistInstagram: {
        handle: "@h_umo_996",
        href: "https://instagram.com/h_umo_996?obrf=OHhvNzVsenZhemM%3D",
      },
      group: [
        {
          src: "assets/img/evento/Narra Muros/Grupo.jpeg",
          mobileSrc: "assets/img/evento/Narra Muros/Grupo_celular.png",
          alt: "Jóvenes pintando en caballetes sobre un campo de Engativá",
        },
      ],
      groupTitle: "Crear en comunidad",
      groupLead: "La experiencia se construye en comunidad: jóvenes que pintan, comparten y se acompañan.",
      videos: [
        { src: "assets/video/evento/Narra muros/Test 1.mp4", label: "Testimonio 01" },
        { src: "assets/video/evento/Narra muros/Test 2.mp4", label: "Testimonio 02" },
        { src: "assets/video/evento/Narra muros/Test 3.mp4", label: "Testimonio 03" },
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
      cover: "assets/img/evento/Ecologia integral/Obra_principal.jpg",
      coverAlt: "Mural Ecología Integral: figura con la Tierra entre las manos, molinos y personas unidas",
      introPhoto: "assets/img/evento/Ecologia integral/Grafitiando.png",
      introDesktopPhoto: "assets/img/evento/Ecologia integral/Grafitiando_horizontal.png",
      introPhotoAlt: "Artista pinta el mural de Ecología Integral en una pared",
      masterpieceCaption: "Agua, viento y naturaleza se unen en un mural que invita a cuidar la vida.",
      artistInstagram: {
        handle: "@el_arte_de_zenko",
        href: "https://instagram.com/el_arte_de_zenko?srtk=MTBlc2tvMzYzd2UzbA%3D%3D",
      },
      group: [],
      videos: [
        { src: "assets/video/evento/Ecologia integral/Test 4.mp4", label: "Proceso de creación" },
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
      src: `assets/img/Obras/Pintura-${n}.JPG`,
      alt: `Obra ${n} de participantes de Narra Muros`,
    };
  });

  const nav = [
    { href: "home.html", label: "Inicio", key: "home" },
    { href: "home.html#eventos", label: "Eventos", key: "eventos" },
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

  const initShell = () => {
    const holder = document.querySelector("[data-site-nav]");
    if (!holder) return;
    const active = currentKey();
    holder.innerHTML = nav
      .map((item) => {
        const isActive = item.key === active;
        return `<a href="${item.href}"${isActive ? ' aria-current="page"' : ""}>${item.label}</a>`;
      })
      .join("");
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
  };

  initShell();
})();
