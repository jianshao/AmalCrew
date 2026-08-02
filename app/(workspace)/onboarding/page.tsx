import { Building2, Check } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ActionFeedback } from "@/components/action-feedback";
import { FormSubmitButton } from "@/components/form-submit-button";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { getWorkspaceContext } from "@/lib/workspace-data";
import { createOrganization } from "./actions";
import { getI18n } from "@/lib/i18n/server";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const feedback = await searchParams;
  const [workspace, { t }] = await Promise.all([getWorkspaceContext(), getI18n()]);
  if (workspace.organization) redirect("/dashboard");

  if (!workspace.configured) {
    return (
      <>
        <PageHeader eyebrow={t("Workspace setup")} title={t("Create organization")} description={t("Set up your company workspace before adding projects and workers.")} />
        <WorkspaceEmptyState configured={false} />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow={t("Workspace setup")} title={t("Create your organization")} description={t("These regional defaults can be changed later in Settings.")} />
      <ActionFeedback error={feedback.error} />
      <form action={createOrganization} className="panel overflow-hidden">
        <div className="panel-header flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Building2 size={19} /></span><div><h2 className="section-title">{t("Company details")}</h2><p className="mt-1 text-xs text-muted">{t("Your first workspace will use you as the owner.")}</p></div></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <label className="field-label sm:col-span-2">{t("Organization name")}<input className="field-input" name="name" required minLength={2} maxLength={160} autoFocus placeholder="Example Technical Services LLC" /></label>
          <label className="field-label">{t("Country")}<select className="field-input" name="countryCode" defaultValue="AE"><option value="AE">United Arab Emirates</option><option value="SA">Saudi Arabia</option><option value="QA">Qatar</option></select></label>
          <label className="field-label">{t("Time zone")}<select className="field-input" name="timezone" defaultValue="Asia/Dubai"><option value="Asia/Dubai">Dubai (GST, UTC+4)</option><option value="Asia/Riyadh">Riyadh (AST, UTC+3)</option><option value="Asia/Qatar">Doha (AST, UTC+3)</option></select></label>
        </div>
        <div className="flex justify-end border-t border-stone-200 px-5 py-4 sm:px-6"><FormSubmitButton pendingLabel="Creating…"><Check size={16} /> {t("Create organization")}</FormSubmitButton></div>
      </form>
    </div>
  );
}
