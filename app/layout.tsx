import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

// Importaciones del sistema
import { CartProvider } from "@/context/CartContext";
import SiteShell from "@/components/SiteShell";
import { Toaster } from "react-hot-toast";
import { SITE_NAME, SITE_URL } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Fuente de títulos (serifa suave)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_DESCRIPTION =
  "Skincare coreano con envíos a toda República Dominicana. Elige tus productos, arma tu rutina y haz tu pedido por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yosoy Skincare | Skincare coreano en República Dominicana",
    template: "%s | Yosoy Skincare",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_DO",
    title: "Yosoy Skincare | Skincare coreano en República Dominicana",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <SiteShell>{children}</SiteShell>
          {/* Notificaciones (toasts) */}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#2b2523',
                color: '#fbf8f5',
                fontWeight: '600',
                borderRadius: '12px',
              }
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}