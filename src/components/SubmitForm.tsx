"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/Button";
import { submitProject, regrade } from "@/lib/actions/project";

export function SubmitForm({
  projectId,
  submissionId,
  initialRepoUrl,
  initialNotes,
}: {
  projectId: string;
  submissionId: string | null;
  initialRepoUrl: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl);
  const [notes, setNotes] = useState(initialNotes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await submitProject(projectId, repoUrl, notes);
    if (!res.ok) setError(res.message ?? "Something went wrong");
    setBusy(false);
    router.refresh();
  }

  async function onRegrade() {
    if (!submissionId) return;
    setBusy(true);
    setError(null);
    const res = await regrade(submissionId);
    if (!res.ok) setError(res.message ?? "Something went wrong");
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="brief" className="label">
          Brief
        </label>
        <textarea
          id="brief"
          value={notes}
          rows={10}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What you built, how you used this week's principle, the tradeoffs you weighed, and where you are unsure."
          className="rounded-md border border-line-strong bg-surface px-3.5 py-3 text-sm text-ink
                     transition-colors duration-150 placeholder:text-faint
                     focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-muted">
          This is what gets graded. A thin brief that just claims success gets a conservative
          score, no matter how good the repository is.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="repo" className="label">
          Repository <span className="text-faint">(optional, secondary)</span>
        </label>
        <input
          id="repo"
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/you/the-build"
          className="h-10 rounded-md border border-line-strong bg-surface px-3.5 text-sm text-ink
                     transition-colors duration-150 placeholder:text-faint
                     focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-muted">
          For your own record. The grader only checks it against the brief for outright
          contradictions, never scores it on its own.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-ink">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" loading={busy}>
          {submissionId ? "Resubmit and regrade" : "Submit for grading"}
        </Button>
        {submissionId ? (
          <Button type="button" variant="secondary" onClick={onRegrade} disabled={busy}>
            Regrade
          </Button>
        ) : null}
      </div>

      {busy ? <p className="text-xs text-muted">Grading. This takes a moment.</p> : null}
    </form>
  );
}
