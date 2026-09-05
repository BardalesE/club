/** @type {import('next').NextConfig} */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig = {
  images: {
    remotePatterns: [
      // Fotos/videos subidos desde el admin viven en Supabase Storage.
      // Si cambias de proyecto Supabase, este host se recalcula solo
      // a partir de NEXT_PUBLIC_SUPABASE_URL (variable de entorno).
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
};

module.exports = nextConfig;
