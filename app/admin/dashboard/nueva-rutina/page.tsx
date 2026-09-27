"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload, Save, X } from "lucide-react";

export default function NuevaRutina() {
  const [title, setTitle] = useState("");
  const [skinTypeTag, setSkinTypeTag] = useState("Piel Seca o Deshidratada");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [steps, setSteps] = useState("");
  
  // Cambiado a un arreglo para soportar múltiples archivos
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedUrls: string[] = [];

      // Subimos cada imagen seleccionada al bucket
      for (const file of imageFiles) {
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
          
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // Guardamos la rutina con el arreglo de URLs en Supabase
      const { error: insertError } = await supabase.from('routines').insert([
        {
          title,
          skin_type_tag: skinTypeTag,
          description,
          price: parseFloat(price),
          steps,
          image_url: uploadedUrls // Guardamos el arreglo completo
        }
      ]);

      if (insertError) {
        throw new Error(`Error al crear rutina: ${insertError.message}`);
      }

      alert("¡Rutina creada con éxito!");
      window.location.href = "/admin/dashboard";
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Agregar Nueva Rutina / Kit</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Crea una guía paso a paso y sube una o varias fotos del kit.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6">
            
            {/* SECCIÓN DE MÚLTIPLES IMÁGENES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fotografías del Kit / Rutina (Puedes subir varias)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors bg-white mb-3">
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="routine-images" />
                <label htmlFor="routine-images" className="cursor-pointer flex flex-col items-center">
                  <Upload className="text-gray-400 mb-2" size={28} />
                  <span className="text-sm text-gray-900 font-medium">Toca para seleccionar una o más fotos</span>
                </label>
              </div>

              {imageFiles.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-3">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
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
                  placeholder="Ej. Rutina Hidratación Profunda" 
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
                  placeholder="Ej. Piel Seca o Deshidratada" 
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
                placeholder="Ej. 4500" 
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
                placeholder="Breve resumen de los beneficios..." 
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
                placeholder="1. Limpieza: Usar gel suave...&#10;2. Tónico: Aplicar dando palmaditas..." 
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full md:w-auto bg-[#E50000] hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 shadow-sm disabled:opacity-70"
              >
                {loading ? "Guardando rutina..." : <><Save size={20} /> Guardar Rutina</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}