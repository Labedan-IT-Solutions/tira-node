const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

export function formatDateForTira(date: string | Date): string {
  const utc = typeof date === "string" ? new Date(date) : date;
  const eat = new Date(utc.getTime() + EAT_OFFSET_MS);
  return eat.toISOString().substring(0, 19);
}
