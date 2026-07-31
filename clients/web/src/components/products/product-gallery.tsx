type ProductGalleryProps = {
  productName: string;
};

export function ProductGallery({
  productName,
}: ProductGalleryProps) {
  return (
    <section
      aria-label={`Galeria de imagens de ${productName}`}
      className="grid gap-4"
    >
      {/* Imagem principal temporária até conectarmos imagens reais. */}
      <div
        role="img"
        aria-label={`Imagem principal de ${productName}`}
        className="aspect-[3/4] w-full rounded-xl bg-muted"
      />

      {/* Miniaturas temporárias da galeria do produto. */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((image) => (
          <div
            key={image}
            role="img"
            aria-label={`Imagem ${image} de ${productName}`}
            className="aspect-square rounded-lg bg-muted"
          />
        ))}
      </div>
    </section>
  );
}