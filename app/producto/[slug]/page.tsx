import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { PRODUCT_COLUMNS, effectivePrice, type Product } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import ProductView from "./ProductView";

// Se genera en el servidor y se refresca cada 5 minutos; el precio en pantalla se vuelve a pedir al abrir
export const revalidate = 300;

// Los productos existentes se preparan de antemano; uno nuevo se genera la primera vez que alguien lo abre
export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("products").select("slug").not("slug", "is", null);
    return (data ?? []).map((p) => ({ slug: p.slug as string }));
  } catch {
    return [];
  }
}

// metadata y página comparten la misma consulta
// `failed` distingue "no existe" (se responde 404) de "Supabase no respondió" (la página carga y reintenta en el navegador)
const getProduct = cache(async (slug: string): Promise<{ product: Product | null; failed: boolean }> => {
  try {
    const { data, error } = await supabase.from("products").select(PRODUCT_COLUMNS).eq("slug", slug).maybeSingle();
    if (error) return { product: null, failed: true };
    return { product: (data as Product) ?? null, failed: false };
  } catch {
    return { product: null, failed: true };
  }
});

const money = (n: number) => `RD$${Number(n).toLocaleString("en-US")}`;
const currentPrice = (p: Product) => effectivePrice(p.price, p.discount_price);

// Las descripciones usan emojis (✨) como viñetas: para buscadores se convierten en frases separadas
function plainText(text: string | null): string {
  return (text ?? "")
    .split(/\p{Extended_Pictographic}️?/u)
    .map((part) => part.replace(/\s+/g, " ").trim().replace(/[.;,:]+$/, ""))
    .filter(Boolean)
    .join(". ")
    .replace(/(?<=\S)$/, ".");
}

// Texto corto para buscadores y vistas previas: la descripción recortada en una frase completa
function summary(p: Product): string {
  const base = plainText(p.description);
  const intro = `${p.name}${p.brand ? ` de ${p.brand}` : ""} a ${money(currentPrice(p))}.`;
  if (!base) return `${intro} Envíos a todo el país y pedido por WhatsApp.`;
  const text = `${intro} ${base}`;
  return text.length <= 158 ? text : `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado", robots: { index: false } };

  const image = product.image_urls?.[0] || product.image_url;
  const description = summary(product);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "es_DO",
      url: `/producto/${product.slug}`,
      title: product.name,
      description,
      // Sin foto del producto se usa la imagen por defecto de la tienda
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    twitter: { card: "summary_large_image", title: product.name, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product, failed } = await getProduct(slug);
  if (!product && !failed) notFound();

  // Datos estructurados para Google (solo datos reales: no hay reseñas, por eso no se declara valoración)
  const jsonLd = product && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: plainText(product.description) || undefined,
    image: [product.image_urls?.[0] || product.image_url].filter(Boolean),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category || undefined,
    url: `${SITE_URL}/producto/${product.slug}`,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.slug}`,
      priceCurrency: "DOP",
      price: currentPrice(product),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <ProductView key={slug} initialProduct={product} />
    </>
  );
}
