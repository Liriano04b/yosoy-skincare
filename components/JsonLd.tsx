// Datos estructurados (JSON-LD) para buscadores. Se escapa "<" para que ningún texto pueda cerrar la etiqueta.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
