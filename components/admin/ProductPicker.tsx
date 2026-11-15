"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PickerProduct = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  discount_price: number | null;
};

const money = (n: number) => `RD$${Number(n).toLocaleString("en-US")}`;
const normalize = (s: string | null | undefined) =>
  (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Selector de los productos que incluye una rutina o kit (admin).
export default function ProductPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, category, price, discount_price")
        .order("name");
      if (!cancelled && data) setProducts(data as PickerProduct[]);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => value.map((id) => products.find((p) => p.id === id)).filter(Boolean) as PickerProduct[],
    [value, products]
  );
  const results = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      if (value.includes(p.id)) return false;
      const hay = normalize(`${p.name} ${p.brand} ${p.category}`);
      return words.every((w) => hay.includes(w));
    });
  }, [products, query, value]);

  return (
    <div>
      <label className="block text-sm font-medium text-ink/80 mb-1">Productos que incluye el kit</label>
      <p className="text-xs text-muted mb-2">
        Se muestran en la página de rutinas, en el orden en que los elijas. El precio del kit sigue siendo el que escribas arriba.
      </p>

      {selected.length > 0 && (
        <ol className="mb-3 space-y-1.5">
          {selected.map((p, i) => (
            <li key={p.id} className="flex items-center gap-2 rounded-lg border border-line bg-cream px-3 py-2 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span className="flex-1 truncate text-ink">{p.name}</span>
              <span className="shrink-0 text-muted">
                {money(p.discount_price && p.discount_price > 0 && p.discount_price < p.price ? p.discount_price : p.price)}
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((id) => id !== p.id))}
                aria-label={`Quitar ${p.name}`}
                className="shrink-0 text-muted hover:text-brand"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted/70" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar un producto para agregarlo…"
          className="w-full rounded-lg border border-muted/30 py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-line bg-white">
        {results.length === 0 ? (
          <li className="px-3 py-3 text-sm text-muted">No hay más productos que coincidan.</li>
        ) : (
          results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onChange([...value, p.id])}
                className="flex w-full items-center justify-between gap-3 border-b border-line/60 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-cream"
              >
                <span className="truncate text-ink">{p.name}</span>
                <span className="shrink-0 text-xs text-muted">{p.category}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
