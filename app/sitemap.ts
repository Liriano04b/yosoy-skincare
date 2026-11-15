import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/config";

// Se actualiza solo cada hora: un producto nuevo aparece en el mapa del sitio sin tocar nada
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalogo`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/descubre-tu-piel`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/rutinas`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const { data } = await supabase.from("products").select("slug, created_at").not("slug", "is", null);
    const products: MetadataRoute.Sitemap = (data ?? []).map((p) => ({
      url: `${SITE_URL}/producto/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...pages, ...products];
  } catch {
    return pages;
  }
}
