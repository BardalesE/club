"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CLUB_SLUG } from "@/lib/constants";
import MediaPicker from "@/components/admin/MediaPicker";

type FieldType = "text" | "textarea" | "checkbox" | "image" | "color";
type FieldConfig = { key: string; label: string; type: FieldType; placeholder?: string; folder?: string };

/**
 * CRUD genérico para tablas "simples" (una fila = un registro plano con
 * club_slug + orden): fundadores, rivales, hitos, memoria. Evita repetir el
 * mismo formulario cuatro veces con solo el nombre de columnas cambiando.
 */
export default function SimpleListManager<T extends { id: string; orden: number }>({
  table,
  fields,
  initialItems,
  emptyLabel = "Aún no hay registros.",
}: {
  table: string;
  fields: FieldConfig[];
  initialItems: T[];
  emptyLabel?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [items, setItems] = useState<T[]>(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  function emptyDraft(): any {
    const draft: any = {};
    fields.forEach((f) => (draft[f.key] = f.type === "checkbox" ? false : ""));
    return draft;
  }
  const [draft, setDraft] = useState<any>(emptyDraft());

  async function handleAdd() {
    setBusyId("new");
    const orden = items.length ? Math.max(...items.map((i) => i.orden)) + 1 : 0;
    const { data, error } = await supabase
      .from(table)
      .insert({ ...draft, club_slug: CLUB_SLUG, orden })
      .select()
      .single();
    setBusyId(null);
    if (!error && data) {
      setItems((prev) => [...prev, data as T]);
      setDraft(emptyDraft());
      router.refresh();
    }
  }

  async function handleUpdate(id: string, patch: any) {
    setBusyId(id);
    const { error } = await supabase.from(table).update(patch).eq("id", id);
    setBusyId(null);
    if (!error) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este registro?")) return;
    setBusyId(id);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setBusyId(null);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  const inputCls =
    "w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 p-5">{emptyLabel}</p>
        ) : (
          items
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .map((item) => (
              <Row
                key={item.id}
                item={item}
                fields={fields}
                busy={busyId === item.id}
                onSave={(patch) => handleUpdate(item.id, patch)}
                onDelete={() => handleDelete(item.id)}
              />
            ))
        )}
      </div>

      <div className="bg-white rounded-lg border border-dashed border-neutral-300 p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Agregar nuevo</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-medium text-neutral-500 mb-1">{f.label}</label>
              {f.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={!!draft[f.key]}
                  onChange={(e) => setDraft((d: any) => ({ ...d, [f.key]: e.target.checked }))}
                />
              ) : f.type === "textarea" ? (
                <textarea
                  className={inputCls}
                  rows={2}
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d: any) => ({ ...d, [f.key]: e.target.value }))}
                />
              ) : f.type === "image" ? (
                <MediaPicker
                  value={draft[f.key] || null}
                  onChange={(url) => setDraft((d: any) => ({ ...d, [f.key]: url }))}
                  folder={f.folder || table}
                />
              ) : f.type === "color" ? (
                <input
                  type="color"
                  className="h-9 w-16 rounded border border-neutral-300"
                  value={draft[f.key] || "#999999"}
                  onChange={(e) => setDraft((d: any) => ({ ...d, [f.key]: e.target.value }))}
                />
              ) : (
                <input
                  className={inputCls}
                  placeholder={f.placeholder}
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d: any) => ({ ...d, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleAdd}
          disabled={busyId === "new"}
          className="mt-3 rounded bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5"
        >
          {busyId === "new" ? "Agregando…" : "Agregar"}
        </button>
      </div>
    </div>
  );
}

function Row({
  item,
  fields,
  busy,
  onSave,
  onDelete,
}: {
  item: any;
  fields: FieldConfig[];
  busy: boolean;
  onSave: (patch: any) => void;
  onDelete: () => void;
}) {
  const [local, setLocal] = useState(item);
  const [dirty, setDirty] = useState(false);
  const inputCls =
    "w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500";

  return (
    <div className="p-4 flex flex-wrap gap-3 items-start">
      <div className="grid gap-2 sm:grid-cols-2 flex-1 min-w-[240px]">
        {fields.map((f) => (
          <div key={f.key} className={f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}>
            {f.type === "checkbox" ? (
              <label className="flex items-center gap-2 text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={!!local[f.key]}
                  onChange={(e) => {
                    setLocal((l: any) => ({ ...l, [f.key]: e.target.checked }));
                    setDirty(true);
                  }}
                />
                {f.label}
              </label>
            ) : f.type === "textarea" ? (
              <textarea
                className={inputCls}
                rows={2}
                value={local[f.key] || ""}
                onChange={(e) => {
                  setLocal((l: any) => ({ ...l, [f.key]: e.target.value }));
                  setDirty(true);
                }}
              />
            ) : f.type === "image" ? (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">{f.label}</label>
                <MediaPicker
                  value={local[f.key] || null}
                  onChange={(url) => {
                    setLocal((l: any) => ({ ...l, [f.key]: url }));
                    setDirty(true);
                  }}
                  folder={f.folder || "misc"}
                />
              </div>
            ) : f.type === "color" ? (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">{f.label}</label>
                <input
                  type="color"
                  className="h-9 w-16 rounded border border-neutral-300"
                  value={local[f.key] || "#999999"}
                  onChange={(e) => {
                    setLocal((l: any) => ({ ...l, [f.key]: e.target.value }));
                    setDirty(true);
                  }}
                />
              </div>
            ) : (
              <input
                className={inputCls}
                value={local[f.key] || ""}
                onChange={(e) => {
                  setLocal((l: any) => ({ ...l, [f.key]: e.target.value }));
                  setDirty(true);
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          disabled={!dirty || busy}
          onClick={() => {
            const patch: any = {};
            fields.forEach((f) => (patch[f.key] = local[f.key]));
            onSave(patch);
            setDirty(false);
          }}
          className="text-xs rounded bg-neutral-800 hover:bg-neutral-900 disabled:opacity-40 text-white px-3 py-1.5"
        >
          Guardar
        </button>
        <button
          disabled={busy}
          onClick={onDelete}
          className="text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
