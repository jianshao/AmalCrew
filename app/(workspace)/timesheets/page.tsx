import {
  CalendarDays,
  Check,
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { ActionFeedback } from "@/components/action-feedback";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import {
  formatMinutes,
  formatTime,
  formatWorkDate,
  getTimesheetsData,
  getDateInTimeZone,
  shortId,
} from "@/lib/workspace-data";
import { approveTimesheet, rejectTimesheet } from "./actions";
import { localeToIntl } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";

const statusTone = {
  SUBMITTED: "amber",
  APPROVED: "blue",
  WORKER_CONFIRMATION_REQUIRED: "amber",
  CONFIRMED: "green",
  REJECTED: "gray",
  DISPUTED: "red",
  LOCKED: "gray",
} as const;

const statusLabel = {
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  WORKER_CONFIRMATION_REQUIRED: "Worker confirmation",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  DISPUTED: "Disputed",
  LOCKED: "Locked",
} as const;

export default async function TimesheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; project?: string; days?: string; error?: string; success?: string }>;
}) {
  const filters = await searchParams;
  const [{ workspace, timesheets }, { locale, t }] = await Promise.all([getTimesheetsData(), getI18n()]);
  const intlLocale = localeToIntl(locale);
  const organization = workspace.organization;

  if (!organization) {
    return (
      <>
        <PageHeader eyebrow={t("Time & attendance")} title={t("Timesheets")} description={t("Review submissions, approve changes and resolve worker disputes.")} />
        <WorkspaceEmptyState configured={workspace.configured} />
      </>
    );
  }

  const tabs = [
    [t("All"), timesheets.length], [t("Pending"), timesheets.filter((item) => item.status === "SUBMITTED").length],
    [t("Approved"), timesheets.filter((item) => item.status === "APPROVED" || item.status === "WORKER_CONFIRMATION_REQUIRED").length],
    [t("Confirmed"), timesheets.filter((item) => item.status === "CONFIRMED" || item.status === "LOCKED").length],
    [t("Disputed"), timesheets.filter((item) => item.status === "DISPUTED").length],
  ] as const;
  const query = filters.q?.trim().toLowerCase() ?? "";
  const days = ["7", "30", "all"].includes(filters.days ?? "") ? filters.days ?? "30" : "30";
  const today = getDateInTimeZone(organization.timezone);
  const cutoffDate = new Date(`${today}T00:00:00Z`);
  if (days !== "all") cutoffDate.setUTCDate(cutoffDate.getUTCDate() - Number(days) + 1);
  const cutoff = cutoffDate.toISOString().slice(0, 10);
  const matchesStatus = (status: typeof timesheets[number]["status"]) => {
    if (!filters.status || filters.status === "all") return true;
    if (filters.status === "pending") return status === "SUBMITTED";
    if (filters.status === "approved") return status === "APPROVED" || status === "WORKER_CONFIRMATION_REQUIRED";
    if (filters.status === "confirmed") return status === "CONFIRMED" || status === "LOCKED";
    return filters.status === "disputed" ? status === "DISPUTED" : true;
  };
  const visibleTimesheets = timesheets.filter((entry) =>
    (!query || `${entry.worker} ${entry.project}`.toLowerCase().includes(query)) &&
    matchesStatus(entry.status) &&
    (!filters.project || entry.project === filters.project) &&
    (days === "all" || entry.workDate >= cutoff),
  );
  const projects = [...new Set(timesheets.map((entry) => entry.project))].sort();
  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries({ q: filters.q, status: filters.status, project: filters.project, days })) {
    if (value) exportParams.set(key, value);
  }

  return (
    <>
      <PageHeader
        eyebrow={t("Time & attendance")} title={t("Timesheets")}
        description={t("Review submissions, approve changes and resolve worker disputes.")}
        actions={<Link className="secondary-button" href={`/timesheets/export?${exportParams.toString()}`}><Download size={16} /> {t("Export CSV")}</Link>}
      />

      <ActionFeedback error={filters.error} success={filters.success} />

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 sm:w-fit">
        {tabs.map(([label, count], index) => {
          const value = ["all", "pending", "approved", "confirmed", "disputed"][index];
          const params = new URLSearchParams();
          if (value !== "all") params.set("status", value);
          const active = (filters.status ?? "all") === value;
          return <Link key={label} href={`/timesheets?${params.toString()}`} className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium ${active ? "bg-ink text-white" : "text-stone-600 hover:bg-stone-50"}`}>{label}<span className={`ms-2 text-[11px] ${active ? "text-stone-300" : "text-stone-400"}`}>{count}</span></Link>;
        })}
      </div>

      <section className="panel overflow-hidden">
        <form method="get" className="flex flex-col gap-3 border-b border-stone-200 p-4 xl:flex-row xl:items-end xl:justify-between">
          {filters.status && <input type="hidden" name="status" value={filters.status} />}
          <label className="relative block w-full sm:max-w-sm"><span className="sr-only">{t("Search timesheets")}</span><Search className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" size={17} /><input name="q" defaultValue={filters.q} className="field-input m-0 h-10 ps-10" placeholder={t("Search worker or project")} /></label>
          <div className="flex flex-wrap items-end gap-2">
            <label className="relative"><CalendarDays className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} /><select aria-label={t("Date range")} name="days" defaultValue={days} className="field-input m-0 h-10 min-w-36 ps-9"><option value="7">{t("Last 7 days")}</option><option value="30">{t("Last 30 days")}</option><option value="all">{t("All records")}</option></select></label>
            <select aria-label={t("Project")} name="project" defaultValue={filters.project ?? ""} className="field-input m-0 h-10 min-w-40"><option value="">{t("All projects")}</option>{projects.map((project) => <option key={project}>{project}</option>)}</select>
            <button className="secondary-button" type="submit"><Filter size={16} /> {t("Apply")}</button>
            {(filters.q || filters.project || filters.days) && <Link href={filters.status ? `/timesheets?status=${filters.status}` : "/timesheets"} className="secondary-button">{t("Clear")}</Link>}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="data-table min-w-[1050px]">
            <thead><tr><th>{t("Worker")}</th><th>{t("Project")}</th><th>{t("Work date")}</th><th>{t("Regular")}</th><th>{t("Overtime")}</th><th>{t("Status")}</th><th>{t("Submitted")}</th><th /></tr></thead>
            <tbody>
              {visibleTimesheets.length ? visibleTimesheets.map((entry) => (
                <tr key={entry.id}>
                  <td><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-sand-100 text-xs font-bold text-stone-700">{entry.initials}</span><div><p className="font-semibold text-ink">{entry.worker}</p><p className="mt-0.5 text-xs text-muted">{shortId("TS", entry.id)}</p></div></div></td>
                  <td className="text-stone-700">{entry.project}</td>
                  <td className="whitespace-nowrap text-stone-700">{formatWorkDate(entry.workDate, intlLocale)}</td>
                  <td className="font-semibold text-ink">{formatMinutes(entry.regularMinutes, "0h")}</td>
                  <td className="font-medium text-stone-700">{formatMinutes(entry.overtimeMinutes)}</td>
                  <td><StatusPill tone={statusTone[entry.status]}>{t(statusLabel[entry.status])}</StatusPill></td>
                  <td className="text-stone-500">{formatTime(entry.submittedAt, organization.timezone, intlLocale)}</td>
                  <td>{entry.status === "SUBMITTED" ? <div className="flex gap-2"><form action={rejectTimesheet}><input type="hidden" name="timesheetId" value={entry.id} /><input type="hidden" name="version" value={entry.version} /><FormSubmitButton className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-60" pendingLabel="Rejecting…"><X size={14} /> {t("Reject")}</FormSubmitButton></form><form action={approveTimesheet}><input type="hidden" name="timesheetId" value={entry.id} /><input type="hidden" name="version" value={entry.version} /><FormSubmitButton className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60" pendingLabel="Approving…"><Check size={14} /> {t("Approve")}</FormSubmitButton></form></div> : <span className="text-xs text-muted">{t("No action needed")}</span>}</td>
                </tr>
              )) : <tr><td colSpan={8} className="py-12 text-center text-muted">{t(timesheets.length ? "No timesheets match these filters." : "No timesheets have been submitted yet.")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
