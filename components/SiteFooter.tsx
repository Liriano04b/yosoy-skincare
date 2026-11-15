import Image from "next/image";
import Link from "next/link";
import { Truck, Banknote } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PAYMENT_METHODS,
  SHIPPING,
  WHATSAPP_DISPLAY,
  whatsappLink,
} from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-cream/80 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/logo.jpeg"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
            <span className="leading-none">
              <span className="block font-display text-2xl font-semibold text-cream">Yosoy</span>
              <span className="block text-[10px] tracking-[0.32em] uppercase mt-1 text-cream/60">Skincare</span>
            </span>
          </div>
          <p className="font-display italic text-lg text-cream">Tu piel, tu mejor versión.</p>
        </div>

        {/* Explorar */}
        <nav aria-label="Pie de página">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-cream mb-4">Explorar</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/descubre-tu-piel" className="hover:text-white transition-colors">Test de piel</Link></li>
            <li><Link href="/rutinas" className="hover:text-white transition-colors">Rutinas</Link></li>
            <li><Link href="/catalogo" className="hover:text-white transition-colors">Catálogo completo</Link></li>
          </ul>
        </nav>

        {/* Envíos y pagos */}
        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-cream mb-4">Envíos y pagos</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2.5">
              <Truck size={16} className="mt-0.5 shrink-0 text-cream/60" aria-hidden="true" />
              <span>
                {SHIPPING.santoDomingo}.<br />
                {SHIPPING.nacional}.
              </span>
            </li>
            <li className="flex gap-2.5">
              <Banknote size={16} className="mt-0.5 shrink-0 text-cream/60" aria-hidden="true" />
              <span>{PAYMENT_METHODS}.</span>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-cream mb-4">Escríbenos</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={whatsappLink("¡Hola! Quisiera más información sobre Yosoy Skincare.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <WhatsAppIcon size={16} className="text-cream/60" />
                WhatsApp {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-cream/60">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
                @{INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <p className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-xs text-cream/50 text-center sm:text-left">
          © {new Date().getFullYear()} Yosoy Skincare. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
