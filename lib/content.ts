import { createClient } from "@/lib/supabase/server";
import type { ClubContent, MediaItem } from "@/lib/types";
import { CLUB_SLUG } from "@/lib/constants";

/**
 * Trae todo el contenido del club en paralelo. Se llama una sola vez desde
 * la página pública (Server Component) — sin este fetch centralizado, cada
 * sección tendría que hacer su propia llamada y perderíamos el paralelismo.
 */
export async function getClubContent(): Promise<ClubContent | null> {
  const supabase = createClient();

  const [
    clubRes,
    foundersRes,
    kitsRes,
    camadasRes,
    anecdotasRes,
    rivalesRes,
    statsRes,
    memoriaRes,
    mediaRes,
    torneoEquiposRes,
    torneoPartidosRes,
  ] = await Promise.all([
    supabase.from("club").select("*").eq("slug", CLUB_SLUG).maybeSingle(),
    supabase.from("founders").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase.from("kits").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase
      .from("camadas")
      .select("*, camada_jugadores(*)")
      .eq("club_slug", CLUB_SLUG)
      .order("orden"),
    supabase.from("anecdotas").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase.from("rivales").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase.from("stats_hitos").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase.from("memoria").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase.from("media_gallery").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase.from("torneo_equipos").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase.from("torneo_partidos").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
  ]);

  if (!clubRes.data) return null;

  // camada_jugadores viene sin ordenar dentro del join; lo ordenamos en memoria.
  const camadas = (camadasRes.data ?? []).map((c: any) => ({
    ...c,
    camada_jugadores: (c.camada_jugadores ?? []).sort((a: any, b: any) => a.orden - b.orden),
  }));

  const media = (mediaRes.data ?? []) as MediaItem[];
  const bySeccion = (s: MediaItem["seccion"]) => media.filter((m) => m.seccion === s);

  return {
    club: clubRes.data as any,
    founders: foundersRes.data ?? [],
    kits: kitsRes.data ?? [],
    camadas,
    anecdotas: anecdotasRes.data ?? [],
    rivales: rivalesRes.data ?? [],
    stats: statsRes.data ?? [],
    memoria: memoriaRes.data ?? [],
    hermandad: bySeccion("hermandad"),
    galeria: bySeccion("galeria"),
    testimonios: bySeccion("testimonios"),
    torneoEquipos: torneoEquiposRes.data ?? [],
    torneoPartidos: torneoPartidosRes.data ?? [],
  };
}
