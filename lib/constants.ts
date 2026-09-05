// Slug fijo del club mientras el producto es mono-cliente. El día que se
// venda a un segundo club, este es el único lugar que cambia por una
// resolución dinámica (subdominio, ruta, etc.) — todo lo demás ya filtra
// por club_slug en las consultas.
export const CLUB_SLUG = "sportboys";
