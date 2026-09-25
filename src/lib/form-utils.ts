export function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function getOptionalString(formData: FormData, key: string): string | null {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

export function getRequiredNumber(formData: FormData, key: string): number {
  const value = Number(getString(formData, key));
  if (Number.isNaN(value)) {
    throw new Error(`"${key}" must be a number`);
  }
  return value;
}

export function getOptionalNumber(formData: FormData, key: string): number | null {
  const raw = getString(formData, key);
  if (raw.length === 0) return null;
  const value = Number(raw);
  return Number.isNaN(value) ? null : value;
}

export function getRequiredDate(formData: FormData, key: string): Date {
  const raw = getString(formData, key);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`"${key}" must be a valid date`);
  }
  return date;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
