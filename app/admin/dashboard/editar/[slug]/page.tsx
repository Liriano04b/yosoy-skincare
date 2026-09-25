"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditarProducto() {
  const params = useParams();
  const router = useRouter();
  const urlParam = params?.slug;

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [howToUse, setHowToUse] = useState("");
  const [skinType, setSkinType] = useState("Todo tipo de piel");
  
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
      setStock(data.stock?.toString() || "");
      setDescription(data.description || "");
      setIngredients(data.ingredients || "");
      setHowToUse(data.how_to_use || "");
      setSkinType(data.skin_type || "Todo tipo de piel");
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          brand,
          price: parseFloat(price),
          stock: parseInt(stock),
          description,
          ingredients,
          how_to_use: howToUse,
          skin_type: skinType,
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
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/admin/dashboard')} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver al inventario
        </button>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h1 className="text-xl font-bold text-gray-900">Editar Producto</h1>
            <p className="text-sm text-gray-500 mt-1">Modifica los detalles del producto. (La edición de fotos se añadirá en el futuro)</p>
          </div>

          <form onSubmit={handleUpdate} className="p-8 space-y-8">
            {/* DATOS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                <input type="text" required value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* PRECIO, STOCK Y TIPO DE PIEL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio (RD$)</label>
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inventario</label>
                <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Piel</label>
                <select value={skinType} onChange={(e) => setSkinType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción Detallada</label>
              <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes Clave</label>
                <textarea required rows={4} value={ingredients} onChange={(e) => setIngredients(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Uso</label>
                <textarea required rows={4} value={howToUse} onChange={(e) => setHowToUse(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* BOTÓN GUARDAR */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70">
                {saving ? "Guardando cambios..." : <><Save size={20} /> Actualizar Producto</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}