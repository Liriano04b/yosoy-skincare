import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand mb-3">Error 404</p>
      <h1 className="text-4xl sm:text-5xl font-semibold text-ink">No encontramos esta página</h1>
      <p className="mt-4 text-muted">
        Puede que el enlace haya cambiado o que el producto ya no esté disponible. Te dejamos algunos caminos:
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white hover:bg-brand-dark transition-colors"
        >
          Ver el catálogo <ArrowRight size={18} aria-hidden="true" />
        </Link>
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
