import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de skincare coreano",
  description:
    "Limpiadores, sérums, hidratantes y protectores solares de skincare coreano. Envíos a todo el país y pedido por WhatsApp.",
  alternates: { canonical: "/catalogo" },
};

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
