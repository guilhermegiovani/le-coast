'use client';

import { type SubmitEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type CheckoutFormData = {
  city: string;
  complement: string;
  email: string;
  name: string;
  neighborhood: string;
  number: string;
  phone: string;
  state: string;
  street: string;
  zipCode: string;
};

type CheckoutFormProps = {
  formData: CheckoutFormData;
  onChange: (
    field: keyof CheckoutFormData,
    value: string,
  ) => void;
  onContinue: () => void;
};

export function CheckoutForm({
  formData,
  onChange,
  onContinue,
}: CheckoutFormProps) {
  // Impede o recarregamento da página e avança para o pagamento.
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (
    event,
  ) => {
    event.preventDefault();

    onContinue();
  };

  return (
    <form
      aria-labelledby="checkout-form-title"
      className="rounded-xl border border-border bg-surface p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <h2
          id="checkout-form-title"
          className="text-xl font-semibold text-foreground"
        >
          Dados para entrega
        </h2>

        <p className="mt-2 text-sm text-muted">
          Preencha seus dados para continuar.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input
            id="checkout-name"
            name="name"
            type="text"
            label="Nome completo"
            autoComplete="name"
            required
            value={formData.name}
            onChange={(event) =>
              onChange('name', event.target.value)
            }
          />
        </div>

        <Input
          id="checkout-email"
          name="email"
          type="email"
          label="E-mail"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(event) =>
            onChange('email', event.target.value)
          }
        />

        <Input
          id="checkout-phone"
          name="phone"
          type="tel"
          label="Telefone"
          autoComplete="tel"
          required
          value={formData.phone}
          onChange={(event) =>
            onChange('phone', event.target.value)
          }
        />

        <Input
          id="checkout-zip-code"
          name="zipCode"
          type="text"
          label="CEP"
          inputMode="numeric"
          autoComplete="postal-code"
          required
          value={formData.zipCode}
          onChange={(event) =>
            onChange('zipCode', event.target.value)
          }
        />

        <Input
          id="checkout-state"
          name="state"
          type="text"
          label="Estado"
          maxLength={2}
          autoComplete="address-level1"
          required
          value={formData.state}
          onChange={(event) =>
            onChange(
              'state',
              event.target.value.toUpperCase(),
            )
          }
        />

        <div className="md:col-span-2">
          <Input
            id="checkout-street"
            name="street"
            type="text"
            label="Rua"
            autoComplete="address-line1"
            required
            value={formData.street}
            onChange={(event) =>
              onChange('street', event.target.value)
            }
          />
        </div>

        <Input
          id="checkout-number"
          name="number"
          type="text"
          label="Número"
          required
          value={formData.number}
          onChange={(event) =>
            onChange('number', event.target.value)
          }
        />

        <Input
          id="checkout-complement"
          name="complement"
          type="text"
          label="Complemento"
          autoComplete="address-line2"
          value={formData.complement}
          onChange={(event) =>
            onChange('complement', event.target.value)
          }
        />

        <Input
          id="checkout-neighborhood"
          name="neighborhood"
          type="text"
          label="Bairro"
          required
          value={formData.neighborhood}
          onChange={(event) =>
            onChange('neighborhood', event.target.value)
          }
        />

        <Input
          id="checkout-city"
          name="city"
          type="text"
          label="Cidade"
          autoComplete="address-level2"
          required
          value={formData.city}
          onChange={(event) =>
            onChange('city', event.target.value)
          }
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="mt-6 w-full md:w-auto"
      >
        Continuar para pagamento
      </Button>
    </form>
  );
}