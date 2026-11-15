"use client";

import toast from "react-hot-toast";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type CartItem = {
    id: string;
    name: string;
    slug?: string; // para enlazar el artículo a su ficha (los carritos antiguos no lo tienen; se completa al abrir el carrito)
    price: number;
    image_url: string;
    quantity: number;
    stock?: number; // unidades disponibles cuando se agregó (se actualiza al abrir el carrito)
};

type CartContextType = {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    refreshCart: () => Promise<void>;
    totalItems: number;
    totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const unidades = (n: number) => `${n} ${n === 1 ? "unidad" : "unidades"}`;

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Cargar el carrito guardado en el navegador al entrar a la página
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem("yosoy_cart");
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                // Solo aceptamos artículos con la forma esperada; un dato corrupto no debe romper la tienda
                if (Array.isArray(parsed)) {
                    // Leer localStorage solo puede hacerse en el navegador, tras el primer render (evita errores de hidratación)
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setCart(
                        parsed.filter(
                            (item) =>
                                item &&
                                typeof item.id === "string" &&
                                typeof item.name === "string" &&
                                typeof item.price === "number" &&
                                typeof item.quantity === "number" &&
                                item.quantity >= 1
                        )
                    );
                }
            }
        } catch {
            localStorage.removeItem("yosoy_cart");
        }
        setHydrated(true);
    }, []);

    // Guardar el carrito cada vez que haya un cambio (solo después de leer el guardado,
    // para no pisarlo con un carrito vacío al cargar)
    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem("yosoy_cart", JSON.stringify(cart));
        } catch {
            // Almacenamiento lleno o bloqueado (modo privado): el carrito sigue funcionando en memoria
        }
    }, [cart, hydrated]);

    const addToCart = (product: Omit<CartItem, "quantity">) => {
        const existing = cart.find((item) => item.id === product.id);
        const stock = product.stock ?? existing?.stock;

        // No se puede pedir más de lo que hay
        if (stock !== undefined && (existing?.quantity ?? 0) >= stock) {
            toast(`Solo hay ${unidades(stock)} disponible${stock === 1 ? "" : "s"} de este producto`);
            return;
        }

        setCart((prev) => {
            if (prev.some((item) => item.id === product.id)) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1, price: product.price, stock: stock ?? item.stock }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        toast.success(`${product.name} agregado al carrito`);
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
        toast("Producto eliminado del carrito");
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        const item = cart.find((i) => i.id === id);
        if (item?.stock !== undefined && quantity > item.stock) {
            toast(`Solo hay ${unidades(item.stock)} disponible${item.stock === 1 ? "" : "s"} de este producto`);
            return;
        }
        setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    };

    const clearCart = () => setCart([]);

    // Al abrir el carrito se revisan precios y existencias actuales, para que lo que ve la persona
    // (y lo que se envía por WhatsApp) siempre sea correcto.
    const refreshCart = useCallback(async () => {
        const ids = cart.map((item) => item.id);
        if (ids.length === 0) return;

        const { data, error } = await supabase
            .from("products")
            .select("id, slug, name, price, discount_price, stock, image_url, image_urls")
            .in("id", ids);
        if (error || !data) return; // sin conexión: se deja el carrito como está

        const notes: string[] = [];
        const next: CartItem[] = [];
        for (const item of cart) {
            const fresh = data.find((p) => p.id === item.id);
            if (!fresh || fresh.stock <= 0) {
                notes.push(`${item.name} ya no está disponible y lo quitamos de tu carrito.`);
                continue;
            }
            const price =
                fresh.discount_price && fresh.discount_price > 0 && fresh.discount_price < fresh.price
                    ? Number(fresh.discount_price)
                    : Number(fresh.price);
            const quantity = Math.min(item.quantity, fresh.stock);
            if (quantity < item.quantity) {
                notes.push(`Solo quedan ${unidades(fresh.stock)} de ${item.name}; ajustamos tu cantidad.`);
            }
            if (price !== item.price) {
                notes.push(`Actualizamos el precio de ${item.name}.`);
            }
            next.push({
                ...item,
                name: fresh.name,
                slug: fresh.slug || item.slug,
                price,
                quantity,
                stock: fresh.stock,
                image_url: fresh.image_urls?.[0] || fresh.image_url || item.image_url,
            });
        }

        const changed = JSON.stringify(next) !== JSON.stringify(cart);
        if (changed) setCart(next);
        notes.slice(0, 3).forEach((note) => toast(note, { duration: 5000 }));
    }, [cart]);

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart, totalItems, totalPrice }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart debe ser usado dentro de un CartProvider");
    }
    return context;
}
