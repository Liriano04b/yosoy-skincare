"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Plus, LogOut, Trash2, Edit, Sparkles, Layers } from "lucide-react";
import Link from "next/link"; // Asegúrate de importar Link si no lo tienes

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"products" | "routines">("products");
  const [products, setProducts] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "/admin";
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: prodData } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    const { data: routData } = await supabase
      .from("routines")
      .select("*")
      .order("created_at", { ascending: false });

    if (prodData) setProducts(prodData);
    if (routData) setRoutines(routData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Error al eliminar: " + error.message);
    else fetchData();
  };

  const handleDeleteRoutine = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta rutina?")) return;
    const { error } = await supabase.from("routines").delete().eq("id", id);
    if (error) alert("Error al eliminar: " + error.message);
    else fetchData();
  };

  const totalProductsCount = products.length;
  const availableProductsCount = products.filter(p => p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const totalUnitsCount = products.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);

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
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
          
          {/* BOTÓN DINÁMICO CORREGIDO SEGÚN LA PESTAÑA ACTIVA */}
          {activeTab === "products" ? (
            <Link
              href="/admin/dashboard/nuevo"
              className="bg-[#E50000] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm text-sm"
            >
              <Plus size={18} />
              Agregar Producto
            </Link>
          ) : (
            <Link
              href="/admin/dashboard/nueva-rutina"
              className="bg-[#E50000] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm text-sm"
            >
              <Plus size={18} />
              Agregar Rutina
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "products"
                ? "bg-[#E50000] text-white shadow-md shadow-red-200"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            Inventario de Productos ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("routines")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "routines"
                ? "bg-[#E50000] text-white shadow-md shadow-red-200"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <Sparkles size={16} /> Rutinas Publicadas ({routines.length})
          </button>
        </div>

        {/* MÉTRICAS DE PRODUCTOS */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Tipos de Productos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalProductsCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Disponibles</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{availableProductsCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Agotados</p>
              <p className="text-3xl font-bold text-[#E50000] mt-2">{outOfStockCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                <Layers size={16} className="text-[#E50000]" /> Total Artículos (Stock)
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalUnitsCount} unds</p>
            </div>
          </div>
        )}

        {/* TABLA DE PRODUCTOS */}
        {activeTab === "products" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {products.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No hay productos registrados todavía.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
                    <tr>
                      <th className="p-4 font-medium">Producto</th>
                      <th className="p-4 font-medium">Categoría</th>
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
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                            {product.category || "General"}
                          </span>
                        </td>
                        <td className="p-4">
                          {product.discount_price && product.discount_price > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-[#E50000] font-bold">RD${product.discount_price.toLocaleString()}</span>
                              <span className="text-gray-400 line-through text-[11px]">RD${product.price.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-900 font-medium">RD${product.price.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-[#E50000]'}`}>
                            {product.stock > 0 ? `${product.stock} unds` : 'AGOTADO'}
                          </span>
                        </td>
                        <td className="p-4 flex justify-center items-center gap-1">
                          <button 
                            onClick={() => window.location.href = `/admin/dashboard/editar/${product.slug}`}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-gray-400 hover:text-[#E50000] transition-colors p-2 rounded-md hover:bg-red-50"
                            title="Eliminar"
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
        )}

        {/* TABLA DE RUTINAS */}
        {activeTab === "routines" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {routines.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No hay rutinas registradas todavía. Haz clic en "Agregar Rutina".</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
                    <tr>
                      <th className="p-4 font-medium">Rutina / Kit</th>
                      <th className="p-4 font-medium">Tipo de Piel</th>
                      <th className="p-4 font-medium">Precio del Kit</th>
                      <th className="p-4 font-medium text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {routines.map((routine) => (
                      <tr key={routine.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          {routine.image_url ? (
                            <img src={routine.image_url} alt={routine.title} className="w-10 h-10 rounded-md object-cover border border-gray-200 bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">Sin img</div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{routine.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{routine.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                            {routine.skin_type_tag || "General"}
                          </span>
                        </td>
                        <td className="p-4 font-extrabold text-gray-900">
                          RD${routine.price?.toLocaleString()}
                        </td>
                        <td className="p-4 flex justify-center items-center gap-1">
                          <button 
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="text-gray-400 hover:text-[#E50000] transition-colors p-2 rounded-md hover:bg-red-50"
                            title="Eliminar"
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
        )}
      </main>
    </div>
  );
}