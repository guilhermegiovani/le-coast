type ProductsHeaderProps = {
  productsCount: number;
};

export function ProductsHeader({
  productsCount,
}: ProductsHeaderProps) {
  // Define o texto no singular ou plural conforme a quantidade recebida.
  const productsCountText =
    productsCount === 1
      ? '1 produto encontrado'
      : `${productsCount} produtos encontrados`;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-foreground">
        Produtos
      </h1>

      <p className="text-sm text-muted">
        {productsCountText}
      </p>
    </div>
  );
}