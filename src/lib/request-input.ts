/** Read form text without assuming a JSON value is a string. */
export function requestText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Numbers and numeric strings are supported; objects never run coercion hooks. */
export function requestNumber(value: unknown): number {
  return typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
}
