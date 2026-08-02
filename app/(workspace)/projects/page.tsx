import {
  ArrowUpRight,
  Filter,
  MapPin,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ActionFeedback } from "@/components/action-feedback";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { getProjectsData } from "@/lib/workspace-data";
import { getI18n } from "@/lib/i18n/server";

const statusTone = {
  DRAFT: "gray",
  ACTIVE: "green",
  ON_HOLD: "amber",
  COMPLETED: "blue",
  ARCHIVED: "gray",
} as const;

const statusLabel = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
} as const;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; supervisor?: string; error?: string; success?: string }>;
}) {
  const filters = await searchParams;
  const [{ workspace, projects }, { t }] = await Promise.all([getProjectsData(), getI18n()]);

  if (!workspace.organization) {
    return (
      <>
        <PageHeader eyebrow={t("Field operations")} title={t("Projects")} description={t("Manage active sites, supervisors and assigned crews from one place.")} />
        <WorkspaceEmptyState configured={workspace.configured} />
      </>
    );
  }

  const active = projects.filter((project) => project.status === "ACTIVE").length;
  const completed = projects.filter((project) => project.status === "COMPLETED").length;
  const assignments = projects.reduce((total, project) => total + project.workers, 0);
  const hours = projects.reduce((total, project) => total + project.hours, 0);
  const query = filters.q?.trim().toLowerCase() ?? "";
  const visibleProjects = projects.filter((project) => {
    const matchesQuery = !query || `${project.name} ${project.location} ${project.code}`.toLowerCase().includes(query);
    const matchesStatus = !filters.status || project.status === filters.status;
    const matchesSupervisor = !filters.supervisor ||
      (filters.supervisor === "self" && project.supervisor === "You") ||
      (filters.supervisor === "unassigned" && project.supervisor === "Unassigned") ||
      (filters.supervisor === "assigned" && project.supervisor !== "Unassigned");
    return matchesQuery && matchesStatus && matchesSupervisor;
  });

  return (
    <>
      <PageHeader
        eyebrow={t("Field operations")}
        title={t("Projects")}
        description={t("Manage active sites, supervisors and assigned crews from one place.")}
        actions={<Link className="primary-button" href="/projects/new"><Plus size={17} /> {t("New project")}</Link>}
      />

      <ActionFeedback error={filters.error} success={filters.success} />

      <section className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 sm:grid-cols-4">
        {[
          [t("Active"), active.toLocaleString()],
          [t("Crew assignments"), assignments.toLocaleString()],
          [t("Recorded hours"), hours.toLocaleString()],
          [t("Completed"), completed.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="bg-white px-5 py-4"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{value}</p></div>
        ))}
      </section>

      <section className="panel overflow-hidden">
        <form method="get" className="flex flex-col gap-3 border-b border-stone-200 p-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="relative block w-full sm:max-w-sm"><span className="sr-only">{t("Search projects")}</span><Search className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" size={17} /><input name="q" defaultValue={filters.q} className="field-input m-0 h-10 ps-10" placeholder={t("Search projects or locations")} /></label>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-semibold text-stone-600"><span className="sr-only">{t("Status")}</span><select name="status" defaultValue={filters.status ?? ""} className="field-input m-0 h-10 min-w-36"><option value="">{t("All statuses")}</option>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>
            <label className="text-xs font-semibold text-stone-600"><span className="sr-only">{t("Supervisor")}</span><select name="supervisor" defaultValue={filters.supervisor ?? ""} className="field-input m-0 h-10 min-w-40"><option value="">{t("All supervisors")}</option><option value="self">{t("Assigned to me")}</option><option value="assigned">{t("Any assigned")}</option><option value="unassigned">{t("Unassigned")}</option></select></label>
            <button className="secondary-button" type="submit"><Filter size={16} /> {t("Apply")}</button>
            {(filters.q || filters.status || filters.supervisor) && <Link href="/projects" className="secondary-button">{t("Clear")}</Link>}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px]">
            <thead><tr><th>{t("Project")}</th><th>{t("Status")}</th><th>{t("Supervisor")}</th><th>{t("Crew")}</th><th>{t("Hours")}</th><th>{t("Progress")}</th><th /></tr></thead>
            <tbody>
              {visibleProjects.length ? visibleProjects.map((project) => (
                <tr key={project.id}>
                  <td><div className="max-w-xs"><p className="font-semibold text-ink">{project.name}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><MapPin size={12} />{project.location} · {project.code}</p></div></td>
                  <td><StatusPill tone={statusTone[project.status]}>{t(statusLabel[project.status])}</StatusPill></td>
                  <td className="text-stone-700">{project.supervisor}</td>
                  <td><span className="inline-flex items-center gap-1.5 text-stone-700"><Users size={15} className="text-stone-400" />{project.workers}</span></td>
                  <td className="font-medium text-ink">{project.hours.toLocaleString()}h</td>
                  <td><div className="flex w-36 items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${project.completion}%` }} /></div><span className="w-8 text-right text-xs text-muted">{project.completion}%</span></div></td>
                  <td><Link href={`/projects/${project.id}`} className="inline-flex rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-ink" aria-label={`Open ${project.name}`}><ArrowUpRight size={17} /></Link></td>
                </tr>
              )) : <tr><td colSpan={7} className="py-12 text-center text-muted">{t(projects.length ? "No projects match these filters." : "No projects yet. Create your first project to get started.")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
