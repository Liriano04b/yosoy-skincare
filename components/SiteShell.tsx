"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartWidget from "@/components/CartWidget";
import BackButton from "@/components/BackButton";

// Marco común de la tienda pública: encabezado, contenido, pie y carrito.
// El panel de administración (/admin) tiene su propio diseño y no lo usa.
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  // El carrito flotante solo se muestra donde se compra: catálogo y fichas de producto
  const showCart = pathname.startsWith("/catalogo") || pathname.startsWith("/producto");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">
        <BackButton />
        {children}
      </div>
      <SiteFooter />
      {showCart && <CartWidget lift={pathname.startsWith("/producto")} />}
    </div>
  );
}
