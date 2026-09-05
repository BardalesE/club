import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import ClubForm from "./ClubForm";

export default async function ClubPage() {
  const supabase = createClient();
  const { data: club } = await supabase.from("club").select("*").eq("slug", CLUB_SLUG).maybeSingle();

  if (!club) {
    return <p className="text-sm text-red-600">No se encontró el registro del club (slug={CLUB_SLUG}).</p>;
  }

  return <ClubForm initial={club} />;
}
