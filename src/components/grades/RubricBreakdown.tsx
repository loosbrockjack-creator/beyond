import { cn } from "@/lib/cn";

export interface RubricRow {
  id: string;
  label: string;
  description: string | null;
  maxPoints: number;
  points: number | null;
  comment: string | null;
}

export function RubricBreakdown({ rows, total }: { rows: RubricRow[]; total: number | null }) {
  return (
    <div>
      <ul>
        {rows.map((r) => {
          const full = r.points !== null && r.points === r.maxPoints;
          return (
            <li key={r.id} className="border-b border-line py-4">
              <div className="flex items-baseline justify-between gap-6">
                <span className="text-sm text-ink">{r.label}</span>
                <span className="num shrink-0 text-sm">
                  <span className={cn(full ? "text-accent" : "text-ink")}>
                    {r.points ?? "—"}
                  </span>
                  <span className="text-faint">/{r.maxPoints}</span>
                </span>
              </div>
              {r.comment ? (
                <p className="mt-2 max-w-[70ch] text-xs text-muted">{r.comment}</p>
              ) : r.description ? (
                <p className="mt-2 max-w-[70ch] text-xs text-muted">{r.description}</p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="flex items-baseline justify-between gap-6 py-4">
        <span className="label">Total</span>
        <span className="num text-lg text-ink">
          {total ?? "—"}
          <span className="text-faint">/100</span>
        </span>
      </div>
    </div>
  );
}
