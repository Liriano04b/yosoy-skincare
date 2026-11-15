import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PLACEHOLDER_IMAGE, isSupabaseImage, whatsappLink } from "@/lib/config";
import WhatsAppIcon from "@/components/WhatsAppIcon";

// Se genera en el servidor y se refresca cada 5 minutos
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Rutinas de skincare paso a paso",
  description: "Kits armados de skincare coreano para que no tengas que adivinar qué usar ni en qué orden.",
  alternates: { canonical: "/rutinas" },
};

type Routine = {
  id: number;
  title: string;
  skin_type_tag: string | null;
  description: string | null;
  price: number | null;
  steps: string | null;
  image_url: unknown;
  product_ids: string[] | null;
};

type IncludedProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  image_urls: string[] | null;
};

const money = (n: number) => `RD$${Number(n).toLocaleString("en-US")}`;

// image_url de las rutinas es un arreglo (jsonb) de URLs; también se acepta un texto suelto
function getImages(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.length > 0);
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

async function getData() {
  try {
    const { data: routines } = await supabase
      .from("routines")
      .select("id, title, skin_type_tag, description, price, steps, image_url, product_ids")
      .order("created_at", { ascending: false });
    const list = (routines ?? []) as Routine[];

    const ids = Array.from(new Set(list.flatMap((r) => r.product_ids ?? [])));
    let products: IncludedProduct[] = [];
    if (ids.length > 0) {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, brand, category, price, discount_price, image_url, image_urls")
        .in("id", ids);
      products = (data ?? []) as IncludedProduct[];
    }
    return { routines: list, products };
  } catch {
    return { routines: [] as Routine[], products: [] as IncludedProduct[] };
  }
}

export default async function Rutinas() {
  const { routines, products } = await getData();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-12 sm:pb-16">
      <header className="mb-10 text-center">
        <Sparkles className="mx-auto mb-3 text-brand" size={30} aria-hidden="true" />
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">Rutinas paso a paso</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Kits armados para que no tengas que adivinar qué usar ni en qué orden.
        </p>
      </header>

      {routines.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white px-6 py-14 text-center">
          <p className="text-lg font-semibold text-ink">Pronto publicaremos nuestras primeras rutinas.</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Mientras tanto, el test de piel te arma una rutina con los productos de nuestro catálogo.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/descubre-tu-piel"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Hacer el test de piel <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/catalogo"
              className="rounded-full border border-ink/20 px-7 py-3 font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Ver el catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {routines.map((routine) => {
            const images = getImages(routine.image_url);
            const included = (routine.product_ids ?? [])
              .map((id) => products.find((p) => p.id === id))
              .filter((p): p is IncludedProduct => !!p);
            const message = `¡Hola! Me interesa adquirir el kit completo de la rutina "${routine.title}"${
              routine.price ? ` por ${money(routine.price)}` : ""
            }. ¿Tienen disponibilidad?`;

            return (
              <article key={routine.id} className="overflow-hidden rounded-3xl border border-line bg-white shadow-xl shadow-brand/5">
                <div className="grid grid-cols-1 md:grid-cols-5">
                  <div className="relative aspect-[4/3] border-b border-line bg-cream md:col-span-2 md:aspect-auto md:min-h-[22rem] md:border-b-0 md:border-r">
                    {images.length > 0 ? (
                      <Image
                        src={images[0]}
                        alt={routine.title}
                        fill
                        sizes="(min-width: 768px) 40vw, 100vw"
                        unoptimized={!isSupabaseImage(images[0])}
                        className="object-contain p-6 mix-blend-multiply"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted/60">
                        <Sparkles size={44} className="mb-2 opacity-60" aria-hidden="true" />
                        <p className="text-sm font-medium">Kit Yosoy Skincare</p>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 p-6 sm:p-8 md:col-span-3">
                    {routine.skin_type_tag && (
                      <span className="mb-3 inline-block rounded-full bg-sage-soft px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sage">
                        {routine.skin_type_tag}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{routine.title}</h2>
                    {routine.description && <p className="mt-2 text-ink/80 leading-relaxed">{routine.description}</p>}

                    {included.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted">Qué incluye</h3>
                        <ol className="space-y-2.5">
                          {included.map((p, i) => {
                            const image = p.image_urls?.[0] || p.image_url || PLACEHOLDER_IMAGE;
                            const price =
                              p.discount_price && p.discount_price > 0 && p.discount_price < p.price ? p.discount_price : p.price;
                            return (
                              <li key={p.id}>
                                <Link
                                  href={`/producto/${p.slug}`}
                                  className="group flex items-center gap-3 rounded-xl border border-line p-2.5 transition-colors hover:border-brand/50 hover:bg-brand-soft/30"
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                                    {i + 1}
                                  </span>
                                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                                    <Image
                                      src={image}
                                      alt=""
                                      fill
                                      sizes="48px"
                                      unoptimized={!isSupabaseImage(image) && image !== PLACEHOLDER_IMAGE}
                                      className="object-contain p-1 mix-blend-multiply"
                                    />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-ink group-hover:text-brand">{p.name}</span>
                                    {p.category && <span className="block text-xs text-muted">{p.category}</span>}
                                  </span>
                                  <span className="shrink-0 text-sm font-semibold text-ink/80">{money(price)}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}

                    {routine.steps && (
                      <div className="mt-6">
                        <h3 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wider text-muted">Cómo usarla</h3>
                        <p className="whitespace-pre-line rounded-2xl bg-cream p-4 text-[15px] leading-relaxed text-ink/80">
                          {routine.steps}
                        </p>
                      </div>
                    )}

                    <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-blush p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Precio del kit</p>
                        <p className="font-display text-3xl font-semibold text-ink">
                          {routine.price ? money(routine.price) : "Consultar"}
                        </p>
                      </div>
                      <a
                        href={whatsappLink(message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3.5 font-semibold text-white shadow-lg shadow-green-900/10 transition-colors hover:bg-[#20bd5a]"
                      >
                        <WhatsAppIcon size={22} />
                        Quiero esta rutina
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
