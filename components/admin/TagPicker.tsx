"use client";

// Selector de etiquetas (varias opciones a la vez) para el admin.
// Se usa para decirle al test de piel para quién sirve cada producto y qué ayuda a mejorar.
export type TagOption = { value: string; label: string };

export const SKIN_TAG_OPTIONS: TagOption[] = [
  { value: "seca", label: "Seca" },
  { value: "grasa", label: "Grasa" },
  { value: "mixta", label: "Mixta" },
  { value: "normal", label: "Normal" },
  { value: "sensible", label: "Sensible" },
];

export const CONCERN_TAG_OPTIONS: TagOption[] = [
  { value: "hidratacion", label: "Hidratación y luminosidad" },
  { value: "acne", label: "Acné, brotes y poros" },
  { value: "manchas", label: "Manchas y tono desigual" },
  { value: "antiedad", label: "Líneas de expresión y firmeza" },
  { value: "calmar", label: "Calmar rojeces e irritación" },
];

export default function TagPicker({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: TagOption[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (tag: string) =>
    onChange(value.includes(tag) ? value.filter((v) => v !== tag) : [...value, tag]);

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-ink/80 mb-1">{label}</legend>
      {hint && <p className="text-xs text-muted mb-2">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option.value)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                selected
                  ? "border-brand bg-brand text-white"
                  : "border-muted/30 bg-white text-ink/80 hover:border-brand hover:text-brand"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
