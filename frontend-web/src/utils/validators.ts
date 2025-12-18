// Email validation
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Required string validation
export function isRequired(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// Positive number validation

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

// Password minimum rules
export function isStrongPassword(value: string, minLength = 8): boolean {
  return value.length >= minLength;
}
