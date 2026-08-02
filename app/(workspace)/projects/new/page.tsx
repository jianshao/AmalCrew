import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/project-form";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { getProjectFormData } from "@/lib/workspace-data";
import { createProject } from "../actions";
import { getI18n } from "@/lib/i18n/server";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, { workspace }, { t }] = await Promise.all([searchParams, getProjectFormData(), getI18n()]);
  if (!workspace.organization) return <><PageHeader eyebrow={t("Field operations")} title={t("New project")} description={t("Create a site and start assigning workers.")} /><WorkspaceEmptyState configured={workspace.configured} /></>;
  return <div className="mx-auto max-w-3xl"><PageHeader eyebrow={t("Field operations")} title={t("New project")} description={t("Create a site and start assigning workers.")} /><ProjectForm action={createProject} isSelfAssigned error={error} /></div>;
}
