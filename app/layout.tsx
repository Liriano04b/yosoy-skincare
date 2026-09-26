import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Importaciones del sistema
import { CartProvider } from "@/context/CartContext";
import CartWidget from "@/components/CartWidget";
import { Toaster } from "react-hot-toast"; // <-- 1. NUEVA IMPORTACIÓN

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yosoy Skincare",
  description: "Tu viaje hacia una piel sana comienza aquí",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <CartWidget />
          {/* 2. CONTENEDOR DE LAS NOTIFICACIONES */}
          <Toaster 
            position="bottom-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '12px',
              }
            }} 
          />
        </CartProvider>
      </body>
    </html>
  );
}