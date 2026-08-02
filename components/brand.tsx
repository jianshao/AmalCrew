import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/dashboard" className="inline-flex items-center gap-3" aria-label="AmalCrew home">
      <span
        className={`grid size-9 place-items-center rounded-[11px] text-base font-bold shadow-sm ${
          inverse ? "bg-brand-400 text-ink" : "bg-brand-700 text-white"
        }`}
      >
        A
      </span>
      <span
        className={`text-lg font-semibold tracking-[-0.025em] ${
          inverse ? "text-white" : "text-ink"
        }`}
      >
        AmalCrew
      </span>
    </Link>
  );
}
