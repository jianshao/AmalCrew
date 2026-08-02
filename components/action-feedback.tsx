"use client";

import { useI18n } from "@/components/locale-provider";

export function ActionFeedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const { t } = useI18n();
  if (!error && !success) return null;
  return (
    <p
      role="status"
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {t((error || success) ?? "")}
    </p>
  );
}
