import { Building2, Database } from "lucide-react";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export async function WorkspaceEmptyState({ configured }: { configured: boolean }) {
  const { t } = await getI18n();
  const Icon = configured ? Building2 : Database;
  return (
    <section className="panel grid min-h-72 place-items-center p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon size={22} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">
          {t(configured ? "Create your organization first" : "Connect Supabase to continue")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {configured
            ? t("Your account is authenticated, but it is not a member of an organization yet. Create one before adding projects and workers.")
            : t("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart the development server.")}
        </p>
        {configured && (
          <Link href="/onboarding" className="primary-button mt-5">
            {t("Create organization")}
          </Link>
        )}
      </div>
    </section>
  );
}
