// Remove campos com valor undefined antes
// de enviar os dados para o Prisma.
export function removeUndefined<
  T extends Record<string, unknown>,
>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) => value !== undefined,
    ),
  );
}