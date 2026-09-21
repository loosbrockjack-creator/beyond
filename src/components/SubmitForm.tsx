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
        <label htmlFor="repo" className="label">
          Repository
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
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          rows={8}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What you built, the decisions you made, and the parts you are unsure about. Paste the key code here too."
          className="rounded-md border border-line-strong bg-surface px-3.5 py-3 text-sm text-ink
                     transition-colors duration-150 placeholder:text-faint
                     focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-muted">
          The grader cannot open your repository, so it scores these notes and anything you
          paste into them. Thin notes get conservative scores.
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
