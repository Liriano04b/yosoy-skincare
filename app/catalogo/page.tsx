"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function Catalogo() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navegación Superior */}
      <nav className="bg-white border-b border-gray-100 p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#E50000] transition-colors font-medium">
            <ArrowLeft size={20} /> Volver al Inicio
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Catálogo <span className="text-[#E50000]">Yosoy Skincare</span>
          </h1>
        </div>
      </nav>

      {/* Catálogo Individual de Productos */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-10 border-b border-gray-100 pb-4">
          <ShoppingBag className="text-[#E50000]" size={28} />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Todos los productos</h2>
            <p className="text-gray-500 mt-1">Explora nuestro inventario disponible</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12 font-medium">Cargando catálogo...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-12 font-medium">No hay productos disponibles por el momento.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link href={`/producto/${product.slug}`} key={product.id} className="group cursor-pointer">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                  
                  <div className="aspect-square bg-[#FAFAFA] p-6 flex items-center justify-center relative overflow-hidden border-b border-gray-50">
                    <img 
                      src={product.image_urls?.[0] || product.image_url} 
                      alt={product.name} 
                      className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.skin_type && (
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#E50000] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-gray-100 uppercase tracking-wider">
                        {product.skin_type}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {product.brand}
                    </p>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-[#E50000] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xl font-extrabold text-gray-900">
                      RD${product.price.toLocaleString()}
                    </p>
                  </div>
                  
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}