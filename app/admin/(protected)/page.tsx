import { createClient } from "@/lib/supabase/server";
import { CLUB_SLUG } from "@/lib/constants";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = createClient();
  const [founders, kits, camadas, anecdotas, rivales, memoria, media, torneoPartidos] = await Promise.all([
    supabase.from("founders").select("id", { count: "exact", head: true }).eq("club_slug", CLUB_SLUG),
    supabase.from("kits").select("id", { count: "exact", head: true }).eq("club_slug", CLUB_SLUG),
    supabase.from("camadas").select("id", { count: "exact", head: true }).eq("club_slug", CLUB_SLUG),
    supabase.from("anecdotas").select("id", { count: "exact", head: true }).eq("club_slug", CLUB_SLUG),
    supabase.from("rivales").select("id", { count: "exact", head: true }).eq("club_slug", CLUB_SLUG),
    supabase.from("memoria").select("id", { count: "exact", head: true }).eq("club_slug", CLUB_SLUG),
    supabase.from("media_gallery").select("id", { count: "exact", head: true }).eq("club_slug", CLUB_SLUG),
    supabase.from("torneo_partidos").select("id", { count: "exact", head: true }).eq("club_slug", CLUB_SLUG),
  ]);

  const cards = [
    { label: "Fotos y videos", href: "/admin/media", count: media.count ?? 0 },
    { label: "🏆 Torneo aniversario", href: "/admin/torneo", count: torneoPartidos.count ?? 0 },
    { label: "Fundadores", href: "/admin/founders", count: founders.count ?? 0 },
    { label: "Camisetas", href: "/admin/kits", count: kits.count ?? 0 },
    { label: "Camadas", href: "/admin/camadas", count: camadas.count ?? 0 },
    { label: "Anécdotas", href: "/admin/anecdotas", count: anecdotas.count ?? 0 },
    { label: "Rivales", href: "/admin/hitos", count: rivales.count ?? 0 },
    { label: "Memoria", href: "/admin/memoria", count: memoria.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Resumen</h1>
      <p className="text-sm text-neutral-500 mt-1">
        Todo lo que edites o subas aquí se ve al instante en el sitio público.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white rounded-lg border border-neutral-200 p-5 hover:border-pink-400 transition"
          >
            <div className="text-2xl font-bold text-neutral-900">{c.count}</div>
            <div className="text-sm text-neutral-500 mt-1">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
