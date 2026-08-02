const tones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
  red: "bg-red-50 text-red-700 ring-red-600/15",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/15",
  gray: "bg-stone-100 text-stone-600 ring-stone-500/15",
} as const;

export function StatusPill({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tones[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
