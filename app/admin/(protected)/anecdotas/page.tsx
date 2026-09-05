import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import SimpleListManager from "@/components/admin/SimpleListManager";

export default async function AnecdotasPage() {
  const supabase = createClient();
  const { data } = await supabase.from("anecdotas").select("*").eq("club_slug", CLUB_SLUG).order("orden");

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Anécdotas</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">Las historias de la sección de mística y comunidad.</p>
      <SimpleListManager
        table="anecdotas"
        initialItems={data ?? []}
        fields={[
          { key: "tag", label: "Etiqueta (ej. 'Tradición')", type: "text" },
          { key: "titulo", label: "Título", type: "text" },
          { key: "texto", label: "Texto", type: "textarea" },
          { key: "cita", label: "Cita destacada (opcional)", type: "textarea" },
          { key: "imagen_url", label: "Foto", type: "image", folder: "anecdotas" },
        ]}
      />
    </div>
  );
}
