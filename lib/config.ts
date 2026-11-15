// Configuración única del negocio. Si cambia el número de WhatsApp, se cambia solo aquí.
export const WHATSAPP_NUMBER = "18299183389";

// Cómo se muestra el número en pantalla (+1 829 918 3389)
export const WHATSAPP_DISPLAY = "+1 (829) 918-3389";

export const INSTAGRAM_HANDLE = "yosoy_skin";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

// Información de envíos y pagos (la usan el encabezado, el pie y otras secciones)
export const SHIPPING = {
  santoDomingo: "Santo Domingo: entrega el mismo día",
  nacional: "Resto del país: 1 a 2 días por Vimenpaq",
  announcement: "Envíos a todo el país · Santo Domingo el mismo día",
};
export const PAYMENT_METHODS = "Efectivo o transferencia bancaria";

// Construye el enlace de WhatsApp con el mensaje bien codificado
// (nombres con &, #, + o tildes ya no cortan el mensaje).
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const SITE_NAME = "Yosoy Skincare";

// Dirección pública de la tienda (enlaces compartidos, sitemap, SEO). En producción se define con
// NEXT_PUBLIC_SITE_URL; si no existe se usa la que entrega Vercel, y en local localhost.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

// Imagen de respaldo cuando un producto no tiene foto.
export const PLACEHOLDER_IMAGE = "/placeholder.svg";

// ¿La URL es una foto de nuestro Storage de Supabase? Solo esas se optimizan con next/image.
export const isSupabaseImage = (url: string) => url.includes(".supabase.co/storage/");
