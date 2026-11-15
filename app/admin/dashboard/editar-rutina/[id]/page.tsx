"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload, Save, X } from "lucide-react";
import ProductPicker from "@/components/admin/ProductPicker";
import { uploadImage } from "@/lib/images";

export default function EditarRutina() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [title, setTitle] = useState("");
  const [skinTypeTag, setSkinTypeTag] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [steps, setSteps] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  
  // Imágenes existentes en la base de datos y nuevas a subir
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchRoutineData = async () => {
      const { data } = await supabase
        .from("routines")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitle(data.title || "");
        setSkinTypeTag(data.skin_type_tag || "");
        setDescription(data.description || "");
        setPrice(data.price ? data.price.toString() : "");
        setSteps(data.steps || "");
        setProductIds(data.product_ids ?? []);

        // Manejamos si las imágenes son un array o un string único
        if (Array.isArray(data.image_url)) {
          setExistingImages(data.image_url);
        } else if (typeof data.image_url === "string" && data.image_url) {
          setExistingImages([data.image_url]);
        }
      } else {
        alert("No se encontró la rutina.");
        router.push("/admin/dashboard");
      }
      setFetching(false);
    };
    fetchRoutineData();
  }, [id, router]);

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImageFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalImagesList = [...existingImages];

      // Subimos las nuevas imágenes añadidas al bucket de Supabase
      for (const file of newImageFiles) {
        finalImagesList.push(await uploadImage(file, "routine_"));
      }

      // Actualizamos el registro en la tabla routines
      const { error: updateError } = await supabase
        .from('routines')
        .update({
          title,
          skin_type_tag: skinTypeTag,
          description,
          price: parseFloat(price),
          steps,
          product_ids: productIds,
          image_url: finalImagesList // Guardamos la lista actualizada de imágenes
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Error al actualizar rutina: ${updateError.message}`);
      }

      alert("¡Rutina actualizada con éxito!");
      router.push("/admin/dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo guardar la rutina.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-muted">Cargando datos de la rutina...</div>;
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center gap-2 text-muted hover:text-ink mb-4 md:mb-6 transition-colors text-sm md:text-base"
        >
          <ArrowLeft size={20} />
          Volver al panel
        </button>

        <div className="bg-white rounded-xl border border-line shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-line bg-white">
            <h1 className="text-lg md:text-xl font-bold text-ink">Editar Rutina / Kit</h1>
            <p className="text-xs md:text-sm text-muted mt-1">Modifica los detalles, pasos o gestiona las fotografías del kit.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6">
            
            {/* GESTIÓN DE IMÁGENES */}
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-2">Fotografías del Kit</label>
              
              {/* Imágenes actuales guardadas */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted/70 uppercase font-semibold mb-2">Imágenes actuales:</p>
                  <div className="flex gap-3 flex-wrap">
                    {existingImages.map((url, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-line bg-cream">
                        <img src={url} alt={`Actual ${index}`} className="w-full h-full object-contain mix-blend-multiply" />
                        <button 
                          type="button" 
                          onClick={() => removeExistingImage(index)} 
                          className="absolute top-1 right-1 bg-brand text-white rounded-full p-1 shadow hover:bg-brand-dark transition-colors"
                          title="Eliminar imagen"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input para agregar nuevas fotos */}
              <div className="border-2 border-dashed border-line rounded-xl p-6 text-center hover:bg-cream transition-colors bg-white mb-3">
                <input type="file" accept="image/*" multiple onChange={handleNewImageChange} className="hidden" id="edit-routine-images" />
                <label htmlFor="edit-routine-images" className="cursor-pointer flex flex-col items-center">
                  <Upload className="text-muted/70 mb-2" size={28} />
                  <span className="text-sm text-ink font-medium">Agregar más fotografías</span>
                </label>
              </div>

              {/* Vista previa de nuevas imágenes seleccionadas */}
              {newImageFiles.length > 0 && (
                <div>
                  <p className="text-xs text-muted/70 uppercase font-semibold mb-2">Nuevas imágenes a subir:</p>
                  <div className="flex gap-3 flex-wrap">
                    {newImageFiles.map((file, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-line">
                        <img src={URL.createObjectURL(file)} alt={`Nuevo ${index}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-brand text-white rounded-full p-1 shadow">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Título de la Rutina</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full border border-muted/30 rounded-lg px-4 py-2.5 outline-none text-ink focus:ring-2 focus:ring-brand" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Etiqueta de Piel</label>
                <input 
                  type="text" 
                  required 
                  value={skinTypeTag} 
                  onChange={(e) => setSkinTypeTag(e.target.value)} 
                  className="w-full border border-muted/30 rounded-lg px-4 py-2.5 outline-none text-ink focus:ring-2 focus:ring-brand" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Precio del Kit (RD$)</label>
              <input 
                type="number" 
                required 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="w-full border border-muted/30 rounded-lg px-4 py-2.5 outline-none text-ink focus:ring-2 focus:ring-brand" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Descripción Breve</label>
              <textarea 
                rows={2} 
                required 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full border border-muted/30 rounded-lg px-4 py-2.5 outline-none text-ink focus:ring-2 focus:ring-brand resize-none" 
              />
            </div>

            <ProductPicker value={productIds} onChange={setProductIds} />

            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Pasos Detallados</label>
              <textarea 
                rows={6} 
                required 
                value={steps} 
                onChange={(e) => setSteps(e.target.value)} 
                className="w-full border border-muted/30 rounded-lg px-4 py-3 outline-none text-ink focus:ring-2 focus:ring-brand resize-none" 
              />
            </div>

            <div className="pt-4 border-t border-line flex justify-end">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full md:w-auto bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 shadow-sm disabled:opacity-70"
              >
                {loading ? "Actualizando..." : <><Save size={20} /> Guardar Cambios</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}