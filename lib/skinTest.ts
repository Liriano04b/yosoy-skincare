// Motor del test de piel: preguntas, reglas de recomendación y armado de la rutina.
// Es código puro (sin React ni Supabase) para que sea fácil de revisar y probar.
//
// Cómo decide:
//  1. Solo considera productos con stock.
//  2. Descarta los que no están indicados para el tipo de piel de la persona (campo `skin_types`).
//  3. Puntúa más alto los que ayudan con su objetivo (campo `concerns`).
//  4. Si la piel es muy sensible, deja fuera productos con retinol o ácidos (AHA/BHA).
//  5. Elige 1 producto por paso de la rutina, en el orden correcto.

export type SkinType = "seca" | "grasa" | "mixta" | "normal";
export type Concern = "hidratacion" | "acne" | "manchas" | "antiedad" | "calmar";
export type Sensitivity = "muy" | "aveces" | "poco";
export type RoutineSize = "basica" | "completa";

export type Answers = {
  skin: SkinType;
  concern: Concern;
  sensitivity: Sensitivity;
  size: RoutineSize;
};

export type TestProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  skin_type: string | null;
  skin_types: string[] | null;
  concerns: string[] | null;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string | null;
  image_urls: string[] | null;
  description: string | null;
  ingredients: string | null;
};

// ───────────────────────── Preguntas ─────────────────────────

type Option<T extends string> = { value: T; label: string; hint?: string };

export const QUESTIONS = [
  {
    key: "skin" as const,
    title: "¿Cómo se siente tu piel durante el día?",
    options: [
      { value: "seca", label: "Seca", hint: "Se siente tirante o con descamación" },
      { value: "grasa", label: "Grasa", hint: "Brillo y exceso de sebo en todo el rostro" },
      { value: "mixta", label: "Mixta", hint: "Grasa en la frente y la nariz, más seca en las mejillas" },
      { value: "normal", label: "Normal", hint: "Equilibrada, ni muy seca ni muy grasa" },
    ] as Option<SkinType>[],
  },
  {
    key: "concern" as const,
    title: "¿Qué te gustaría mejorar primero?",
    options: [
      { value: "hidratacion", label: "Hidratación y luminosidad" },
      { value: "acne", label: "Brotes, acné y poros" },
      { value: "manchas", label: "Manchas y tono desigual" },
      { value: "antiedad", label: "Líneas de expresión y firmeza" },
      { value: "calmar", label: "Calmar rojeces e irritación" },
    ] as Option<Concern>[],
  },
  {
    key: "sensitivity" as const,
    title: "¿Tu piel suele irritarse con los productos nuevos?",
    options: [
      { value: "muy", label: "Sí, es muy sensible y reactiva" },
      { value: "aveces", label: "A veces, depende del producto" },
      { value: "poco", label: "Casi nunca, tolera bien los ingredientes" },
    ] as Option<Sensitivity>[],
  },
  {
    key: "size" as const,
    title: "¿Cuántos pasos quieres en tu rutina?",
    options: [
      { value: "basica", label: "Rutina básica", hint: "4 pasos: limpiar, tratar, hidratar y proteger del sol" },
      { value: "completa", label: "Rutina completa", hint: "Hasta 6 pasos, con tónico y un extra" },
    ] as Option<RoutineSize>[],
  },
];

export const SKIN_LABEL: Record<SkinType, string> = {
  seca: "seca",
  grasa: "grasa",
  mixta: "mixta",
  normal: "normal",
};

export const CONCERN_LABEL: Record<Concern, string> = {
  hidratacion: "hidratación y luminosidad",
  acne: "brotes, acné y poros",
  manchas: "manchas y tono desigual",
  antiedad: "líneas de expresión y firmeza",
  calmar: "calmar rojeces e irritación",
};

// Frase que se muestra en cada producto cuando ayuda con el objetivo de la persona
const CONCERN_REASON: Record<Concern, string> = {
  hidratacion: "Ayuda a hidratar y dar luminosidad",
  acne: "Ayuda con brotes, acné y poros",
  manchas: "Ayuda con manchas y tono desigual",
  antiedad: "Ayuda con líneas de expresión y firmeza",
  calmar: "Ayuda a calmar rojeces e irritación",
};

export const SENSITIVITY_LABEL: Record<Sensitivity, string> = {
  muy: "muy sensible",
  aveces: "sensibilidad ocasional",
  poco: "poco sensible",
};

