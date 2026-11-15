import { supabase } from "@/lib/supabase";

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
