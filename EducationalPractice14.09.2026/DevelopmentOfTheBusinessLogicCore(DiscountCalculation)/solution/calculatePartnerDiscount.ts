export function calculatePartnerDiscount(totalQuantity: number): number {
  if (totalQuantity < 10_000) {
    return 0;
  }
  if (totalQuantity < 50_000) {
    return 5;
  }
  if (totalQuantity < 300_000) {
    return 10;
  }
  return 15;
}