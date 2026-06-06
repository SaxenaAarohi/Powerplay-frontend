export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeTotals(amount: number, taxRate: number): { tax: number; total: number } {
  const tax = roundCurrency((amount * taxRate) / 100);
  return { tax, total: roundCurrency(amount + tax) };
}
