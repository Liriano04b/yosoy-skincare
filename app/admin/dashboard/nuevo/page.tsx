"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload, Save, X } from "lucide-react";

export default function NuevoProducto() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [howToUse, setHowToUse] = useState("");
  const [skinType, setSkinType] = useState("Todo tipo de piel");
  
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 5) {
        alert("Puedes subir un máximo de 5 fotografías por producto.");
        return;
      }
      setImages((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Por favor, selecciona al menos una fotografía.");
      return;
    }
    setLoading(true);

    try {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const uploaded_urls: string[] = [];

      for (const img of images) {
        const fileExt = img.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(fileName, img);

        if (uploadError) {
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('productos')
          .getPublicUrl(fileName);
          
        uploaded_urls.push(publicUrlData.publicUrl);
      }

      const { error: insertError } = await supabase.from('products').insert([
        {
          name,
          slug,
          brand,
          price: parseFloat(price),
          stock: parseInt(stock),
          description,
          ingredients,
          how_to_use: howToUse,
          skin_type: skinType,
          image_url: uploaded_urls[0], 
          image_urls: uploaded_urls 
        }
      ]);

      if (insertError) {
        throw new Error(`Error al crear producto: ${insertError.message}`);
      }

      alert("¡Producto creado con éxito!");
      window.location.href = "/admin/dashboard";

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => window.location.href = '/admin/dashboard'} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 md:mb-6 transition-colors text-sm md:text-base"
        >
          <ArrowLeft size={20} />
          Volver al inventario
        </button>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Agregar Nuevo Producto</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Completa los detalles y agrega hasta 5 fotografías.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6 md:space-y-8">
            
            {/* FOTOGRAFÍAS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fotografías del Producto (Máx 5)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 md:p-8 text-center hover:bg-gray-50 transition-colors bg-white mb-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="text-gray-400 mb-3" size={32} />
                  <span className="text-sm text-gray-900 font-medium px-2">
                    Toca para seleccionar tus imágenes
                  </span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG (Varias a la vez)</span>
                </label>
              </div>

              {/* Vista previa de las imágenes */}
              {images.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {images.map((file, index) => (
                    <div key={index} className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DATOS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base"
                  placeholder="Ej. Serum de Vitamina C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Marca</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base"
                  placeholder="Ej. Yosoy Skincare"
                />
              </div>
            </div>

            {/* PRECIO, STOCK Y TIPO DE PIEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Precio (RD$)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Inventario Inicial</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base"
                  placeholder="Cantidad"
                />
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Tipo de Piel Recomendada</label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 bg-white text-sm md:text-base"
                >
                  <option value="Todo tipo de piel">Todo tipo de piel</option>
                  <option value="Piel Seca">Piel Seca</option>
                  <option value="Piel Grasa">Piel Grasa</option>
                  <option value="Piel Mixta">Piel Mixta</option>
                  <option value="Piel Sensible">Piel Sensible</option>
                  <option value="Piel con tendencia acnéica">Tendencia acnéica</option>
                </select>
              </div>
            </div>

            {/* DETALLES EXTENSOS (TEXTAREAS) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Descripción Detallada</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base resize-none"
                placeholder="Describe los beneficios principales..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Ingredientes Clave</label>
                <textarea
                  required
                  rows={4}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base resize-none"
                  placeholder="Ej. Ácido Hialurónico al 2%..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Modo de Uso</label>
                <textarea
                  required
                  rows={4}
                  value={howToUse}
                  onChange={(e) => setHowToUse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base resize-none"
                  placeholder="Ej. Aplicar 3 a 4 gotas sobre el rostro limpio..."
                />
              </div>
            </div>

            {/* BOTÓN GUARDAR */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-[#E50000] hover:bg-red-700 text-white px-8 py-3.5 md:py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 shadow-sm disabled:opacity-70 text-base md:text-md"
              >
                {loading ? (
                  "Subiendo fotos y guardando..."
                ) : (
                  <>
                    <Save size={20} />
                    Guardar Producto
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}