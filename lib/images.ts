import { supabase } from "@/lib/supabase";
import { isSupabaseImage } from "@/lib/config";

const MAX_SIDE = 1400; // píxeles del lado más largo; de sobra para pantallas retina de un catálogo
const QUALITY = 0.85;

// Reduce y comprime una foto antes de subirla. Las fotos de celular pesan 3-8 MB y la tienda
// solo necesita ~100-200 KB. Si algo falla (formato raro, navegador antiguo) se sube la original.
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // Fondo blanco: los PNG con transparencia no deben quedar negros al pasar a JPEG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    // Si no se logró algo más liviano, se queda la original
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

const BUCKET = "productos";
const MARKER = `/${BUCKET}/`;

// Nombre del archivo dentro del bucket a partir de su URL pública (null si no es una foto nuestra).
function fileNameFromUrl(url: string): string | null {
  if (!isSupabaseImage(url)) return null;
  const i = url.indexOf(MARKER);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + MARKER.length).split("?")[0]);
}

// Nombres de todas las fotos que usa algún producto o rutina (consulta fresca a la base de datos).
async function fileNamesInUse(): Promise<Set<string>> {
  const [products, routines] = await Promise.all([
    supabase.from("products").select("image_url, image_urls"),
    supabase.from("routines").select("image_url"),
  ]);
  if (products.error || routines.error) throw new Error("No se pudo revisar qué fotos están en uso.");

  const urls: string[] = [];
  for (const p of products.data ?? []) {
    if (p.image_url) urls.push(p.image_url);
    if (Array.isArray(p.image_urls)) urls.push(...p.image_urls);
  }
  for (const r of routines.data ?? []) {
    if (Array.isArray(r.image_url)) urls.push(...r.image_url);
    else if (typeof r.image_url === "string" && r.image_url) urls.push(r.image_url);
  }
  const names = new Set<string>();
  for (const u of urls) {
    const name = fileNameFromUrl(u);
    if (name) names.add(name);
  }
  return names;
}

// Borra del Storage las fotos indicadas SOLO si ya ninguna fila de la base de datos las usa.
// Es un "mejor esfuerzo": si falla no interrumpe el guardado, a lo sumo queda una foto sin usar.
export async function deleteUnusedImages(urls: (string | null | undefined)[]): Promise<void> {
  try {
    const candidates = urls.map((u) => (u ? fileNameFromUrl(u) : null)).filter((n): n is string => !!n);
    if (candidates.length === 0) return;
    const inUse = await fileNamesInUse();
    const toDelete = [...new Set(candidates)].filter((n) => !inUse.has(n));
    if (toDelete.length > 0) await supabase.storage.from(BUCKET).remove(toDelete);
  } catch {
    // ignorado a propósito (ver comentario arriba)
  }
}

export type OrphanImage = { name: string; size: number };

// Fotos del Storage que ningún producto ni rutina usa. Se ignoran las de la última hora
// por si alguien está subiendo fotos en este momento y aún no ha guardado el formulario.
export async function findOrphanImages(): Promise<OrphanImage[]> {
  const inUse = await fileNamesInUse();
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const orphans: OrphanImage[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(BUCKET).list("", { limit: 1000, offset });
    if (error) throw new Error(`No se pudo listar las fotos: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const f of data) {
      if (!f.id) continue; // carpeta, no archivo
      if (inUse.has(f.name)) continue;
      if (f.created_at && new Date(f.created_at).getTime() > oneHourAgo) continue;
      orphans.push({ name: f.name, size: Number(f.metadata?.size) || 0 });
    }
    if (data.length < 1000) break;
  }
  return orphans;
}

export async function removeImages(names: string[]): Promise<number> {
  let removed = 0;
  for (let i = 0; i < names.length; i += 100) {
    const { data, error } = await supabase.storage.from(BUCKET).remove(names.slice(i, i + 100));
    if (error) throw new Error(`No se pudieron borrar las fotos: ${error.message}`);
    removed += data?.length ?? 0;
  }
  return removed;
}

// Comprime y sube una foto al bucket "productos"; devuelve la URL pública.
export async function uploadImage(file: File, prefix = ""): Promise<string> {
  const ready = await compressImage(file);
  const ext = ready.type === "image/jpeg" ? "jpg" : (ready.name.split(".").pop() || "jpg").toLowerCase();
  const fileName = `${prefix}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("productos").upload(fileName, ready, {
    contentType: ready.type || undefined,
    cacheControl: "31536000", // el nombre es único, así que el navegador puede guardarla un año
  });
  if (error) throw new Error(`Error al subir imagen: ${error.message}`);
  return supabase.storage.from("productos").getPublicUrl(fileName).data.publicUrl;
}
