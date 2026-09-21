/**
 * Unlock rules. Pure, and the only place these are expressed.
 *
 * A topic unlocks when the previous topic's quiz has been passed at 100%.
 * A module unlocks when every topic in the previous module is complete.
 * Projects are graded but never gate anything.
 */

export type TopicStatus = "locked" | "available" | "in_progress" | "complete";

export interface TopicRef {
  id: string;
  number: number;
}

/**
 * @param topics       every topic, any order
 * @param passedIds    ids of topics whose quiz has a passing attempt
 * @param startedIds   ids of topics with at least one attempt or submission
 */
export function deriveTopicStatuses(
  topics: TopicRef[],
  passedIds: ReadonlySet<string>,
  startedIds: ReadonlySet<string> = new Set(),
): Map<string, TopicStatus> {
  const ordered = [...topics].sort((a, b) => a.number - b.number);
  const statuses = new Map<string, TopicStatus>();

  ordered.forEach((topic, i) => {
    if (passedIds.has(topic.id)) {
      statuses.set(topic.id, "complete");
      return;
    }
    const prev = ordered[i - 1];
    const unlocked = i === 0 || (prev !== undefined && passedIds.has(prev.id));
    if (!unlocked) {
      statuses.set(topic.id, "locked");
      return;
    }
    statuses.set(topic.id, startedIds.has(topic.id) ? "in_progress" : "available");
  });

  return statuses;
}

export function isModuleLocked(
  moduleTopics: TopicRef[],
  statuses: Map<string, TopicStatus>,
): boolean {
  return moduleTopics.every((t) => statuses.get(t.id) === "locked");
}

/** The topic the user should be working on right now. */
export function activeTopic<T extends TopicRef>(
  topics: T[],
  statuses: Map<string, TopicStatus>,
): T | null {
  const ordered = [...topics].sort((a, b) => a.number - b.number);
  return (
    ordered.find((t) => statuses.get(t.id) === "in_progress") ??
    ordered.find((t) => statuses.get(t.id) === "available") ??
    null
  );
}

export function nextAttemptNumber(existingAttempts: number): number {
  return existingAttempts + 1;
}

export function scoreQuiz(
  answers: Record<string, string>,
  correctByQuestion: Record<string, string>,
): number {
  const ids = Object.keys(correctByQuestion);
  if (ids.length === 0) return 0;
  const right = ids.filter((qid) => answers[qid] === correctByQuestion[qid]).length;
  return Math.round((right / ids.length) * 100);
}
