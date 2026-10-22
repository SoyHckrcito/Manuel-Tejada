export interface SiteContentData {
  theme: {
    name: string;
    primaryAccent: string; // e.g. '#d97706' (amber-600)
    bgCanvas: string; // e.g. '#0a0b0e'
    cardBg: string; // e.g. '#12141a'
    fontFamily: string; // 'Plus Jakarta Sans' | 'Cinzel' | 'System'
    borderRadius: string; // 'rounded-lg' | 'rounded-2xl' | 'rounded-none'
  };
  navigation: {
    brandName: string;
    links: { id: string; label: string; href: string }[];
  };
  sections: Array<{
    id: string;
    type: 'hero' | 'bio' | 'discography' | 'works' | 'studio' | 'videos' | 'gallery' | 'news' | 'announcements' | 'contact' | 'custom';
    title: string;
    subtitle?: string;
    visible: boolean;
    order: number;
    content: any;
  }>;
}

export const initialSiteContent: SiteContentData = {
  theme: {
    name: 'Oro Dominicano Clásico',
    primaryAccent: '#f59e0b',
    bgCanvas: '#090a0f',
    cardBg: '#13151f',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: 'rounded-xl',
  },
  navigation: {
    brandName: 'MANUEL TEJADA',
    links: [
      { id: 'nav-bio', label: 'Biografía', href: '#biografia' },
      { id: 'nav-discography', label: 'Discografía', href: '#discografia' },
      { id: 'nav-works', label: 'Obras Sinfónicas', href: '#obras' },
      { id: 'nav-announcements', label: 'Anuncios', href: '#anuncios' },
      { id: 'nav-studio', label: 'Estudio', href: '#estudio' },
      { id: 'nav-videos', label: 'Vídeos', href: '#videos' },
      { id: 'nav-contact', label: 'Contacto', href: '#contacto' },
    ],
  },
  sections: [
    {
      id: 'section-hero',
      type: 'hero',
      title: 'Maestro Manuel Tejada',
      subtitle: 'Compositor, Arreglista y Productor Musical Galardonado',
      visible: true,
      order: 1,
      content: {
        kicker: 'Música, Orquestación y Producción de Autor',
        leadText: 'Pionero de la orquestación contemporánea caribeña y creador de arreglos inmortales que definieron el sonido de la música latina ante el mundo.',
        primaryCtaText: 'Explorar Obra y Discografía',
        primaryCtaLink: '#discografia',
        secondaryCtaText: 'Proyectos & Contacto',
        secondaryCtaLink: '#contacto',
        heroImage: '/src/assets/images/hero_manuel_tejada_1792681355172.jpg',
        awardsSummary: 'Múltiple ganador de los Latin Grammy Awards y Premios Soberano',
        stats: [
          { value: '45+', label: 'Años de Trayectoria' },
          { value: '180+', label: 'Producciones Discográficas' },
          { value: '14', label: 'Grammy & Soberano' },
          { value: '12M+', label: 'Oyentes Globales' },
        ],
      },
    },
    {
      id: 'section-bio',
      type: 'bio',
      title: 'Trayectoria & Legado',
      subtitle: 'La armonía entre el rigor académico y el corazón popular',
      visible: true,
      order: 2,
      content: {
        paragraph1: 'Nacido en Santo Domingo, Manuel Tejada inició su formación académica formal de piano y composición en el Conservatorio Nacional de Música. Su virtuosismo al teclado y su prodigiosa intuición orquestal le permitieron transformar las estructuras del merengue, el bolero, la balada pop y el jazz latino.',
        paragraph2: 'Ha sido arquitecto sonoro de las producciones más influyentes de habla hispana, colaborando como arreglista, productor o director musical con leyendas como Juan Luis Guerra, 4.40, Wilfrido Vargas, Fernando Villalona, Olga Tañón, Celia Cruz, Ángela Carrasco y orquestas sinfónicas de América y Europa.',
        quote: '«La música no es solo técnica armónica; es la verdad emocional que una orquesta entera es capaz de transmitir en un compás».',
        author: 'Manuel Tejada',
        milestones: [
          'Egresado distinguido del Conservatorio Nacional de Música.',
          'Arreglista orquestal de obras cumbres del cancionero latinoamericano.',
          'Compositor de bandas sonoras cinematográficas y sinfonías para cuerdas.',
          'Reconocido con el Gran Soberano por el mérito a toda una vida artística.',
        ],
      },
    },
    {
      id: 'section-discography',
      type: 'discography',
      title: 'Discografía & Producciones Selectas',
      subtitle: 'Grabaciones maestras, arreglos y suites',
      visible: true,
      order: 3,
      content: {
        description: 'Una selección curada de trabajos icónicos como arreglista principal, productor y compositor.',
        albums: [
          {
            id: 'alb-1',
            title: 'Suite Orquestal Caribeña',
            artist: 'Manuel Tejada & Orquesta Filarmónica',
            year: '2023',
            role: 'Compositor & Director',
            cover: '/src/assets/images/album_merengue_jazz_1792681356799.jpg',
            spotifyUrl: 'https://open.spotify.com',
            appleUrl: 'https://music.apple.com',
            youtubeUrl: 'https://youtube.com',
            tracks: [
              { title: 'Obertura de Cuerdas y Tambora', duration: '5:42' },
              { title: 'Nocturno para Piano en Sol Menor', duration: '4:18' },
              { title: 'Danza de las Antillas', duration: '6:05' },
              { title: 'Elegía a la Brisa', duration: '4:50' },
            ],
          },
          {
            id: 'alb-2',
            title: 'Armonías Inmortales (Grandes Arreglos)',
            artist: 'Manuel Tejada Sessions',
            year: '2019',
            role: 'Arreglista & Productor',
            cover: '/src/assets/images/studio_recording_console_1792681357218.jpg',
            spotifyUrl: 'https://open.spotify.com',
            appleUrl: 'https://music.apple.com',
            youtubeUrl: 'https://youtube.com',
            tracks: [
              { title: 'Poema en Bolero para Clarinete y Piano', duration: '3:55' },
              { title: 'Preludio Santo Domingo', duration: '4:30' },
              { title: 'Fantasía Rítmica Nº 2', duration: '5:12' },
            ],
          },
          {
            id: 'alb-3',
            title: 'Piano & Orquesta de Cámara',
            artist: 'Manuel Tejada',
            year: '2015',
            role: 'Pianista Solista & Compositor',
            cover: '/src/assets/images/orchestral_session_conducting_1792681357271.jpg',
            spotifyUrl: 'https://open.spotify.com',
            appleUrl: 'https://music.apple.com',
            youtubeUrl: 'https://youtube.com',
            tracks: [
              { title: 'Andante Con Moto', duration: '6:15' },
              { title: 'Rapsodia de Otoño', duration: '5:48' },
              { title: 'Cadenza Criolla', duration: '4:22' },
            ],
          },
        ],
      },
    },
    {
      id: 'section-works',
      type: 'works',
      title: 'Obras Sinfónicas & Arreglos Mayores',
      subtitle: 'Composiciones para orquestas sinfónicas, cine y teatro',
      visible: true,
      order: 4,
      content: {
        bannerImage: '/src/assets/images/orchestral_session_conducting_1792681357271.jpg',
        items: [
          {
            title: 'Concierto Antillano para Piano y Gran Orquesta',
            instrumentation: 'Piano Solista, Maderas, Metales y Percusión Sinfónica',
            premiere: 'Teatro Nacional Eduardo Brito',
            notes: 'Obra en tres movimientos que fusiona el contrapunto europeo clásico con la polirritmia insular.',
          },
          {
            title: 'Suite para Cuerdas y Cuarteto de Maderas',
            instrumentation: 'Orquesta de Cuerdas (Violines, Violas, Violonchelos, Contrabajos)',
            premiere: 'Festival Internacional de Música Clásica',
            notes: 'Elogiada por la crítica por su lirismo armónico y riqueza textural.',
          },
          {
            title: 'Banda Sonora Original «Senderos de Gloria»',
            instrumentation: 'Orquesta Híbrida y Solistas Folclóricos',
            premiere: 'Largometraje Cinematográfico',
            notes: 'Premio a la Mejor Música Original en festivales internacionales de cine.',
          },
        ],
      },
    },
    {
      id: 'section-announcements',
      type: 'announcements',
      title: 'Anuncios & Comunicados Oficiales',
      subtitle: 'Novedades, estrenos discográficos, masterclasses y noticias artísticas',
      visible: true,
      order: 5,
      content: {},
    },
    {
      id: 'section-studio',
      type: 'studio',
      title: 'El Estudio de Grabación',
      subtitle: 'Filosofía acústica analógica y precisión digital',
      visible: true,
      order: 6,
      content: {
        lead: 'Un santuario de creación acústicamente calibrado donde convergen consolas analógicas legendarias, micrófonos de tubo vintage y procesamiento digital de ultra alta resolución.',
        image: '/src/assets/images/studio_recording_console_1792681357218.jpg',
        specs: [
          { title: 'Consola Analógica', desc: 'Mesa clásica de 48 canales con preamplificadores clase A de transformador.' },
          { title: 'Monitoreo de Campo Cercano', desc: 'Sistemas activos de precisión alineados acústicamente para mezcla crítica.' },
          { title: 'Instrumentos Acústicos', desc: 'Piano de cola Steinway & Sons Model D residente, mantenido y afinado en sala.' },
          { title: 'Cadena de Masterización', desc: 'Compresores optoelectrónicos y ecualizadores pasivos de válvulas.' },
        ],
      },
    },
    {
      id: 'section-videos',
      type: 'videos',
      title: 'Vídeos & Sesiones en Vivo',
      subtitle: 'Ensayos orquestales, clases magistrales y grabaciones',
      visible: true,
      order: 7,
      content: {
        videos: [
          {
            id: 'v1',
            title: 'Manuel Tejada: Sesión de Arreglos y Dirección Orquestal',
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder embed standard
            description: 'Ensayos orquestales y proceso minucioso de microfonía para la Suite Dominicana.',
          },
          {
            id: 'v2',
            title: 'Clase Magistral de Armonía Moderna en el Piano',
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Explicación del uso de acordes extendidos y polirritmia en la música caribeña.',
          },
        ],
      },
    },
    {
      id: 'section-gallery',
      type: 'gallery',
      title: 'Galería Histórica',
      subtitle: 'Momentos en escenario, sesiones de estudio y galardones',
      visible: true,
      order: 8,
      content: {
        images: [
          { src: '/src/assets/images/hero_manuel_tejada_1792681355172.jpg', caption: 'Manuel Tejada al piano durante la sesión de grabación sinfónica.' },
          { src: '/src/assets/images/studio_recording_console_1792681357218.jpg', caption: 'Consola principal de mezcla y producción analógica.' },
          { src: '/src/assets/images/orchestral_session_conducting_1792681357271.jpg', caption: 'Dirección orquestal de la Suite Antillana en el Teatro Nacional.' },
          { src: '/src/assets/images/album_merengue_jazz_1792681356799.jpg', caption: 'Edición conmemorativa para audiófilos en vinilo de 180 gramos.' },
        ],
      },
    },
    {
      id: 'section-contact',
      type: 'contact',
      title: 'Contacto & Gestión Artística',
      subtitle: 'Comisiones orquestales, producción discográfica y conferencias',
      visible: true,
      order: 9,
      content: {
        officeEmail: 'contacto@manueltejada.com',
        location: 'Santo Domingo, República Dominicana / Proyectos Internacionales',
        managementNote: 'Para comisiones sinfónicas, arreglos orquestales, bandas sonoras de cine o dirección musical, complete el formulario oficial.',
      },
    },
  ],
};
