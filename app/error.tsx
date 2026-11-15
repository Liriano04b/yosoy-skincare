"use client";

import Link from "next/link";

// Se muestra si algo falla inesperadamente al cargar una página.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl sm:text-5xl font-semibold text-ink">Algo no salió como esperábamos</h1>
      <p className="mt-4 text-muted">Puedes intentarlo de nuevo. Si sigue pasando, escríbenos por WhatsApp.</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3.5 font-semibold text-white hover:bg-brand-dark transition-colors"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-ink/20 px-7 py-3.5 font-semibold text-ink hover:border-brand hover:text-brand transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
