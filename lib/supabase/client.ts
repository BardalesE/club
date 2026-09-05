"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Client Components (formularios del admin,
 * subida de fotos/videos a Storage).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
