"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { whatsappLink } from "@/lib/config";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import ProductCard, { type CardProduct } from "@/components/ProductCard";

const ITEMS_PER_PAGE = 16;
const STORAGE_KEY = "yosoy_catalog_state";
const COLUMNS =
  "id, slug, name, brand, category, price, discount_price, stock, image_url, image_urls, created_at";

type CatalogProduct = CardProduct & { created_at: string };
type SortKey = "recientes" | "precio-asc" | "precio-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

// Para buscar sin importar tildes ni mayúsculas ("serum" encuentra "Sérum")
const normalize = (s: string | null | undefined) =>
  (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const effectivePrice = (p: CardProduct) =>
  p.discount_price && p.discount_price > 0 && p.discount_price < p.price ? p.discount_price : p.price;

export default function Catalogo() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recientes");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Carga los productos y, si la persona viene de ver un producto, recupera sus filtros y su posición.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("products")
        .select(COLUMNS)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) setLoadError(true);
      else setProducts((data ?? []) as CatalogProduct[]);

      let scrollY = 0;
      try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
        if (saved) {
          setQuery(saved.query ?? "");
          setSort(saved.sort ?? "recientes");
          setSelectedCategories(saved.categories ?? []);
          setSelectedBrands(saved.brands ?? []);
          setCurrentPage(saved.page ?? 1);
          scrollY = saved.scrollY ?? 0;
        }
      } catch {
        // sin sessionStorage: el catálogo funciona igual
      }
      setLoading(false);
      if (scrollY > 0) setTimeout(() => window.scrollTo({ top: scrollY, behavior: "instant" }), 80);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Guarda filtros, página y posición para que "Volver" desde un producto deje todo como estaba.
  useEffect(() => {
    if (loading) return;
    let frame = 0;
    const save = () => {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            query,
            sort,
            categories: selectedCategories,
            brands: selectedBrands,
            page: currentPage,
            scrollY: window.scrollY,
          })
        );
      } catch {
        // ignorar
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(save);
    };
    save();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [loading, query, sort, selectedCategories, selectedBrands, currentPage]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[])).sort(),
    [products]
  );
  // Las marcas se normalizan para agrupar "SKIN1004" y "skin1004 " como una sola
  const brands = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.brand?.trim().toUpperCase()).filter(Boolean) as string[])).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    // Cada palabra escrita debe aparecer en el nombre, la marca o la categoría (en cualquier orden)
    const words = normalize(query).split(/\s+/).filter(Boolean);
    const list = products.filter((p) => {
      const matchCategory = selectedCategories.length === 0 || (!!p.category && selectedCategories.includes(p.category));
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand?.trim().toUpperCase() ?? "");
      const haystack = normalize(`${p.name} ${p.brand} ${p.category}`);
      const matchQuery = words.every((w) => haystack.includes(w));
      return matchCategory && matchBrand && matchQuery;
    });
    if (sort === "precio-asc") return [...list].sort((a, b) => effectivePrice(a) - effectivePrice(b));
    if (sort === "precio-desc") return [...list].sort((a, b) => effectivePrice(b) - effectivePrice(a));
    return list; // ya vienen ordenados por fecha
  }, [products, query, sort, selectedCategories, selectedBrands]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const hasFilters = query !== "" || selectedCategories.length > 0 || selectedBrands.length > 0;

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setCurrentPage(1);
  };

  const goToPage = (n: number) => {
    setCurrentPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chipClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "border-brand bg-brand text-white"
        : "border-line bg-white text-ink/80 hover:border-brand hover:text-brand"
    }`;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-10 sm:pb-14">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">Catálogo</h1>
        <p className="mt-1 text-muted">Skincare coreano para cada tipo de piel.</p>
      </header>

      {/* Búsqueda y orden */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted/70" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por producto, marca o categoría"
            aria-label="Buscar productos"
            className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-10 text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCurrentPage(1);
              }}
              aria-label="Borrar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-brand"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortKey);
            setCurrentPage(1);
          }}
          aria-label="Ordenar productos"
          className="rounded-full border border-line bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros siempre visibles, con desplazamiento horizontal en móvil */}
      {!loading && products.length > 0 && (
        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted/80">Categoría</p>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0">
              <button type="button" onClick={() => { setSelectedCategories([]); setCurrentPage(1); }} className={chipClass(selectedCategories.length === 0)}>
                Todas
              </button>
              {categories.map((c) => (
                <button key={c} type="button" aria-pressed={selectedCategories.includes(c)} onClick={() => toggle(selectedCategories, setSelectedCategories, c)} className={chipClass(selectedCategories.includes(c))}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          {brands.length > 1 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted/80">Marca</p>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0">
                <button type="button" onClick={() => { setSelectedBrands([]); setCurrentPage(1); }} className={chipClass(selectedBrands.length === 0)}>
                  Todas
                </button>
                {brands.map((b) => (
                  <button key={b} type="button" aria-pressed={selectedBrands.includes(b)} onClick={() => toggle(selectedBrands, setSelectedBrands, b)} className={chipClass(selectedBrands.includes(b))}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      <div className="mt-6 mb-4 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <span>
          {loading ? "Cargando productos…" : `${filtered.length} ${filtered.length === 1 ? "producto" : "productos"}`}
        </span>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="font-semibold text-brand hover:text-brand-dark transition-colors">
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4" aria-busy="true">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-line bg-white">
              <div className="aspect-square bg-blush/50" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-1/3 rounded bg-blush" />
                <div className="h-4 w-4/5 rounded bg-blush" />
                <div className="h-5 w-1/2 rounded bg-blush" />
                <div className="h-10 rounded-full bg-blush/70" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-3xl border border-line bg-white py-14 text-center">
          <p className="font-semibold text-ink">No pudimos cargar el catálogo.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark transition-colors">
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white px-6 py-14 text-center">
          <p className="text-lg font-semibold text-ink">No encontramos productos con esa búsqueda.</p>
          <p className="mt-1 text-muted">Prueba con otra palabra o quita algún filtro.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button type="button" onClick={clearFilters} className="rounded-full bg-ink px-6 py-2.5 font-semibold text-cream hover:bg-ink/90 transition-colors">
              Limpiar filtros
            </button>
            <a
              href={whatsappLink("¡Hola! No encontré un producto en el catálogo. ¿Me pueden ayudar?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-2.5 font-semibold text-white hover:bg-[#20bd5a] transition-colors"
            >
              <WhatsAppIcon size={18} /> Pregúntanos por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Páginas del catálogo" className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
                className="rounded-full border border-line bg-white p-2.5 text-muted transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                    n === page ? "bg-brand text-white" : "border border-line bg-white text-ink/80 hover:border-brand hover:text-brand"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                aria-label="Página siguiente"
                className="rounded-full border border-line bg-white p-2.5 text-muted transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
