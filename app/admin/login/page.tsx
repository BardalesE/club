"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-lg shadow p-8 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Panel del club</h1>
          <p className="text-sm text-neutral-500 mt-1">Inicia sesión para administrar fotos, videos y contenido.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-semibold py-2 text-sm"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
