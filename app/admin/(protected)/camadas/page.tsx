import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import CamadasManager from "./CamadasManager";

export default async function CamadasPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("camadas")
    .select("*, camada_jugadores(*)")
    .eq("club_slug", CLUB_SLUG)
    .order("orden");

  const camadas = (data ?? []).map((c: any) => ({
    ...c,
    camada_jugadores: (c.camada_jugadores ?? []).sort((a: any, b: any) => a.orden - b.orden),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Camadas</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        Cada camada es una generación de jugadores, con su propia lista de nombres.
      </p>
      <CamadasManager initialCamadas={camadas} />
    </div>
  );
}
