"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function ModuleSidebar({
  slug,
  number,
  title,
  subtitle,
}: {
  slug: string;
  number: number;
  title: string;
  subtitle: string | null;
}) {
  const pathname = usePathname();
  const base = `/m/${slug}`;

  const items = [
    { href: base, label: "Home" },
    { href: `${base}/topics`, label: "Topics" },
    { href: `${base}/assignments`, label: "Assignments" },
    { href: `${base}/grades`, label: "Grades" },
    { href: `${base}/syllabus`, label: "Syllabus" },
  ];

  return (
    <nav
      aria-label={`${title} sections`}
      className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line px-6 py-8 lg:flex"
    >
      <div className="mb-8">
        <span className="num label !tracking-[0.3em] text-accent">
          {String(number).padStart(2, "0")}
        </span>
        <h2 className="mt-2 text-lg font-medium text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
      </div>

      <ul className="flex flex-col gap-0.5">
        {items.map(({ href, label }) => {
          const active = href === base ? pathname === base : pathname.startsWith(href);
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-out-quart",
                  active ? "bg-hover text-ink" : "text-muted hover:bg-hover hover:text-ink",
                )}
              >
                {label}
              </Link>
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -left-3 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent"
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
