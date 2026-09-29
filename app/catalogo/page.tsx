"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Catalogo() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  const [showCategories, setShowCategories] = useState(false);
  const [showBrands, setShowBrands] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 16;
  
  const { addToCart } = useCart(); 

  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedBrands]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowCategories(false);
        setShowBrands(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => 
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => 
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const brands = Array.from(new Set(products.map(p => p.brand?.trim().toUpperCase()).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand?.trim().toUpperCase());
    return matchCategory && matchBrand;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-white border-b border-gray-100 p-4 sm:p-6 sticky top-0 z-40 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between relative h-8 sm:h-10">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#E50000] transition-colors font-medium text-sm sm:text-base z-10 relative">
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Volver al Inicio</span>
          </Link>
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3 w-max z-0">
            <img src="/logo.jpeg" alt="Logo" className="h-6 sm:h-8 object-contain" />
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              Catálogo <span className="text-[#E50000]">Yosoy Skincare</span>
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-[#E50000]" size={28} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Todos los productos</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">Explora nuestro inventario disponible</p>
            </div>
          </div>
        </div>

        {!loading && products.length > 0 && (
          <div ref={filtersRef} className="mb-8 sm:mb-10 flex flex-row items-start gap-3 w-full">
            <div className="relative flex-1">
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
                <button 
                  onClick={() => {
                    setShowCategories(!showCategories);
                    if (!showCategories) setShowBrands(false);
                  }}
                  className="w-full p-3 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-900 font-bold">
                    <Filter size={16} className="text-[#E50000] sm:w-[18px] sm:h-[18px]" />
                    <span className="text-[10px] sm:text-sm uppercase tracking-wider line-clamp-1 text-left">Categorías</span>
                    {selectedCategories.length > 0 && (
                      <span className="bg-[#E50000] text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                        {selectedCategories.length}
                      </span>
                    )}
                  </div>
                  {showCategories ? <ChevronUp size={16} className="text-gray-400 sm:w-[20px] sm:h-[20px]" /> : <ChevronDown size={16} className="text-gray-400 sm:w-[20px] sm:h-[20px]" />}
                </button>
              </div>
              
              {showCategories && (
                <div className="absolute top-full left-0 mt-2 min-w-[260px] sm:w-[350px] max-w-[90vw] bg-white/60 backdrop-blur-lg rounded-xl border border-gray-100/50 shadow-2xl p-4 flex flex-wrap gap-2 z-50 max-h-[60vh] overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategories([])}
                    className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm font-bold transition-all duration-300 ${
                      selectedCategories.length === 0
                        ? "bg-[#E50000] text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-[#E50000] hover:text-[#E50000]"
                    }`}
                  >
                    Todas
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category as string}
                      onClick={() => toggleCategory(category as string)}
                      className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm font-bold transition-all duration-300 ${
                        selectedCategories.includes(category as string)
                          ? "bg-[#E50000] text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-[#E50000] hover:text-[#E50000]"
                      }`}
                    >
                      {category as string}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {brands.length > 0 && (
              <div className="relative flex-1">
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
                  <button 
                    onClick={() => {
                      setShowBrands(!showBrands);
                      if (!showBrands) setShowCategories(false);
                    }}
                    className="w-full p-3 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-900 font-bold">
                      <Tag size={16} className="text-[#E50000] sm:w-[18px] sm:h-[18px]" />
                      <span className="text-[10px] sm:text-sm uppercase tracking-wider line-clamp-1 text-left">Marcas</span>
                      {selectedBrands.length > 0 && (
                        <span className="bg-[#E50000] text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                          {selectedBrands.length}
                        </span>
                      )}
                    </div>
                    {showBrands ? <ChevronUp size={16} className="text-gray-400 sm:w-[20px] sm:h-[20px]" /> : <ChevronDown size={16} className="text-gray-400 sm:w-[20px] sm:h-[20px]" />}
                  </button>
                </div>
                
                {showBrands && (
                  <div className="absolute top-full right-0 mt-2 min-w-[260px] sm:w-[350px] max-w-[90vw] bg-white/60 backdrop-blur-lg rounded-xl border border-gray-100/50 shadow-2xl p-4 flex flex-wrap gap-2 z-50 max-h-[60vh] overflow-y-auto">
                    <button
                      onClick={() => setSelectedBrands([])}
                      className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm font-bold transition-all duration-300 ${
                        selectedBrands.length === 0
                          ? "bg-[#E50000] text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-[#E50000] hover:text-[#E50000]"
                      }`}
                    >
                      Todas
                    </button>

                    {brands.map((brand) => (
                      <button
                        key={brand as string}
                        onClick={() => toggleBrand(brand as string)}
                        className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm font-bold transition-all duration-300 ${
                          selectedBrands.includes(brand as string)
                            ? "bg-[#E50000] text-white shadow-sm"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-[#E50000] hover:text-[#E50000]"
                        }`}
                      >
                        {brand as string}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-12 font-medium">Cargando catálogo...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500 font-medium text-lg mb-2">No hay productos que coincidan con estos filtros.</p>
            <button 
              onClick={() => {
                setSelectedCategories([]);
                setSelectedBrands([]);
              }}
              className="mt-2 text-white bg-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              Limpiar todos los filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8 relative z-0">
              {paginatedProducts.map((product) => {
                const isOutofStock = product.stock <= 0;
                const hasDiscount = product.discount_price && product.discount_price > 0 && !isOutofStock;

                return (
                  <Link href={`/producto/${product.slug}`} key={product.id} className="group cursor-pointer">
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col">
                      <div className="aspect-square bg-[#FAFAFA] p-3 sm:p-6 flex items-center justify-center relative overflow-hidden border-b border-gray-50">
                        <img 
                          src={product.image_urls?.[0] || product.image_url} 
                          alt={product.name} 
                          className={`max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 ${isOutofStock ? 'opacity-80' : 'group-hover:scale-105'}`}
                        />
                        
                        {isOutofStock && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                            <span className="bg-[#E50000] text-white font-bold px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg tracking-widest text-[10px] sm:text-sm shadow-md">
                              AGOTADO
                            </span>
                          </div>
                        )}

                        {hasDiscount && (
                          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#E50000] text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm uppercase tracking-wider z-20">
                            Oferta
                          </span>
                        )}

                        {product.skin_type && !isOutofStock && (
                          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-md text-[#E50000] text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm border border-gray-100 uppercase tracking-wider z-20 hidden sm:block">
                            {product.skin_type}
                          </span>
                        )}
                      </div>

                      <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between relative z-20 bg-white">
                        <div>
                          <div className="flex justify-between items-start mb-1 sm:mb-1.5">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                              {product.brand}
                            </p>
                            
                            {product.category && (
                              <span className="text-[8px] sm:text-[10px] font-bold text-[#E50000] bg-red-50 border border-red-100 px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wide">
                                {product.category}
                              </span>
                            )}
                          </div>
                          
                          <h4 className={`text-sm sm:text-lg font-bold mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-1 transition-colors ${isOutofStock ? 'text-gray-500' : 'text-gray-900 group-hover:text-[#E50000]'}`}>
                            {product.name}
                          </h4>
                          
                          {hasDiscount ? (
                            <div className="flex items-baseline gap-1 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
                              <p className="text-base sm:text-xl font-extrabold text-[#E50000]">
                                RD${product.discount_price.toLocaleString()}
                              </p>
                              <p className="text-[10px] sm:text-sm font-semibold text-gray-400 line-through">
                                RD${product.price.toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            <p className={`text-base sm:text-xl font-extrabold mb-3 sm:mb-4 ${isOutofStock ? 'text-gray-400' : 'text-gray-900'}`}>
                              RD${product.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={isOutofStock}
                          className={`w-full font-semibold py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-base ${
                            isOutofStock 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : "bg-[#E50000] text-white hover:bg-red-700"
                          }`}
                        >
                          <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                          <span className="hidden sm:inline">{isOutofStock ? "No disponible" : "Agregar al Carrito"}</span>
                          <span className="sm:hidden">{isOutofStock ? "Agotado" : "Agregar"}</span>
                        </button>
                      </div>
                      
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100 relative z-0">
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-[#E50000] hover:border-[#E50000] hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-bold transition-all flex items-center justify-center text-sm sm:text-base ${
                      currentPage === page
                        ? "bg-[#E50000] text-white shadow-md shadow-red-200"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#E50000] hover:text-[#E50000] hover:bg-red-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-[#E50000] hover:border-[#E50000] hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}