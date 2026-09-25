/**
 * Astro converts an empty form field to `null` before Zod validation runs, and
 * `z.coerce.number()` happily turns that `null` into `0` (`Number(null) === 0`).
 * For fields that are genuinely optional (as opposed to defaulting to 0), parse
 * them as raw strings and convert by hand so a blank field means "not provided".
 */
export function parseOptionalNumber(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isNaN(value) ? null : value;
}

export function parseOptionalString(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}
