"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/media", label: "Fotos y videos" },
  { href: "/admin/club", label: "Club, hero y textos" },
  { href: "/admin/founders", label: "Fundadores" },
  { href: "/admin/kits", label: "Camisetas" },
  { href: "/admin/camadas", label: "Camadas" },
  { href: "/admin/anecdotas", label: "Anécdotas" },
  { href: "/admin/hitos", label: "Rivales e hitos" },
  { href: "/admin/memoria", label: "Memoria" },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 bg-neutral-900 text-neutral-100 min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-neutral-800">
        <div className="font-bold text-sm">Panel del club</div>
        <div className="text-xs text-neutral-400 mt-1 truncate">{email}</div>
      </div>
      <nav className="flex-1 py-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`block px-5 py-2.5 text-sm ${
              pathname === l.href ? "bg-pink-600 text-white" : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-neutral-800 space-y-2">
        <a href="/" target="_blank" className="block text-xs text-neutral-400 hover:text-white">
          Ver sitio público ↗
        </a>
        <button onClick={handleLogout} className="text-xs text-neutral-400 hover:text-white">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
