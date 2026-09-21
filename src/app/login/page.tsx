"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/nav/Mark";
import { Button } from "@/components/primitives/Button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await createClient().auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-12">
          <span className="text-accent">
            <Mark className="size-7" />
          </span>
          <h1 className="mt-6 text-2xl font-medium tracking-[-0.025em] text-ink">Beyond</h1>
          <p className="mt-2 text-sm text-muted">
            Sixteen weeks of building with AI.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          {error ? (
            <p role="alert" className="text-sm text-ink">
              {error}
            </p>
          ) : null}

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Sign in
          </Button>
        </form>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-md border border-line-strong bg-surface px-3.5 text-sm text-ink
                   transition-colors duration-150 ease-out-quart
                   placeholder:text-muted hover:border-line-strong
                   focus:border-accent focus:outline-none"
      />
    </div>
  );
}
