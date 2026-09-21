/** Score to letter to points, on the standard 4.0 scale. Pure. */

export interface Grade {
  letter: string;
  points: number;
}

const SCALE: ReadonlyArray<readonly [min: number, letter: string, points: number]> = [
  [93, "A", 4.0],
  [90, "A-", 3.7],
  [87, "B+", 3.3],
  [83, "B", 3.0],
  [80, "B-", 2.7],
  [77, "C+", 2.3],
  [73, "C", 2.0],
  [70, "C-", 1.7],
  [67, "D+", 1.3],
  [63, "D", 1.0],
  [60, "D-", 0.7],
  [0, "F", 0.0],
];

export function gradeFor(score: number): Grade {
  const row = SCALE.find(([min]) => score >= min) ?? SCALE[SCALE.length - 1];
  return { letter: row[1], points: row[2] };
}

/** Mean grade points across graded work. Null when nothing has been graded yet. */
export function gpaOf(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const total = scores.reduce((sum, s) => sum + gradeFor(s).points, 0);
  return total / scores.length;
}

export function formatGpa(gpa: number | null): string {
  return gpa === null ? "—" : gpa.toFixed(2);
}

export function formatScore(score: number | null): string {
  return score === null ? "—" : String(score);
}
