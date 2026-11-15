"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Protección única para todo /admin/dashboard/*: si no hay sesión, se vuelve al login.
// Las pantallas nuevas del panel quedan protegidas solas, sin repetir la comprobación.
// (La seguridad real de los datos sigue siendo Supabase; esto evita mostrar pantallas a quien no ha entrado.)
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) setAllowed(true);
      else router.replace("/admin");
    });
    // Si la sesión se cierra (en esta u otra pestaña), también se sale del panel
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin");
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (!allowed) return <div className="p-10 text-center text-muted">Verificando acceso...</div>;
  return children;
}
