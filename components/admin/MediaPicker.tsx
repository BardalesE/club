"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Sube una foto o video a Supabase Storage (bucket "media") y devuelve la
 * URL pública. Es el componente que reemplaza al "admin de PoliticOS" para
 * este producto: cualquier campo de imagen/video del sitio usa esto.
 */
export default function MediaPicker({
  value,
  onChange,
  accept = "image/*,video/*",
  folder = "misc",
}: {
  value: string | null;
  onChange: (url: string) => void;
  accept?: string;
  folder?: string;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: any) {
      setError(e.message || "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isVideo = value ? /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value) : false;

  return (
    <div>
      {value ? (
        <div className="mb-2 rounded overflow-hidden border border-neutral-200 max-w-xs">
          {isVideo ? (
            <video src={value} controls className="w-full" />
          ) : (
            <img src={value} alt="" className="w-full object-cover" />
          )}
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="text-xs text-neutral-600 file:mr-3 file:rounded file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-xs file:font-medium hover:file:bg-neutral-300"
      />
      {uploading ? <p className="text-xs text-neutral-500 mt-1">Subiendo…</p> : null}
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </div>
  );
}
