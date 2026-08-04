// Mantém apenas os números informados.
function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

// Formata um CEP no padrão brasileiro 00000-000.
export function formatZipCode(value: string) {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}