"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload, Save, X } from "lucide-react";

export default function EditarRutina() {
  const params = useParams();
  const id = params?.id;

  const [title, setTitle] = useState("");
  const [skinTypeTag, setSkinTypeTag] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [steps, setSteps] = useState("");
  
  // Imágenes existentes en la base de datos y nuevas a subir
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRoutineData();
    }
  }, [id]);

  const fetchRoutineData = async () => {
    const { data, error } = await supabase
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

      // Manejamos si las imágenes son un array o un string único
      if (Array.isArray(data.image_url)) {
        setExistingImages(data.image_url);
      } else if (typeof data.image_url === "string" && data.image_url) {
        setExistingImages([data.image_url]);
      }
    } else {
      alert("No se encontró la rutina.");
      window.location.href = "/admin/dashboard";
    }
    setFetching(false);
  };

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
        const fileExt = file.name.split('.').pop();
        const fileName = `routine_${Math.random()}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('productos')
          .getPublicUrl(fileName);
          
        finalImagesList.push(publicUrlData.publicUrl);
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
          image_url: finalImagesList // Guardamos la lista actualizada de imágenes
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Error al actualizar rutina: ${updateError.message}`);
      }

      alert("¡Rutina actualizada con éxito!");
      window.location.href = "/admin/dashboard";
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-gray-500">Cargando datos de la rutina...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => window.location.href = '/admin/dashboard'} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 md:mb-6 transition-colors text-sm md:text-base"
        >
          <ArrowLeft size={20} />
          Volver al panel
        </button>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Editar Rutina / Kit</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Modifica los detalles, pasos o gestiona las fotografías del kit.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6">
            
            {/* GESTIÓN DE IMÁGENES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fotografías del Kit</label>
              
              {/* Imágenes actuales guardadas */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Imágenes actuales:</p>
                  <div className="flex gap-3 flex-wrap">
                    {existingImages.map((url, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={url} alt={`Actual ${index}`} className="w-full h-full object-contain mix-blend-multiply" />
                        <button 
                          type="button" 
                          onClick={() => removeExistingImage(index)} 
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-700 transition-colors"
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
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors bg-white mb-3">
                <input type="file" accept="image/*" multiple onChange={handleNewImageChange} className="hidden" id="edit-routine-images" />
                <label htmlFor="edit-routine-images" className="cursor-pointer flex flex-col items-center">
                  <Upload className="text-gray-400 mb-2" size={28} />
                  <span className="text-sm text-gray-900 font-medium">Agregar más fotografías</span>
                </label>
              </div>

              {/* Vista previa de nuevas imágenes seleccionadas */}
              {newImageFiles.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Nuevas imágenes a subir:</p>
                  <div className="flex gap-3 flex-wrap">
                    {newImageFiles.map((file, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img src={URL.createObjectURL(file)} alt={`Nuevo ${index}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Rutina</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 focus:ring-2 focus:ring-[#E50000]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta de Piel</label>
                <input 
                  type="text" 
                  required 
                  value={skinTypeTag} 
                  onChange={(e) => setSkinTypeTag(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 focus:ring-2 focus:ring-[#E50000]" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio del Kit (RD$)</label>
              <input 
                type="number" 
                required 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 focus:ring-2 focus:ring-[#E50000]" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Breve</label>
              <textarea 
                rows={2} 
                required 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 focus:ring-2 focus:ring-[#E50000] resize-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pasos Detallados</label>
              <textarea 
                rows={6} 
                required 
                value={steps} 
                onChange={(e) => setSteps(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none text-gray-900 focus:ring-2 focus:ring-[#E50000] resize-none" 
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full md:w-auto bg-[#E50000] hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 shadow-sm disabled:opacity-70"
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