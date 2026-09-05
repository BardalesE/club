import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import SimpleListManager from "@/components/admin/SimpleListManager";

export default async function FoundersPage() {
  const supabase = createClient();
  const { data } = await supabase.from("founders").select("*").eq("club_slug", CLUB_SLUG).order("orden");

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Fundadores</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        La lista de nombres que aparece en la sección de fundación.
      </p>
      <SimpleListManager
        table="founders"
        initialItems={data ?? []}
        fields={[
          { key: "nombre", label: "Nombre completo", type: "text" },
          { key: "apodo", label: "Apodo (opcional)", type: "text" },
          { key: "es_presidente", label: "Fue el primer presidente", type: "checkbox" },
        ]}
      />
    </div>
  );
}
