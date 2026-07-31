import { Input } from '@/components/ui/input';

export function ProductsFilters() {
  return (
    <form
      aria-label="Filtros de produtos"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      {/* Campo que futuramente permitirá buscar produtos pelo nome. */}
      <Input
        label="Buscar produtos"
        name="search"
        placeholder="Digite o nome do produto"
        type="search"
      />

      {/* Filtro que futuramente permitirá selecionar uma categoria. */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="category"
          className="text-sm font-medium text-foreground"
        >
          Categoria
        </label>

        <select
          id="category"
          name="category"
          defaultValue=""
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors duration-200 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <option value="">Todas as categorias</option>
          <option value="fitness">Fitness</option>
          <option value="beachwear">Beachwear</option>
        </select>
      </div>

      {/* Controle que futuramente definirá a ordem dos produtos exibidos. */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="sort"
          className="text-sm font-medium text-foreground"
        >
          Ordenar por
        </label>

        <select
          id="sort"
          name="sort"
          defaultValue="featured"
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors duration-200 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <option value="featured">Destaques</option>
          <option value="lowest-price">Menor preço</option>
          <option value="highest-price">Maior preço</option>
          <option value="name">Nome</option>
        </select>
      </div>
    </form>
  );
}