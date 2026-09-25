"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/Button";
import { markSessionRead } from "@/lib/actions/session";

/** Fallback for a session with no recall written yet. */
export function MarkRead({ sessionId, nextHref }: { sessionId: string; nextHref: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      loading={busy}
      onClick={async () => {
        setBusy(true);
        await markSessionRead(sessionId);
        router.push(nextHref);
        router.refresh();
      }}
    >
      Mark as read
    </Button>
  );
}
