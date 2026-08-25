'use client';

import { useEffect, useState } from 'react';

import { Container } from '@/components/layout/container';

import { AddressForm } from '@/components/account/addresses/address-form';
import { Button } from '@/components/ui/button';

import {
    createAddress,
    deleteAddress,
    getAddresses,
    setDefaultAddress,
    updateAddress,
    type Address,
    type CreateAddressInput,
} from '@/services/address-service';

import { useAuth } from '@/contexts/auth-context';
import { AddressCard } from '@/components/account/addresses/address-card';

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const {
        isAuthenticated,
        isLoading: isAuthLoading,
    } = useAuth();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [
        updatingDefaultAddressId,
        setUpdatingDefaultAddressId,
    ] = useState<number | null>(null);

    const [
        deletingAddressId,
        setDeletingAddressId,
    ] = useState<number | null>(null);

    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const [isUpdating, setIsUpdating] = useState(false);

    // Carrega os endereços somente depois que a aplicação
    // terminar de verificar a sessão do usuário.
    //
    // Isso evita chamar uma rota protegida antes que
    // o access token seja configurado na instância da API.
    useEffect(() => {
        if (isAuthLoading || !isAuthenticated) {
            return;
        }

        async function loadAddresses() {
            try {
                setError('');

                const result = await getAddresses();

                setAddresses(result);
            } catch {
                // Falhas inesperadas recebem uma mensagem
                // genérica sem expor detalhes técnicos.
                setError(
                    'Não foi possível carregar seus endereços.',
                );
            } finally {
                setIsLoading(false);
            }
        }

        void loadAddresses();
    }, [
        isAuthLoading,
        isAuthenticated,
    ]);

    // Cria um novo endereço e atualiza a lista
    // exibida na página sem precisar recarregar.
    async function handleCreateAddress(
        data: CreateAddressInput,
    ) {
        try {
            setError('');
            setIsSaving(true);

            await createAddress(data);

            // O primeiro endereço pode ser definido como padrão
            // automaticamente pelo backend.
            // Por isso, recarregamos a lista para preservar
            // a ordenação e o estado retornado pela API.
            const updatedAddresses = await getAddresses();

            setAddresses(updatedAddresses);
            setIsFormOpen(false);
        } catch {
            setError(
                'Não foi possível salvar o endereço. Tente novamente.',
            );
        } finally {
            setIsSaving(false);
        }
    }

    // Define um endereço como padrão e recarrega
    // a lista para refletir o estado autoritativo da API.
    async function handleSetDefaultAddress(
        addressId: number,
    ) {
        try {
            setError('');
            setUpdatingDefaultAddressId(addressId);

            await setDefaultAddress(addressId);

            const updatedAddresses = await getAddresses();

            setAddresses(updatedAddresses);
        } catch {
            setError(
                'Não foi possível alterar o endereço padrão.',
            );
        } finally {
            setUpdatingDefaultAddressId(null);
        }
    }

    // Exclui um endereço e recarrega a lista.
    //
    // O backend é responsável por promover outro endereço
    // caso o endereço removido seja o padrão atual.
    async function handleDeleteAddress(
        addressId: number,
    ) {
        try {
            setError('');
            setDeletingAddressId(addressId);

            await deleteAddress(addressId);

            const updatedAddresses = await getAddresses();

            setAddresses(updatedAddresses);
        } catch {
            setError(
                'Não foi possível excluir o endereço.',
            );
        } finally {
            setDeletingAddressId(null);
        }
    }

    // Seleciona o endereço que será editado.
    //
    // O objeto completo é armazenado para que seus dados
    // possam preencher os valores iniciais do formulário.
    function handleEditAddress(
        address: Address,
    ) {
        setEditingAddress(address);
        setIsFormOpen(false);
    }

    // Atualiza o endereço selecionado e recarrega
    // a lista com o estado mais recente da API.
    async function handleUpdateAddress(
        data: CreateAddressInput,
    ) {
        if (!editingAddress) {
            return;
        }

        try {
            setError('');
            setIsUpdating(true);

            await updateAddress(
                editingAddress.id,
                data,
            );

            const updatedAddresses =
                await getAddresses();

            setAddresses(updatedAddresses);
            setEditingAddress(null);
        } catch {
            setError(
                'Não foi possível atualizar o endereço.',
            );
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <main className="py-8">
            <Container>
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Meus endereços
                    </h1>

                    <p className="my-2 text-sm text-muted">
                        Gerencie os endereços utilizados nas suas compras.
                    </p>

                    <Button
                        type="button"
                        variant="primary"
                        onClick={() =>
                            setIsFormOpen((current) => !current)
                        }
                    >
                        {isFormOpen
                            ? 'Cancelar'
                            : 'Adicionar endereço'}
                    </Button>
                </div>

                {isFormOpen && (
                    <section className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
                        <h2 className="text-lg font-semibold text-foreground">
                            Novo endereço
                        </h2>

                        <div className="mt-4">
                            <AddressForm
                                isLoading={isSaving}
                                onSubmit={handleCreateAddress}
                            />
                        </div>
                    </section>
                )}

                {isLoading && (
                    <p className="mt-6 text-sm text-muted">
                        Carregando endereços...
                    </p>
                )}

                {error && (
                    <p
                        role="alert"
                        className="mt-6 text-sm text-red-600"
                    >
                        {error}
                    </p>
                )}

                {!isLoading &&
                    !error &&
                    addresses.length === 0 && (
                        <p className="mt-6 text-sm text-muted">
                            Você ainda não possui endereços cadastrados.
                        </p>
                    )}

                {editingAddress && (
                    <section className="my-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-foreground">
                                Editar endereço
                            </h2>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={isUpdating}
                                onClick={() =>
                                    setEditingAddress(null)
                                }
                            >
                                Cancelar
                            </Button>
                        </div>

                        <div className="mt-4">
                            <AddressForm
                                initialValues={{
                                    city: editingAddress.city,
                                    ...(editingAddress.complement && {
                                        complement:
                                            editingAddress.complement,
                                    }),
                                    name: editingAddress.name,
                                    neighborhood:
                                        editingAddress.neighborhood,
                                    number: editingAddress.number,
                                    state: editingAddress.state,
                                    street: editingAddress.street,
                                    zipCode: editingAddress.zipCode,
                                }}
                                isLoading={isUpdating}
                                onSubmit={handleUpdateAddress}
                            />
                        </div>
                    </section>
                )}

                {!isLoading &&
                    !error &&
                    addresses.length > 0 && (
                        <div className="mt-6 space-y-4">
                            {addresses.map((address) => (
                                <AddressCard
                                    key={address.id}
                                    address={address}
                                    isDeleting={
                                        deletingAddressId === address.id
                                    }
                                    isUpdatingDefault={
                                        updatingDefaultAddressId === address.id
                                    }
                                    onDelete={handleDeleteAddress}
                                    onEdit={handleEditAddress}
                                    onSetDefault={handleSetDefaultAddress}
                                />
                            ))}
                        </div>
                    )}
            </Container>
        </main>
    );
}