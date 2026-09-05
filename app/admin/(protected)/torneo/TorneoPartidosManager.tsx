"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CLUB_SLUG } from "@/lib/constants";
import type { TorneoEquipo, TorneoEstado, TorneoPartido } from "@/lib/types";

const FASES_SUGERIDAS = ["Octavos de Final", "Cuartos de Final", "Semifinal", "Tercer puesto", "Final"];
const ESTADOS: { value: TorneoEstado; label: string }[] = [
  { value: "programado", label: "Programado" },
  { value: "en_vivo", label: "En vivo" },
  { value: "finalizado", label: "Finalizado" },
];

const inputCls =
  "w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500";

/**
 * Torneo del aniversario, pensado para cargarse desde el celular partido a
 * partido a medida que se juegan: formulario de alta simple arriba, y abajo
 * cada partido editable in-place (goles, estado, equipos) con flechas para
 * reordenar dentro de su fase.
 */
export default function TorneoPartidosManager({
  equipos,
  initialPartidos,
}: {
  equipos: TorneoEquipo[];
  initialPartidos: TorneoPartido[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [partidos, setPartidos] = useState<TorneoPartido[]>(initialPartidos);
  const [busy, setBusy] = useState(false);

  function emptyDraft() {
    return {
      fase: "",
      fecha: new Date().toISOString().slice(0, 10),
      equipo_local_id: "",
      equipo_visitante_id: "",
      goles_local: "",
      goles_visitante: "",
      estado: "programado" as TorneoEstado,
    };
  }
  const [draft, setDraft] = useState(emptyDraft());

  async function handleAdd() {
    if (!draft.fase.trim() || !draft.equipo_local_id || !draft.equipo_visitante_id) return;
    setBusy(true);
    const orden = partidos.length ? Math.max(...partidos.map((p) => p.orden)) + 1 : 0;
    const { data, error } = await supabase
      .from("torneo_partidos")
      .insert({
        club_slug: CLUB_SLUG,
        fase: draft.fase.trim(),
        fecha: draft.fecha || null,
        equipo_local_id: draft.equipo_local_id,
        equipo_visitante_id: draft.equipo_visitante_id,
        goles_local: draft.goles_local === "" ? null : Number(draft.goles_local),
        goles_visitante: draft.goles_visitante === "" ? null : Number(draft.goles_visitante),
        estado: draft.estado,
        orden,
      })
      .select()
      .single();
    setBusy(false);
    if (!error && data) {
      setPartidos((prev) => [...prev, data as TorneoPartido]);
      setDraft(emptyDraft());
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este partido?")) return;
    const { error } = await supabase.from("torneo_partidos").delete().eq("id", id);
    if (!error) {
      setPartidos((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
  }

  async function handleUpdate(id: string, patch: Partial<TorneoPartido>) {
    const { error } = await supabase.from("torneo_partidos").update(patch).eq("id", id);
    if (!error) {
      setPartidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      router.refresh();
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const sorted = partidos.slice().sort((a, b) => a.orden - b.orden);
    const idx = sorted.findIndex((p) => p.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      supabase.from("torneo_partidos").update({ orden: b.orden }).eq("id", a.id),
      supabase.from("torneo_partidos").update({ orden: a.orden }).eq("id", b.id),
    ]);
    setPartidos((prev) =>
      prev.map((p) => {
        if (p.id === a.id) return { ...p, orden: b.orden };
        if (p.id === b.id) return { ...p, orden: a.orden };
        return p;
      })
    );
    router.refresh();
  }

  const sorted = partidos.slice().sort((a, b) => a.orden - b.orden);

  if (!equipos.length) {
    return (
      <p className="text-sm text-neutral-500 bg-white rounded-lg border border-dashed border-neutral-300 p-5">
        Primero agrega los equipos arriba — luego podrás armar los partidos eligiéndolos de una lista.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-dashed border-neutral-300 p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Agregar partido</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Fase</label>
            <input
              className={inputCls}
              list="fases-sugeridas"
              placeholder="Ej. Cuartos de Final"
              value={draft.fase}
              onChange={(e) => setDraft((d) => ({ ...d, fase: e.target.value }))}
            />
            <datalist id="fases-sugeridas">
              {FASES_SUGERIDAS.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Fecha</label>
            <input
              type="date"
              className={inputCls}
              value={draft.fecha}
              onChange={(e) => setDraft((d) => ({ ...d, fecha: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Equipo local</label>
            <select
              className={inputCls}
              value={draft.equipo_local_id}
              onChange={(e) => setDraft((d) => ({ ...d, equipo_local_id: e.target.value }))}
            >
              <option value="">Elegir…</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.emoji ? `${eq.emoji} ` : ""}
                  {eq.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Goles local</label>
            <input
              type="number"
              inputMode="numeric"
              className={inputCls}
              value={draft.goles_local}
              onChange={(e) => setDraft((d) => ({ ...d, goles_local: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Equipo visitante</label>
            <select
              className={inputCls}
              value={draft.equipo_visitante_id}
              onChange={(e) => setDraft((d) => ({ ...d, equipo_visitante_id: e.target.value }))}
            >
              <option value="">Elegir…</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.emoji ? `${eq.emoji} ` : ""}
                  {eq.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Goles visitante</label>
            <input
              type="number"
              inputMode="numeric"
              className={inputCls}
              value={draft.goles_visitante}
              onChange={(e) => setDraft((d) => ({ ...d, goles_visitante: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-500 mb-1">Estado</label>
            <select
              className={inputCls}
              value={draft.estado}
              onChange={(e) => setDraft((d) => ({ ...d, estado: e.target.value as TorneoEstado }))}
            >
              {ESTADOS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={busy || !draft.fase.trim() || !draft.equipo_local_id || !draft.equipo_visitante_id}
          className="mt-3 rounded bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5"
        >
          {busy ? "Agregando…" : "Agregar partido"}
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-400">Aún no hay partidos cargados.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((p, i) => (
            <PartidoRow
              key={p.id}
              partido={p}
              equipos={equipos}
              isFirst={i === 0}
              isLast={i === sorted.length - 1}
              onMove={(dir) => move(p.id, dir)}
              onSave={(patch) => handleUpdate(p.id, patch)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PartidoRow({
  partido,
  equipos,
  isFirst,
  isLast,
  onMove,
  onSave,
  onDelete,
}: {
  partido: TorneoPartido;
  equipos: TorneoEquipo[];
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
  onSave: (patch: Partial<TorneoPartido>) => void;
  onDelete: () => void;
}) {
  const [local, setLocal] = useState(partido);
  const [dirty, setDirty] = useState(false);

  function set<K extends keyof TorneoPartido>(key: K, value: TorneoPartido[K]) {
    setLocal((l) => ({ ...l, [key]: value }));
    setDirty(true);
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide truncate pr-2">
          {local.fase}
        </span>
        <div className="flex gap-1 shrink-0">
          <button
            disabled={isFirst}
            onClick={() => onMove(-1)}
            className="text-xs px-2 py-1 rounded border border-neutral-200 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            disabled={isLast}
            onClick={() => onMove(1)}
            className="text-xs px-2 py-1 rounded border border-neutral-200 disabled:opacity-30"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <input className={inputCls} value={local.fase} onChange={(e) => set("fase", e.target.value)} placeholder="Fase" />
        <input
          type="date"
          className={inputCls}
          value={local.fecha ?? ""}
          onChange={(e) => set("fecha", e.target.value || null)}
        />
      </div>

      <div className="grid grid-cols-[1fr_64px] gap-2 mt-2 items-center">
        <select
          className={inputCls}
          value={local.equipo_local_id ?? ""}
          onChange={(e) => set("equipo_local_id", e.target.value || null)}
        >
          <option value="">Elegir…</option>
          {equipos.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.emoji ? `${eq.emoji} ` : ""}
              {eq.nombre}
            </option>
          ))}
        </select>
        <input
          type="number"
          inputMode="numeric"
          className={`${inputCls} text-center font-semibold`}
          value={local.goles_local ?? ""}
          onChange={(e) => set("goles_local", e.target.value === "" ? null : Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-[1fr_64px] gap-2 mt-2 items-center">
        <select
          className={inputCls}
          value={local.equipo_visitante_id ?? ""}
          onChange={(e) => set("equipo_visitante_id", e.target.value || null)}
        >
          <option value="">Elegir…</option>
          {equipos.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.emoji ? `${eq.emoji} ` : ""}
              {eq.nombre}
            </option>
          ))}
        </select>
        <input
          type="number"
          inputMode="numeric"
          className={`${inputCls} text-center font-semibold`}
          value={local.goles_visitante ?? ""}
          onChange={(e) => set("goles_visitante", e.target.value === "" ? null : Number(e.target.value))}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-neutral-100">
        <select
          className="rounded border border-neutral-300 px-2 py-1.5 text-xs"
          value={local.estado}
          onChange={(e) => set("estado", e.target.value as TorneoEstado)}
        >
          {ESTADOS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            disabled={!dirty}
            onClick={() => {
              onSave({
                fase: local.fase,
                fecha: local.fecha,
                equipo_local_id: local.equipo_local_id,
                equipo_visitante_id: local.equipo_visitante_id,
                goles_local: local.goles_local,
                goles_visitante: local.goles_visitante,
                estado: local.estado,
              });
              setDirty(false);
            }}
            className="text-xs rounded bg-neutral-800 hover:bg-neutral-900 disabled:opacity-40 text-white px-3 py-1.5"
          >
            Guardar
          </button>
          <button
            onClick={onDelete}
            className="text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
