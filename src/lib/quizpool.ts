/**
 * Weekly quiz question selection. Pure.
 *
 * The weekly quiz draws from questions written against the week's sessions,
 * weighted toward the sessions that were recalled badly. Selection happens per
 * attempt, so a retake is not the same five questions.
 */

export interface PoolQuestion {
  id: string;
  sessionId: string | null;
}

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function selectQuizQuestions<T extends PoolQuestion>(
  pool: T[],
  missedSessionIds: ReadonlySet<string>,
  count: number,
): T[] {
  // Questions from a badly recalled session come first, then everything else.
  const weak = pool.filter((q) => q.sessionId != null && missedSessionIds.has(q.sessionId));
  const rest = pool.filter((q) => !(q.sessionId != null && missedSessionIds.has(q.sessionId)));

  const picked = [...shuffled(weak), ...shuffled(rest)].slice(0, count);
  // Do not let the weak ones always land in the first slots.
  return shuffled(picked);
}

/** Sessions where the recall was not perfect. Those are what to push on. */
export function missedSessionIds(
  sessions: { session: { id: string }; progress: { score: number | null } | null }[],
): Set<string> {
  return new Set(
    sessions
      .filter((sv) => sv.progress != null && (sv.progress.score ?? 0) < 100)
      .map((sv) => sv.session.id),
  );
}
