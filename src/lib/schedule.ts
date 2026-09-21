/**
 * Week and due-date math. Pure: no Supabase, no React.
 *
 * The course runs 16 weeks from a Monday start. Weeks 14 to 16 are pushed back by a
 * two-week holiday break so nothing lands on Christmas or New Year's Day.
 */

export const WEEKS_TOTAL = 16;
const BREAK_AFTER_WEEK = 13;
const BREAK_WEEKS = 2;

/** Parse a 'YYYY-MM-DD' date column at local noon, which is immune to DST shifts. */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function weekStart(startDate: string, week: number): Date {
  const d = parseISODate(startDate);
  const offsetWeeks = week - 1 + (week > BREAK_AFTER_WEEK ? BREAK_WEEKS : 0);
  d.setDate(d.getDate() + offsetWeeks * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Projects are due Friday at 11:59pm of their week. */
export function projectDue(startDate: string, week: number): Date {
  const d = weekStart(startDate, week);
  d.setDate(d.getDate() + 4);
  d.setHours(23, 59, 0, 0);
  return d;
}

export function currentWeek(startDate: string, now: Date = new Date()): number {
  for (let w = WEEKS_TOTAL; w >= 1; w--) {
    if (now >= weekStart(startDate, w)) return w;
  }
  return 1;
}

/** True when the deadline has passed and nothing was submitted. */
export function isOverdue(due: Date, submittedAt: string | null, now: Date = new Date()): boolean {
  if (submittedAt) return false;
  return now > due;
}

export function wasLate(due: Date, submittedAt: string | null): boolean {
  if (!submittedAt) return false;
  return new Date(submittedAt) > due;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " at 11:59pm";
}

/** Whole days from now until `d`. Negative once it is in the past. */
export function daysUntil(d: Date, now: Date = new Date()): number {
  const a = new Date(d); a.setHours(12, 0, 0, 0);
  const b = new Date(now); b.setHours(12, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

/** "in 5 days" / "tomorrow" / "today" / "2 days ago" */
export function relativeDue(d: Date, now: Date = new Date()): string {
  const n = daysUntil(d, now);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  if (n > 1) return `in ${n} days`;
  return `${Math.abs(n)} days ago`;
}
