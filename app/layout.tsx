import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sport Boys San Gregorio — cápsula digital de memoria",
  description:
    "Revista digital histórica del Club Deportivo Sport Boys de San Gregorio, desde 1990 hasta hoy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,450;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
