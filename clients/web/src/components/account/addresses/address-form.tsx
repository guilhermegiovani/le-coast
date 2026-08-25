'use client';

import {
    type SubmitEvent,
    useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateAddressInput } from '@/services/address-service';

type AddressFormProps = {
  initialValues?: Partial<CreateAddressInput>;
  isLoading?: boolean;
  onSubmit: (
    data: CreateAddressInput,
  ) => Promise<void>;
};

// Formulário reutilizável para cadastro de endereços.
//
// Posteriormente ele também poderá receber valores iniciais
// para ser reutilizado na edição de um endereço existente.
export function AddressForm({
  initialValues,
  isLoading = false,
  onSubmit,
}: AddressFormProps) {
  const [name, setName] = useState(
    initialValues?.name ?? '',
  );

  const [street, setStreet] = useState(
    initialValues?.street ?? '',
  );

  const [number, setNumber] = useState(
    initialValues?.number ?? '',
  );

  const [complement, setComplement] = useState(
    initialValues?.complement ?? '',
  );

  const [neighborhood, setNeighborhood] =
    useState(
      initialValues?.neighborhood ?? '',
    );

  const [city, setCity] = useState(
    initialValues?.city ?? '',
  );

  const [state, setState] = useState(
    initialValues?.state ?? '',
  );

  const [zipCode, setZipCode] = useState(
    initialValues?.zipCode ?? '',
  );

    // Reúne os dados preenchidos e delega a criação
    // para o componente responsável pela página.
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        await onSubmit({
            city,
            ...(complement && {
                complement,
            }),
            name,
            neighborhood,
            number,
            state,
            street,
            zipCode,
        });
    }

    return (
        <form
            className="space-y-4"
            onSubmit={handleSubmit}
        >
            <Input
                id="address-name"
                name="name"
                type="text"
                label="Nome do endereço"
                placeholder="Ex.: Casa"
                autoComplete="off"
                required
                value={name}
                onChange={(event) =>
                    setName(event.target.value)
                }
            />

            <Input
                id="address-zip-code"
                name="zipCode"
                type="text"
                label="CEP"
                autoComplete="postal-code"
                required
                value={zipCode}
                onChange={(event) =>
                    setZipCode(event.target.value)
                }
            />

            <Input
                id="address-street"
                name="street"
                type="text"
                label="Rua"
                autoComplete="address-line1"
                required
                value={street}
                onChange={(event) =>
                    setStreet(event.target.value)
                }
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <Input
                    id="address-number"
                    name="number"
                    type="text"
                    label="Número"
                    required
                    value={number}
                    onChange={(event) =>
                        setNumber(event.target.value)
                    }
                />

                <Input
                    id="address-complement"
                    name="complement"
                    type="text"
                    label="Complemento"
                    autoComplete="address-line2"
                    value={complement}
                    onChange={(event) =>
                        setComplement(event.target.value)
                    }
                />
            </div>

            <Input
                id="address-neighborhood"
                name="neighborhood"
                type="text"
                label="Bairro"
                required
                value={neighborhood}
                onChange={(event) =>
                    setNeighborhood(event.target.value)
                }
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <Input
                    id="address-city"
                    name="city"
                    type="text"
                    label="Cidade"
                    autoComplete="address-level2"
                    required
                    value={city}
                    onChange={(event) =>
                        setCity(event.target.value)
                    }
                />

                <Input
                    id="address-state"
                    name="state"
                    type="text"
                    label="Estado"
                    autoComplete="address-level1"
                    required
                    value={state}
                    onChange={(event) =>
                        setState(event.target.value)
                    }
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={isLoading}
            >
                {isLoading
                    ? 'Salvando...'
                    : 'Salvar endereço'}
            </Button>
        </form>
    );
}