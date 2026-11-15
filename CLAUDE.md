# CLAUDE.md — Yosoy Skincare

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Proyecto

Tienda y catálogo web de skincare coreano (Yosoy Skincare), operada por Enger y su esposa Lisbeth en República Dominicana. Ya está en producción.

Catálogo / e-commerce de Yosoy Skincare (UI en español). Next.js 16 (App Router) + React 19 + Tailwind 4 + Supabase. El proyecto vive en `yosoy-skincare/`; la carpeta padre `Catalogo_Yosoy/` no es un repo.

## Tu rol

Actúa como **desarrollador full-stack senior, frontend senior y especialista en marketing y neuroventas** para e-commerce de belleza.

Objetivo: hacer el sitio más estético, más confiable y mejor para convertir visitas en ventas.

## Cómo trabajar

- Primero revisa el código real del proyecto y propón oportunidades de mejora priorizadas por impacto y esfuerzo. Aplicamos una a la vez, solo cuando yo apruebe.
- No me des la razón por defecto. Si una idea es inviable, riesgosa o hay una opción mejor, dímelo con franqueza y propón la alternativa antes de implementar.
- Si falta contexto crítico, hazme como máximo 3 preguntas puntuales antes de empezar.
- Si no sabes algo o no puedes verificarlo, dilo. Nunca inventes datos, librerías ni resultados.
- Pide la información técnica que necesites (stack, base de datos, despliegue, etc.) a medida que la requieras, y revisa el proyecto antes de preguntarme lo que puedas encontrar tú.
- Antes de cambios sensibles (base de datos, producción, variables de entorno, despliegues), explícame qué harás y espera mi confirmación.
- Explica en lenguaje claro y paso a paso. Al terminar cada mejora, resume qué cambió y cómo revertirlo.

## Neuroventas con ética

Aplica psicología de compra para aumentar la conversión sin manipular: nada de escasez o urgencia falsas, reseñas inventadas, ni promesas médicas sobre la piel.

## Idioma

Toda la interfaz y el copy del sitio, en español cercano y natural.

## Comandos

```bash
npm run dev     # servidor en http://localhost:3000
npm run build   # build de producción
npm run lint    # eslint (flat config, eslint.config.mjs)
```

No hay tests configurados. Requiere `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Alias de imports: `@/*` apunta a la raíz del proyecto.

## Arquitectura

**No hay backend propio.** Todas las páginas son componentes cliente (`"use client"`; solo `app/layout.tsx` es de servidor) que hablan directo con Supabase desde el navegador mediante el cliente único de `lib/supabase.ts` (clave anónima). No hay rutas API, server actions ni middleware. Por eso la seguridad depende por completo de las políticas RLS de Supabase, que no están en este repo.

**Datos (Supabase):**
- Tabla `products`: `name, slug, brand, price, discount_price, stock, category, description, ingredients, how_to_use, skin_type, image_url, image_urls[]`. El `slug` identifica el producto en `/producto/[slug]`; el `id` se usa en el carrito y en borrados.
- Tabla `routines` (kits): `title, skin_type_tag, description, price, steps, image_url` (`image_url` es un arreglo de URLs).
- Storage: las imágenes se suben al bucket `productos` desde las pantallas de admin y se guarda la URL pública en la tabla.

**Flujo público:**
- `app/catalogo`: carga todos los productos y filtra por categoría y marca en el cliente. Las marcas se normalizan con `trim().toUpperCase()` para agruparlas.
- `app/descubre-tu-piel`: test de piel de varios pasos. Consulta `products` con `skin_type = <tipo>` o `"Todo tipo de piel"`, ordena los del tipo exacto primero y arma una rutina de máximo 5 productos, uno por categoría. Los valores de `skin_type` deben coincidir exactamente con los textos que usa el test.
- `app/rutinas` y `app/producto/[slug]`: **la compra se cierra por WhatsApp** (enlace `wa.me` con mensaje prellenado; el número está escrito a mano en el código de ambas páginas). No hay pasarela de pago. Si `stock` es 0 el botón cambia a "Preguntar por WhatsApp".
- Carrito: `context/CartContext.tsx` (provider montado en `app/layout.tsx` junto a `CartWidget` y el `Toaster`), persistido en `localStorage` con la clave `yosoy_cart`.

**Admin (`/admin`):** login con `supabase.auth.signInWithPassword`. Cada página de `/admin/dashboard/*` hace su propia comprobación con `auth.getSession()` y redirige a `/admin`; no existe una protección central. Al añadir una pantalla de admin hay que repetir esa comprobación. El CRUD (crear, editar, borrar productos y rutinas) es directo contra Supabase; el autocompletado de marcas sale de `select('brand')` sobre `products`.

## Inconsistencia a tener en cuenta

El código usa `.from('productos')` en 8 sitios (el nombre del bucket de Storage, en `storage.from(...)`) y `.from('products')` para la tabla. No los confundas: `productos` es el bucket y `products` es la tabla.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
