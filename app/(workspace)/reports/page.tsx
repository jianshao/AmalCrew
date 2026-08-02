import { CalendarDays, Download } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import {
  buildWeeklyHours,
  getDateInTimeZone,
  getReportsData,
  isApprovedForReports,
} from "@/lib/workspace-data";
import { localeToIntl } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const filters = await searchParams;
  const [{ workspace, projects, timesheets, selectedMonth }, { locale, t }] = await Promise.all([getReportsData(filters.month), getI18n()]);
  const intlLocale = localeToIntl(locale);
  const organization = workspace.organization;

  if (!organization) {
    return (
      <>
        <PageHeader eyebrow={t("Workforce insights")} title={t("Reports")} description={t("Understand hours across projects and export records for your finance team.")} />
        <WorkspaceEmptyState configured={workspace.configured} />
      </>
    );
  }

  const today = getDateInTimeZone(organization.timezone);
  const monthPrefix = selectedMonth || today.slice(0, 7);
  const monthTimesheets = timesheets.filter(
    (item) => item.workDate.startsWith(monthPrefix) && isApprovedForReports(item.status),
  );
  const regularMinutes = monthTimesheets.reduce((total, item) => total + item.regularMinutes, 0);
  const overtimeMinutes = monthTimesheets.reduce((total, item) => total + item.overtimeMinutes, 0);
  const totalHours = Math.round(((regularMinutes + overtimeMinutes) / 60) * 10) / 10;
  const workerCount = new Set(monthTimesheets.map((item) => item.workerId)).size;
  const [reportYear, reportMonth] = monthPrefix.split("-").map(Number);
  const monthEnd = new Date(Date.UTC(reportYear, reportMonth, 0)).toISOString().slice(0, 10);
  const reportEndDate = monthPrefix === today.slice(0, 7) ? today : monthEnd;
  const weeklyHours = buildWeeklyHours(timesheets, reportEndDate, ["APPROVED", "CONFIRMED", "LOCKED"], intlLocale);
  const max = Math.max(1, ...weeklyHours.map((item) => item.hours));
  const monthLabel = new Intl.DateTimeFormat(intlLocale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${monthPrefix}-01T00:00:00Z`));

  const summaries = projects.map((project) => {
    const records = monthTimesheets.filter((item) => item.projectId === project.id);
    const regular = records.reduce((total, item) => total + item.regularMinutes, 0) / 60;
    const overtime = records.reduce((total, item) => total + item.overtimeMinutes, 0) / 60;
    return { ...project, regular, overtime, total: regular + overtime };
  }).filter((project) => project.total > 0).sort((a, b) => b.total - a.total);
  const maxProjectHours = Math.max(1, ...summaries.map((item) => item.total));

  return (
    <>
      <PageHeader
        eyebrow={t("Workforce insights")} title={t("Reports")}
        description={t("Approved and confirmed workforce hours from Supabase.")}
        actions={<><form method="get" className="flex items-center gap-2"><label className="relative"><span className="sr-only">{t("Report month")}</span><CalendarDays className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} /><input className="field-input m-0 h-10 ps-9" type="month" name="month" defaultValue={monthPrefix} /></label><button className="secondary-button" type="submit">{t("Apply")}</button></form><Link className="primary-button" href={`/reports/export?month=${monthPrefix}`}><Download size={16} /> {t("Export CSV")}</Link></>}
      />

      <section className="grid gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [t("Total hours"), `${totalHours.toLocaleString()}h`], [t("Regular hours"), `${(Math.round((regularMinutes / 60) * 10) / 10).toLocaleString()}h`],
          [t("Overtime"), `${(Math.round((overtimeMinutes / 60) * 10) / 10).toLocaleString()}h`], [t("Avg. per worker"), `${workerCount ? (Math.round((totalHours / workerCount) * 10) / 10).toLocaleString() : 0}h`],
        ].map(([label, value]) => <div key={label} className="bg-white p-5"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p></div>)}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="panel p-5 sm:p-7">
          <div><h2 className="section-title">{t("Weekly hours")}</h2><p className="mt-1 text-xs text-muted">{t("Approved and confirmed hours")}</p></div>
          <div className="mt-9 flex h-64 items-end gap-3 sm:gap-6">
            {weeklyHours.map((item) => <div key={item.date} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="relative flex flex-1 items-end"><div className="w-full rounded-t-lg bg-brand-600" style={{ height: `${item.hours ? Math.max((item.hours / max) * 100, 5) : 2}%` }} title={`${item.hours} hours`} /></div><span className="text-center text-[10px] font-medium text-stone-500">{item.day}</span></div>)}
          </div>
        </div>

        <div className="panel p-5 sm:p-7">
          <h2 className="section-title">{t("Hours by project")}</h2><p className="mt-1 text-xs text-muted">{t("{month} to date", { month: monthLabel })}</p>
          <div className="mt-7 space-y-6">
            {summaries.length ? summaries.slice(0, 5).map((project) => <div key={project.id}><div className="mb-2 flex items-center justify-between gap-4"><span className="truncate text-sm font-medium text-ink">{project.name}</span><span className="text-sm font-semibold text-ink">{(Math.round(project.total * 10) / 10).toLocaleString()}h</span></div><div className="h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${(project.total / maxProjectHours) * 100}%` }} /></div><p className="mt-2 text-[11px] text-muted">{t("{count} assigned workers", { count: project.workers })}</p></div>) : <p className="py-10 text-center text-sm text-muted">{t("No approved hours this month.")}</p>}
          </div>
        </div>
      </section>

      <section className="panel mt-6 overflow-hidden">
        <div className="panel-header"><h2 className="section-title">{t("Monthly summary")}</h2><p className="mt-1 text-xs text-muted">{t("Approved, confirmed and locked time only")}</p></div>
        <div className="overflow-x-auto"><table className="data-table min-w-[760px]"><thead><tr><th>{t("Project")}</th><th>{t("Workers")}</th><th>{t("Regular")}</th><th>{t("Overtime")}</th><th>{t("Total")}</th></tr></thead><tbody>{summaries.length ? summaries.map((project) => <tr key={project.id}><td><p className="font-semibold text-ink">{project.name}</p><p className="mt-0.5 text-xs text-muted">{project.location}</p></td><td>{project.workers}</td><td>{(Math.round(project.regular * 10) / 10).toLocaleString()}h</td><td>{(Math.round(project.overtime * 10) / 10).toLocaleString()}h</td><td className="font-semibold text-ink">{(Math.round(project.total * 10) / 10).toLocaleString()}h</td></tr>) : <tr><td colSpan={5} className="py-12 text-center text-muted">{t("No reportable timesheets for {month}.", { month: monthLabel })}</td></tr>}</tbody></table></div>
      </section>
    </>
  );
}
