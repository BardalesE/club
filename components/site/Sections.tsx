import type { ClubContent } from "@/lib/types";
import MobileMenuToggle from "@/components/site/MobileMenuToggle";

function fmtFecha(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}

const NAV_LINKS = [
  { href: "#fundacion", label: "Fundación" },
  { href: "#camadas", label: "Camadas" },
  { href: "#mistica", label: "Mística" },
  { href: "#galeria", label: "Galería" },
];

export function TopNav({ club, showTorneo }: { club: ClubContent["club"]; showTorneo?: boolean }) {
  const links = showTorneo ? [{ href: "#torneo", label: "🏆 Torneo" }, ...NAV_LINKS] : NAV_LINKS;
  return (
    <div className="topnav">
      <div className="brand">
        {club.escudo_url ? <img src={club.escudo_url} alt={`Escudo ${club.nombre}`} /> : null}
        {club.nombre}
      </div>
      <nav>
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <MobileMenuToggle links={links} />
    </div>
  );
}

export function Rail() {
  const targets = ["#fundacion", "#camisetas", "#camadas", "#mistica", "#hitos", "#memoria"];
  return (
    <div className="rail" id="rail">
      <div className="rail-track">
        <div className="rail-fill" id="railFill" />
        {targets.map((t, i) => (
          <div key={t} className="rail-dot" style={{ top: `${i * 20}%` }} data-target={t} />
        ))}
      </div>
    </div>
  );
}

