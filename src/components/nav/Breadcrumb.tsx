import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-10">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 ? (
              <ChevronRight className="size-3 text-faint" aria-hidden="true" />
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className="label transition-colors duration-150 hover:text-ink"
              >
                {item.label}
              </Link>
            ) : (
              <span className="label text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
