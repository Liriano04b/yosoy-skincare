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

  // SOLUCIÓN: El Hook debe ir SIEMPRE dentro del componente
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

  const numeroWhatsApp = "18299183389";
  const mensajeWhatsApp = `¡Hola! Me interesa el producto ${product.name} (RD$${product.price}). ¿Tienen disponibilidad?`;
  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeWhatsApp)}`;

  const hasMultipleImages = product.image_urls && product.image_urls.length > 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Navegación Superior */}
      <nav className="border-b border-gray-100 p-6 max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Volver al catálogo
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

          {/* COLUMNA IZQUIERDA: Galería de Imágenes */}
          <div className="flex flex-col gap-4">
            {/* Imagen Principal Grande */}
            <div className="bg-[#FAFAFA] rounded-3xl p-8 md:p-12 flex items-center justify-center border border-gray-100 aspect-square">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-sm mix-blend-multiply transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {hasMultipleImages && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.image_urls.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(url)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl p-2 border-2 transition-all ${mainImage === url
                        ? "border-[#E50000] bg-white shadow-sm"
                        : "border-gray-100 bg-[#FAFAFA] hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={url}
                      alt={`Vista ${index + 1}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Ficha Técnica */}
          <div className="flex flex-col justify-center">

            <p className="text-[#E50000] font-bold tracking-wider uppercase text-sm mb-3">
              {product.brand}
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-5 mb-8">
              <p className="text-4xl font-bold text-gray-900">
                RD${product.price.toLocaleString()}
              </p>
              {product.skin_type && (
                <span className="bg-red-50 text-[#E50000] px-4 py-1.5 rounded-full text-sm font-semibold border border-red-100">
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
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_urls?.[0] || product.image_url
                  });
                }}
                className="w-full bg-[#E50000] text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <ShoppingBag size={22} />
                Agregar al Carrito
              </button>

              <a
                href={linkWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-center py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Comprar por WhatsApp
              </a>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}