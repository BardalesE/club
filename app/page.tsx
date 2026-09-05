import { getClubContent } from "@/lib/content";
import Interactions from "@/components/site/Interactions";
import {
  Actualidad,
  Camadas,
  Cta,
  Fundacion,
  Galeria,
  Hero,
  Hitos,
  Kits,
  Lightbox,
  Memoria,
  Mistica,
  Rail,
  SiteFooter,
  Testimonios,
  TopNav,
} from "@/components/site/Sections";

export const revalidate = 0; // siempre fresco: el admin publica y se ve al instante

export default async function HomePage() {
  const content = await getClubContent();

  if (!content) {
    return (
      <main className="wrap" style={{ paddingTop: 80 }}>
        <h1>Todavía no hay contenido publicado.</h1>
        <p>Carga los datos del club desde el panel de administración en /admin.</p>
      </main>
    );
  }

  const { club } = content;

  return (
    <div className="site">
      <div className="grain" />
      <Rail />
      <TopNav club={club} />
      <Hero club={club} />
      <Fundacion club={club} founders={content.founders} />
      <Kits club={club} kits={content.kits} />
      <Camadas club={club} camadas={content.camadas} />
      <Mistica club={club} anecdotas={content.anecdotas} hermandad={content.hermandad} />
      <Hitos rivales={content.rivales} stats={content.stats} />
      <Actualidad club={club} />
      <Memoria club={club} memoria={content.memoria} />
      <Testimonios testimonios={content.testimonios} />
      <Galeria club={club} galeria={content.galeria} />
      <Cta club={club} />
      <SiteFooter club={club} />
      <Lightbox />
      <Interactions />
    </div>
  );
}