export function Hero({ club }: { club: ClubContent["club"] }) {
  return (
    <header className="hero">
      <div className="hero-bg">
        {club.hero_bg_url ? (
          <img src={club.hero_bg_url} alt={`Plantel de ${club.nombre}`} />
        ) : null}
      </div>
      {club.escudo_url ? (
        <img className="hero-badge" src={club.escudo_url} alt={`Escudo de ${club.nombre}`} />
      ) : null}
      <div className="hero-inner">
        {club.eyebrow ? <div className="eyebrow">{club.eyebrow}</div> : null}
        <h1>
          {club.hero_titulo_pre} <em>{club.hero_titulo_em}</em>
          <br />
          {club.hero_titulo_post}
        </h1>
        {club.hero_subtitulo ? <p className="hero-sub">{club.hero_subtitulo}</p> : null}
        {club.hero_cifras?.length ? (
          <div className="hero-meta">
            {club.hero_cifras.map((c, i) => (
              <div key={i}>
                <span className="n">{c.numero}</span>
                <span className="l">{c.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="hero-scroll">Desliza</div>
    </header>
  );
}

/**
 * Torneo del aniversario — eliminación directa. El admin va agregando
 * partido a partido con el resultado a medida que se juegan (ver
 * /admin/torneo); acá solo agrupamos por fase y mostramos el marcador.
 * Se oculta por completo si todavía no hay partidos cargados.
 */
export function Torneo({ torneoEquipos, torneoPartidos }: Pick<ClubContent, "torneoEquipos" | "torneoPartidos">) {
  if (!torneoPartidos.length) return null;
  const equiposPorId = new Map(torneoEquipos.map((e) => [e.id, e]));

  const fases: string[] = [];
  torneoPartidos.forEach((p) => {
    if (!fases.includes(p.fase)) fases.push(p.fase);
  });

  const estadoLabel: Record<string, string> = {
    programado: "Programado",
    en_vivo: "En vivo",
    finalizado: "Fin",
  };

  return (
    <section className="torneo" id="torneo">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">🏆 Torneo aniversario</div>
          <h2>Así se juega hoy</h2>
        </div>
        {fases.map((fase) => (
          <div key={fase} className="torneo-fase reveal">
            <h3>{fase}</h3>
            <div className="torneo-grid">
              {torneoPartidos
                .filter((p) => p.fase === fase)
                .map((p) => {
                  const local = p.equipo_local_id ? equiposPorId.get(p.equipo_local_id) : undefined;
                  const visitante = p.equipo_visitante_id ? equiposPorId.get(p.equipo_visitante_id) : undefined;
                  const jugado = p.estado === "finalizado" && p.goles_local != null && p.goles_visitante != null;
                  const ganaLocal = jugado && p.goles_local! > p.goles_visitante!;
                  const ganaVisitante = jugado && p.goles_visitante! > p.goles_local!;
                  return (
                    <div key={p.id} className={`torneo-card torneo-${p.estado}`}>
                      <div className="torneo-card-top">
                        <span>{fmtFecha(p.fecha)}</span>
                        <span className={`torneo-badge torneo-badge-${p.estado}`}>{estadoLabel[p.estado]}</span>
                      </div>
                      <div className={`torneo-equipo${ganaLocal ? " gana" : ""}`}>
                        <span className="torneo-nombre">
                          {local?.emoji ? <span className="torneo-emoji">{local.emoji}</span> : null}
                          {local?.nombre ?? "Por definir"}
                        </span>
                        <span className="torneo-gol">{p.goles_local ?? "–"}</span>
                      </div>
                      <div className={`torneo-equipo${ganaVisitante ? " gana" : ""}`}>
                        <span className="torneo-nombre">
                          {visitante?.emoji ? <span className="torneo-emoji">{visitante.emoji}</span> : null}
                          {visitante?.nombre ?? "Por definir"}
                        </span>
                        <span className="torneo-gol">{p.goles_visitante ?? "–"}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Fundacion({ club, founders }: Pick<ClubContent, "club" | "founders">) {
  const parrafos = (club.fundacion_relato || "").split("\n\n").filter(Boolean);
  const presidente = founders.find((f) => f.es_presidente);
  const resto = founders.filter((f) => !f.es_presidente);
  return (
    <section className="fundacion" id="fundacion">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">01 — Los orígenes</div>
          <h2>La noche del nacimiento</h2>
        </div>
        <div className="fundacion-grid">
          <div className="reveal">
            <div className="doc-card">
              {club.fecha_fundacion ? (
                <div className="fecha-badge">{fmtFecha(club.fecha_fundacion)}</div>
              ) : null}
              {parrafos.map((p, i) => (
                <p key={i}>{i === 0 ? <span className="drop">{p[0]}</span> : null}{i === 0 ? p.slice(1) : p}</p>
              ))}
              {founders.length ? (
                <div className="founders">
                  <h4>Presentes esa noche</h4>
                  <ul className="founders-list">
                    {presidente ? (
                      <li className="pres">
                        {presidente.nombre} — Primer Presidente
                      </li>
                    ) : null}
                    {resto.map((f) => (
                      <li key={f.id}>
                        {f.nombre} {f.apodo ? <span className="apodo">&quot;{f.apodo}&quot;</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
          <figure className="fund-photo reveal">
            {club.fundacion_foto_url ? (
              <img src={club.fundacion_foto_url} alt="Fundadores del club" />
            ) : null}
            {club.fundacion_foto_caption ? <figcaption>{club.fundacion_foto_caption}</figcaption> : null}
          </figure>
        </div>
      </div>
    </section>
  );
}

export function Kits({ club, kits }: Pick<ClubContent, "club" | "kits">) {
  if (!kits.length) return null;
  return (
    <section className="kits" id="camisetas">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">02 — Identidad</div>
          <h2>La evolución de la camiseta</h2>
          {club.kits_intro ? <p>{club.kits_intro}</p> : null}
        </div>
        <div className="kit-track reveal">
          {kits.map((k) => (
            <div className="kit-card" key={k.id}>
              <div className="swatch" style={{ background: k.color_hex || "#999" }} />
              <div className="kimg">{k.imagen_url ? <img src={k.imagen_url} alt={k.nombre} /> : null}</div>
              <div className="kbody">
                <div className="kyear">{k.anio}</div>
                <h4>{k.nombre}</h4>
                {k.descripcion ? <p>{k.descripcion}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Camadas({ club, camadas }: Pick<ClubContent, "club" | "camadas">) {
  if (!camadas.length) return null;
  return (
    <section className="camadas" id="camadas">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">03 — Generaciones</div>
          <h2>Las camadas que hicieron historia</h2>
          {club.camadas_intro ? <p>{club.camadas_intro}</p> : null}
        </div>
        <div className="camada-tabs reveal">
          {camadas.map((c, i) => (
            <button key={c.id} className={`camada-tab${i === 0 ? " active" : ""}`} data-tab={`c-${c.id}`}>
              {c.nombre}
            </button>
          ))}
        </div>
        {camadas.map((c, i) => (
          <div key={c.id} className={`camada-panel reveal${i === 0 ? " active" : ""}`} id={`c-${c.id}`}>
            <div className="camada-photo">{c.imagen_url ? <img src={c.imagen_url} alt={c.nombre} /> : null}</div>
            <div className="camada-info">
              <h3>{c.emoji} {c.nombre}</h3>
              {c.descripcion ? <p className="desc">{c.descripcion}</p> : null}
              <ul className="camada-names">
                {c.camada_jugadores.map((j) => (
                  <li key={j.id}>{j.rol_destacado ? <b>{j.rol_destacado} </b> : null}{j.nombre}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Mistica({
  club,
  anecdotas,
  hermandad,
}: Pick<ClubContent, "club" | "anecdotas" | "hermandad">) {
  return (
    <section className="mistica" id="mistica">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">04 — Mística y comunidad</div>
          <h2>Las historias que se cuentan en cada verbena</h2>
          {club.mistica_intro ? <p>{club.mistica_intro}</p> : null}
        </div>
        {anecdotas.length ? (
          <div className="anecdotas reveal">
            {anecdotas.map((a) => (
              <article className="anecdota" key={a.id}>
                <div className="aimg">{a.imagen_url ? <img src={a.imagen_url} alt={a.titulo} /> : null}</div>
                <div className="abody">
                  {a.tag ? <div className="tag">{a.tag}</div> : null}
                  <h3>{a.titulo}</h3>
                  {a.texto ? <p>{a.texto}</p> : null}
                  {a.cita ? <p className="quote">&quot;{a.cita}&quot;</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {club.hermandad_texto ? (
          <div className="hermandad-strip reveal">
            <div className="eyebrow">Hermandad dentro y fuera de la cancha</div>
            <p style={{ marginTop: 12 }}>{club.hermandad_texto}</p>
            {hermandad.length ? (
              <div className="strip-row">
                {hermandad.map((m) =>
                  m.tipo === "video" ? (
                    <video key={m.id} src={m.url} muted loop playsInline />
                  ) : (
                    <img key={m.id} src={m.url} alt={m.caption || "Comunidad del club"} />
                  )
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function Hitos({ rivales, stats }: Pick<ClubContent, "rivales" | "stats">) {
  if (!rivales.length && !stats.length) return null;
  return (
    <section className="hitos" id="hitos">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">05 — Hitos deportivos</div>
          <h2>Rivalidades que hicieron liga</h2>
        </div>
        <div className="hitos-grid">
          <ul className="rivales reveal">
            {rivales.map((r) => (
              <li key={r.id}>
                <span className="r-label">{r.label}</span>
                <span className="r-names">{r.nombres}</span>
              </li>
            ))}
          </ul>
          {stats[0] ? (
            <div className="stat-card reveal">
              <div className="num">{stats[0].numero}</div>
              <div className="lab">{stats[0].etiqueta}</div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function Actualidad({ club }: Pick<ClubContent, "club">) {
  return (
    <section className="actualidad" id="actualidad">
      <div className="bg">{club.actualidad_bg_url ? <img src={club.actualidad_bg_url} alt="Plantel actual" /> : null}</div>
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">06 — Hoy y mañana</div>
          <h2>El lote propio: un sueño en marcha</h2>
          {club.actualidad_intro ? <p>{club.actualidad_intro}</p> : null}
        </div>
        <div className="act-cols reveal">
          <div>
            <h4>De dónde viene</h4>
            {club.actualidad_de_donde ? <p>{club.actualidad_de_donde}</p> : null}
          </div>
          <div>
            <h4>Hacia dónde va</h4>
            {club.actualidad_hacia_donde ? <p>{club.actualidad_hacia_donde}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Memoria({ club, memoria }: Pick<ClubContent, "club" | "memoria">) {
  if (!memoria.length) return null;
  return (
    <section className="memoria" id="memoria">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">07 — En memoria</div>
          <h2>Los que descansan en paz</h2>
          {club.memoria_intro ? <p>{club.memoria_intro}</p> : null}
        </div>
        <ul className="memoria-list reveal">
          {memoria.map((m) => (
            <li key={m.id}>{m.nombre}</li>
          ))}
        </ul>
        {club.memoria_nota ? <p className="memoria-note reveal">{club.memoria_nota}</p> : null}
      </div>
    </section>
  );
}

export function Testimonios({ testimonios }: Pick<ClubContent, "testimonios">) {
  if (!testimonios.length) return null;
  return (
    <section className="testimonios" id="testimonios">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">Voces del club</div>
          <h2>Testimonios</h2>
        </div>
        <div className="testimonios-grid reveal">
          {testimonios.map((t) => (
            <div className="testimonio-card" key={t.id}>
              {t.tipo === "video" ? <video src={t.url} controls /> : <img src={t.url} alt={t.autor || "Testimonio"} />}
              {t.caption ? <p>&quot;{t.caption}&quot;</p> : null}
              {t.autor ? <div className="autor">{t.autor}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Galeria({ club, galeria }: Pick<ClubContent, "club" | "galeria">) {
  return (
    <section className="galeria" id="galeria">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">08 — Álbum</div>
          <h2>Galería fotográfica</h2>
          {club.galeria_intro ? <p>{club.galeria_intro}</p> : null}
        </div>
        {galeria.length ? (
          <div className="masonry reveal" id="masonry">
            {galeria.map((m) => (
              <figure key={m.id} data-lightbox={m.url} data-lightbox-type={m.tipo}>
                {m.tipo === "video" ? (
                  <>
                    <video src={m.url} muted />
                    <span className="video-badge">Video</span>
                  </>
                ) : (
                  <img src={m.url} alt={m.caption || `Foto histórica de ${club.nombre}`} loading="lazy" />
                )}
              </figure>
            ))}
          </div>
        ) : (
          <p className="empty-hint reveal">Aún no se han subido fotos a la galería. Súbelas desde el panel de administración.</p>
        )}
      </div>
    </section>
  );
}

export function Cta({ club }: Pick<ClubContent, "club">) {
  return (
    <section className="cta">
      <div className="wrap">
        {club.escudo_url ? <img src={club.escudo_url} alt={`Escudo ${club.nombre}`} /> : null}
        {club.cta_titulo ? <h2>{club.cta_titulo}</h2> : null}
        {club.cta_texto ? <p>{club.cta_texto}</p> : null}
      </div>
    </section>
  );
}

export function SiteFooter({ club }: Pick<ClubContent, "club">) {
  return (
    <footer>
      <div className="wrap">
        <div>
          <b>{club.nombre}</b> · Club Deportivo
          {club.fecha_fundacion ? ` · Fundado el ${fmtFecha(club.fecha_fundacion)}` : ""}
        </div>
        <div>Cápsula digital de memoria — v1</div>
      </div>
    </footer>
  );
}

export function Lightbox() {
  return (
    <div className="lightbox" id="lightbox">
      <button className="lightbox-close" id="lightboxClose" aria-label="Cerrar">
        ✕
      </button>
      <img id="lightboxImg" src="" alt="" />
      <video id="lightboxVideo" controls style={{ display: "none" }} />
    </div>
  );
}
