import Link from "next/link";
import { Check } from "lucide-react";
import { ActionFeedback } from "@/components/action-feedback";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { ProjectRecord, WorkerChannelRecord, WorkerRecord } from "@/lib/workspace-data";
import { getI18n } from "@/lib/i18n/server";

export async function WorkerForm({
  action,
  worker,
  projects,
  projectId,
  channel,
  error,
  success,
}: {
  action: (formData: FormData) => void | Promise<void>;
  worker?: WorkerRecord | null;
  projects: Pick<ProjectRecord, "id" | "name" | "status">[];
  projectId?: string | null;
  channel?: WorkerChannelRecord | null;
  error?: string;
  success?: string;
}) {
  const { t } = await getI18n();
  return (
    <>
      <ActionFeedback error={error} success={success} />
      <form action={action} className="panel overflow-hidden">
        <input type="hidden" name="channel" value={channel?.channel === "TELEGRAM" ? "TELEGRAM" : ""} />
        <input type="hidden" name="channelIdentifier" value={channel?.external_user_id ?? ""} />
        <div className="panel-header"><h2 className="section-title">{t("Worker details")}</h2><p className="mt-1 text-xs text-muted">{t("Communication identities remain unverified until the worker completes opt-in.")}</p></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <label className="field-label sm:col-span-2">{t("Full name")}<input className="field-input" name="fullName" required minLength={2} maxLength={160} defaultValue={worker?.full_name ?? ""} autoFocus placeholder="Mohammed Rahman" /></label>
          <label className="field-label">{t("Phone number")}<input className="field-input" name="phoneNumber" type="tel" defaultValue={worker?.phone_number ?? ""} placeholder="+971 50 123 4567" /></label>
          <label className="field-label">{t("Trade")}<input className="field-input" name="trade" maxLength={100} defaultValue={worker?.trade ?? ""} placeholder="Electrician" /></label>
          <label className="field-label">{t("Preferred language")}<select className="field-input" name="language" defaultValue={worker?.preferred_language ?? "en"}><option value="en">English</option><option value="ar">العربية</option><option value="ur">اردو</option><option value="hi">हिन्दी</option></select></label>
          <label className="field-label">{t("Status")}<select className="field-input" name="status" defaultValue={worker?.status ?? "ACTIVE"}><option value="ACTIVE">{t("Active")}</option><option value="INACTIVE">{t("Inactive")}</option></select></label>
          <label className="field-label sm:col-span-2">{t("Current project")}<select className="field-input" name="projectId" defaultValue={projectId ?? ""}><option value="">{t("Unassigned")}</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name} · {t(project.status.toLowerCase().replaceAll("_", " "))}</option>)}</select></label>
          <div className="sm:col-span-2 rounded-2xl bg-sky-50 p-4 text-sm text-sky-950"><p className="font-semibold">Telegram: {t(channel?.is_verified ? "Connected" : "Not connected")}</p><p className="mt-1 text-xs leading-5 text-sky-800">{t("Telegram identities are connected and verified only when a worker opens a project invitation and taps Start in the AmalCrew bot.")}</p></div>
        </div>
        <div className="flex justify-end gap-3 border-t border-stone-200 px-5 py-4 sm:px-6"><Link href="/workers" className="secondary-button">{t("Cancel")}</Link><FormSubmitButton pendingLabel="Saving worker…"><Check size={16} /> {t(worker ? "Save worker" : "Add worker")}</FormSubmitButton></div>
      </form>
    </>
  );
}
