'use client';

import {
  type SubmitEventHandler,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPhone } from '@/lib/formatters/phone';
import { formatZipCode } from '@/lib/formatters/zip-code';
import {
  type CheckoutFormErrors,
  validateCheckoutForm,
} from '@/lib/validators/checkout';
import {
  getAddressByZipCode,
  ZipCodeNotFoundError,
} from '@/services/zip-code-service';

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
  const [isLoadingZipCode, setIsLoadingZipCode] = useState(false);

  const [zipCodeError, setZipCodeError] = useState<string>();

  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});

  // Formata o CEP e consulta o endereço quando os oito dígitos forem preenchidos.
  async function handleZipCodeChange(value: string) {
    const formattedZipCode = formatZipCode(value);
    const zipCodeDigits = formattedZipCode.replace(/\D/g, '');

    handleFieldChange('zipCode', formattedZipCode);
    setZipCodeError(undefined);

    if (zipCodeDigits.length !== 8) {
      return;
    }

    try {
      setIsLoadingZipCode(true);

      const address =
        await getAddressByZipCode(formattedZipCode);

      handleFieldChange('street', address.street);
      handleFieldChange('neighborhood', address.neighborhood);
      handleFieldChange('city', address.city);
      handleFieldChange('state', address.state);
    } catch (error) {
      if (error instanceof ZipCodeNotFoundError) {
        setZipCodeError('CEP não encontrado.');
        return;
      }

      setZipCodeError(
        'Não foi possível consultar o CEP. Tente novamente.',
      );
    } finally {
      setIsLoadingZipCode(false);
    }
  }

  // Impede o recarregamento da página e avança para o pagamento.
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (
    event,
  ) => {
    event.preventDefault();

    const errors = validateCheckoutForm(formData);

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    onContinue();
  };

  function handleFieldChange(
    field: keyof CheckoutFormData,
    value: string,
  ) {
    onChange(field, value);

    setFormErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = {
        ...currentErrors,
      };

      delete nextErrors[field];

      return nextErrors;
    });
  }

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
            error={formErrors.name}
            onChange={(event) =>
              handleFieldChange('name', event.target.value)
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
          error={formErrors.email}
          onChange={(event) =>
            handleFieldChange('email', event.target.value)
          }
        />

        <Input
          id="checkout-phone"
          name="phone"
          type="tel"
          label="Telefone"
          inputMode="tel"
          autoComplete="tel"
          maxLength={15}
          required
          value={formData.phone}
          error={formErrors.phone}
          onChange={(event) =>
            handleFieldChange(
              'phone',
              formatPhone(event.target.value),
            )
          }
        />

        <Input
          id="checkout-zip-code"
          name="zipCode"
          type="text"
          label="CEP"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={9}
          required
          value={formData.zipCode}
          error={zipCodeError ?? formErrors.zipCode}
          helperText={
            isLoadingZipCode
              ? 'Consultando CEP...'
              : undefined
          }
          onChange={(event) => {
            void handleZipCodeChange(event.target.value);
          }}
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
          error={formErrors.state}
          onChange={(event) =>
            handleFieldChange(
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
            error={formErrors.street}
            onChange={(event) =>
              handleFieldChange('street', event.target.value)
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
          error={formErrors.number}
          onChange={(event) =>
            handleFieldChange('number', event.target.value)
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
            handleFieldChange('complement', event.target.value)
          }
        />

        <Input
          id="checkout-neighborhood"
          name="neighborhood"
          type="text"
          label="Bairro"
          required
          value={formData.neighborhood}
          error={formErrors.neighborhood}
          onChange={(event) =>
            handleFieldChange('neighborhood', event.target.value)
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
          error={formErrors.city}
          onChange={(event) =>
            handleFieldChange('city', event.target.value)
          }
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="mt-6 w-full md:w-auto"
        disabled={isLoadingZipCode}
      >
        Continuar para pagamento
      </Button>
    </form>
  );
}