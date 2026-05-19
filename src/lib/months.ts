export const MONTHS_HU = [
  "Január",
  "Február",
  "Március",
  "Április",
  "Május",
  "Június",
  "Július",
  "Augusztus",
  "Szeptember",
  "Október",
  "November",
  "December",
] as const;

export function getMonthName(month: number): string {
  return MONTHS_HU[month - 1] ?? String(month);
}
