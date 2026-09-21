import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium " +
  "transition-[background-color,border-color,color,transform,opacity] duration-150 ease-out-quart " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-bg hover:bg-accent/90 active:bg-accent-press",
  secondary: "border border-line-strong text-ink hover:bg-hover hover:border-line-strong",
  ghost: "text-muted hover:text-ink hover:bg-hover",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(BASE, VARIANTS[variant], "h-9 px-5", className)}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      className="size-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}
