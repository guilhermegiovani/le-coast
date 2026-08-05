import type { CheckoutFormData } from '@/components/checkout/checkout-form';

export type CheckoutFormErrors = Partial<
  Record<keyof CheckoutFormData, string>
>;

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function validateCheckoutForm(
  formData: CheckoutFormData,
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  if (!formData.name.trim()) {
    errors.name = 'Informe seu nome completo.';
  }

  if (!formData.email.trim()) {
    errors.email = 'Informe seu e-mail.';
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  ) {
    errors.email = 'Informe um e-mail válido.';
  }

  const phoneDigits = onlyDigits(formData.phone);

  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.phone = 'Informe um telefone válido.';
  }

  const zipCodeDigits = onlyDigits(formData.zipCode);

  if (zipCodeDigits.length !== 8) {
    errors.zipCode = 'Informe um CEP válido.';
  }

  if (!/^[A-Za-z]{2}$/.test(formData.state.trim())) {
    errors.state = 'Informe a sigla do estado.';
  }

  if (!formData.street.trim()) {
    errors.street = 'Informe a rua.';
  }

  if (!formData.number.trim()) {
    errors.number = 'Informe o número.';
  }

  if (!formData.neighborhood.trim()) {
    errors.neighborhood = 'Informe o bairro.';
  }

  if (!formData.city.trim()) {
    errors.city = 'Informe a cidade.';
  }

  return errors;
}