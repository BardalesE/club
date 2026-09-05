import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import SimpleListManager from "@/components/admin/SimpleListManager";

export default async function MemoriaPage() {
  const supabase = createClient();
  const { data } = await supabase.from("memoria").select("*").eq("club_slug", CLUB_SLUG).order("orden");

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Memoria</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">Homenaje a quienes ya no están.</p>
      <SimpleListManager
        table="memoria"
        initialItems={data ?? []}
        fields={[{ key: "nombre", label: "Nombre completo", type: "text" }]}
      />
    </div>
  );
}
