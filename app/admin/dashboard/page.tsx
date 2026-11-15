"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Package, Plus, Minus, LogOut, Trash2, Edit, Eye, ImageOff, Sparkles, Layers } from "lucide-react";
import Link from "next/link";
import { deleteUnusedImages, findOrphanImages, removeImages } from "@/lib/images";

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string | null;
  image_urls: string[] | null;
};

type AdminRoutine = {
  id: string | number;
  title: string;
  description: string | null;
  skin_type_tag: string | null;
  price: number | null;
  image_url: string | string[] | null;
};

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "routines">("products");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [routines, setRoutines] = useState<AdminRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStockId, setSavingStockId] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);

  // El acceso al panel lo protege app/admin/dashboard/layout.tsx
  const fetchData = useCallback(async () => {
    const [{ data: prodData }, { data: routData }] = await Promise.all([
      supabase.from("products").select("id, slug, name, brand, category, price, discount_price, stock, image_url, image_urls").order("created_at", { ascending: false }),
      supabase.from("routines").select("id, title, description, skin_type_tag, price, image_url").order("created_at", { ascending: false }),
    ]);
    if (prodData) setProducts(prodData as AdminProduct[]);
    if (routData) setRoutines(routData as AdminRoutine[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos externos
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin");
  };

  const handleDeleteProduct = async (product: AdminProduct) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }
    // Sus fotos ya no las usa nadie (si otro producto las compartiera, no se tocan)
    await deleteUnusedImages([product.image_url, ...(product.image_urls ?? [])]);
    fetchData();
  };

  const handleDeleteRoutine = async (routine: AdminRoutine) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta rutina?")) return;
    const { error } = await supabase.from("routines").delete().eq("id", routine.id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }
    await deleteUnusedImages(Array.isArray(routine.image_url) ? routine.image_url : [routine.image_url]);
    fetchData();
  };

  // Borra del Storage las fotos que ningún producto ni rutina usa (restos de pruebas o ediciones antiguas)
  const handleCleanImages = async () => {
    setCleaning(true);
    try {
      const orphans = await findOrphanImages();
      if (orphans.length === 0) {
        alert("No hay fotos sin uso. Todo está limpio.");
        return;
      }
      const kb = Math.round(orphans.reduce((sum, o) => sum + o.size, 0) / 1024);
      const ok = window.confirm(
        `Hay ${orphans.length} foto${orphans.length === 1 ? "" : "s"} (${kb} KB) que ningún producto ni rutina usa.\n\nSe eliminarán para siempre. ¿Continuar?`
      );
      if (!ok) return;
      const removed = await removeImages(orphans.map((o) => o.name));
      alert(`Listo: se eliminaron ${removed} foto${removed === 1 ? "" : "s"} sin uso.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo limpiar las fotos.");
    } finally {
      setCleaning(false);
    }
  };

  // Ajuste rápido de existencias (+1 / -1) sin abrir la pantalla de edición
  const changeStock = async (product: AdminProduct, delta: number) => {
    const next = Math.max(0, product.stock + delta);
    if (next === product.stock || savingStockId) return;
    setSavingStockId(product.id);
    const { error } = await supabase.from("products").update({ stock: next }).eq("id", product.id);
    setSavingStockId(null);
    if (error) {
      alert("No se pudo actualizar el stock: " + error.message);
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: next } : p)));
  };

  const routineImage = (r: AdminRoutine) => (Array.isArray(r.image_url) ? r.image_url[0] : r.image_url);

  const totalProductsCount = products.length;
  const availableProductsCount = products.filter(p => p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const totalUnitsCount = products.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);

  if (loading) return <div className="p-10 text-center text-muted">Cargando panel...</div>;

  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-white border-b border-line px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="text-brand" />
          <span className="font-bold text-ink text-xl">Yosoy Admin</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleCleanImages}
            disabled={cleaning}
            className="flex items-center gap-2 text-muted hover:text-ink transition-colors text-sm disabled:opacity-50"
            title="Borra del almacenamiento las fotos que ningún producto ni rutina usa"
            aria-label="Limpiar fotos sin uso"
          >
            <ImageOff size={18} />
            <span className="hidden sm:inline">{cleaning ? "Revisando..." : "Limpiar fotos sin uso"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted hover:text-ink transition-colors text-sm"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
          
          {/* BOTÓN DINÁMICO CORREGIDO SEGÚN LA PESTAÑA ACTIVA */}
          {activeTab === "products" ? (
            <Link
              href="/admin/dashboard/nuevo"
              className="bg-brand text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand-dark transition-colors shadow-sm text-sm"
            >
              <Plus size={18} />
              Agregar Producto
            </Link>
          ) : (
            <Link
              href="/admin/dashboard/nueva-rutina"
              className="bg-brand text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand-dark transition-colors shadow-sm text-sm"
            >
              <Plus size={18} />
              Agregar Rutina
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex gap-4 mb-8 border-b border-line pb-4">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "products"
                ? "bg-brand text-white shadow-md shadow-brand/25"
                : "bg-white text-muted border border-line hover:border-muted/40"
            }`}
          >
            Inventario de Productos ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("routines")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "routines"
                ? "bg-brand text-white shadow-md shadow-brand/25"
                : "bg-white text-muted border border-line hover:border-muted/40"
            }`}
          >
            <Sparkles size={16} /> Rutinas Publicadas ({routines.length})
          </button>
        </div>

        {/* MÉTRICAS DE PRODUCTOS */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-line shadow-sm">
              <p className="text-sm text-muted font-medium">Tipos de Productos</p>
              <p className="text-3xl font-bold text-ink mt-2">{totalProductsCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-line shadow-sm">
              <p className="text-sm text-muted font-medium">Disponibles</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{availableProductsCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-line shadow-sm">
              <p className="text-sm text-muted font-medium">Agotados</p>
              <p className="text-3xl font-bold text-brand mt-2">{outOfStockCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-line shadow-sm">
              <p className="text-sm text-muted font-medium flex items-center gap-1.5">
                <Layers size={16} className="text-brand" /> Total Artículos (Stock)
              </p>
              <p className="text-3xl font-bold text-ink mt-2">{totalUnitsCount} unds</p>
            </div>
          </div>
        )}

        {/* TABLA DE PRODUCTOS */}
        {activeTab === "products" && (
          <div className="bg-white rounded-xl border border-line shadow-sm overflow-hidden">
            {products.length === 0 ? (
              <div className="p-12 text-center text-muted">No hay productos registrados todavía.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted">
                  <thead className="bg-cream border-b border-line text-ink/80">
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
                      <tr key={product.id} className="hover:bg-cream/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          {product.image_urls?.[0] || product.image_url ? (
                            <img src={(product.image_urls?.[0] || product.image_url) as string} alt={product.name} className="w-10 h-10 rounded-md object-cover border border-line bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-blush/60 flex items-center justify-center text-muted/70 text-[10px]">Sin img</div>
                          )}
                          <div>
                            <p className="font-medium text-ink">{product.name}</p>
                            <p className="text-xs text-muted">{product.brand}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-blush/60 text-ink/80 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                            {product.category || "General"}
                          </span>
                        </td>
                        <td className="p-4">
                          {product.discount_price && product.discount_price > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-brand font-bold">RD${product.discount_price.toLocaleString()}</span>
                              <span className="text-muted/70 line-through text-[11px]">RD${product.price.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-ink font-medium">RD${product.price.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => changeStock(product, -1)}
                              disabled={product.stock <= 0 || savingStockId === product.id}
                              className="rounded-md border border-line p-1.5 text-muted hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Quitar una unidad de ${product.name}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className={`min-w-[4.5rem] rounded-full px-3 py-1 text-center text-xs font-bold ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-brand-soft text-brand'}`}>
                              {product.stock > 0 ? `${product.stock} unds` : 'AGOTADO'}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeStock(product, 1)}
                              disabled={savingStockId === product.id}
                              className="rounded-md border border-line p-1.5 text-muted hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Agregar una unidad de ${product.name}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 flex justify-center items-center gap-1">
                          <Link
                            href={`/producto/${product.slug}`}
                            target="_blank"
                            rel="noopener"
                            className="text-muted/70 hover:text-brand transition-colors p-2 rounded-md hover:bg-brand-soft"
                            title="Ver producto en la tienda"
                            aria-label={`Ver ${product.name} en la tienda`}
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            onClick={() => router.push(`/admin/dashboard/editar/${product.slug}`)}
                            className="text-muted/70 hover:text-sage transition-colors p-2 rounded-md hover:bg-sage-soft"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product)}
                            className="text-muted/70 hover:text-brand transition-colors p-2 rounded-md hover:bg-brand-soft"
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
          <div className="bg-white rounded-xl border border-line shadow-sm overflow-hidden">
            {routines.length === 0 ? (
              <div className="p-12 text-center text-muted">No hay rutinas registradas todavía. Haz clic en &ldquo;Agregar Rutina&rdquo;.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted">
                  <thead className="bg-cream border-b border-line text-ink/80">
                    <tr>
                      <th className="p-4 font-medium">Rutina / Kit</th>
                      <th className="p-4 font-medium">Tipo de Piel</th>
                      <th className="p-4 font-medium">Precio del Kit</th>
                      <th className="p-4 font-medium text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {routines.map((routine) => (
                      <tr key={routine.id} className="hover:bg-cream/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          {routineImage(routine) ? (
                            <img src={routineImage(routine) as string} alt={routine.title} className="w-10 h-10 rounded-md object-cover border border-line bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-blush/60 flex items-center justify-center text-muted/70 text-[10px]">Sin img</div>
                          )}
                          <div>
                            <p className="font-medium text-ink">{routine.title}</p>
                            <p className="text-xs text-muted line-clamp-1">{routine.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-sage-soft text-sage px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                            {routine.skin_type_tag || "General"}
                          </span>
                        </td>
                        <td className="p-4 font-extrabold text-ink">
                          RD${routine.price?.toLocaleString()}
                        </td>
                        <td className="p-4 flex justify-center items-center gap-1">
                          <button
                            onClick={() => router.push(`/admin/dashboard/editar-rutina/${routine.id}`)}
                            className="text-muted/70 hover:text-sage transition-colors p-2 rounded-md hover:bg-sage-soft"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteRoutine(routine)}
                            className="text-muted/70 hover:text-brand transition-colors p-2 rounded-md hover:bg-brand-soft"
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