export function isCompleteAnswers(a: Partial<Answers> | null | undefined): a is Answers {
  return !!a && !!a.skin && !!a.concern && !!a.sensitivity && !!a.size;
}

// ───────────────────────── Datos del producto ─────────────────────────

const ALL_SKINS: SkinType[] = ["seca", "grasa", "mixta", "normal"];

const normalize = (s: string | null | undefined) =>
  (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

export function effectivePrice(p: TestProduct): number {
  return p.discount_price && p.discount_price > 0 ? p.discount_price : p.price;
}

// Activos que pueden irritar una piel muy sensible.
const STRONG_ACTIVES = /retinol|retinal|salic[ií]lic|salicylic|\bbha\b|\baha\b|gl[ií]colic|glycolic|l[aá]ctic/i;
const NIGHT_ACTIVES = /retinol|retinal/i;

const textOf = (p: TestProduct) => `${p.name} ${p.ingredients ?? ""}`;
export const hasStrongActive = (p: TestProduct) => STRONG_ACTIVES.test(textOf(p));
const isNightProduct = (p: TestProduct) =>
  NIGHT_ACTIVES.test(textOf(p)) || /nocturn/i.test(p.description ?? "");

// Tipos de piel del producto. Usa las etiquetas del admin; si un producto nuevo todavía
// no las tiene, se deduce del campo antiguo `skin_type` para no dejarlo fuera.
function skinTypesOf(p: TestProduct): string[] {
  if (p.skin_types && p.skin_types.length > 0) return p.skin_types;
  const legacy = normalize(p.skin_type);
  if (legacy.includes("grasa")) return ["grasa", "mixta"];
  if (legacy.includes("mixta")) return ["mixta", "normal"];
  if (legacy.includes("seca")) return ["seca"];
  if (legacy.includes("acne")) return ["grasa", "mixta"];
  return [...ALL_SKINS, "sensible"]; // "Todo tipo de piel", "Piel Sensible", etc.
}

function concernsOf(p: TestProduct): string[] {
  if (p.concerns && p.concerns.length > 0) return p.concerns;
  const legacy = normalize(p.skin_type);
  if (legacy.includes("acne")) return ["acne"];
  if (legacy.includes("mancha")) return ["manchas"];
  if (legacy.includes("expresion")) return ["antiedad"];
  return [];
}

const isUniversal = (skins: string[]) => ALL_SKINS.every((s) => skins.includes(s));

// ───────────────────────── Pasos de la rutina ─────────────────────────

export type StepKey = "limpiar" | "preparar" | "tratar" | "hidratar" | "proteger" | "extra";

export const STEP_LABEL: Record<StepKey, string> = {
  limpiar: "Limpia",
  preparar: "Prepara",
  tratar: "Trata",
  hidratar: "Hidrata",
  proteger: "Protege",
  extra: "Extra",
};

const CATEGORY_STEP: Record<string, StepKey> = {
  limpiador: "limpiar",
  tonico: "preparar",
  serum: "tratar",
  "crema hidratante": "hidratar",
  "protector solar": "proteger",
  mascarilla: "extra",
  "contorno de ojos": "extra",
  tratamiento: "extra",
};

const stepOf = (p: TestProduct): StepKey | null => CATEGORY_STEP[normalize(p.category)] ?? null;

// ───────────────────────── Recomendación ─────────────────────────

export type RoutineItem = {
  step: StepKey;
  product: TestProduct;
  when: "Mañana" | "Noche" | "Mañana y noche" | "Extra";
  reasons: string[];
  caution?: string;
  price: number;
  goalMatch: boolean;
};

export type RoutineResult = {
  items: RoutineItem[];
  total: number;
  notes: string[];
};

type Scored = { product: TestProduct; score: number; reasons: string[]; goalMatch: boolean };

function scoreProduct(p: TestProduct, a: Answers): Scored | null {
  if (p.stock <= 0) return null;

  const skins = skinTypesOf(p);
  if (!skins.includes(a.skin)) return null; // no está indicado para su tipo de piel

  // Piel muy sensible: se dejan fuera retinol y ácidos
  if (a.sensitivity === "muy" && hasStrongActive(p)) return null;

  const reasons: string[] = [];
  let score = 0;

  // Un producto universal es una apuesta segura; uno específico solo gana si además ayuda con el objetivo
  if (isUniversal(skins)) {
    score += 2.5;
    reasons.push("Apto para todo tipo de piel");
  } else {
    score += 2;
    reasons.push(`Indicado para piel ${SKIN_LABEL[a.skin]}`);
  }

  const concerns = concernsOf(p);
  const goalMatch = concerns.includes(a.concern);
  if (goalMatch) {
    score += 4;
    reasons.unshift(CONCERN_REASON[a.concern]);
  }

  if (a.sensitivity === "muy") {
    if (skins.includes("sensible")) score += 2;
    if (concerns.includes("calmar")) score += 1;
  } else if (a.sensitivity === "aveces" && skins.includes("sensible")) {
    score += 1;
  }

  return { product: p, score, reasons, goalMatch };
}

function best(scored: Scored[]): Scored | undefined {
  return [...scored].sort(
    (x, y) => y.score - x.score || effectivePrice(x.product) - effectivePrice(y.product)
  )[0];
}

function toItem(s: Scored, step: StepKey, a: Answers): RoutineItem {
  const p = s.product;
  let when: RoutineItem["when"] = "Mañana y noche";
  if (step === "proteger") when = "Mañana";
  else if (step === "extra") when = "Extra";
  else if (isNightProduct(p)) when = "Noche";

  let caution: string | undefined;
  if (a.sensitivity === "aveces" && hasStrongActive(p)) {
    caution =
      "Contiene retinol o ácidos: empieza poco a poco y haz una prueba en una zona pequeña antes de usarlo.";
  }

  return { step, product: p, when, reasons: s.reasons, caution, price: effectivePrice(p), goalMatch: s.goalMatch };
}

export function buildRoutine(products: TestProduct[], a: Answers): RoutineResult {
  const byStep = new Map<StepKey, Scored[]>();
  for (const p of products) {
    const step = stepOf(p);
    if (!step) continue;
    const s = scoreProduct(p, a);
    if (!s) continue;
    byStep.set(step, [...(byStep.get(step) ?? []), s]);
  }

  const order: StepKey[] =
    a.size === "completa"
      ? ["limpiar", "preparar", "tratar", "hidratar", "proteger"]
      : ["limpiar", "tratar", "hidratar", "proteger"];

  const items: RoutineItem[] = [];
  for (const step of order) {
    const pick = best(byStep.get(step) ?? []);
    if (pick) items.push(toItem(pick, step, a));
  }

  // Rutina completa: un extra, solo si de verdad ayuda con su objetivo
  if (a.size === "completa") {
    const extras = (byStep.get("extra") ?? []).filter((s) => s.goalMatch);
    const pick = best(extras);
    if (pick) items.push(toItem(pick, "extra", a));
  }

  const notes: string[] = [];
  if (a.sensitivity === "muy") {
    notes.push(
      "Como tu piel es muy sensible, dejamos fuera los productos con retinol o ácidos (AHA/BHA)."
    );
  }
  const treat = items.find((i) => i.step === "tratar");
  if (treat && !treat.goalMatch) {
    notes.push(
      `Todavía no tenemos un sérum específico para ${CONCERN_LABEL[a.concern]} que sea compatible con tu perfil. Elegimos uno suave y apto para ti; escríbenos si quieres más opciones.`
    );
  }
  if (items.length > 0 && items.length < (a.size === "completa" ? 5 : 4)) {
    notes.push(
      "Por ahora no tenemos productos disponibles para todos los pasos con tu perfil. Escríbenos y te ayudamos a completar tu rutina."
    );
  }

  return { items, total: items.reduce((sum, i) => sum + i.price, 0), notes };
}

// ───────────────────────── Mensaje de WhatsApp ─────────────────────────

export function routineWhatsAppMessage(result: RoutineResult, a: Answers): string {
  const lines = result.items.map(
    (item, i) =>
      `${i + 1}. ${STEP_LABEL[item.step]}: ${item.product.name} (RD$${item.price.toLocaleString("en-US")})`
  );
  return (
    "¡Hola! Hice el test de piel de Yosoy Skincare y me gustaría pedir esta rutina:\n\n" +
    lines.join("\n") +
    `\n\n*Total: RD$${result.total.toLocaleString("en-US")}*\n\n` +
    `Mi perfil: piel ${SKIN_LABEL[a.skin]}, objetivo: ${CONCERN_LABEL[a.concern]}. ¿Tienen disponibilidad?`
  );
}
