"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Droplets, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export default function Rutinas() {
  const [showRoutine, setShowRoutine] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navegación Superior */}
      <nav className="bg-white border-b border-gray-100 p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#E50000] transition-colors font-medium">
            <ArrowLeft size={20} /> Volver al Inicio
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Rutinas <span className="text-[#E50000]">Yosoy</span>
          </h1>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <Sparkles className="text-[#E50000] mx-auto mb-4" size={36} />
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Soluciones Paso a Paso</h2>
          <p className="text-gray-600 max-w-xl mx-auto text-lg">
            No te pierdas buscando productos sueltos. Hemos diseñado combinaciones sinérgicas para tratar necesidades específicas de tu piel.
          </p>
        </div>

        {/* Tarjeta de Rutina: Hidratación Profunda */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-red-100/50 border border-red-50 relative overflow-hidden transition-all duration-300">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <span className="bg-blue-50 text-blue-600 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider uppercase mb-4 inline-block">
                Piel Seca o Deshidratada
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Rutina Hidratación Profunda</h3>
              <p className="text-gray-600 mt-2 text-md md:text-lg max-w-2xl">
                Recupera y mantén la hidratación durante todo el día con esta sinergia de ingredientes calmantes.
              </p>
            </div>
            
            <button 
              onClick={() => setShowRoutine(!showRoutine)}
              className="w-full md:w-auto bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              {showRoutine ? (
                <>Ocultar Detalles <ChevronUp size={20} /></>
              ) : (
                <>Ver Pasos de la Rutina <ChevronDown size={20} /></>
              )}
            </button>
          </div>

          {showRoutine && (
            <div className="border-t border-gray-100 pt-8 mt-8 flex flex-col md:flex-row gap-12 items-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex-1">
                <div className="space-y-4 mb-10">
                  <div className="flex gap-4">
                    <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center font-bold text-[#E50000] shrink-0">1</div>
                    <div>
                      <p className="font-bold text-gray-900">Limpieza</p>
                      <p className="text-sm text-gray-500">Gel limpiador suave de bajo pH</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center font-bold text-[#E50000] shrink-0">2</div>
                    <div>
                      <p className="font-bold text-gray-900">Preparación</p>
                      <p className="text-sm text-gray-500">Tónico calmante</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center font-bold text-[#E50000] shrink-0">3</div>
                    <div>
                      <p className="font-bold text-gray-900">Tratamiento e Hidratación</p>
                      <p className="text-sm text-gray-500">Esencia hidratante + Crema selladora</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 bg-red-50/50 p-6 rounded-2xl border border-red-50">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-[#E50000] font-bold uppercase tracking-wider">Valor del kit</p>
                    <p className="text-3xl font-extrabold text-gray-900">RD$4,500</p>
                  </div>
                  <button className="w-full sm:w-auto bg-[#E50000] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                    <CheckCircle2 size={22} />
                    QUIERO ESTA RUTINA
                  </button>
                </div>
              </div>

              <div className="w-full md:w-2/5 aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative z-10 p-6">
                <div className="text-center text-gray-400">
                  <Sparkles size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Foto del Kit de Hidratación</p>
                </div>
              </div>
            </div>
          )}
          
          <Droplets className="absolute -bottom-10 -right-10 text-red-50 opacity-30 pointer-events-none" size={250} />
        </div>
      </main>
    </div>
  );
}