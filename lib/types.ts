export type Cifra = { numero: string; label: string };

export type Club = {
  slug: string;
  nombre: string;
  eyebrow: string | null;
  fecha_fundacion: string | null;
  hero_titulo_pre: string | null;
  hero_titulo_em: string | null;
  hero_titulo_post: string | null;
  hero_subtitulo: string | null;
  hero_cifras: Cifra[];
  escudo_url: string | null;
  hero_bg_url: string | null;
  fundacion_relato: string | null;
  fundacion_foto_url: string | null;
  fundacion_foto_caption: string | null;
  kits_intro: string | null;
  camadas_intro: string | null;
  mistica_intro: string | null;
  hermandad_texto: string | null;
  actualidad_intro: string | null;
  actualidad_de_donde: string | null;
  actualidad_hacia_donde: string | null;
  actualidad_bg_url: string | null;
  memoria_intro: string | null;
  memoria_nota: string | null;
  galeria_intro: string | null;
  cta_titulo: string | null;
  cta_texto: string | null;
};

export type Founder = {
  id: string;
  nombre: string;
  apodo: string | null;
  es_presidente: boolean;
  orden: number;
};

export type Kit = {
  id: string;
  anio: string;
  nombre: string;
  descripcion: string | null;
  color_hex: string | null;
  imagen_url: string | null;
  orden: number;
};

export type CamadaJugador = {
  id: string;
  nombre: string;
  rol_destacado: string | null;
  orden: number;
};

export type Camada = {
  id: string;
  nombre: string;
  emoji: string | null;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  camada_jugadores: CamadaJugador[];
};

export type Anecdota = {
  id: string;
  tag: string | null;
  titulo: string;
  texto: string | null;
  cita: string | null;
  imagen_url: string | null;
  orden: number;
};

export type Rival = {
  id: string;
  label: string;
  nombres: string;
  orden: number;
};

export type StatHito = {
  id: string;
  numero: string;
  etiqueta: string;
  orden: number;
};

export type Memoria = {
  id: string;
  nombre: string;
  orden: number;
};

export type MediaSeccion = "hermandad" | "galeria" | "testimonios";
export type MediaTipo = "foto" | "video";

export type MediaItem = {
  id: string;
  seccion: MediaSeccion;
  tipo: MediaTipo;
  url: string;
  caption: string | null;
  autor: string | null;
  orden: number;
};

export type TorneoEquipo = {
  id: string;
  nombre: string;
  emoji: string | null;
  escudo_url: string | null;
  orden: number;
};

export type TorneoEstado = "programado" | "en_vivo" | "finalizado";

export type TorneoPartido = {
  id: string;
  fase: string;
  fecha: string | null;
  equipo_local_id: string | null;
  equipo_visitante_id: string | null;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: TorneoEstado;
  orden: number;
};

export type ClubContent = {
  club: Club;
  founders: Founder[];
  kits: Kit[];
  camadas: Camada[];
  anecdotas: Anecdota[];
  rivales: Rival[];
  stats: StatHito[];
  memoria: Memoria[];
  hermandad: MediaItem[];
  galeria: MediaItem[];
  testimonios: MediaItem[];
  torneoEquipos: TorneoEquipo[];
  torneoPartidos: TorneoPartido[];
};
