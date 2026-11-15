import type { Metadata } from "next";

// El panel de administración no debe aparecer en buscadores
export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
