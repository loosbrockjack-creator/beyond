/**
 * Week and due-date math. Pure: no Supabase, no React.
 *
 * The course runs 16 topics, each topic now spanning two calendar weeks: a learn week
 * (sessions, recalls, the quiz) followed by a build week (the project). Topic 1 is the
 * exception: it already ran its learn phase across two calendar weeks before this
 * cadence existed, so its block is learn, learn, build (3 calendar weeks) instead of
 * every later topic's learn, build (2 calendar weeks).
 *
 * Calendar weeks are pushed back by a two-week holiday break after calendar week 13
 * (the week whose Sunday is Dec 27) so nothing is due during Christmas or New Year's.
 */

export const WEEKS_TOTAL = 16;
const BREAK_AFTER_CAL_WEEK = 13;
const BREAK_WEEKS = 2;

/** Parse a 'YYYY-MM-DD' date column at local noon, which is immune to DST shifts. */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/**
 * Topic `n`'s learn week starts here (calendar week, 1-indexed, before the holiday
 * break is applied). Topic 1 keeps the extra learn week it was already given; every
 * topic after it gets exactly one learn week followed by one build week.
 */
function learnStartCalWeek(topicWeek: number): number {
  return topicWeek === 1 ? 1 : 2 * topicWeek;
}

/** The calendar week topic `n`'s quiz is due at the end of. */
function learnDueCalWeek(topicWeek: number): number {
  return topicWeek === 1 ? 2 : 2 * topicWeek;
}

/** The calendar week topic `n`'s build (project) week falls on. */
function buildCalWeek(topicWeek: number): number {
  return topicWeek === 1 ? 3 : 2 * topicWeek + 1;
}

function calWeekStart(startDate: string, calWeek: number): Date {
  const d = parseISODate(startDate);
  const offsetWeeks = calWeek - 1 + (calWeek > BREAK_AFTER_CAL_WEEK ? BREAK_WEEKS : 0);
  d.setDate(d.getDate() + offsetWeeks * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Everything in a calendar week is due Sunday at 11:59pm, the end of that week. */
function calWeekDueSunday(startDate: string, calWeek: number): Date {
  const d = calWeekStart(startDate, calWeek);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 0, 0);
  return d;
}

/** The Monday topic `week`'s learn phase begins. */
export function weekStart(startDate: string, week: number): Date {
  return calWeekStart(startDate, learnStartCalWeek(week));
}

/** The project deadline: the Sunday at the end of topic `week`'s build week. */
export function projectDue(startDate: string, week: number): Date {
  return calWeekDueSunday(startDate, buildCalWeek(week));
}

/** The quiz deadline: the Sunday at the end of topic `week`'s learn week. */
export function quizDue(startDate: string, week: number): Date {
  return calWeekDueSunday(startDate, learnDueCalWeek(week));
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
