import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import SimpleListManager from "@/components/admin/SimpleListManager";

export default async function HitosPage() {
  const supabase = createClient();
  const [rivales, stats] = await Promise.all([
    supabase.from("rivales").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
    supabase.from("stats_hitos").select("*").eq("club_slug", CLUB_SLUG).order("orden"),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Rivales e hitos</h1>
        <p className="text-sm text-neutral-500 mt-1">Rivalidades históricas y el dato/stat destacado.</p>
      </div>

      <section>
        <h2 className="font-semibold text-neutral-800 mb-3">Rivalidades</h2>
        <SimpleListManager
          table="rivales"
          initialItems={rivales.data ?? []}
          fields={[
            { key: "label", label: "Etiqueta (ej. 'El clásico del pueblo')", type: "text" },
            { key: "nombres", label: "Nombres de los rivales", type: "text" },
          ]}
        />
      </section>

      <section>
        <h2 className="font-semibold text-neutral-800 mb-3">Stat destacado</h2>
        <SimpleListManager
          table="stats_hitos"
          initialItems={stats.data ?? []}
          fields={[
            { key: "numero", label: "Número/cifra (ej. '3×')", type: "text" },
            { key: "etiqueta", label: "Descripción", type: "textarea" },
          ]}
        />
      </section>
    </div>
  );
}
