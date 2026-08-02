import Link from "next/link";
import { Check } from "lucide-react";
import { ActionFeedback } from "@/components/action-feedback";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { ProjectRecord } from "@/lib/workspace-data";
import { getI18n } from "@/lib/i18n/server";

export async function ProjectForm({
  action,
  project,
  isSelfAssigned,
  error,
  success,
}: {
  action: (formData: FormData) => void | Promise<void>;
  project?: ProjectRecord | null;
  isSelfAssigned?: boolean;
  error?: string;
  success?: string;
}) {
  const { t } = await getI18n();
  return (
    <>
      <ActionFeedback error={error} success={success} />
      <form action={action} className="panel overflow-hidden">
        <div className="panel-header"><h2 className="section-title">{t("Project details")}</h2><p className="mt-1 text-xs text-muted">{t("Dates are used to calculate the progress indicator.")}</p></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <label className="field-label sm:col-span-2">{t("Project name")}<input className="field-input" name="name" required minLength={2} maxLength={160} defaultValue={project?.name ?? ""} autoFocus placeholder="Jumeirah Villa Renovation" /></label>
          <label className="field-label">{t("Project code")}<input className="field-input uppercase" name="code" required minLength={2} maxLength={32} defaultValue={project?.code ?? ""} placeholder="PRJ-001" /></label>
          <label className="field-label">{t("Status")}<select className="field-input" name="status" defaultValue={project?.status ?? "ACTIVE"}><option value="DRAFT">{t("Draft")}</option><option value="ACTIVE">{t("Active")}</option><option value="ON_HOLD">{t("On hold")}</option><option value="COMPLETED">{t("Completed")}</option></select></label>
          <label className="field-label sm:col-span-2">{t("Location")}<input className="field-input" name="location" maxLength={200} defaultValue={project?.location ?? ""} placeholder="Jumeirah 2, Dubai" /></label>
          <label className="field-label">{t("Start date")}<input className="field-input" name="startsOn" type="date" defaultValue={project?.starts_on ?? ""} /></label>
          <label className="field-label">{t("End date")}<input className="field-input" name="endsOn" type="date" defaultValue={project?.ends_on ?? ""} /></label>
          <label className="flex items-center gap-3 rounded-xl border border-stone-200 p-4 text-sm text-stone-700 sm:col-span-2"><input name="assignSelf" type="checkbox" defaultChecked={isSelfAssigned} className="size-4 accent-emerald-700" /><span><strong className="block font-semibold text-ink">{t("Assign me as supervisor")}</strong><span className="mt-0.5 block text-xs text-muted">{t("You can change this later.")}</span></span></label>
        </div>
        <div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4 sm:px-6"><Link href="/projects" className="secondary-button">{t("Cancel")}</Link><FormSubmitButton pendingLabel="Saving project…"><Check size={16} /> {t(project ? "Save project" : "Create project")}</FormSubmitButton></div>
      </form>
    </>
  );
}
