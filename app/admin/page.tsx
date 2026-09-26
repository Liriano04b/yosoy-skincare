"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Yosoy Admin</h1>

        <form onSubmit={handleLogin} className="space-y-5">
          {/*Fragmento clave para las etiquetas y inputs en tu formulario de admin:*/}
          {/* Campo de Correo Electrónico */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E50000] focus:ring-2 focus:ring-red-100 transition-all font-medium"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Campo de Contraseña */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E50000] focus:ring-2 focus:ring-red-100 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-[#E50000] text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#E50000] text-white font-medium rounded-lg p-3 hover:bg-red-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}