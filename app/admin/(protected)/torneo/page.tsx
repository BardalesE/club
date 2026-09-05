import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import SimpleListManager from "@/components/admin/SimpleListManager";
import TorneoPartidosManager from "./TorneoPartidosManager";
import type { TorneoEquipo, TorneoPartido } from "@/lib/types";

export default async function TorneoPage() {
  const supabase = createClient();
  const [equipos, partidos] = await Promise.all([
    supabase.from("torneo_equipos").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase.from("torneo_partidos").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Torneo aniversario</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Carga los equipos una vez y después ve agregando cada partido con su resultado a medida que se juega.
          Aparece en el sitio público apenas hay un partido cargado.
        </p>
      </div>

      <section>
        <h2 className="font-semibold text-neutral-800 mb-3">Equipos</h2>
        <SimpleListManager
          table="torneo_equipos"
          initialItems={(equipos.data ?? []) as TorneoEquipo[]}
          emptyLabel="Aún no hay equipos cargados."
          fields={[
            { key: "nombre", label: "Nombre del equipo", type: "text" },
            { key: "emoji", label: "Emoji/bandera (ej. 🔵)", type: "text", placeholder: "🔵" },
            { key: "escudo_url", label: "Escudo (opcional)", type: "image", folder: "torneo" },
          ]}
        />
      </section>

      <section>
        <h2 className="font-semibold text-neutral-800 mb-3">Partidos</h2>
        <TorneoPartidosManager
          equipos={(equipos.data ?? []) as TorneoEquipo[]}
          initialPartidos={(partidos.data ?? []) as TorneoPartido[]}
        />
      </section>
    </div>
  );
}
