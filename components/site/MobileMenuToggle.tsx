"use client";

import { useState } from "react";

/**
 * Botón hamburguesa + menú desplegable para el topnav en móvil. El <nav>
 * desktop se oculta bajo 720px (ver .topnav nav en globals.css); sin esto,
 * los links de navegación simplemente desaparecían sin nada que los
 * reemplace.
 */
export default function MobileMenuToggle({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav-toggle">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="mobile-nav-btn"
      >
        {open ? "✕" : "☰"}
      </button>
      {open ? (
        <nav className="mobile-nav-panel" onClick={() => setOpen(false)}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
