import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  ClipboardList,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import JsonLd from "@/components/JsonLd";
import ProductTeaser, { type TeaserProduct } from "@/components/ProductTeaser";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PAYMENT_METHODS,
  SHIPPING,
  SITE_NAME,
  SITE_URL,
  whatsappLink,
} from "@/lib/config";

// La portada se genera en el servidor y se refresca cada 5 minutos:
// carga más rápido y los productos nuevos aparecen solos.
export const revalidate = 300;

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Datos del negocio para buscadores (solo información real ya publicada en el sitio)
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.jpeg`,
  image: `${SITE_URL}/logo.jpeg`,
  slogan: "Tu piel, tu mejor versión",
  areaServed: { "@type": "Country", name: "República Dominicana" },
  paymentAccepted: PAYMENT_METHODS,
  sameAs: [INSTAGRAM_URL],
};

async function getHomeData() {
  try {
    const [products, routines] = await Promise.all([
      supabase
        .from("products")
        .select("id, slug, name, brand, price, discount_price, image_url, image_urls, category")
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase.from("routines").select("id", { count: "exact", head: true }),
    ]);
    return {
      products: (products.data ?? []) as TeaserProduct[],
      hasRoutines: (routines.count ?? 0) > 0,
    };
  } catch {
    // Si Supabase no responde, la portada sigue viéndose sin las secciones dinámicas
    return { products: [] as TeaserProduct[], hasRoutines: false };
  }
}

const STEPS = [
  {
    title: "Cuéntanos de tu piel",
    text: "Responde 3 preguntas rápidas en el test de piel.",
  },
  {
    title: "Mira tu rutina",
    text: "Te mostramos productos que encajan con tu tipo de piel.",
  },
  {
    title: "Pide por WhatsApp",
    text: "Confirmamos disponibilidad y coordinamos tu envío.",
  },
];

export default async function Home() {
  const { products, hasRoutines } = await getHomeData();

  return (
    <div>
      <JsonLd data={ORGANIZATION_JSON_LD} />
      {/* ───────── Portada ───────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-14 md:pt-14 md:pb-20 grid md:grid-cols-2 gap-10 md:gap-6 items-center">
        <div className="text-center md:text-left">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-brand mb-4">
            Skincare coreano · Tu piel, tu mejor versión
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-ink">
            Una rutina pensada para <em className="text-brand not-italic">tu</em> piel
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-xl mx-auto md:mx-0">
            Te ayudamos a elegir qué usar y en qué orden, para que construyas un hábito que sí puedas mantener.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link
              href="/descubre-tu-piel"
              className="inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-brand/25 hover:bg-brand-dark transition-colors"
            >
              Hacer el test de piel <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 border border-ink/20 text-ink font-semibold px-7 py-3.5 rounded-full hover:border-brand hover:text-brand transition-colors"
            >
              Ver el catálogo
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start text-sm text-muted">
            <li className="flex items-center gap-2">
              <Truck size={16} className="text-sage" aria-hidden="true" /> Envíos a todo el país
            </li>
            <li className="flex items-center gap-2">
              <Banknote size={16} className="text-sage" aria-hidden="true" /> Efectivo o transferencia
            </li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[22rem] md:max-w-md aspect-square">
          <div className="absolute inset-4 rounded-full bg-blush" aria-hidden="true" />
          <Image
            src="/fondo.png"
            alt="Yosoy Skincare, tu piel, tu mejor versión"
            fill
            priority
            sizes="(min-width: 768px) 28rem, 22rem"
            className="object-contain p-2"
          />
        </div>
      </section>

      {/* ───────── Cómo funciona ───────── */}
      <section className="bg-white border-y border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink">Así de fácil</h2>
            <p className="mt-3 text-muted">De tu piel a tu pedido en tres pasos.</p>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="text-center">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft font-display text-xl font-semibold text-brand">
                  {i + 1}
                </span>
                <h3 className="font-sans text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Por dónde empezar ───────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink">¿Por dónde quieres empezar?</h2>
        </div>
        <div className={`grid gap-5 ${hasRoutines ? "md:grid-cols-3" : "md:grid-cols-2 max-w-3xl mx-auto"}`}>
          <Link
            href="/descubre-tu-piel"
            className="group relative flex flex-col rounded-3xl border-2 border-brand/30 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-xl hover:shadow-brand/10"
          >
            <span className="absolute top-4 right-4 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              Recomendado
            </span>
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <ClipboardList size={26} aria-hidden="true" />
            </span>
            <h3 className="font-sans text-xl font-semibold text-ink">Descubre tu rutina ideal</h3>
            <p className="mt-2 flex-grow text-sm text-muted leading-relaxed">
              Responde unas preguntas sobre tu piel y mira qué productos encajan contigo.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand transition-all group-hover:gap-3">
              Comenzar el test <ArrowRight size={18} aria-hidden="true" />
            </span>
          </Link>

          {hasRoutines && (
            <Link
              href="/rutinas"
              className="group flex flex-col rounded-3xl border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
            >
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blush text-ink transition-colors group-hover:bg-brand-soft group-hover:text-brand">
                <Sparkles size={26} aria-hidden="true" />
              </span>
              <h3 className="font-sans text-xl font-semibold text-ink">Rutinas paso a paso</h3>
              <p className="mt-2 flex-grow text-sm text-muted leading-relaxed">
                Kits armados con el orden en que se usa cada producto.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-semibold text-ink transition-all group-hover:gap-3 group-hover:text-brand">
                Ver rutinas <ArrowRight size={18} aria-hidden="true" />
              </span>
            </Link>
          )}

          <Link
            href="/catalogo"
            className="group flex flex-col rounded-3xl border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
          >
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blush text-ink transition-colors group-hover:bg-brand-soft group-hover:text-brand">
              <ShoppingBag size={26} aria-hidden="true" />
            </span>
            <h3 className="font-sans text-xl font-semibold text-ink">Catálogo completo</h3>
            <p className="mt-2 flex-grow text-sm text-muted leading-relaxed">
              ¿Ya sabes lo que buscas? Explora todos los productos y filtra por categoría o marca.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 font-semibold text-ink transition-all group-hover:gap-3 group-hover:text-brand">
              Ver productos <ArrowRight size={18} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

      {/* ───────── Novedades ───────── */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 md:pb-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink">Novedades</h2>
            <Link
              href="/catalogo"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
            >
              Ver todo <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductTeaser key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ───────── Envíos y pagos ───────── */}
      <section className="bg-white border-y border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-8 sm:grid-cols-3">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage">
              <Truck size={22} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-sans font-semibold text-ink">Envíos a todo el país</h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                {SHIPPING.santoDomingo}. {SHIPPING.nacional}.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage">
              <Banknote size={22} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-sans font-semibold text-ink">Paga como prefieras</h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">{PAYMENT_METHODS}.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage">
              <WhatsAppIcon size={22} />
            </span>
            <div>
              <h3 className="font-sans font-semibold text-ink">Atención por WhatsApp</h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                Confirmamos tu pedido y resolvemos tus dudas por mensaje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Cierre ───────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="rounded-3xl bg-blush px-6 py-12 text-center sm:px-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink">¿No sabes por dónde empezar?</h2>
          <p className="mt-3 text-muted max-w-lg mx-auto">
            Escríbenos y te ayudamos a elegir. También puedes seguirnos en Instagram.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={whatsappLink("¡Hola! Quisiera ayuda para elegir mi rutina de skincare.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 font-semibold text-white shadow-lg shadow-green-900/10 hover:bg-[#20bd5a] transition-colors"
            >
              <WhatsAppIcon size={20} /> Escríbenos por WhatsApp
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-7 py-3.5 font-semibold text-ink hover:border-brand hover:text-brand transition-colors"
            >
              @{INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
