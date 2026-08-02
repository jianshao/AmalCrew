import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  MessageCircleMore,
  TriangleAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { getCurrentUser } from "@/lib/auth";
import { localeToIntl } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import {
  buildWeeklyHours,
  formatMinutes,
  formatTime,
  getDashboardData,
  getDateInTimeZone,
} from "@/lib/workspace-data";

export default async function DashboardPage() {
  const [user, data, i18n] = await Promise.all([getCurrentUser(), getDashboardData(), getI18n()]);
  const { locale, t } = i18n;
  const intlLocale = localeToIntl(locale);
  const organization = data.workspace.organization;

  if (!organization) {
    return (
      <>
        <PageHeader
          eyebrow={t("Operations overview")}
          title={t("Welcome, {name}", { name: user?.name ?? "there" })}
          description={t("Connect your organization to start tracking live workforce data.")}
        />
        <WorkspaceEmptyState configured={data.workspace.configured} />
      </>
    );
  }

  const today = getDateInTimeZone(organization.timezone);
  const todayTimesheets = data.timesheets.filter((entry) => entry.workDate === today);
  const reportedWorkers = new Set(todayTimesheets.map((entry) => entry.workerId)).size;
  const activeWorkers = data.workers.filter((worker) => worker.status === "ACTIVE").length;
  const awaiting = Math.max(activeWorkers - reportedWorkers, 0);
  const submissionRate = activeWorkers ? Math.round((reportedWorkers / activeWorkers) * 100) : 0;
  const pending = data.timesheets.filter((entry) => entry.status === "SUBMITTED");
  const disputes = data.timesheets.filter((entry) => entry.status === "DISPUTED");
  const approvalItems = data.timesheets
    .filter((entry) => entry.status === "SUBMITTED" || entry.status === "DISPUTED")
    .slice(0, 4);
  const weeklyHours = buildWeeklyHours(data.timesheets, today, undefined, intlLocale);
  const maxHours = Math.max(1, ...weeklyHours.map((item) => item.hours));
  const totalWeekHours = weeklyHours.reduce((total, item) => total + item.hours, 0);
  const activeProjects = data.projects.filter((project) => project.status === "ACTIVE").slice(0, 2);
  const telegramWorkers = data.channels.filter((channel) => channel === "TELEGRAM").length;
  const localDate = new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: organization.timezone,
  }).format(new Date());

  return (
    <>
      <PageHeader
        eyebrow={`${localDate} · ${organization.timezone}`}
        title={t("Good morning, {name}", { name: user?.name.split(" ")[0] ?? "there" })}
        description={t("Here is what needs your attention across today’s crews.")}
        actions={
          <>
            <Link className="secondary-button" href="/reports">
              <CalendarDays size={17} /> {t("This week")}
            </Link>
            <Link href="/workers" className="primary-button">
              <Users size={17} /> {t("View workers")}
            </Link>
          </>
        }
      />

      <section className="overflow-hidden rounded-3xl bg-ink text-white shadow-[0_18px_50px_rgba(18,34,25,0.12)]">
        <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-e">
            <div className="relative flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
                  <span className="size-2 rounded-full bg-brand-300" /> {t("Operations pulse")}
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  {t("{reported} of {active} workers", { reported: reportedWorkers, active: activeWorkers })}
                  <span className="block text-stone-400">{t("reported today")}</span>
                </h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-stone-200">
                {t("Live")} · {formatTime(new Date().toISOString(), organization.timezone, intlLocale)}
              </span>
            </div>
            <div className="relative mt-8 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-400" style={{ width: `${submissionRate}%` }} />
            </div>
            <div className="relative mt-3 flex justify-between text-xs text-stone-400">
              <span>{t("{rate}% submitted", { rate: submissionRate })}</span>
              <span>{t("{count} awaiting", { count: awaiting })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1">
            <Link href="/timesheets" className="group flex items-center justify-between border-e border-white/10 p-5 transition hover:bg-white/[0.04] sm:p-6 lg:border-b lg:border-e-0">
              <span><span className="block text-3xl font-semibold text-orange-300">{pending.length}</span><span className="mt-1 block text-sm text-stone-300">{t("Need approval")}</span></span>
              <ChevronRight className="text-stone-600 transition group-hover:translate-x-1 group-hover:text-white" />
            </Link>
            <Link href="/timesheets?status=disputed" className="group flex items-center justify-between p-5 transition hover:bg-white/[0.04] sm:p-6">
              <span><span className="block text-3xl font-semibold text-red-300">{disputes.length}</span><span className="mt-1 block text-sm text-stone-300">{t("Open disputes")}</span></span>
              <ChevronRight className="text-stone-600 transition group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="panel overflow-hidden">
          <div className="panel-header flex items-center justify-between">
            <div><h2 className="section-title">{t("Pending approvals")}</h2><p className="mt-1 text-xs text-muted">{t("Latest submissions across active sites")}</p></div>
            <Link href="/timesheets" className="text-link">{t("View all")} <ArrowRight size={14} /></Link>
          </div>
          <div className="divide-y divide-stone-100">
            {approvalItems.length ? approvalItems.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand-100 text-xs font-bold text-stone-700">{entry.initials}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{entry.worker}</p><p className="mt-0.5 truncate text-xs text-muted">{entry.project}</p></div>
                <div className="hidden text-end sm:block"><p className="text-sm font-semibold text-ink">{formatMinutes(entry.regularMinutes, "0h")}{entry.overtimeMinutes ? ` + ${formatMinutes(entry.overtimeMinutes)}` : ""}</p><p className="mt-0.5 text-xs text-muted">{t("Submitted {time}", { time: formatTime(entry.submittedAt, organization.timezone, intlLocale) })}</p></div>
                <StatusPill tone={entry.status === "DISPUTED" ? "red" : "amber"}>{t(entry.status === "DISPUTED" ? "Disputed" : "Pending")}</StatusPill>
              </div>
            )) : <p className="px-6 py-10 text-center text-sm text-muted">{t("No timesheets need attention.")}</p>}
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div><h2 className="section-title">{t("Hours this week")}</h2><p className="mt-1 text-xs text-muted">{t("All visible projects")}</p></div>
            <strong className="block text-xl text-ink">{totalWeekHours.toLocaleString()}h</strong>
          </div>
          <div className="mt-8 flex h-48 items-end justify-between gap-2 sm:gap-3">
            {weeklyHours.map((item, index) => (
              <div key={item.date} className="flex h-full flex-1 flex-col justify-end gap-2">
                <div className="group relative flex flex-1 items-end"><div style={{ height: `${item.hours ? Math.max((item.hours / maxHours) * 100, 6) : 2}%` }} className={`w-full rounded-t-lg ${index === weeklyHours.length - 1 ? "bg-brand-600" : "bg-brand-100"}`} title={`${item.hours} hours`} /></div>
                <span className="text-center text-[10px] font-medium text-stone-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="panel p-5 sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between"><h2 className="section-title">{t("Active projects")}</h2><Link href="/projects" className="text-link">{t("View projects")} <ArrowRight size={14} /></Link></div>
          {activeProjects.length ? <div className="grid gap-3 sm:grid-cols-2">
            {activeProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="rounded-2xl border border-stone-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/30">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-ink">{project.name}</p><p className="mt-1 text-xs text-muted">{project.location}</p></div><StatusPill tone="green">{t("Active")}</StatusPill></div>
                <div className="mt-5 flex items-center justify-between text-xs text-muted"><span className="flex items-center gap-1.5"><UserCheck size={14} /> {t("{count} workers", { count: project.workers })}</span><span>{t("{percent}% complete", { percent: project.completion })}</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${project.completion}%` }} /></div>
              </Link>
            ))}
          </div> : <p className="rounded-2xl border border-dashed border-stone-200 py-10 text-center text-sm text-muted">{t("No active projects yet.")}</p>}
        </div>

        <div className="panel p-5 sm:p-6">
          <h2 className="section-title">{t("Channel health")}</h2>
          <div className="mt-5 space-y-4">
            {[
              ["Telegram", telegramWorkers, "bg-sky-50 text-sky-700"],
            ].map(([name, count, iconClass]) => (
              <div key={String(name)} className="flex items-center gap-3">
                <span className={`grid size-10 place-items-center rounded-xl ${iconClass}`}><MessageCircleMore size={19} /></span>
                <div className="flex-1"><p className="text-sm font-semibold text-ink">{name}</p><p className="text-xs text-muted">{t("{count} workers connected", { count: Number(count) })}</p></div>
                <StatusPill tone={Number(count) ? "green" : "gray"}>{t(Number(count) ? "Online" : "Not connected")}</StatusPill>
              </div>
            ))}
          </div>
          {data.retryNotifications > 0 && <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-3 text-amber-900"><TriangleAlert size={16} className="mt-0.5 shrink-0" /><p className="text-xs leading-5">{data.retryNotifications} notifications are pending or queued for retry.</p></div>}
        </div>
      </section>
    </>
  );
}
