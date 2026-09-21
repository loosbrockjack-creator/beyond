"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, CalendarDays, GraduationCap, Wrench, FileText, LogOut } from "lucide-react";
import { Mark } from "./Mark";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/", label: "Dashboard", Icon: LayoutGrid },
  { href: "/calendar", label: "Calendar", Icon: CalendarDays },
  { href: "/grades", label: "Grades", Icon: GraduationCap },
  { href: "/tools", label: "Tools", Icon: Wrench },
  { href: "/syllabus", label: "Syllabus", Icon: FileText },
] as const;

export function GlobalRail({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-30 flex h-dvh w-16 shrink-0 flex-col items-center border-r border-line bg-raised py-5"
    >
      <Link
        href="/"
        aria-label="Beyond home"
        className="mb-8 text-accent transition-opacity duration-150 hover:opacity-80"
      >
        <Mark className="size-6" />
      </Link>

      <ul className="flex flex-1 flex-col gap-1">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex size-10 items-center justify-center rounded-lg",
                  "transition-colors duration-150 ease-out-quart",
                  active ? "bg-hover text-ink" : "text-muted hover:bg-hover hover:text-ink",
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.6} />
                <Tooltip>{label}</Tooltip>
              </Link>
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -left-5 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent"
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      <button
        onClick={signOut}
        aria-label={`Sign out of ${email}`}
        className="group relative flex size-10 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-hover hover:text-ink"
      >
        <LogOut className="size-[18px]" strokeWidth={1.6} />
        <Tooltip>Sign out</Tooltip>
      </button>
    </nav>
  );
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute left-[calc(100%+10px)] z-50 whitespace-nowrap rounded-md",
        "border border-line bg-raised px-2.5 py-1.5 text-xs text-ink opacity-0 shadow-lg",
        "transition-opacity duration-150 ease-out-quart group-hover:opacity-100",
      )}
    >
      {children}
    </span>
  );
}
