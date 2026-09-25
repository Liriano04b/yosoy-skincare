"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Plus, LogOut, Trash2, Edit } from "lucide-react";

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "/admin";
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto permanentemente?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      fetchProducts();
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando panel...</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="text-[#E50000]" />
          <span className="font-bold text-gray-900 text-xl">Yosoy Admin</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
          
          <button
            onClick={() => window.location.href = "/admin/dashboard/nuevo"}
            className="bg-[#E50000] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Agregar Producto
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Total Productos</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Disponibles</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {products.filter(p => p.stock > 0).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Agotados</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {products.filter(p => p.stock === 0).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No hay productos registrados todavía. Haz clic en "Agregar Producto" para comenzar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
                  <tr>
                    <th className="p-4 font-medium">Producto</th>
                    <th className="p-4 font-medium">Precio</th>
                    <th className="p-4 font-medium">Stock</th>
                    <th className="p-4 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        {product.image_urls?.[0] || product.image_url ? (
                          <img src={product.image_urls?.[0] || product.image_url} alt={product.name} className="w-10 h-10 rounded-md object-cover border border-gray-200 bg-white" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">Sin img</div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                        </div>
                      </td>
                      <td className="p-4">RD${product.price.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                          {product.stock} unds
                        </span>
                      </td>
                      <td className="p-4 flex justify-center items-center gap-1">
                        <button 
                          onClick={() => window.location.href = `/admin/dashboard/editar/${product.slug}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                          title="Editar producto"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.image_url)}
                          className="text-gray-400 hover:text-[#E50000] transition-colors p-2 rounded-md hover:bg-red-50"
                          title="Eliminar producto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}