import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test de piel: arma tu rutina",
  description:
    "Responde 4 preguntas sobre tu piel y te armamos una rutina paso a paso con productos de nuestro catálogo.",
  alternates: { canonical: "/descubre-tu-piel" },
};

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
