"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";

export default function CartWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  // Cambia este número por el WhatsApp de ventas de Yosoy Skincare (incluye el código de país, ej: 1829...)
  const WHATSAPP_NUMBER = "18299183389"; 

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    let message = "¡Hola! Me gustaría hacer un pedido en Yosoy Skincare:%0A%0A";
    cart.forEach((item) => {
      message += `- ${item.quantity}x ${item.name} ($${item.price})%0A`;
    });
    message += `%0A*Total: $${totalPrice}*`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#E50000] text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transition-transform hover:scale-105 flex items-center justify-center"
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
            {totalItems}
          </span>
        )}
      </button>

      {/* Menú Lateral (Sidebar) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Fondo oscuro desenfocado */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Panel Blanco */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Tu Carrito</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-[#E50000] transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingCart size={48} className="opacity-50" />
                  <p className="text-lg">Tu carrito está vacío.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-gray-50 pb-4">
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                      <p className="text-[#E50000] font-semibold mt-1">${item.price}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-gray-100 p-1.5 rounded-md hover:bg-gray-200 text-gray-700"><Minus size={14} /></button>
                        <span className="font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-gray-100 p-1.5 rounded-md hover:bg-gray-200 text-gray-700"><Plus size={14} /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-2">
                      <X size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total y Botón de Pago */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between mb-6 text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span>${totalPrice}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl hover:bg-[#1DA851] shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2 text-lg"
                >
                  Pedir por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}