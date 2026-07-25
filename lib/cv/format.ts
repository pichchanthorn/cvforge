const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Formats a "YYYY-MM" (or "YYYY") string as "Mon YYYY". Returns the raw input if it doesn't match. */
export function formatMonthYear(value: string): string {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value.trim());
  if (!match) return value;
  const [, year, month] = match;
  if (!month) return year;
  const index = Number(month) - 1;
  if (index < 0 || index > 11) return value;
  return `${MONTHS[index]} ${year}`;
}

export function formatDateRange(
  start: string,
  end: string,
  isCurrent: boolean,
): string {
  const startLabel = start ? formatMonthYear(start) : "";
  const endLabel = isCurrent ? "Present" : end ? formatMonthYear(end) : "";
  if (!startLabel && !endLabel) return "";
  if (!endLabel) return startLabel;
  return `${startLabel} – ${endLabel}`;
}
