import {
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Send,
} from "lucide-react";
import Link from "next/link";
import { ActionFeedback } from "@/components/action-feedback";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { formatMinutes, getWorkersData, initials, shortId } from "@/lib/workspace-data";
import { getI18n } from "@/lib/i18n/server";

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; project?: string; trade?: string; channel?: string; error?: string; success?: string }>;
}) {
  const filters = await searchParams;
  const [{ workspace, workers }, { t }] = await Promise.all([getWorkersData(), getI18n()]);

  if (!workspace.organization) {
    return (
      <>
        <PageHeader eyebrow={t("Crew directory")} title={t("Workers")} description={t("Manage worker details, project assignments and communication preferences.")} />
        <WorkspaceEmptyState configured={workspace.configured} />
      </>
    );
  }

  const query = filters.q?.trim().toLowerCase() ?? "";
  const projects = [...new Set(workers.map((worker) => worker.project))].sort();
  const trades = [...new Set(workers.map((worker) => worker.trade))].sort();
  const visibleWorkers = workers.filter((worker) =>
    (!query || `${worker.name} ${worker.trade} ${worker.phone}`.toLowerCase().includes(query)) &&
    (!filters.project || worker.project === filters.project) &&
    (!filters.trade || worker.trade === filters.trade) &&
    (!filters.channel || worker.channel === filters.channel),
  );

  const exportParams = new URLSearchParams();
  if (filters.q) exportParams.set("q", filters.q);
  if (filters.project) exportParams.set("project", filters.project);
  if (filters.trade) exportParams.set("trade", filters.trade);
  if (filters.channel) exportParams.set("channel", filters.channel);

  return (
    <>
      <PageHeader
        eyebrow={t("Crew directory")}
        title={t("Workers")}
        description={t("Manage worker details, project assignments and communication preferences.")}
        actions={<><Link className="secondary-button" href={`/workers/export?${exportParams.toString()}`}><Download size={16} /> {t("Export")}</Link><Link className="primary-button" href="/workers/new"><Plus size={17} /> {t("Add worker")}</Link></>}
      />

      <ActionFeedback error={filters.error} success={filters.success} />

      <section className="panel overflow-hidden">
        <form method="get" className="flex flex-col gap-3 border-b border-stone-200 p-4 xl:flex-row xl:items-end xl:justify-between">
          <label className="relative block w-full sm:max-w-sm"><span className="sr-only">{t("Search workers")}</span><Search className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" size={17} /><input name="q" defaultValue={filters.q} className="field-input m-0 h-10 ps-10" placeholder={t("Search name, trade or phone")} /></label>
          <div className="flex flex-wrap items-end gap-2">
            <select aria-label={t("Project")} name="project" defaultValue={filters.project ?? ""} className="field-input m-0 h-10 min-w-36"><option value="">{t("All projects")}</option>{projects.map((project) => <option key={project}>{project}</option>)}</select>
            <select aria-label={t("Trade")} name="trade" defaultValue={filters.trade ?? ""} className="field-input m-0 h-10 min-w-32"><option value="">{t("All trades")}</option>{trades.map((trade) => <option key={trade}>{trade}</option>)}</select>
            <select aria-label={t("Channel")} name="channel" defaultValue={filters.channel ?? ""} className="field-input m-0 h-10 min-w-32"><option value="">{t("All channels")}</option><option value="TELEGRAM">Telegram</option></select>
            <button className="secondary-button" type="submit"><Filter size={16} /> {t("Apply")}</button>
            {(filters.q || filters.project || filters.trade || filters.channel) && <Link href="/workers" className="secondary-button">{t("Clear")}</Link>}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="data-table min-w-[1050px]">
            <thead><tr><th>{t("Worker")}</th><th>{t("Trade")}</th><th>{t("Current project")}</th><th>{t("Channel")}</th><th>{t("Today")}</th><th>{t("Status")}</th><th /></tr></thead>
            <tbody>
              {visibleWorkers.length ? visibleWorkers.map((worker) => {
                const presence = worker.status === "INACTIVE" ? "Inactive" : worker.todayMinutes ? "On site" : "Off site";
                const tone = worker.status === "INACTIVE" ? "amber" : worker.todayMinutes ? "green" : "gray";
                return (
                  <tr key={worker.id}>
                    <td><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-sand-100 text-xs font-bold text-stone-700">{initials(worker.name)}</span><div><p className="font-semibold text-ink">{worker.name}</p><p className="mt-0.5 text-xs text-muted">{worker.phone} · {shortId("WRK", worker.id)}</p></div></div></td>
                    <td><p className="text-stone-700">{worker.trade}</p><p className="mt-0.5 text-xs text-muted">{worker.language}</p></td>
                    <td className="text-stone-700">{worker.project}</td>
                    <td>
                      {worker.channel === "TELEGRAM" ? <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-700"><Send size={15} />Telegram{!worker.channelVerified && <span className="text-xs font-normal text-stone-400">{t("Unverified")}</span>}</span> : <span className="text-sm text-muted">{t("Not connected")}</span>}
                    </td>
                    <td className="font-semibold text-ink">{formatMinutes(worker.todayMinutes)}</td>
                    <td><StatusPill tone={tone}>{t(presence)}</StatusPill></td>
                    <td><Link href={`/workers/${worker.id}`} className="inline-flex rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-ink" aria-label={`Open ${worker.name}`}><MoreHorizontal size={18} /></Link></td>
                  </tr>
                );
              }) : <tr><td colSpan={7} className="py-12 text-center text-muted">{t(workers.length ? "No workers match these filters." : "No workers yet. Add a worker to build your crew directory.")}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-stone-200 px-5 py-3 text-xs text-muted">{t("Showing {visible} of {total} workers", { visible: visibleWorkers.length.toLocaleString(), total: workers.length.toLocaleString() })}</div>
      </section>
    </>
  );
}
