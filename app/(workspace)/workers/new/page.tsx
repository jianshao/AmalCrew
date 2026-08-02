import { PageHeader } from "@/components/page-header";
import { WorkerForm } from "@/components/worker-form";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { getWorkerFormData } from "@/lib/workspace-data";
import { createWorker } from "../actions";
import { getI18n } from "@/lib/i18n/server";

export default async function NewWorkerPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [feedback, data, { t }] = await Promise.all([searchParams, getWorkerFormData(), getI18n()]);
  if (!data.workspace.organization) return <><PageHeader eyebrow={t("Crew directory")} title={t("Add worker")} description={t("Create a worker profile and choose their initial assignment.")} /><WorkspaceEmptyState configured={data.workspace.configured} /></>;
  return <div className="mx-auto max-w-3xl"><PageHeader eyebrow={t("Crew directory")} title={t("Add worker")} description={t("Create a worker profile and choose their initial assignment.")} /><WorkerForm action={createWorker} projects={data.projects} error={feedback.error} /></div>;
}
