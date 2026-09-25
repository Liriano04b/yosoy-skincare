"use client";

import Link from "next/link";
import { ShoppingBag, Sparkles, ClipboardList, ArrowRight, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navegación Superior */}
      <nav className="border-b border-gray-100 p-6 relative z-20 bg-white">
        <div className="max-w-6xl mx-auto flex justify-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Yosoy <span className="text-[#E50000]">Skincare</span>
          </h1>
        </div>
      </nav>

      {/* Banner Principal con el Logo de Fondo (Solo título y bajada principal) */}
      <header className="relative py-20 md:py-28 px-6 text-center overflow-hidden border-b border-gray-100">
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: "url('/logo.jpeg')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            opacity: 0.75
          }}
        />
        <div className="absolute inset-0 z-0 bg-white/60"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow-sm">
            Tu viaje hacia una piel sana comienza aquí
          </h2>
          <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium">
            No vendemos solo productos, te ayudamos a construir el hábito que transformará tu rostro.
          </p>
        </div>
      </header>

      {/* Sección de Opciones con la pregunta destacada arriba */}
      <main className="max-w-5xl mx-auto px-6 py-16 md:py-20 relative z-10 bg-white">
        
        {/* Pregunta movida aquí */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            ¿Qué te gustaría hacer hoy?
          </h3>
          <p className="text-gray-500 mt-2">Selecciona una de nuestras opciones para comenzar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Opción 1: El Quiz */}
          <Link href="/descubre-tu-piel" className="group">
            <div className="h-full bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#E50000] hover:shadow-2xl hover:shadow-red-100 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden transform group-hover:-translate-y-2">
              <div className="bg-red-50 text-[#E50000] w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ClipboardList size={36} />
              </div>
              <span className="absolute top-4 right-4 bg-[#E50000] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Recomendado
              </span>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Descubre tu rutina ideal</h4>
              <p className="text-gray-600 mb-8 flex-grow">
                Responde unas breves preguntas sobre tu piel y recibe una recomendación personalizada al instante.
              </p>
              <div className="flex items-center gap-2 text-[#E50000] font-bold group-hover:gap-4 transition-all">
                Comenzar Test <ArrowRight size={20} />
              </div>
            </div>
          </Link>

          {/* Opción 2: Rutinas Armadas */}
          <Link href="/rutinas" className="group">
            <div className="h-full bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#E50000] hover:shadow-2xl hover:shadow-red-100 transition-all duration-300 flex flex-col items-center text-center transform group-hover:-translate-y-2">
              <div className="bg-gray-50 text-gray-900 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-50 group-hover:text-[#E50000] transition-colors duration-300">
                <Sparkles size={36} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Ver Rutinas</h4>
              <p className="text-gray-600 mb-8 flex-grow">
                Soluciones completas paso a paso. Diseñadas para hidratar, controlar acné, manchas y más.
              </p>
              <div className="flex items-center gap-2 text-gray-900 font-bold group-hover:text-[#E50000] group-hover:gap-4 transition-all">
                Explorar Rutinas <ArrowRight size={20} />
              </div>
            </div>
          </Link>

          {/* Opción 3: Catálogo Libre */}
          <Link href="/catalogo" className="group">
            <div className="h-full bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#E50000] hover:shadow-2xl hover:shadow-red-100 transition-all duration-300 flex flex-col items-center text-center transform group-hover:-translate-y-2">
              <div className="bg-gray-50 text-gray-900 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-50 group-hover:text-[#E50000] transition-colors duration-300">
                <ShoppingBag size={36} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Catálogo Completo</h4>
              <p className="text-gray-600 mb-8 flex-grow">
                ¿Ya sabes lo que buscas? Explora todos nuestros productos individuales disponibles en inventario.
              </p>
              <div className="flex items-center gap-2 text-gray-900 font-bold group-hover:text-[#E50000] group-hover:gap-4 transition-all">
                Ver Inventario <ArrowRight size={20} />
              </div>
            </div>
          </Link>

        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-gray-900 text-white py-12 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Heart className="text-[#E50000]" size={20} />
          <span className="font-bold text-xl tracking-wider">Yosoy Skincare</span>
        </div>
        <p className="text-gray-400 text-sm">Tu Piel, Tu Mejor Versión.</p>
        <p className="text-gray-500 text-xs mt-2">© 2026 Yosoy Skincare. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}