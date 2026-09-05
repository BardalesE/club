"use client";

import { useState } from "react";
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

/**
 * Nav del admin. En pantallas md+ es una barra lateral fija (igual que
 * antes). En móvil/tablet colapsa a una barra superior + un cajón deslizable,
 * para no comerse la mitad de un celular con una sidebar de 256px fija.
 */
export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const navLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 py-2 overflow-y-auto">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onNavigate}
          className={`block px-5 py-2.5 text-sm ${
            pathname === l.href ? "bg-pink-600 text-white" : "text-neutral-300 hover:bg-neutral-800"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="p-4 border-t border-neutral-800 space-y-2 shrink-0">
      <a href="/" target="_blank" className="block text-xs text-neutral-400 hover:text-white">
        Ver sitio público ↗
      </a>
      <button onClick={handleLogout} className="text-xs text-neutral-400 hover:text-white">
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <>
      {/* Barra superior — solo móvil/tablet */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-neutral-900 text-neutral-100 px-4 py-3">
        <div>
          <div className="font-bold text-sm">Panel del club</div>
          <div className="text-[11px] text-neutral-400 truncate max-w-[220px]">{email}</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="p-2 -mr-2 shrink-0"
        >
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
      </div>

      {/* Cajón deslizable — solo móvil/tablet, cuando está abierto */}
      {open ? (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[80vw] bg-neutral-900 text-neutral-100 h-full flex flex-col">
            <div className="px-5 py-5 border-b border-neutral-800 flex items-start justify-between shrink-0">
              <div>
                <div className="font-bold text-sm">Panel del club</div>
                <div className="text-xs text-neutral-400 mt-1 truncate">{email}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="text-neutral-400 text-2xl leading-none px-1"
              >
                ×
              </button>
            </div>
            {navLinks(() => setOpen(false))}
            {footer}
          </div>
          <button
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/60"
          />
        </div>
      ) : null}

      {/* Sidebar fija — solo desktop (md+) */}
      <aside className="hidden md:flex w-64 shrink-0 bg-neutral-900 text-neutral-100 min-h-screen flex-col">
        <div className="px-5 py-5 border-b border-neutral-800 shrink-0">
          <div className="font-bold text-sm">Panel del club</div>
          <div className="text-xs text-neutral-400 mt-1 truncate">{email}</div>
        </div>
        {navLinks()}
        {footer}
      </aside>
    </>
  );
}
