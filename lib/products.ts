// Tipos y utilidades de producto compartidas entre páginas de servidor y componentes de cliente.

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string | null;
  image_urls: string[] | null;
};

export type Product = CardProduct & {
  description: string | null;
  ingredients: string | null;
  how_to_use: string | null;
  skin_types: string[] | null;
  concerns: string[] | null;
};

export const PRODUCT_COLUMNS =
  "id, slug, name, brand, category, price, discount_price, stock, image_url, image_urls, description, ingredients, how_to_use, skin_types, concerns";

// Porcentaje de descuento real, calculado con los dos precios guardados.
export function discountPercent(price: number, discount: number | null): number {
  if (!discount || discount <= 0 || discount >= price) return 0;
  return Math.round((1 - discount / price) * 100);
}

// Precio que paga la clienta hoy: el de oferta si es real, si no el normal.
export function effectivePrice(price: number, discount: number | null): number {
  return discountPercent(price, discount) > 0 ? Number(discount) : Number(price);
}
