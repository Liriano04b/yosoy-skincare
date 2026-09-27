"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Sparkles, CheckCircle2, RefreshCw, ChevronLeft } from "lucide-react";

export default function DescubreTuPiel() {
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState("");
  const [skinGoal, setSkinGoal] = useState("");
  const [isSensitive, setIsSensitive] = useState("");
  
  const [loadingResult, setLoadingResult] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  const handleNextStep = (answer: string, type: 'skin' | 'goal' | 'sensitive') => {
    if (type === 'skin') setSkinType(answer);
    if (type === 'goal') setSkinGoal(answer);
    if (type === 'sensitive') {
      setIsSensitive(answer);
      fetchRecommendations(skinType);
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // ALGORITMO ACTUALIZADO
  const fetchRecommendations = async (selectedSkinType: string) => {
    setLoadingResult(true);
    let dbSkinQuery = "Todo tipo de piel";
    
    if (selectedSkinType.includes("Seca")) dbSkinQuery = "Piel Seca";
    else if (selectedSkinType.includes("Grasa")) dbSkinQuery = "Piel Grasa";
    else if (selectedSkinType.includes("Mixta")) dbSkinQuery = "Piel Mixta";
    else if (selectedSkinType.includes("Sensible")) dbSkinQuery = "Piel Sensible";
    else if (selectedSkinType.includes("manchas")) dbSkinQuery = "Piel con manchas";
    else if (selectedSkinType.includes("expresión")) dbSkinQuery = "Linea de expresión";

    // Buscamos productos específicos para el tipo de piel O los generales ("Todo tipo de piel")
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`skin_type.eq.${dbSkinQuery},skin_type.eq.Todo tipo de piel`);

    if (data && data.length > 0) {
      // 1. Damos prioridad a los productos que son EXACTAMENTE para el problema del usuario
      const sortedData = data.sort((a, b) => {
        if (a.skin_type === dbSkinQuery && b.skin_type !== dbSkinQuery) return -1;
        if (a.skin_type !== dbSkinQuery && b.skin_type === dbSkinQuery) return 1;
        return 0;
      });

      // 2. Armamos una rutina completa evitando repetir categorías (hasta 5 productos)
      const routine: any[] = [];
      const categoriesAdded = new Set();

      for (const prod of sortedData) {
        // Ignoramos productos sin categoría si queremos armar rutinas
        if (prod.category && !categoriesAdded.has(prod.category) && routine.length < 5) {
          routine.push(prod);
          categoriesAdded.add(prod.category);
        }
      }

      // 3. Si no llegamos a 5 productos, rellenamos con lo que quede disponible
      if (routine.length < 5) {
        for (const prod of sortedData) {
          if (!routine.find(r => r.id === prod.id) && routine.length < 5) {
            routine.push(prod);
          }
        }
      }

      setRecommendedProducts(routine);
    } else {
      setRecommendedProducts([]);
    }

    setTimeout(() => {
      setLoadingResult(false);
      setResultReady(true);
    }, 1500); // Simulamos que la IA está calculando la rutina ideal
  };

  const resetQuiz = () => {
    setStep(1);
    setSkinType("");
    setSkinGoal("");
    setIsSensitive("");
    setResultReady(false);
    setRecommendedProducts([]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-white border-b border-gray-100 p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#E50000] transition-colors font-medium">
            <ArrowLeft size={20} /> Volver al Inicio
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Test <span className="text-[#E50000]">Yosoy</span>
          </h1>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-red-100/30 border border-gray-100 relative">
          
          {!resultReady && !loadingResult && step > 1 && (
            <button 
              onClick={handlePrevStep}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
              <ChevronLeft size={18} /> Anterior
            </button>
          )}

          {/* PASO 1: TIPOS DE PIEL (ACTUALIZADO) */}
          {!resultReady && !loadingResult && step === 1 && (
            <div>
              <span className="text-xs font-bold text-[#E50000] uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">
                Pregunta 1 de 3
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-4 mb-8">
                ¿Cómo describirías tu tipo de piel o preocupación principal?
              </h2>
              <div className="space-y-4">
                {[
                  "Piel Seca (Tirante o escamosa)",
                  "Piel Grasa (Brillo constante o exceso de sebo)",
                  "Piel Mixta (Grasa en zona T, seca en mejillas)",
                  "Piel Sensible / Reactiva",
                  "Piel con manchas (Hiperpigmentación u ojeras)", // NUEVO
                  "Línea de expresión (Prevención y antienvejecimiento)" // NUEVO
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNextStep(option, 'skin')}
                    className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:border-[#E50000] hover:bg-red-50/20 font-medium text-gray-800 transition-all shadow-sm"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {!resultReady && !loadingResult && step === 2 && (
            <div>
              <span className="text-xs font-bold text-[#E50000] uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">
                Pregunta 2 de 3
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-4 mb-8">
                ¿Qué es lo que más te gustaría mejorar en tu rostro?
              </h2>
              <div className="space-y-4">
                {[
                  "Recuperar hidratación profunda y luminosidad",
                  "Controlar brotes, acné y poros dilatados",
                  "Disminuir manchas y unificar el tono",
                  "Prevenir arrugas y mejorar la firmeza", // Ajustado para encajar con el nuevo paso
                  "Calmar rojeces y sensibilidad"
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNextStep(option, 'goal')}
                    className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:border-[#E50000] hover:bg-red-50/20 font-medium text-gray-800 transition-all shadow-sm"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {!resultReady && !loadingResult && step === 3 && (
            <div>
              <span className="text-xs font-bold text-[#E50000] uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">
                Pregunta 3 de 3
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-4 mb-8">
                ¿Tu piel suele irritarse o reaccionar con facilidad a los cosméticos?
              </h2>
              <div className="space-y-4">
                {[
                  "Sí, es muy sensible y reactiva",
                  "A veces, dependiendo del producto",
                  "No, tolera muy bien los ingredientes"
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNextStep(option, 'sensitive')}
                    className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:border-[#E50000] hover:bg-red-50/20 font-medium text-gray-800 transition-all shadow-sm"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ESTADO DE CARGA */}
          {loadingResult && (
            <div className="text-center py-16">
              <Sparkles className="text-[#E50000] animate-spin mx-auto mb-6" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Diseñando tu rutina...</h3>
              <p className="text-gray-500">Filtrando los mejores productos para tu tipo de piel.</p>
            </div>
          )}

          {/* RESULTADOS */}
          {resultReady && (
            <div className="animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <span className="bg-emerald-50 text-emerald-600 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider uppercase inline-block mb-3">
                  Recomendación basada en tu perfil
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900">Tu Rutina Yosoy Ideal</h2>
                <p className="text-gray-600 mt-2 text-sm">
                  Perfil detectado: <span className="font-semibold text-gray-900">{skinType.split('(')[0].trim()}</span> con objetivo de <span className="font-semibold text-gray-900">{skinGoal.toLowerCase()}</span>.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Productos sugeridos para ti:</p>
                
                {recommendedProducts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-gray-600 font-medium mb-2">¡Pronto tendremos productos específicos para este tipo de piel!</p>
                    <p className="text-xs text-gray-400">Mientras tanto, puedes explorar todo nuestro catálogo general.</p>
                  </div>
                ) : (
                  recommendedProducts.map((prod) => {
                    const isOutofStock = prod.stock <= 0;
                    const hasDiscount = prod.discount_price && prod.discount_price > 0 && !isOutofStock;

                    return (
                      <Link 
                        href={`/producto/${prod.slug}`} 
                        key={prod.id} 
                        className={`flex items-center gap-4 p-4 rounded-2xl border ${isOutofStock ? 'border-gray-100 opacity-80' : 'border-gray-100 hover:border-[#E50000] hover:bg-red-50/10'} transition-all group relative overflow-hidden`}
                      >
                        {/* IMAGEN DEL PRODUCTO (Estilo catálogo) */}
                        <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-xl p-2 border border-gray-100">
                          <img 
                            src={prod.image_urls?.[0] || prod.image_url} 
                            alt={prod.name} 
                            className={`w-full h-full object-contain mix-blend-multiply ${isOutofStock ? 'opacity-50' : ''}`} 
                          />
                          {isOutofStock && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="bg-[#E50000] text-white font-bold px-1.5 py-0.5 rounded text-[8px] tracking-widest shadow-md text-center">
                                AGOTADO
                              </span>
                            </div>
                          )}
                        </div>

                        {/* DETALLES DEL PRODUCTO */}
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold text-gray-400 uppercase truncate">{prod.brand}</p>
                            {prod.category && (
                              <span className="text-[10px] font-bold text-[#E50000] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md uppercase tracking-wide whitespace-nowrap ml-2">
                                {prod.category}
                              </span>
                            )}
                          </div>
                          
                          <h4 className={`font-bold line-clamp-1 transition-colors ${isOutofStock ? 'text-gray-500' : 'text-gray-900 group-hover:text-[#E50000]'}`}>
                            {prod.name}
                          </h4>
                          
                          {/* PRECIOS */}
                          {hasDiscount ? (
                            <div className="flex items-baseline gap-2 mt-1">
                              <p className="text-sm font-extrabold text-[#E50000]">RD${prod.discount_price.toLocaleString()}</p>
                              <p className="text-xs font-semibold text-gray-400 line-through">RD${prod.price.toLocaleString()}</p>
                            </div>
                          ) : (
                            <p className={`text-sm font-extrabold mt-1 ${isOutofStock ? 'text-gray-400' : 'text-gray-900'}`}>
                              RD${prod.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              {/* BOTONES FINALES */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={resetQuiz}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} /> Repetir Test
                </button>
                <Link 
                  href="/catalogo" 
                  className="w-full bg-[#E50000] hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                >
                  <CheckCircle2 size={18} /> Ver Todo el Catálogo
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}