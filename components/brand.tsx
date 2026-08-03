import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/dashboard" className="inline-flex items-center gap-3" aria-label="AmalCrew home">
      <LogoMark className={inverse ? "ring-1 ring-white/15" : "ring-1 ring-black/5"} />
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
