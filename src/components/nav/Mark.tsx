/** The Beyond mark: two offset rings. One of the few places the accent is allowed. */
export function Mark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      <circle cx="15.5" cy="12" r="5.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
