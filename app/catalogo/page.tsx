"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Filter } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Catalogo() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ACTUALIZADO: Ahora es un arreglo que guarda múltiples categorías
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const { addToCart } = useCart(); 

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

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    if (product.stock <= 0) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.discount_price ? product.discount_price : product.price,
      image_url: product.image_urls?.[0] || product.image_url || "/placeholder.jpg"
    });
  };

  // Función para agregar o quitar una categoría de la selección
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => 
      prev.includes(category)
        ? prev.filter((c) => c !== category) // Si ya está, la quita
        : [...prev, category] // Si no está, la agrega
    );
  };

  // Extraemos las categorías únicas (quitando "Todos" para manejarlo manualmente)
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Filtramos: Si el arreglo está vacío, mostramos todos; si no, vemos si la categoría está en el arreglo
  const filteredProducts = selectedCategories.length === 0 
    ? products 
    : products.filter(p => selectedCategories.includes(p.category));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-white border-b border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#E50000] transition-colors font-medium">
            <ArrowLeft size={20} /> Volver al Inicio
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Catálogo <span className="text-[#E50000]">Yosoy Skincare</span>
          </h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-[#E50000]" size={28} />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Todos los productos</h2>
              <p className="text-gray-500 mt-1">Explora nuestro inventario disponible</p>
            </div>
          </div>
        </div>

        {!loading && products.length > 0 && (
          <div className="mb-10 flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex items-center gap-2 text-gray-400 font-medium pl-1 pr-2">
              <Filter size={18} />
              <span className="text-sm uppercase tracking-wider">Filtros</span>
            </div>
            
            <div className="flex gap-3">
              {/* Botón "Todos" (se activa cuando no hay ninguna categoría seleccionada) */}
              <button
                onClick={() => setSelectedCategories([])}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  selectedCategories.length === 0
                    ? "bg-[#E50000] text-white shadow-md shadow-red-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#E50000] hover:text-[#E50000]"
                }`}
              >
                Todos
              </button>

              {/* Botones de Categorías Dinámicas */}
              {categories.map((category) => (
                <button
                  key={category as string}
                  onClick={() => toggleCategory(category as string)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    selectedCategories.includes(category as string)
                      ? "bg-[#E50000] text-white shadow-md shadow-red-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#E50000] hover:text-[#E50000]"
                  }`}
                >
                  {category as string}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-12 font-medium">Cargando catálogo...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500 font-medium text-lg">No hay productos que coincidan con estos filtros.</p>
            <button 
              onClick={() => setSelectedCategories([])}
              className="mt-4 text-[#E50000] font-bold hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const isOutofStock = product.stock <= 0;
              const hasDiscount = product.discount_price && product.discount_price > 0 && !isOutofStock;

              return (
                <Link href={`/producto/${product.slug}`} key={product.id} className="group cursor-pointer">
                  {/* Se quitó la opacidad general de la tarjeta para que se vea más nítida */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col">
                    
                    <div className="aspect-square bg-[#FAFAFA] p-6 flex items-center justify-center relative overflow-hidden border-b border-gray-50">
                      <img 
                        src={product.image_urls?.[0] || product.image_url} 
                        alt={product.name} 
                        // Se quitó el "grayscale" y se subió la opacidad a 80 para que la imagen se vea bien
                        className={`max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 ${isOutofStock ? 'opacity-80' : 'group-hover:scale-105'}`}
                      />
                      
                      {/* Nueva etiqueta roja de AGOTADO sin el fondo borroso */}
                      {isOutofStock && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                          <span className="bg-[#E50000] text-white font-bold px-5 py-2 rounded-lg tracking-widest text-sm shadow-md">
                            AGOTADO
                          </span>
                        </div>
                      )}

                      {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-[#E50000] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider z-20">
                          Oferta
                        </span>
                      )}

                      {product.skin_type && !isOutofStock && (
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#E50000] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-gray-100 uppercase tracking-wider z-20">
                          {product.skin_type}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between relative z-20 bg-white">
                      <div>
                        <div className="flex justify-between items-start mb-1.5">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {product.brand}
                          </p>
                          {product.category && (
                            <span className="text-[10px] font-bold text-[#E50000] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <h4 className={`text-lg font-bold mb-3 line-clamp-1 transition-colors ${isOutofStock ? 'text-gray-500' : 'text-gray-900 group-hover:text-[#E50000]'}`}>
                          {product.name}
                        </h4>
                        
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-2 mb-4">
                            <p className="text-xl font-extrabold text-[#E50000]">
                              RD${product.discount_price.toLocaleString()}
                            </p>
                            <p className="text-sm font-semibold text-gray-400 line-through">
                              RD${product.price.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className={`text-xl font-extrabold mb-4 ${isOutofStock ? 'text-gray-400' : 'text-gray-900'}`}>
                            RD${product.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={isOutofStock}
                        className={`w-full font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                          isOutofStock 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-[#E50000] text-white hover:bg-red-700"
                        }`}
                      >
                        <ShoppingBag size={18} />
                        {isOutofStock ? "No disponible" : "Agregar al Carrito"}
                      </button>
                    </div>
                    
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}