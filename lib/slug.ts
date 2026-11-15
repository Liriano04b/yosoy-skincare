import { supabase } from "@/lib/supabase";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Devuelve un slug que todavía no usa ningún producto: "serum-x", y si existe, "serum-x-2", "serum-x-3"...
export async function uniqueProductSlug(name: string): Promise<string> {
  const base = slugify(name) || "producto";
  const { data, error } = await supabase.from("products").select("slug").like("slug", `${base}%`);
  if (error) throw new Error(`No se pudo comprobar el nombre del producto: ${error.message}`);
  const taken = new Set((data ?? []).map((p) => p.slug as string));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
