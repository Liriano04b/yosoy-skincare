"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// A dónde ir si la persona llegó directo a la página (sin historial dentro de la tienda).
function fallbackFor(pathname: string): string {
  if (pathname.startsWith("/producto/")) return "/catalogo";
  return "/";
}

// Botón "Volver" para todas las páginas internas de la tienda.
// - Si la persona navegó dentro del sitio, vuelve a la página anterior real.
// - Si llegó directo (por un enlace de WhatsApp o Instagram, por ejemplo), la lleva al catálogo o al inicio
//   en lugar de sacarla de la tienda.
export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const lastPath = useRef<string | null>(null);
  const internalNavigations = useRef(0);

  useEffect(() => {
    if (lastPath.current !== null && lastPath.current !== pathname) {
      internalNavigations.current += 1;
    }
    lastPath.current = pathname;
  }, [pathname]);

  if (pathname === "/") return null;

  const handleBack = () => {
    if (internalNavigations.current > 0) {
      router.back();
    } else {
      router.push(fallbackFor(pathname));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 -ml-2 px-2 py-1.5 rounded-full text-sm font-medium text-muted hover:text-brand hover:bg-brand-soft transition-colors"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Volver
      </button>
    </div>
  );
}
