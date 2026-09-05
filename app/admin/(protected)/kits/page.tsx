import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import SimpleListManager from "@/components/admin/SimpleListManager";

export default async function KitsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("kits").select("*").eq("club_slug", CLUB_SLUG).order("orden");

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Camisetas</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">La evolución de la indumentaria del club.</p>
      <SimpleListManager
        table="kits"
        initialItems={data ?? []}
        fields={[
          { key: "anio", label: "Año / época", type: "text", placeholder: "1990" },
          { key: "nombre", label: "Nombre", type: "text" },
          { key: "descripcion", label: "Descripción", type: "textarea" },
          { key: "color_hex", label: "Color", type: "color" },
          { key: "imagen_url", label: "Foto de la camiseta", type: "image", folder: "kits" },
        ]}
      />
    </div>
  );
}
