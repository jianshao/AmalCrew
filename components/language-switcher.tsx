"use client";

import { Languages, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/app/locale-actions";
import { localeOptions, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/locale-provider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className={`relative flex items-center gap-2 ${compact ? "" : "w-full"}`}>
      <span className="sr-only">{t("Change language")}</span>
      {pending ? <LoaderCircle className="shrink-0 animate-spin text-stone-400" size={16} /> : <Languages className="shrink-0 text-stone-400" size={16} />}
      <select
        aria-label={t("Change language")}
        className={`rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-700 outline-none focus:border-brand-500 ${compact ? "h-9 px-2" : "h-9 min-w-0 flex-1 px-2.5"}`}
        disabled={pending}
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as Locale;
          startTransition(async () => {
            await setLocale(nextLocale);
            router.refresh();
          });
        }}
      >
        {localeOptions.map((option) => <option key={option.code} value={option.code}>{compact ? option.shortLabel : option.label}</option>)}
      </select>
    </label>
  );
}
