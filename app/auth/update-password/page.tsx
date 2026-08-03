import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { UpdatePasswordForm } from "./update-password-form";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Update password", robots: { index: false, follow: false } };

export default async function UpdatePasswordPage() {
  const { t } = await getI18n();
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8">
        <Brand />
        <p className="eyebrow mb-3 mt-10">{t("Account security")}</p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-ink">{t("Choose a new password")}</h1>
        <p className="mb-7 mt-3 text-sm leading-6 text-muted">{t("Use at least eight characters and avoid passwords used on other services.")}</p>
        <UpdatePasswordForm />
      </div>
    </main>
  );
}
