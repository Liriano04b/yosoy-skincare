"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ChevronLeft, Moon, RefreshCw, Sun } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PLACEHOLDER_IMAGE, whatsappLink } from "@/lib/config";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  CONCERN_LABEL,
  QUESTIONS,
  SENSITIVITY_LABEL,
  SKIN_LABEL,
  STEP_LABEL,
  buildRoutine,
  isCompleteAnswers,
  routineWhatsAppMessage,
  type Answers,
  type TestProduct,
} from "@/lib/skinTest";

const STORAGE_KEY = "yosoy_skin_test";
const COLUMNS =
  "id, slug, name, brand, category, skin_type, skin_types, concerns, price, discount_price, stock, image_url, image_urls, description, ingredients";

const money = (n: number) => `RD$${Number(n).toLocaleString("en-US")}`;

export default function DescubreTuPiel() {
  const total = QUESTIONS.length;
  const [step, setStep] = useState(0); // 0..total-1 = preguntas, total = resultados
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [products, setProducts] = useState<TestProduct[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Carga los productos con stock y, si la persona ya había hecho el test en esta sesión
  // (por ejemplo, volvió desde la ficha de un producto), recupera su resultado.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase.from("products").select(COLUMNS).gt("stock", 0);
      if (cancelled) return;
      if (error) setLoadError(true);
      else setProducts((data ?? []) as TestProduct[]);

      try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
        if (isCompleteAnswers(saved)) {
          setAnswers(saved);
          setStep(total);
        }
      } catch {
        // sin sessionStorage: el test funciona igual, solo que no recuerda el resultado
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [total]);

  const result = useMemo(() => {
    if (step < total || !products || !isCompleteAnswers(answers)) return null;
    return buildRoutine(products, answers);
  }, [step, total, products, answers]);

  const choose = (key: keyof Answers, value: string) => {
    const next = { ...answers, [key]: value } as Partial<Answers>;
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignorar
      }
      setStep(total);
      window.scrollTo({ top: 0 });
    }
  };

  const reset = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorar
    }
    setAnswers({});
    setStep(0);
    window.scrollTo({ top: 0 });
  };

  // ───────────────────────── Preguntas ─────────────────────────
  if (step < total) {
    const q = QUESTIONS[step];
    const current = answers[q.key];
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="rounded-3xl bg-white border border-line shadow-xl shadow-brand/5 p-6 sm:p-10">
          {step === 0 && (
            <p className="mb-6 text-sm text-muted">
              Responde {total} preguntas y te armamos una rutina con productos de nuestro catálogo. Toma menos de un
              minuto.
            </p>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand mb-2">
              <span>
                Pregunta {step + 1} de {total}
              </span>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1 normal-case tracking-normal text-sm font-medium text-muted hover:text-ink transition-colors"
                >
                  <ChevronLeft size={16} aria-hidden="true" /> Anterior
                </button>
              )}
            </div>
            <div
              className="h-1.5 rounded-full bg-blush overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={step + 1}
            >
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${((step + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-6">{q.title}</h1>

          <div className="space-y-3">
            {q.options.map((option) => {
              const selected = current === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => choose(q.key, option.value)}
                  className={`w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all ${
                    selected
                      ? "border-brand bg-brand-soft"
                      : "border-line bg-white hover:border-brand/50 hover:bg-brand-soft/40"
                  }`}
                >
                  <span className="block font-semibold text-ink">{option.label}</span>
                  {option.hint && <span className="mt-0.5 block text-sm text-muted">{option.hint}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // ───────────────────────── Resultados ─────────────────────────
  if (loadError) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-ink">No pudimos cargar los productos</h1>
        <p className="mt-3 text-muted">Revisa tu conexión e inténtalo de nuevo.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-brand px-7 py-3 font-semibold text-white hover:bg-brand-dark transition-colors"
        >
          Reintentar
        </button>
      </main>
    );
  }

  if (!result || !isCompleteAnswers(answers)) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12" aria-busy="true">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-2/3 rounded-lg bg-blush" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-blush/60" />
          ))}
        </div>
      </main>
    );
  }

  const hasDiscount = result.items.some((i) => i.product.discount_price && i.product.discount_price > 0);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="text-center mb-8">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-brand mb-3">Tu rutina Yosoy</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">
          Tu rutina para piel {SKIN_LABEL[answers.skin]}
        </h1>
        <ul className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          <li className="rounded-full bg-blush px-3 py-1 text-ink/80">Objetivo: {CONCERN_LABEL[answers.concern]}</li>
          <li className="rounded-full bg-blush px-3 py-1 text-ink/80">{SENSITIVITY_LABEL[answers.sensitivity]}</li>
          <li className="rounded-full bg-blush px-3 py-1 text-ink/80">
            Rutina {answers.size === "completa" ? "completa" : "básica"}
          </li>
        </ul>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white p-8 text-center">
          <p className="font-semibold text-ink">Por ahora no tenemos productos disponibles para tu perfil.</p>
          <p className="mt-2 text-sm text-muted">Escríbenos y te ayudamos a encontrar una alternativa.</p>
          <a
            href={whatsappLink("¡Hola! Hice el test de piel pero no encontré productos para mi perfil. ¿Me pueden ayudar?")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3 font-semibold text-white hover:bg-[#20bd5a] transition-colors"
          >
            <WhatsAppIcon size={20} /> Escríbenos por WhatsApp
          </a>
        </div>
      ) : (
        <>
          <ol className="space-y-4">
            {result.items.map((item, index) => {
              const p = item.product;
              const image = p.image_urls?.[0] || p.image_url || PLACEHOLDER_IMAGE;
              const optimizable = image.includes(".supabase.co/storage/");
              const discounted = !!p.discount_price && p.discount_price > 0;
              return (
                <li key={p.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft font-display text-sm text-brand">
                        {index + 1}
                      </span>
                      {STEP_LABEL[item.step]}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-2.5 py-1 text-xs font-medium text-sage">
                      {item.when === "Noche" ? (
                        <Moon size={13} aria-hidden="true" />
                      ) : item.when === "Mañana" ? (
                        <Sun size={13} aria-hidden="true" />
                      ) : null}
                      {item.when}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href={`/producto/${p.slug}`}
                      className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl border border-line bg-white"
                    >
                      <Image
                        src={image}
                        alt={p.name}
                        fill
                        sizes="112px"
                        unoptimized={!optimizable && image !== PLACEHOLDER_IMAGE}
                        className="object-contain p-2 mix-blend-multiply"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      {p.brand && (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/70 truncate">
                          {p.brand}
                        </p>
                      )}
                      <Link
                        href={`/producto/${p.slug}`}
                        className="font-sans font-semibold text-ink leading-snug hover:text-brand transition-colors line-clamp-2"
                      >
                        {p.name}
                      </Link>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className={`font-bold ${discounted ? "text-brand" : "text-ink"}`}>{money(item.price)}</span>
                        {discounted && <span className="text-sm text-muted/70 line-through">{money(p.price)}</span>}
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {item.reasons.map((reason) => (
                          <li key={reason} className="rounded-full bg-blush/70 px-2.5 py-0.5 text-xs text-ink/80">
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {item.caution && (
                    <p className="mt-3 flex gap-2 rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand-dark">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                      {item.caution}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>

          {result.notes.length > 0 && (
            <div className="mt-5 space-y-2">
              {result.notes.map((note) => (
                <p key={note} className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
                  {note}
                </p>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-3xl bg-blush p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Total de tu rutina</p>
                {hasDiscount && <p className="text-xs text-muted/80">Incluye precios con descuento</p>}
              </div>
              <p className="font-display text-3xl font-semibold text-ink">{money(result.total)}</p>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappLink(routineWhatsAppMessage(result, answers))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-900/10 hover:bg-[#20bd5a] transition-colors"
              >
                <WhatsAppIcon size={22} /> Pedir esta rutina por WhatsApp
              </a>
              <Link
                href="/catalogo"
                className="flex items-center justify-center rounded-full border border-ink/20 bg-white px-6 py-3.5 font-semibold text-ink hover:border-brand hover:text-brand transition-colors"
              >
                Ver el catálogo
              </Link>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand transition-colors"
        >
          <RefreshCw size={16} aria-hidden="true" /> Repetir el test
        </button>
        <p className="mx-auto mt-4 max-w-xl text-xs text-muted/80 leading-relaxed">
          Esta rutina es una guía basada en la información de cada producto y no reemplaza la opinión de un
          dermatólogo. Si tu piel es muy sensible o tienes alguna condición, consulta con un profesional y prueba cada
          producto en una zona pequeña antes de usarlo.
        </p>
      </div>
    </main>
  );
}
