"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart, Trash2, X, Minus, Banknote, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { PAYMENT_METHODS, PLACEHOLDER_IMAGE, SHIPPING, isSupabaseImage, whatsappLink } from "@/lib/config";
import WhatsAppIcon from "@/components/WhatsAppIcon";

type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string | null;
  image_urls: string[] | null;
};

// Categorías que completan una rutina, en el orden en que se sugieren
const ROUTINE_CATEGORIES = ["Limpiador", "Serum", "Crema Hidratante", "Protector Solar"];

const money = (n: number) => `RD$${Number(n).toLocaleString("en-US")}`;
const unitPrice = (p: CatalogItem) =>
  p.discount_price && p.discount_price > 0 && p.discount_price < p.price ? Number(p.discount_price) : Number(p.price);

// Miniatura optimizada (la foto original puede pesar varios MB)
function Thumb({ src, size, className }: { src: string | null | undefined; size: number; className: string }) {
  const url = src || PLACEHOLDER_IMAGE;
  return (
    <span className={`block overflow-hidden border border-line bg-white ${className}`}>
      <Image
        src={url}
        alt=""
        width={size * 2}
        height={size * 2}
        sizes={`${size}px`}
        unoptimized={!isSupabaseImage(url) && url !== PLACEHOLDER_IMAGE}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

// Lleva a la ficha del producto; si el artículo todavía no tiene su enlace (carritos antiguos), se muestra sin enlace
function ItemLink({
  slug,
  label,
  onNavigate,
  className,
  children,
}: {
  slug?: string;
  label: string;
  onNavigate: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  if (!slug) return <div className={className}>{children}</div>;
  return (
    <Link href={`/producto/${slug}`} onClick={onNavigate} aria-label={`Ver ${label}`} className={className}>
      {children}
    </Link>
  );
}

export default function CartWidget({ lift = false }: { lift?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart, totalItems, totalPrice } = useCart();

  // Al abrir: se revisan precios y existencias actuales y se cargan sugerencias
  const openCart = async () => {
    setIsOpen(true);
    refreshCart();
    const { data } = await supabase
      .from("products")
      .select("id, slug, name, category, price, discount_price, stock, image_url, image_urls")
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(40);
    if (data) setCatalog(data as CatalogItem[]);
  };

  // "Completa tu rutina": productos de las categorías básicas que todavía no tiene en el carrito
  const suggestions = useMemo(() => {
    if (cart.length === 0 || catalog.length === 0) return [];
    const inCart = new Set(cart.map((i) => i.id));
    const haveCategories = new Set(catalog.filter((p) => inCart.has(p.id)).map((p) => p.category));
    const picks: CatalogItem[] = [];
    for (const category of ROUTINE_CATEGORIES) {
      if (picks.length >= 2) break;
      if (haveCategories.has(category)) continue;
      // Se sugieren productos suaves: sin retinol ni ácidos, que no todas las pieles toleran
      const candidate = catalog.find((p) => p.category === category && !inCart.has(p.id) && !/retinol|retinal|\bbha\b|\baha\b|[aá]cido/i.test(p.name));
      if (candidate) picks.push(candidate);
    }
    return picks;
  }, [cart, catalog]);

  // Con el carrito abierto: Escape lo cierra y la página de atrás no se desplaza
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // El mensaje lleva el pedido, el total y los datos que necesitamos para coordinar el envío
    let message = "¡Hola! Quisiera hacer este pedido en Yosoy Skincare:\n\n";
    cart.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} (${money(item.price * item.quantity)})\n`;
    });
    message += `\n*Total: ${money(totalPrice)}*\n\n`;
    message += `Pago: ${PAYMENT_METHODS.toLowerCase()}.\n`;
    message += "Mis datos para el envío:\n- Nombre:\n- Provincia y sector:";
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={openCart}
        aria-label={`Abrir carrito (${totalItems} productos)`}
        className={`fixed right-6 z-50 ${lift ? "bottom-24 md:bottom-6" : "bottom-6"} bg-brand text-white p-4 rounded-full shadow-2xl hover:bg-brand-dark transition-transform hover:scale-105 flex items-center justify-center`}
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-ink text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
            {totalItems}
          </span>
        )}
      </button>

      {/* Panel lateral */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Tu carrito"
            className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right"
          >
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="text-2xl font-semibold text-ink">
                Tu carrito{totalItems > 0 && <span className="ml-2 text-base font-normal text-muted">({totalItems})</span>}
              </h2>
              <button onClick={() => setIsOpen(false)} aria-label="Cerrar carrito" className="text-muted/70 transition-colors hover:text-brand">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-muted/70">
                  <ShoppingCart size={48} className="opacity-50" />
                  <p className="text-lg">Tu carrito está vacío.</p>
                  <Link
                    href="/catalogo"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Ver el catálogo
                  </Link>
                </div>
              ) : (
                <>
                  <ul className="space-y-5">
                    {cart.map((item) => (
                      <li key={item.id} className="flex items-center gap-4 border-b border-line/60 pb-5">
                        <ItemLink slug={item.slug} label={item.name} onNavigate={() => setIsOpen(false)} className="shrink-0">
                          <Thumb src={item.image_url} size={80} className="h-20 w-20 rounded-xl p-1.5" />
                        </ItemLink>
                        <div className="min-w-0 flex-1">
                          <ItemLink slug={item.slug} label={item.name} onNavigate={() => setIsOpen(false)} className="block text-ink transition-colors hover:text-brand">
                            <span className="block font-semibold leading-tight line-clamp-2">{item.name}</span>
                          </ItemLink>
                          <p className="mt-1 font-semibold text-brand">{money(item.price * item.quantity)}</p>
                          <div className="mt-2.5 flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label={`Quitar una unidad de ${item.name}`}
                              className="rounded-md bg-blush/60 p-1.5 text-ink/80 hover:bg-line disabled:opacity-40"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-4 text-center font-bold text-ink">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label={`Agregar una unidad de ${item.name}`}
                              className="rounded-md bg-blush/60 p-1.5 text-ink/80 hover:bg-line"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Eliminar ${item.name} del carrito`}
                          className="p-2 text-muted/50 hover:text-brand"
                        >
                          <X size={20} />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand transition-colors"
                  >
                    <Trash2 size={15} aria-hidden="true" /> Vaciar carrito
                  </button>

                  {suggestions.length > 0 && (
                    <div className="mt-6 rounded-2xl bg-cream p-4">
                      <p className="mb-3 text-sm font-semibold text-ink">Completa tu rutina</p>
                      <ul className="space-y-3">
                        {suggestions.map((p) => (
                          <li key={p.id} className="flex items-center gap-3">
                            <Thumb src={p.image_urls?.[0] || p.image_url} size={56} className="h-14 w-14 shrink-0 rounded-lg p-1" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/70">{p.category}</p>
                              <p className="text-sm font-medium leading-snug text-ink line-clamp-2">{p.name}</p>
                              <p className="text-sm font-semibold text-ink">{money(unitPrice(p))}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                addToCart({
                                  id: p.id,
                                  name: p.name,
                                  slug: p.slug,
                                  price: unitPrice(p),
                                  image_url: p.image_urls?.[0] || p.image_url || PLACEHOLDER_IMAGE,
                                  stock: p.stock,
                                })
                              }
                              className="shrink-0 rounded-full border border-brand px-3.5 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
                            >
                              Agregar
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-line bg-cream p-5">
                <div className="mb-4 flex items-baseline justify-between text-ink">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="font-display text-3xl font-semibold">{money(totalPrice)}</span>
                </div>
                <ul className="mb-4 space-y-1.5 text-xs text-muted">
                  <li className="flex gap-2">
                    <Truck size={14} className="mt-0.5 shrink-0 text-sage" aria-hidden="true" />
                    <span>
                      {SHIPPING.santoDomingo}. {SHIPPING.nacional}.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <Banknote size={14} className="mt-0.5 shrink-0 text-sage" aria-hidden="true" />
                    <span>Pago: {PAYMENT_METHODS.toLowerCase()}. Lo coordinamos contigo por WhatsApp.</span>
                  </li>
                </ul>
                <button
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] py-4 text-lg font-semibold text-white shadow-lg shadow-green-900/10 transition-colors hover:bg-[#20bd5a]"
                >
                  <WhatsAppIcon size={22} />
                  Pedir por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
