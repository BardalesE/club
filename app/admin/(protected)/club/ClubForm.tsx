"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CLUB_SLUG } from "@/lib/constants";
import type { Club } from "@/lib/types";
import MediaPicker from "@/components/admin/MediaPicker";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500";

export default function ClubForm({ initial }: { initial: Club }) {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState<Club>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function set<K extends keyof Club>(key: K, value: Club[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { slug, ...rest } = form;
    const { error } = await supabase.from("club").update(rest).eq("slug", CLUB_SLUG);
    setSaving(false);
    if (!error) {
      setSavedAt(Date.now());
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Club, hero y textos</h1>
        <p className="text-sm text-neutral-500 mt-1">Identidad general y el copy de cada sección de la revista.</p>
      </div>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="font-semibold text-neutral-800">Identidad</h2>
        <Field label="Nombre del club">
          <input className={inputCls} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </Field>
        <Field label="Eyebrow (línea sobre el título, ej. 'Club Deportivo · San Gregorio')">
          <input className={inputCls} value={form.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} />
        </Field>
        <Field label="Fecha de fundación">
          <input
            type="date"
            className={inputCls}
            value={form.fecha_fundacion || ""}
            onChange={(e) => set("fecha_fundacion", e.target.value)}
          />
        </Field>
        <Field label="Escudo del club">
          <MediaPicker
            value={form.escudo_url}
            onChange={(url) => set("escudo_url", url)}
            accept="image/*"
            folder="club"
          />
        </Field>
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="font-semibold text-neutral-800">Hero (portada)</h2>
        <Field label="Foto/video de fondo del hero">
          <MediaPicker value={form.hero_bg_url} onChange={(url) => set("hero_bg_url", url)} folder="hero" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Título — parte 1">
            <input className={inputCls} value={form.hero_titulo_pre || ""} onChange={(e) => set("hero_titulo_pre", e.target.value)} />
          </Field>
          <Field label="Título — énfasis (cursiva)">
            <input className={inputCls} value={form.hero_titulo_em || ""} onChange={(e) => set("hero_titulo_em", e.target.value)} />
          </Field>
          <Field label="Título — parte 2">
            <input className={inputCls} value={form.hero_titulo_post || ""} onChange={(e) => set("hero_titulo_post", e.target.value)} />
          </Field>
        </div>
        <Field label="Subtítulo">
          <textarea
            className={inputCls}
            rows={3}
            value={form.hero_subtitulo || ""}
            onChange={(e) => set("hero_subtitulo", e.target.value)}
          />
        </Field>
        <Field label="Cifras destacadas (JSON: [{numero,label}])">
          <textarea
            className={`${inputCls} font-mono text-xs`}
            rows={4}
            value={JSON.stringify(form.hero_cifras, null, 2)}
            onChange={(e) => {
              try {
                set("hero_cifras", JSON.parse(e.target.value));
              } catch {
                /* se ignora hasta que el JSON sea válido */
              }
            }}
          />
        </Field>
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="font-semibold text-neutral-800">Fundación</h2>
        <Field label="Relato de fundación (usa línea en blanco entre párrafos)">
          <textarea
            className={inputCls}
            rows={8}
            value={form.fundacion_relato || ""}
            onChange={(e) => set("fundacion_relato", e.target.value)}
          />
        </Field>
        <Field label="Foto de la fundación">
          <MediaPicker value={form.fundacion_foto_url} onChange={(url) => set("fundacion_foto_url", url)} folder="fundacion" />
        </Field>
        <Field label="Pie de foto">
          <input
            className={inputCls}
            value={form.fundacion_foto_caption || ""}
            onChange={(e) => set("fundacion_foto_caption", e.target.value)}
          />
        </Field>
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="font-semibold text-neutral-800">Copy de secciones</h2>
        <Field label="Intro — Camisetas / identidad">
          <textarea className={inputCls} rows={2} value={form.kits_intro || ""} onChange={(e) => set("kits_intro", e.target.value)} />
        </Field>
        <Field label="Intro — Camadas">
          <textarea className={inputCls} rows={2} value={form.camadas_intro || ""} onChange={(e) => set("camadas_intro", e.target.value)} />
        </Field>
        <Field label="Intro — Mística">
          <textarea className={inputCls} rows={2} value={form.mistica_intro || ""} onChange={(e) => set("mistica_intro", e.target.value)} />
        </Field>
        <Field label="Texto — Hermandad">
          <textarea className={inputCls} rows={3} value={form.hermandad_texto || ""} onChange={(e) => set("hermandad_texto", e.target.value)} />
        </Field>
        <Field label="Intro — Galería">
          <textarea className={inputCls} rows={2} value={form.galeria_intro || ""} onChange={(e) => set("galeria_intro", e.target.value)} />
        </Field>
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="font-semibold text-neutral-800">Actualidad y futuro</h2>
        <Field label="Fondo (foto/video del plantel actual)">
          <MediaPicker value={form.actualidad_bg_url} onChange={(url) => set("actualidad_bg_url", url)} folder="actualidad" />
        </Field>
        <Field label="Intro">
          <textarea className={inputCls} rows={2} value={form.actualidad_intro || ""} onChange={(e) => set("actualidad_intro", e.target.value)} />
        </Field>
        <Field label="De dónde viene">
          <textarea className={inputCls} rows={3} value={form.actualidad_de_donde || ""} onChange={(e) => set("actualidad_de_donde", e.target.value)} />
        </Field>
        <Field label="Hacia dónde va">
          <textarea className={inputCls} rows={3} value={form.actualidad_hacia_donde || ""} onChange={(e) => set("actualidad_hacia_donde", e.target.value)} />
        </Field>
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="font-semibold text-neutral-800">Memoria y cierre</h2>
        <Field label="Intro — Memoria">
          <textarea className={inputCls} rows={2} value={form.memoria_intro || ""} onChange={(e) => set("memoria_intro", e.target.value)} />
        </Field>
        <Field label="Nota de cierre — Memoria">
          <input className={inputCls} value={form.memoria_nota || ""} onChange={(e) => set("memoria_nota", e.target.value)} />
        </Field>
        <Field label="Título CTA final">
          <input className={inputCls} value={form.cta_titulo || ""} onChange={(e) => set("cta_titulo", e.target.value)} />
        </Field>
        <Field label="Texto CTA final">
          <textarea className={inputCls} rows={2} value={form.cta_texto || ""} onChange={(e) => set("cta_texto", e.target.value)} />
        </Field>
      </section>

      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-semibold px-5 py-2 text-sm"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {savedAt ? <span className="text-sm text-green-600">Guardado ✓</span> : null}
      </div>
    </form>
  );
}
