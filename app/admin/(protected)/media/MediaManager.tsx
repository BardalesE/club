"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CLUB_SLUG } from "@/lib/constants";
import type { MediaItem, MediaSeccion } from "@/lib/types";

const SECCIONES: { key: MediaSeccion; label: string; help: string }[] = [
  {
    key: "galeria",
    label: "Galería (álbum principal)",
    help: "El mosaico de fotos y videos históricos del club — la sección más grande del sitio.",
  },
  {
    key: "hermandad",
    label: "Hermandad",
    help: "Las 4 fotos/videos de la tira dentro de la sección de mística y comunidad.",
  },
  {
    key: "testimonios",
    label: "Testimonios",
    help: "Fotos o videos cortos de hinchas, jugadores o dirigentes contando algo del club.",
  },
];

export default function MediaManager({
  hermandad,
  galeria,
  testimonios,
}: {
  hermandad: MediaItem[];
  galeria: MediaItem[];
  testimonios: MediaItem[];
}) {
  const [active, setActive] = useState<MediaSeccion>("galeria");
  const byKey: Record<MediaSeccion, MediaItem[]> = { hermandad, galeria, testimonios };

  return (
    <div>
      <div className="flex gap-2 mb-5 border-b border-neutral-200 overflow-x-auto">
        {SECCIONES.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`shrink-0 whitespace-nowrap px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
              active === s.key ? "border-pink-600 text-pink-600" : "border-transparent text-neutral-500"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <SeccionPanel
        key={active}
        seccion={active}
        help={SECCIONES.find((s) => s.key === active)!.help}
        initialItems={byKey[active]}
      />
    </div>
  );
}

function SeccionPanel({
  seccion,
  help,
  initialItems,
}: {
  seccion: MediaSeccion;
  help: string;
  initialItems: MediaItem[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList) {
    setUploading(true);
    setError(null);
    let orden = items.length ? Math.max(...items.map((i) => i.orden)) + 1 : 0;
    const files = Array.from(fileList);
    const newItems: MediaItem[] = [];
    for (const file of files) {
      try {
        const ext = file.name.split(".").pop();
        const path = `${seccion}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        const tipo = file.type.startsWith("video") ? "video" : "foto";
        const { data, error: insertError } = await supabase
          .from("media_gallery")
          .insert({ club_slug: CLUB_SLUG, seccion, tipo, url: pub.publicUrl, orden: orden++ })
          .select()
          .single();
        if (insertError) throw insertError;
        newItems.push(data as MediaItem);
      } catch (e: any) {
        setError(e.message || "Falló la subida de uno de los archivos.");
      }
    }
    setItems((prev) => [...prev, ...newItems]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm("¿Eliminar este archivo?")) return;
    const { error } = await supabase.from("media_gallery").delete().eq("id", item.id);
    if (!error) {
      // Intentamos borrar también el objeto del storage; si falla (política o
      // ya no existe) no bloqueamos el borrado del registro.
      const path = item.url.split("/storage/v1/object/public/media/")[1];
      if (path) await supabase.storage.from("media").remove([path]);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      router.refresh();
    }
  }

  async function updateField(id: string, patch: Partial<MediaItem>) {
    const { error } = await supabase.from("media_gallery").update(patch).eq("id", id);
    if (!error) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const sorted = items.slice().sort((a, b) => a.orden - b.orden);
    const idx = sorted.findIndex((i) => i.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      supabase.from("media_gallery").update({ orden: b.orden }).eq("id", a.id),
      supabase.from("media_gallery").update({ orden: a.orden }).eq("id", b.id),
    ]);
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === a.id) return { ...i, orden: b.orden };
        if (i.id === b.id) return { ...i, orden: a.orden };
        return i;
      })
    );
    router.refresh();
  }

  const sorted = items.slice().sort((a, b) => a.orden - b.orden);

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">{help}</p>

      <label className="block mb-6">
        <div className="rounded-lg border-2 border-dashed border-neutral-300 hover:border-pink-400 transition p-8 text-center cursor-pointer bg-white">
          <p className="text-sm font-semibold text-neutral-700">
            {uploading ? "Subiendo…" : "Haz clic para elegir fotos o videos"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">Puedes seleccionar varios archivos a la vez.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
          }}
        />
      </label>
      {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-400">Todavía no hay archivos en esta sección.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item, i) => (
            <div key={item.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <div className="aspect-video bg-neutral-100">
                {item.tipo === "video" ? (
                  <video src={item.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3 space-y-2">
                <input
                  className="w-full text-xs rounded border border-neutral-300 px-2 py-1"
                  placeholder="Descripción / pie de foto"
                  defaultValue={item.caption || ""}
                  onBlur={(e) => updateField(item.id, { caption: e.target.value })}
                />
                {seccion === "testimonios" ? (
                  <input
                    className="w-full text-xs rounded border border-neutral-300 px-2 py-1"
                    placeholder="Autor (nombre y rol)"
                    defaultValue={item.autor || ""}
                    onBlur={(e) => updateField(item.id, { autor: e.target.value })}
                  />
                ) : null}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1">
                    <button
                      disabled={i === 0}
                      onClick={() => move(item.id, -1)}
                      className="text-xs px-2 py-1 rounded border border-neutral-200 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      disabled={i === sorted.length - 1}
                      onClick={() => move(item.id, 1)}
                      className="text-xs px-2 py-1 rounded border border-neutral-200 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <button onClick={() => handleDelete(item)} className="text-xs text-red-600 hover:underline">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
