import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import MediaManager from "./MediaManager";
import type { MediaItem } from "@/lib/types";

export default async function MediaPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("media_gallery")
    .select("*")
    .eq("club_slug", CLUB_SLUG)
    .order("orden");

  const items = (data ?? []) as MediaItem[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Fotos y videos</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        Sube el archivo histórico del club. Aparece de inmediato en la sección correspondiente del sitio público.
      </p>
      <MediaManager
        hermandad={items.filter((m) => m.seccion === "hermandad")}
        galeria={items.filter((m) => m.seccion === "galeria")}
        testimonios={items.filter((m) => m.seccion === "testimonios")}
      />
    </div>
  );
}
