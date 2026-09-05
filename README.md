# Revista digital — Sport Boys San Gregorio

Sistema completo (sitio público + panel de administración) para la cápsula
digital de memoria del Sport Boys de San Gregorio. Reemplaza el prototipo v1
(un solo HTML estático) por una arquitectura real: **Next.js + Supabase**
(Postgres + Auth + Storage), con un admin para subir fotos y videos igual
que en PoliticOS.

Diseñado mono-cliente por ahora, pero con `club_slug` en cada tabla —
migrar a multi-tenant el día que llegue el segundo club es un `ALTER`, no
una reescritura. Ver `supabase/migration.sql` para el detalle.

## Qué incluye

- **Sitio público** (`/`): renderiza el diseño del prototipo v1 (mismos
  tokens de color, tipografías Fraunces/Archivo, scroll reveal, rail de
  progreso, tabs de camadas, lightbox) pero leyendo todo el contenido desde
  Supabase en vez de tenerlo hardcodeado en el HTML.
- **Panel de administración** (`/admin`): login con Supabase Auth, y una
  pantalla por tipo de contenido — la más importante es **Fotos y videos**
  (`/admin/media`), que sube archivos directo a Supabase Storage y los
  publica al instante en la Galería, la tira de Hermandad o Testimonios.
- **Base de datos ya provisionada**: proyecto Supabase `revistas-clubes-sportboys`
  (región `sa-east-1`), con el esquema aplicado y los textos del prototipo
  ya cargados como semilla — solo faltan las fotos/videos reales, que se
  suben desde el admin.

## Puesta en marcha local

```bash
npm install
cp .env.local.example .env.local   # ya trae las credenciales del proyecto Supabase
npm run dev
```

Abre `http://localhost:3000` (sitio público) y `http://localhost:3000/admin` (panel).

## Crear el usuario del admin (una sola vez)

Supabase Auth no viene con un usuario por defecto. Créalo así:

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard/project/izvyxagcahbbogkztxuy/auth/users).
2. **Authentication → Users → Add user → Create new user.**
3. Pon tu email y una contraseña. Marca "Auto Confirm User".
4. Con eso ya puedes entrar a `/admin/login`.

Puedes crear un usuario por cada persona del club que vaya a subir contenido
(dirigente, community manager, etc.) — todos entran al mismo panel.

## Deploy a producción (Vercel)

**Opción rápida — CLI, sin GitHub:**

```bash
npm i -g vercel
vercel login
vercel --prod
```

Cuando pregunte por variables de entorno, o después desde
**Project Settings → Environment Variables**, carga las mismas dos que hay
en `.env.local.example` (para Production, Preview y Development).

**Opción con GitHub (recomendada si vas a vender esto a más clubes):**
sube este repo a GitHub y conéctalo desde vercel.com/new. Cada push a
`main` redeploya solo.

El archivo `.env.production` ya incluye las credenciales del proyecto
Supabase (son públicas por diseño — la clave `anon` está pensada para vivir
en el navegador; el control de acceso real lo hacen las políticas RLS, no
el secreto de esa clave). Si prefieres no tenerlas en el código, bórralo y
cárgalas solo en el dashboard de Vercel.

## Arquitectura de datos

Todas las tablas viven bajo `club_slug = 'sportboys'` (ver `supabase/migration.sql`):

- `club` — fila única con hero, textos de cada sección, colores del escudo.
- `founders`, `kits`, `camadas` + `camada_jugadores`, `anecdotas`, `rivales`,
  `stats_hitos`, `memoria` — el contenido estructurado de cada sección.
- `media_gallery` — fotos y videos, con `seccion` (`hermandad` | `galeria` |
  `testimonios`) y `tipo` (`foto` | `video`). Esta es la tabla que respalda
  la pantalla "Fotos y videos" del admin.

Storage: bucket público `media` en Supabase Storage. Lectura pública,
escritura solo para usuarios autenticados (RLS en `storage.objects`).

## Deuda técnica conocida (léela antes de escalar a más clientes)

- **Next.js 14.2.35**: es la última versión de la rama 14 (con los parches
  de seguridad disponibles para esa rama), pero varias CVEs de Next.js solo
  están resueltas en la rama 16. Para un club de barrio con tráfico bajo el
  riesgo es aceptable; si esto se vende a un cliente con más exposición
  (municipalidad, marca grande), vale la pena migrar a Next 15/16 antes.
- **Reordenar fotos/videos** en el admin usa flechas ↑/↓ (simple y
  confiable). Si con el uso real hace falta arrastrar-y-soltar, es un
  cambio acotado a `MediaManager.tsx`.
- **Un solo rol de admin**: cualquiera con cuenta en Supabase Auth ve todo
  el panel. Si más adelante quieres un admin por club (multi-tenant real),
  hay que añadir una tabla `club_admins` y filtrar por ella en las políticas
  RLS — el `club_slug` ya está listo para eso.
