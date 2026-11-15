"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Banknote, ChevronDown, Droplet, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { PAYMENT_METHODS, PLACEHOLDER_IMAGE, SHIPPING, isSupabaseImage, whatsappLink } from "@/lib/config";
import { CONCERN_LABEL, SKIN_LABEL, type Concern, type SkinType } from "@/lib/skinTest";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import ProductCard from "@/components/ProductCard";
import { PRODUCT_COLUMNS, discountPercent, type CardProduct, type Product } from "@/lib/products";

const CARD_COLUMNS = "id, slug, name, brand, category, price, discount_price, stock, image_url, image_urls";

const money = (n: number) => `RD$${Number(n).toLocaleString("en-US")}`;
const ALL_SKINS = ["seca", "grasa", "mixta", "normal"];

// Bloque desplegable (nativo, funciona sin JavaScript)
function Accordion({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-line last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2.5">
          <span className="text-brand">{icon}</span>
          {title}
        </span>
        <ChevronDown size={18} className="text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pb-5 text-[15px] leading-relaxed text-muted whitespace-pre-line">{children}</div>
    </details>
  );
}

// El servidor entrega el producto ya cargado (para buscadores y vista inmediata); aquí se vuelve a pedir
// para mostrar siempre el precio y las existencias de este momento.
export default function ProductView({ initialProduct = null }: { initialProduct?: Product | null }) {
  const params = useParams();
  const slug = (params?.slug ?? params?.id ?? params?.producto) as string | undefined;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [related, setRelated] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(!initialProduct);
  const [mainImage, setMainImage] = useState(initialProduct?.image_urls?.[0] || initialProduct?.image_url || "");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase.from("products").select(PRODUCT_COLUMNS).eq("slug", slug).maybeSingle();
      if (cancelled) return;
      if (data) {
        const p = data as Product;
        setProduct(p);
        setMainImage(p.image_urls?.[0] || p.image_url || "");

        // También te puede gustar: primero la misma categoría, luego lo demás con stock
        const { data: others } = await supabase
          .from("products")
          .select(CARD_COLUMNS)
          .neq("id", p.id)
          .gt("stock", 0)
          .order("created_at", { ascending: false })
          .limit(16);
        if (!cancelled && others) {
          const list = others as CardProduct[];
          const same = list.filter((o) => o.category && o.category === p.category);
          const rest = list.filter((o) => !same.includes(o));
          setRelated([...same, ...rest].slice(0, 4));
        }
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // ───────── Carga y no encontrado ─────────
  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6" aria-busy="true">
        <div className="grid animate-pulse gap-8 rounded-3xl border border-line bg-white p-6 md:grid-cols-2 md:p-10">
          <div className="aspect-square rounded-2xl bg-blush/50" />
          <div className="space-y-4">
            <div className="h-4 w-1/4 rounded bg-blush" />
            <div className="h-9 w-4/5 rounded bg-blush" />
            <div className="h-8 w-1/3 rounded bg-blush" />
            <div className="h-24 rounded bg-blush/60" />
            <div className="h-12 rounded-full bg-blush" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">No encontramos este producto</h1>
        <p className="mt-3 text-muted">Puede que ya no esté disponible o que el enlace haya cambiado.</p>
        <Link href="/catalogo" className="mt-6 inline-flex rounded-full bg-brand px-7 py-3 font-semibold text-white hover:bg-brand-dark transition-colors">
          Ver el catálogo
        </Link>
      </main>
    );
  }

  // ───────── Datos derivados ─────────
  const soldOut = product.stock <= 0;
  const percent = soldOut ? 0 : discountPercent(product.price, product.discount_price);
  const currentPrice = percent > 0 ? (product.discount_price as number) : product.price;
  const images = product.image_urls && product.image_urls.length > 0 ? product.image_urls : product.image_url ? [product.image_url] : [];
  const shownImage = mainImage || PLACEHOLDER_IMAGE;
  const lowStock = !soldOut && product.stock <= 3;

  const skins = product.skin_types ?? [];
  const skinText = skins.length === 0 ? null : ALL_SKINS.every((s) => skins.includes(s)) ? "Apto para todo tipo de piel" : `Indicado para piel ${skins.filter((s) => s in SKIN_LABEL).map((s) => SKIN_LABEL[s as SkinType]).join(", ")}`;
  const concerns = (product.concerns ?? []).filter((c): c is Concern => c in CONCERN_LABEL);

  const whatsappMessage = soldOut
    ? `¡Hola! Me interesa el producto ${product.name}, pero veo que está agotado. ¿Cuándo volverán a tener disponibilidad?`
    : `¡Hola! Me interesa el producto ${product.name} (${money(currentPrice)}). ¿Tienen disponibilidad?`;
  const whatsappHref = whatsappLink(whatsappMessage);

  const handleAdd = () => {
    if (soldOut) return;
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      image_url: product.image_urls?.[0] || product.image_url || PLACEHOLDER_IMAGE,
      stock: product.stock,
    });
  };

  return (
    <div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-10 sm:pb-14">
        <div className="rounded-3xl border border-line bg-white p-5 shadow-xl shadow-brand/5 sm:p-8 lg:p-12">
          <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
            {/* Galería */}
            <div className="min-w-0">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-white">
                <Image
                  src={shownImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 768px) 45vw, 100vw"
                  unoptimized={!isSupabaseImage(shownImage) && shownImage !== PLACEHOLDER_IMAGE}
                  className={`object-contain p-6 sm:p-10 mix-blend-multiply ${soldOut ? "opacity-60" : ""}`}
                />
                {percent > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                    -{percent}%
                  </span>
                )}
                {soldOut && (
                  <span className="absolute inset-x-0 bottom-5 mx-auto w-fit rounded-full bg-ink/85 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-cream">
                    Agotado
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setMainImage(url)}
                      aria-label={`Ver imagen ${index + 1}`}
                      aria-pressed={mainImage === url}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-colors ${
                        mainImage === url ? "border-brand" : "border-line hover:border-muted/40"
                      }`}
                    >
                      <Image
                        src={url}
                        alt=""
                        fill
                        sizes="80px"
                        unoptimized={!isSupabaseImage(url)}
                        className="object-contain p-1.5 mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información */}
            <div className="flex min-w-0 flex-col">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {product.brand && <p className="text-sm font-semibold uppercase tracking-wider text-brand">{product.brand}</p>}
                {product.category && (
                  <span className="rounded-md bg-blush px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink/70">
                    {product.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">{product.name}</h1>

              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className={`text-3xl font-bold sm:text-4xl ${percent > 0 ? "text-brand" : soldOut ? "text-muted/70" : "text-ink"}`}>
                  {money(currentPrice)}
                </span>
                {percent > 0 && <span className="text-lg text-muted/70 line-through">{money(product.price)}</span>}
              </div>

              {lowStock && (
                <p className="mt-3 text-sm font-medium text-brand-dark">
                  {product.stock === 1 ? "Queda solo 1 unidad" : `Quedan solo ${product.stock} unidades`}
                </p>
              )}

              {(skinText || concerns.length > 0) && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {skinText && <li className="rounded-full bg-blush px-3 py-1 text-sm text-ink/80">{skinText}</li>}
                  {concerns.map((c) => (
                    <li key={c} className="rounded-full bg-brand-soft px-3 py-1 text-sm text-brand-dark">
                      {CONCERN_LABEL[c]}
                    </li>
                  ))}
                </ul>
              )}

              {product.description && (
                <p className="mt-5 whitespace-pre-line leading-relaxed text-ink/80">{product.description}</p>
              )}

              {/* Acciones (en móvil, las mismas quedan fijas abajo) */}
              <div className="mt-6 hidden flex-col gap-3 md:flex">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={soldOut}
                  className={`flex items-center justify-center gap-2 rounded-full py-4 text-lg font-semibold transition-colors ${
                    soldOut ? "cursor-not-allowed bg-blush/60 text-muted/70" : "bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-dark"
                  }`}
                >
                  <ShoppingBag size={22} aria-hidden="true" />
                  {soldOut ? "Producto agotado" : "Agregar al carrito"}
                </button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2.5 rounded-full py-4 text-lg font-semibold text-white transition-colors ${
                    soldOut ? "bg-ink hover:bg-ink/90" : "bg-[#25D366] hover:bg-[#20bd5a]"
                  }`}
                >
                  <WhatsAppIcon size={24} />
                  {soldOut ? "Preguntar por WhatsApp" : "Comprar por WhatsApp"}
                </a>
              </div>

              <ul className="mt-6 space-y-3 rounded-2xl bg-cream p-4 text-sm text-ink/80">
                <li className="flex gap-3">
                  <Truck size={18} className="mt-0.5 shrink-0 text-sage" aria-hidden="true" />
                  <span>
                    {SHIPPING.santoDomingo}.<br />
                    {SHIPPING.nacional}.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Banknote size={18} className="mt-0.5 shrink-0 text-sage" aria-hidden="true" />
                  <span>{PAYMENT_METHODS}.</span>
                </li>
                <li className="flex gap-3">
                  <WhatsAppIcon size={18} className="mt-0.5 text-sage" />
                  <span>Confirmamos la disponibilidad y coordinamos tu envío por WhatsApp.</span>
                </li>
              </ul>

              {(product.ingredients || product.how_to_use) && (
                <div className="mt-4 border-t border-line">
                  {product.ingredients && (
                    <Accordion title="Ingredientes clave" icon={<Sparkles size={20} />} defaultOpen>
                      {product.ingredients}
                    </Accordion>
                  )}
                  {product.how_to_use && (
                    <Accordion title="Modo de uso" icon={<Droplet size={20} />}>
                      {product.how_to_use}
                    </Accordion>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12" aria-labelledby="related-title">
            <h2 id="related-title" className="mb-6 text-2xl font-semibold text-ink sm:text-3xl">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Barra de compra fija en móvil: sigue visible mientras se lee la ficha */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className={`truncate text-lg font-bold leading-tight ${percent > 0 ? "text-brand" : "text-ink"}`}>{money(currentPrice)}</p>
            {percent > 0 && <p className="text-xs text-muted/70 line-through">{money(product.price)}</p>}
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={soldOut ? "Preguntar por WhatsApp" : "Comprar por WhatsApp"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
          >
            <WhatsAppIcon size={24} />
          </a>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className={`flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition-colors ${
              soldOut ? "cursor-not-allowed bg-blush/60 text-muted/70" : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            {soldOut ? "Agotado" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
