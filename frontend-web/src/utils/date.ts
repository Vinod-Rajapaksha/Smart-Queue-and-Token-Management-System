// Example: Jan 12, 2025
export function formatDate(
  value: Date | string | number,
  locale = "en-US"
): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

// Example: 10:45 AM
 export function formatTime(
  value: Date | string | number,
  locale = "en-US"
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function toISODate(value: Date | string | number): string {
  return new Date(value).toISOString();
}
