import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { WorkerForm } from "@/components/worker-form";
import { getWorkerFormData, shortId } from "@/lib/workspace-data";
import { updateWorker } from "../actions";
import { getI18n } from "@/lib/i18n/server";

export default async function WorkerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; success?: string }> }) {
  const [{ id }, feedback] = await Promise.all([params, searchParams]);
  const [data, { t }] = await Promise.all([getWorkerFormData(id), getI18n()]);
  if (!data.workspace.organization || !data.worker) notFound();
  return <div className="mx-auto max-w-3xl"><PageHeader eyebrow={shortId("WRK", data.worker.id)} title={data.worker.full_name} description={t("Update worker details, current project and preferred messaging channel.")} /><WorkerForm action={updateWorker.bind(null, data.worker.id)} worker={data.worker} projects={data.projects} projectId={data.projectId} channel={data.channel} error={feedback.error} success={feedback.success} /></div>;
}
