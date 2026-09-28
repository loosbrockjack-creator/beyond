"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { generateProjectBrief } from "@/lib/actions/project";

export function GenerateBrief({
  topicId,
  regenerate = false,
}: {
  topicId: string;
  regenerate?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    const res = await generateProjectBrief(topicId, regenerate);
    if (!res.ok) setError(res.message ?? "Could not generate the brief");
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <Button variant={regenerate ? "secondary" : "primary"} onClick={run} loading={busy}>
        {!regenerate ? <Sparkles className="size-3.5" aria-hidden="true" /> : null}
        {regenerate ? "Regenerate brief" : "Generate this week's project"}
      </Button>

      {busy ? (
        <p className="mt-3 text-xs text-muted">
          Reading this week&apos;s sources and your recall scores. This takes a moment.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 max-w-[62ch] text-sm text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
