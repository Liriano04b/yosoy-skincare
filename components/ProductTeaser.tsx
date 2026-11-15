import Image from "next/image";
import Link from "next/link";
import { PLACEHOLDER_IMAGE } from "@/lib/config";

export type TeaserProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  category: string | null;
};

const money = (n: number) => `RD$${Number(n).toLocaleString("en-US")}`;

// Tarjeta ligera de producto para la portada (sin carrito: lleva a la ficha completa).
export default function ProductTeaser({ product }: { product: TeaserProduct }) {
  const image = product.image_urls?.[0] || product.image_url || PLACEHOLDER_IMAGE;
  const hasDiscount = !!product.discount_price && product.discount_price > 0;
  // Solo se optimizan las fotos que viven en nuestro Storage de Supabase
  const optimizable = image.includes(".supabase.co/storage/");

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block rounded-2xl bg-white border border-line overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10"
    >
      <div className="relative aspect-square bg-white">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          unoptimized={!optimizable && image !== PLACEHOLDER_IMAGE}
          className="object-contain p-4 sm:p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3 sm:p-4 border-t border-line/60">
        {product.brand && (
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted/70 mb-1 truncate">
            {product.brand}
          </p>
        )}
        <h3 className="font-sans text-sm sm:text-base font-semibold text-ink line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-brand transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          {hasDiscount ? (
            <>
              <span className="text-base sm:text-lg font-bold text-brand">{money(product.discount_price!)}</span>
              <span className="text-xs sm:text-sm text-muted/70 line-through">{money(product.price)}</span>
            </>
          ) : (
            <span className="text-base sm:text-lg font-bold text-ink">{money(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
