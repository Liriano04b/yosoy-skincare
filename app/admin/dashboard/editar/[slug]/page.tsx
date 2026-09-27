"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditarProducto() {
  const params = useParams();
  const router = useRouter();
  const urlParam = params?.slug;

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState(""); // NUEVO: Estado para precio de oferta
  const [stock, setStock] = useState("");
  
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [howToUse, setHowToUse] = useState("");
  const [skinType, setSkinType] = useState("Todo tipo de piel");
  const [category, setCategory] = useState("Serum");
  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (urlParam) {
      fetchProductData();
    }
  }, [urlParam]);

  const fetchProductData = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", urlParam)
      .single();

    if (error) {
      alert("Error al cargar producto: " + error.message);
      return;
    }

    if (data) {
      setId(data.id);
      setName(data.name || "");
      setBrand(data.brand || "");
      setPrice(data.price?.toString() || "");
      setDiscountPrice(data.discount_price?.toString() || "");
      setStock(data.stock?.toString() || "");
      setDescription(data.description || "");
      setIngredients(data.ingredients || "");
      setHowToUse(data.how_to_use || "");
      setSkinType(data.skin_type || "Todo tipo de piel");
      setCategory(data.category || "Serum");

      if (data.image_urls && data.image_urls.length > 0) {
        setExistingImages(data.image_urls);
      } else if (data.image_url) {
        setExistingImages([data.image_url]);
      }
    }
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalImages = existingImages.length + newImages.length + selectedFiles.length;
      if (totalImages > 5) {
        alert("Puedes tener un máximo de 5 fotografías por producto en total.");
        return;
      }
      setNewImages((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingImages.length === 0 && newImages.length === 0) {
      alert("Por favor, mantén o selecciona al menos una fotografía.");
      return;
    }

    setSaving(true);
    try {
      const final_urls: string[] = [...existingImages];

      for (const img of newImages) {
        const fileExt = img.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(fileName, img);

        if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('productos')
          .getPublicUrl(fileName);
          
        final_urls.push(publicUrlData.publicUrl);
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          brand,
          price: parseFloat(price),
          discount_price: discountPrice ? parseFloat(discountPrice) : null,
          stock: parseInt(stock),
          category,
          description,
          ingredients,
          how_to_use: howToUse,
          skin_type: skinType,
          image_url: final_urls[0] || "", 
          image_urls: final_urls 
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Error al actualizar producto: ${updateError.message}`);
      }

      alert("¡Producto actualizado con éxito!");
      router.push("/admin/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando datos del producto...</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/admin/dashboard')} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 md:mb-6 transition-colors text-sm md:text-base"
        >
          <ArrowLeft size={20} />
          Volver al inventario
        </button>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Editar Producto</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Modifica los detalles del producto, gestiona sus fotografías y asigna su clasificación.</p>
          </div>
          <form onSubmit={handleUpdate} className="p-5 md:p-8 space-y-6 md:space-y-8">
            
            {/* FOTOGRAFÍAS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fotografías del Producto (Máx 5 en total)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 md:p-8 text-center hover:bg-gray-50 transition-colors bg-white mb-4">
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="image-upload" disabled={existingImages.length + newImages.length >= 5} />
                <label htmlFor="image-upload" className={`cursor-pointer flex flex-col items-center ${existingImages.length + newImages.length >= 5 ? 'cursor-not-allowed opacity-50' : ''}`}>
                  <Upload className="text-gray-400 mb-3" size={32} />
                  <span className="text-sm text-gray-900 font-medium px-2">
                    {existingImages.length + newImages.length >= 5 ? 'Límite de 5 imágenes alcanzado' : 'Toca para agregar más imágenes'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG (Varias a la vez)</span>
                </label>
              </div>

              {(existingImages.length > 0 || newImages.length > 0) && (
                <div className="flex gap-3 flex-wrap">
                  {existingImages.map((url, index) => (
                    <div key={`exist-${index}`} className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">Guardada</span>
                      <img src={url} alt="Existente" className="w-full h-full object-cover bg-white" />
                      <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md z-10">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {newImages.map((file, index) => (
                    <div key={`new-${index}`} className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-green-200 shadow-sm">
                      <span className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-[9px] text-center py-0.5">Nueva</span>
                      <img src={URL.createObjectURL(file)} alt="Nueva" className="w-full h-full object-cover bg-white" />
                      <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md z-10">
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
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base" placeholder="Ej. Serum de Vitamina C" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Marca</label>
                <input type="text" required value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base" placeholder="Ej. Yosoy Skincare" />
              </div>
            </div>

            {/* PRECIO, OFERTA E INVENTARIO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Precio Regular (RD$)</label>
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Precio Oferta (Opcional)</label>
                <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-[#E50000] placeholder-gray-400 bg-red-50 text-sm md:text-base font-semibold" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Inventario</label>
                <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base" placeholder="Cantidad" />
              </div>
            </div>

            {/* CLASIFICACIÓN Y TIPO DE PIEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Clasificación</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 bg-white text-sm md:text-base">
                  <option value="Limpiador">Limpiador</option>
                  <option value="Tónico">Tónico</option>
                  <option value="Serum">Serum</option>
                  <option value="Crema Hidratante">Crema Hidratante</option>
                  <option value="Protector Solar">Protector Solar</option>
                  <option value="Contorno de Ojos">Contorno de Ojos</option>
                  <option value="Exfoliante">Exfoliante</option>
                  <option value="Mascarilla">Mascarilla</option>
                  <option value="Tratamiento">Tratamiento Específico</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Tipo de Piel</label>
                <select value={skinType} onChange={(e) => setSkinType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 bg-white text-sm md:text-base">
                  <option value="Todo tipo de piel">Todo tipo de piel</option>
                  <option value="Piel Seca">Piel Seca</option>
                  <option value="Piel Grasa">Piel Grasa</option>
                  <option value="Piel Mixta">Piel Mixta</option>
                  <option value="Piel Sensible">Piel Sensible</option>
                  <option value="Piel con tendencia acnéica">Tendencia acnéica</option>
                  <option value="Piel con manchas">Piel con manchas</option>
                  <option value="Linea de expresión">Linea de expresión</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Descripción Detallada</label>
              <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base resize-none" placeholder="Describe los beneficios principales..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Ingredientes Clave</label>
                <textarea required rows={4} value={ingredients} onChange={(e) => setIngredients(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base resize-none" placeholder="Ej. Ácido Hialurónico al 2%..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Modo de Uso</label>
                <textarea required rows={4} value={howToUse} onChange={(e) => setHowToUse(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#E50000] focus:border-transparent outline-none text-gray-900 placeholder-gray-400 bg-white text-sm md:text-base resize-none" placeholder="Ej. Aplicar 3 a 4 gotas sobre el rostro limpio..." />
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={saving} className="w-full md:w-auto bg-[#E50000] hover:bg-red-700 text-white px-8 py-3.5 md:py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 shadow-sm disabled:opacity-70 text-base md:text-md">
                {saving ? "Actualizando..." : <><Save size={20} /> Guardar Cambios</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}