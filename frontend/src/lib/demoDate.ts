/** Demo “today” aligned with seeded lead dates (Sep 2026). */
export const DEMO_TODAY = "2026-09-07";

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
