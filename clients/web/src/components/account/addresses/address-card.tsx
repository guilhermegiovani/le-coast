import { Button } from '@/components/ui/button';
import type { Address } from '@/services/address-service';

type AddressCardProps = {
  address: Address;
  isDeleting?: boolean;
  isUpdatingDefault?: boolean;
  onDelete?: (addressId: number) => Promise<void>;
  onEdit?: (address: Address) => void;
  onSetDefault?: (addressId: number) => Promise<void>;
};

// Exibe as informações de um endereço salvo pelo usuário.
//
// Também disponibiliza as ações relacionadas ao endereço,
// delegando a execução para o componente responsável pela página.
export function AddressCard({
  address,
  isDeleting = false,
  isUpdatingDefault = false,
  onDelete,
  onEdit,
  onSetDefault,
}: AddressCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground">
              {address.name}
            </h2>

            {address.isDefault && (
              <span className="text-xs font-medium text-primary">
                Padrão
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-muted">
            {address.street}, {address.number}
          </p>

          {address.complement && (
            <p className="text-sm text-muted">
              {address.complement}
            </p>
          )}

          <p className="text-sm text-muted">
            {address.neighborhood} — {address.city}/
            {address.state}
          </p>

          <p className="text-sm text-muted">
            CEP: {address.zipCode}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <Button
              type="button"
              variant="secondary"
              disabled={isDeleting || isUpdatingDefault}
              onClick={() => onEdit(address)}
            >
              Editar
            </Button>
          )}

          {!address.isDefault && onSetDefault && (
            <Button
              type="button"
              variant="secondary"
              disabled={isUpdatingDefault || isDeleting}
              onClick={() =>
                void onSetDefault(address.id)
              }
            >
              {isUpdatingDefault
                ? 'Atualizando...'
                : 'Definir como padrão'}
            </Button>
          )}

          {onDelete && (
            <Button
              type="button"
              variant="danger"
              disabled={isDeleting || isUpdatingDefault}
              onClick={() => {
                const shouldDelete = window.confirm(
                  `Deseja realmente excluir o endereço "${address.name}"?`,
                );

                if (shouldDelete) {
                  void onDelete(address.id);
                }
              }}
            >
              {isDeleting
                ? 'Excluindo...'
                : 'Excluir'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}