"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Droplet, Sparkles, ShoppingBag } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function DetalleProducto() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("");

  const { addToCart } = useCart();
  const urlParam = params?.id || params?.slug || params?.producto;

  useEffect(() => {
    if (urlParam) {
      fetchProduct();
    }
  }, [urlParam]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", urlParam)
      .single();

    if (data) {
      setProduct(data);
      setMainImage(data.image_urls?.[0] || data.image_url || "");
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-500">Cargando detalles del producto...</div>;
  if (!product) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-500">Producto no encontrado</div>;

  const isOutofStock = product.stock <= 0;
  const hasDiscount = product.discount_price && product.discount_price > 0 && !isOutofStock;
  const currentPrice = hasDiscount ? product.discount_price : product.price;

  const numeroWhatsApp = "18299183389";
  const mensajeWhatsApp = isOutofStock 
    ? `¡Hola! Me interesa el producto ${product.name}, pero veo que está agotado. ¿Cuándo volverán a tener disponibilidad?`
    : `¡Hola! Me interesa el producto ${product.name} (RD$${currentPrice}). ¿Tienen disponibilidad?`;
  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeWhatsApp)}`;

  const hasMultipleImages = product.image_urls && product.image_urls.length > 1;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 p-6 max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/catalogo')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Volver al catálogo
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

          {/* COLUMNA IZQUIERDA: Galería de Imágenes */}
          <div className="flex flex-col gap-4 w-full min-w-0">
            {/* Se quitó la opacidad general para mantener el color blanco del fondo limpio */}
            <div className="bg-[#FAFAFA] rounded-3xl relative overflow-hidden border border-gray-100 aspect-square w-full">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  // Se cambió grayscale por un ligero opacity-80 para que resalte la etiqueta
                  className={`absolute inset-0 w-full h-full object-contain p-6 md:p-12 mix-blend-multiply transition-opacity duration-300 ${isOutofStock ? 'opacity-80' : ''}`}
                />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}
              
              {/* NUEVA ETIQUETA ROJA DE AGOTADO */}
              {isOutofStock && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <span className="bg-[#E50000] text-white font-bold px-6 py-3 rounded-xl tracking-widest text-lg shadow-md">
                    AGOTADO
                  </span>
                </div>
              )}
            </div>

            {hasMultipleImages && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide w-full">
                {product.image_urls.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(url)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl p-2 border-2 transition-all overflow-hidden ${mainImage === url
                        ? "border-[#E50000] bg-white shadow-sm"
                        : "border-gray-100 bg-[#FAFAFA] hover:border-gray-300"
                      } ${isOutofStock ? 'opacity-80' : ''}`}
                  >
                    <img src={url} alt={`Vista ${index + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Ficha Técnica */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[#E50000] font-bold tracking-wider uppercase text-sm">
                {product.brand}
              </p>
              {product.category && (
                <span className="text-[10px] font-bold text-[#E50000] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                  {product.category}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              {hasDiscount ? (
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-extrabold text-[#E50000]">
                    RD${product.discount_price.toLocaleString()}
                  </p>
                  <p className="text-xl font-bold text-gray-400 line-through">
                    RD${product.price.toLocaleString()}
                  </p>
                  <span className="bg-[#E50000] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ml-2">
                    Oferta
                  </span>
                </div>
              ) : (
                <p className={`text-4xl font-extrabold ${isOutofStock ? 'text-gray-400' : 'text-gray-900'}`}>
                  RD${product.price.toLocaleString()}
                </p>
              )}
              
              {product.skin_type && !isOutofStock && (
                <span className="bg-red-50 text-[#E50000] px-4 py-1.5 rounded-full text-sm font-semibold border border-red-100 ml-auto">
                  {product.skin_type}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="space-y-8 mb-10 border-t border-gray-100 pt-8">
              {product.ingredients && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <Sparkles className="text-[#E50000]" size={22} />
                    Ingredientes Clave
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-md bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    {product.ingredients}
                  </p>
                </div>
              )}

              {product.how_to_use && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <Droplet className="text-[#E50000]" size={22} />
                    Modo de Uso
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-md bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    {product.how_to_use}
                  </p>
                </div>
              )}
            </div>

            {/* BOTONES DE ACCIÓN AGRUPADOS */}
            <div className="flex flex-col gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (isOutofStock) return;
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: currentPrice,
                    image_url: product.image_urls?.[0] || product.image_url
                  });
                }}
                disabled={isOutofStock}
                className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                  isOutofStock 
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none hover:translate-y-0" 
                    : "bg-[#E50000] text-white hover:bg-red-700"
                }`}
              >
                <ShoppingBag size={22} />
                {isOutofStock ? "Producto Agotado" : "Agregar al Carrito"}
              </button>

              <a
                href={linkWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-center py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                  isOutofStock
                    ? "bg-gray-800 hover:bg-gray-900 text-white"
                    : "bg-[#25D366] hover:bg-[#20bd5a] text-white"
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                {isOutofStock ? "Preguntar por WhatsApp" : "Comprar por WhatsApp"}
              </a>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}