"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CLUB_SLUG } from "@/lib/constants";
import type { Camada, CamadaJugador } from "@/lib/types";
import MediaPicker from "@/components/admin/MediaPicker";

const inputCls =
  "w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500";

export default function CamadasManager({ initialCamadas }: { initialCamadas: Camada[] }) {
  const [camadas, setCamadas] = useState<Camada[]>(initialCamadas);

  return (
    <div className="space-y-6">
      {camadas.map((c) => (
        <CamadaCard
          key={c.id}
          camada={c}
          onDeleted={() => setCamadas((prev) => prev.filter((x) => x.id !== c.id))}
        />
      ))}
      <NewCamada onCreated={(c) => setCamadas((prev) => [...prev, { ...c, camada_jugadores: [] }])} />
    </div>
  );
}

function CamadaCard({ camada, onDeleted }: { camada: Camada; onDeleted: () => void }) {
  const supabase = createClient();
  const router = useRouter();
  const [local, setLocal] = useState(camada);
  const [dirty, setDirty] = useState(false);
  const [jugadores, setJugadores] = useState<CamadaJugador[]>(camada.camada_jugadores);
  const [nuevoJugador, setNuevoJugador] = useState("");
  const [nuevoRol, setNuevoRol] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveCamada() {
    setSaving(true);
    const { nombre, emoji, descripcion, imagen_url } = local;
    const { error } = await supabase
      .from("camadas")
      .update({ nombre, emoji, descripcion, imagen_url })
      .eq("id", camada.id);
    setSaving(false);
    if (!error) {
      setDirty(false);
      router.refresh();
    }
  }

  async function deleteCamada() {
    if (!confirm(`¿Eliminar "${camada.nombre}" y todos sus jugadores?`)) return;
    const { error } = await supabase.from("camadas").delete().eq("id", camada.id);
    if (!error) onDeleted();
  }

  async function addJugador() {
    if (!nuevoJugador.trim()) return;
    const orden = jugadores.length ? Math.max(...jugadores.map((j) => j.orden)) + 1 : 0;
    const { data, error } = await supabase
      .from("camada_jugadores")
      .insert({ camada_id: camada.id, nombre: nuevoJugador.trim(), rol_destacado: nuevoRol.trim() || null, orden })
      .select()
      .single();
    if (!error && data) {
      setJugadores((prev) => [...prev, data as CamadaJugador]);
      setNuevoJugador("");
      setNuevoRol("");
      router.refresh();
    }
  }

  async function deleteJugador(id: string) {
    const { error } = await supabase.from("camada_jugadores").delete().eq("id", id);
    if (!error) {
      setJugadores((prev) => prev.filter((j) => j.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-4">
      <div className="grid sm:grid-cols-[80px_1fr] gap-3">
        <input
          className={inputCls}
          value={local.emoji || ""}
          onChange={(e) => {
            setLocal((l) => ({ ...l, emoji: e.target.value }));
            setDirty(true);
          }}
          placeholder="🥇"
        />
        <input
          className={inputCls}
          value={local.nombre}
          onChange={(e) => {
            setLocal((l) => ({ ...l, nombre: e.target.value }));
            setDirty(true);
          }}
        />
      </div>
      <textarea
        className={inputCls}
        rows={2}
        value={local.descripcion || ""}
        onChange={(e) => {
          setLocal((l) => ({ ...l, descripcion: e.target.value }));
          setDirty(true);
        }}
      />
      <MediaPicker
        value={local.imagen_url}
        onChange={(url) => {
          setLocal((l) => ({ ...l, imagen_url: url }));
          setDirty(true);
        }}
        folder="camadas"
      />

      <div>
        <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Jugadores</h4>
        <ul className="space-y-1 mb-3">
          {jugadores.map((j) => (
            <li key={j.id} className="flex items-center justify-between text-sm bg-neutral-50 rounded px-3 py-1.5">
              <span>
                {j.rol_destacado ? <b className="text-pink-600">{j.rol_destacado} </b> : null}
                {j.nombre}
              </span>
              <button onClick={() => deleteJugador(j.id)} className="text-xs text-red-500 hover:underline">
                Quitar
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <input
            className={`${inputCls} min-w-0 flex-1 basis-40`}
            placeholder="Nombre del jugador"
            value={nuevoJugador}
            onChange={(e) => setNuevoJugador(e.target.value)}
          />
          <input
            className={`${inputCls} min-w-0 w-28`}
            placeholder="Rol (opcional)"
            value={nuevoRol}
            onChange={(e) => setNuevoRol(e.target.value)}
          />
          <button
            onClick={addJugador}
            className="shrink-0 text-xs rounded bg-neutral-800 hover:bg-neutral-900 text-white px-3 py-1.5"
          >
            Añadir
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-neutral-100">
        <button
          onClick={saveCamada}
          disabled={!dirty || saving}
          className="text-xs rounded bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white px-3 py-1.5"
        >
          {saving ? "Guardando…" : "Guardar camada"}
        </button>
        <button onClick={deleteCamada} className="text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5">
          Eliminar camada
        </button>
      </div>
    </div>
  );
}

function NewCamada({ onCreated }: { onCreated: (c: any) => void }) {
  const supabase = createClient();
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [emoji, setEmoji] = useState("🥇");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!nombre.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("camadas")
      .insert({ club_slug: CLUB_SLUG, nombre: nombre.trim(), emoji, orden: 99 })
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      onCreated(data);
      setNombre("");
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-lg border border-dashed border-neutral-300 p-5">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">Agregar nueva camada</h3>
      <div className="flex gap-2">
        <input className={`${inputCls} w-20`} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
        <input
          className={inputCls}
          placeholder="Nombre de la camada"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button
          onClick={create}
          disabled={saving}
          className="shrink-0 text-sm rounded bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-semibold px-4 py-1.5"
        >
          {saving ? "Creando…" : "Crear"}
        </button>
      </div>
    </div>
  );
}
