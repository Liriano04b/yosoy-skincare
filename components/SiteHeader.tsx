"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Truck } from "lucide-react";
import { SHIPPING } from "@/lib/config";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/descubre-tu-piel", label: "Test de piel" },
  { href: "/rutinas", label: "Rutinas" },
  { href: "/catalogo", label: "Catálogo" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40">
      {/* Franja informativa: datos reales de envío */}
      <div className="bg-ink text-cream">
        <p className="max-w-6xl mx-auto px-4 py-2 text-center text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-2">
          <Truck size={14} aria-hidden="true" className="shrink-0" />
          {SHIPPING.announcement}
        </p>
      </div>

      <div className="bg-cream/90 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Yosoy Skincare, ir al inicio">
            <Image
              src="/logo.jpeg"
              alt=""
              width={44}
              height={44}
              priority
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover shadow-sm"
            />
            <span className="leading-none">
              <span className="block font-display text-xl sm:text-2xl font-semibold text-ink">Yosoy</span>
              <span className="block text-[9px] sm:text-[10px] tracking-[0.32em] text-muted uppercase mt-1">
                Skincare
              </span>
            </span>
          </Link>

          {/* Navegación de escritorio */}
          <nav aria-label="Principal" className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-brand-soft text-brand"
                    : "text-ink/80 hover:text-brand hover:bg-brand-soft/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Botón de menú en móvil */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            className="md:hidden p-2 -mr-2 text-ink rounded-full hover:bg-brand-soft transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú desplegable en móvil */}
        {menuOpen && (
          <nav aria-label="Principal" className="md:hidden border-t border-line bg-cream px-4 py-3 animate-in">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`block px-3 py-3 rounded-xl text-base font-medium ${
                      isActive(link.href) ? "bg-brand-soft text-brand" : "text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
