"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } else {
      window.location.href = "/admin/dashboard";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-line">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand transition-colors mb-4"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Volver a la tienda
        </a>
        <h1 className="text-2xl font-bold text-ink mb-6 text-center">Yosoy Admin</h1>

        <form onSubmit={handleLogin} className="space-y-5">
          {/*Fragmento clave para las etiquetas y inputs en tu formulario de admin:*/}
          {/* Campo de Correo Electrónico */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-muted/30 text-ink placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Campo de Contraseña */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-ink mb-2">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-muted/30 text-ink placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-brand text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-brand text-white font-medium rounded-lg p-3 hover:bg-brand-dark transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}