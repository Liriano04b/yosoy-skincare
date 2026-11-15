"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PLACEHOLDER_IMAGE, isSupabaseImage } from "@/lib/config";
import { discountPercent, type CardProduct } from "@/lib/products";

export type { CardProduct };

const money = (n: number) => `RD$${Number(n).toLocaleString("en-US")}`;

// Tarjeta de producto del catálogo y de "También te puede gustar".
export default function ProductCard({ product }: { product: CardProduct }) {
  const { addToCart } = useCart();
  const soldOut = product.stock <= 0;
  const percent = soldOut ? 0 : discountPercent(product.price, product.discount_price);
  const currentPrice = percent > 0 ? (product.discount_price as number) : product.price;
  const image = product.image_urls?.[0] || product.image_url || PLACEHOLDER_IMAGE;

  const handleAdd = () => {
    if (soldOut) return;
    addToCart({ id: product.id, name: product.name, slug: product.slug, price: currentPrice, image_url: image, stock: product.stock });
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
      <Link href={`/producto/${product.slug}`} className="flex flex-1 flex-col" aria-label={product.name}>
        <div className="relative aspect-square bg-white">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            unoptimized={!isSupabaseImage(image) && image !== PLACEHOLDER_IMAGE}
            className={`object-contain p-4 sm:p-6 mix-blend-multiply transition-transform duration-500 ${
              soldOut ? "opacity-60" : "group-hover:scale-105"
            }`}
          />
          {percent > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-white shadow-sm sm:left-3 sm:top-3">
              -{percent}%
            </span>
          )}
          {soldOut && (
            <span className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-ink/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cream">
              Agotado
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col border-t border-line/60 p-3 sm:p-4">
          <p className="mb-1 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted/70 sm:text-xs">
            <span className="truncate">{product.brand}</span>
            {product.category && <span className="shrink-0 rounded-md bg-blush px-1.5 py-0.5 text-ink/70">{product.category}</span>}
          </p>
          <h3
            className={`font-sans text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem] sm:text-base sm:min-h-[3rem] transition-colors ${
              soldOut ? "text-muted" : "text-ink group-hover:text-brand"
            }`}
          >
            {product.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
            <span className={`text-base font-bold sm:text-lg ${percent > 0 ? "text-brand" : soldOut ? "text-muted/70" : "text-ink"}`}>
              {money(currentPrice)}
            </span>
            {percent > 0 && <span className="text-xs text-muted/70 line-through sm:text-sm">{money(product.price)}</span>}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors sm:text-[15px] ${
            soldOut
              ? "cursor-not-allowed bg-blush/60 text-muted/70"
              : "bg-brand text-white hover:bg-brand-dark"
          }`}
        >
          <ShoppingBag size={16} aria-hidden="true" />
          {soldOut ? "No disponible" : "Agregar"}
        </button>
      </div>
    </article>
  );
}
