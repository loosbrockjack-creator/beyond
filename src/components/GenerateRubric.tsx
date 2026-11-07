"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { generateProjectRubric } from "@/lib/actions/project";

export function GenerateRubric({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    const res = await generateProjectRubric(projectId);
    if (!res.ok) setError(res.message ?? "Could not generate the rubric");
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <Button variant="primary" onClick={run} loading={busy}>
        <Sparkles className="size-3.5" aria-hidden="true" />
        Generate rubric from brief
      </Button>

      {busy ? <p className="mt-3 text-xs text-muted">This takes a moment.</p> : null}

      {error ? (
        <p role="alert" className="mt-3 max-w-[62ch] text-sm text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
