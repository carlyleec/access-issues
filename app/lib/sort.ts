/**
 * alphabetizeOptions
 *
 * Takes options and returns a copy of options sorted alphabetically (A-Z) by the labels
 *
 * @param options - {value: unknown, label: string} []
 * @returns a copy of options sorted alphabetically (A-Z) by the labels
 */
export function alphabetizeOptions<T extends { label: string }>(options: T[]) {
  options.sort((a, b) => a.label.localeCompare(b.label))
  return [...options]
}
