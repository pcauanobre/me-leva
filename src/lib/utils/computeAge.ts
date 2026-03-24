/**
 * Compute current age based on age_months at time of created_at.
 * age_months was set when the animal was registered — this function
 * adds the months elapsed since then to get the current age.
 */
export function computeCurrentAge(
  ageMonths: number | null,
  createdAt: string
): string {
  if (ageMonths == null) return "Não informada";

  const created = new Date(createdAt);
  const now = new Date();
  const monthsElapsed =
    (now.getFullYear() - created.getFullYear()) * 12 +
    (now.getMonth() - created.getMonth());

  const currentMonths = ageMonths + Math.max(0, monthsElapsed);

  if (currentMonths < 1) return "Menos de 1 mês";
  if (currentMonths === 1) return "1 mês";
  if (currentMonths < 12) return `${currentMonths} meses`;

  const years = Math.floor(currentMonths / 12);
  const remainingMonths = currentMonths % 12;

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
  }
  return `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`;
}
