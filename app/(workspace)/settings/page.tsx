import { BadgeDollarSign, Building2, Check, ChevronRight, KeyRound, Languages, MessageCircleMore, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ActionFeedback } from "@/components/action-feedback";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { WorkspaceEmptyState } from "@/components/workspace-empty-state";
import { getSettingsData } from "@/lib/workspace-data";
import { getSubscriptionSettingsData } from "@/lib/subscription-data";
import { updateOrganization } from "./actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getI18n } from "@/lib/i18n/server";
import { localeToIntl } from "@/lib/i18n/config";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const feedback = await searchParams;
  const [{ workspace, channelCounts }, subscriptionData, { t, locale }] = await Promise.all([getSettingsData(), getSubscriptionSettingsData(), getI18n()]);
  const organization = workspace.organization;

  if (!organization) {
    return (
      <>
        <PageHeader eyebrow={t("Workspace configuration")} title={t("Settings")} description={t("Manage your organization, regional preferences and messaging channels.")} />
        <WorkspaceEmptyState configured={workspace.configured} />
      </>
    );
  }

  const canEdit = workspace.membership?.role === "OWNER" || workspace.membership?.role === "ADMIN";
  const telegramCount = channelCounts.get("TELEGRAM") ?? 0;
  const subscription = subscriptionData.subscription;
  const statusTone = subscription?.status === "ACTIVE" ? "green" : subscription?.status === "TRIAL" ? "amber" : "gray";
  const formatLimit = (count: number, limit: number | null) => `${count} / ${limit ?? t("Unlimited")}`;
  const subscriptionStatus = subscription?.status === "ACTIVE" ? t("Active") : subscription?.status === "TRIAL" ? t("Pilot") : subscription?.status === "PENDING" ? t("Pending") : subscription?.status === "SUSPENDED" ? t("Suspended") : subscription?.status === "CANCELLED" ? t("Cancelled") : subscription?.status;
  const contactLanguage = locale === "ar" ? "ar" : "en";

  return (
    <>
      <PageHeader eyebrow={t("Workspace configuration")} title={t("Settings")} description={t("Manage your organization, regional preferences and messaging channels.")} />
      <ActionFeedback error={feedback.error} success={feedback.success} />

      <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="h-fit rounded-2xl border border-stone-200 bg-white p-2">
          <a href="#organization" className="flex w-full items-center gap-3 rounded-xl bg-brand-50 px-3 py-2.5 text-start text-sm font-medium text-brand-800"><Building2 size={17} />{t("Organization")}</a>
          <a href="#subscription" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-stone-600 hover:bg-stone-50"><BadgeDollarSign size={17} />{t("Subscription")}</a>
          <a href="#messaging" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-stone-600 hover:bg-stone-50"><MessageCircleMore size={17} />{t("Messaging")}</a>
          <div className="rounded-xl px-3 py-2"><p className="mb-2 flex items-center gap-3 text-sm font-medium text-stone-600"><Languages size={17} />{t("Language & region")}</p><LanguageSwitcher /></div>
          <span className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-stone-400"><ShieldCheck size={17} />{t("Members & roles")} <small className="ms-auto">{t("Soon")}</small></span>
          <span className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-stone-400"><KeyRound size={17} />{t("Security")} <small className="ms-auto">{t("Soon")}</small></span>
        </nav>

        <div className="space-y-6">
          <form id="organization" action={updateOrganization} className="panel scroll-mt-24 overflow-hidden">
            <div className="panel-header"><h2 className="section-title">{t("Organization details")}</h2><p className="mt-1 text-xs text-muted">{t("Stored in Supabase and shown to supervisors and workers.")}</p></div>
            <fieldset disabled={!canEdit} className="grid gap-5 p-5 disabled:opacity-70 sm:grid-cols-2 sm:p-6">
              <label className="field-label sm:col-span-2">{t("Organization name")}<input className="field-input" name="name" required minLength={2} maxLength={160} defaultValue={organization.name} /></label>
              <label className="field-label">{t("Country")}<select className="field-input" name="countryCode" defaultValue={organization.country_code}><option value="AE">United Arab Emirates</option><option value="SA">Saudi Arabia</option><option value="QA">Qatar</option></select></label>
              <label className="field-label">{t("Time zone")}<select className="field-input" name="timezone" defaultValue={organization.timezone}><option value="Asia/Dubai">Dubai (GST, UTC+4)</option><option value="Asia/Riyadh">Riyadh (AST, UTC+3)</option><option value="Asia/Qatar">Doha (AST, UTC+3)</option></select></label>
              <label className="field-label">{t("Default worker language")}<select className="field-input" name="defaultLanguage" defaultValue={organization.default_language}><option value="en">English</option><option value="ar">العربية</option><option value="ur">اردو</option><option value="hi">हिन्दी</option></select></label>
              <label className="field-label">{t("Week starts")}<select className="field-input" name="weekStartsOn" defaultValue={String(organization.week_starts_on)}><option value="1">{t("Monday")}</option><option value="0">{t("Sunday")}</option><option value="6">{t("Saturday")}</option></select></label>
            </fieldset>
            <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 sm:px-6"><p className="text-xs text-muted">{t("Your role: {role}", { role: workspace.membership?.role ?? "—" })}</p>{canEdit ? <FormSubmitButton pendingLabel="Saving…"><Check size={16} /> {t("Save changes")}</FormSubmitButton> : <span className="text-xs text-muted">{t("Owner or admin access required")}</span>}</div>
          </form>

          <section id="subscription" className="panel scroll-mt-24 overflow-hidden">
            <div className="panel-header"><div className="flex items-center gap-2"><h2 className="section-title">{t("Subscription")}</h2>{subscription ? <StatusPill tone={statusTone}>{subscriptionStatus}</StatusPill> : <StatusPill tone="gray">{t("Setting up")}</StatusPill>}</div><p className="mt-1 text-xs text-muted">{t("Your plan is managed by AmalCrew. Contact us to upgrade, renew or discuss your site requirements.")}</p></div>
            {subscription ? <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6"><div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted">{t("Plan")}</p><p className="mt-2 text-lg font-semibold text-ink">{subscription.plan}</p></div><div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted">{t("Active workers")}</p><p className="mt-2 text-lg font-semibold text-ink">{formatLimit(subscriptionData.activeWorkerCount, subscription.activeWorkerLimit)}</p></div><div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted">{t("Active projects")}</p><p className="mt-2 text-lg font-semibold text-ink">{formatLimit(subscriptionData.activeProjectCount, subscription.activeProjectLimit)}</p></div><div className="sm:col-span-3 flex flex-col gap-3 border-t border-stone-100 pt-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between"><span>{subscription.endsAt ? t("Current term ends {date}.", { date: new Intl.DateTimeFormat(localeToIntl(locale), { day: "2-digit", month: "short", year: "numeric" }).format(new Date(subscription.endsAt)) }) : t("Your current plan does not have an end date set.")}</span><Link href={`/${contactLanguage}/contact`} className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition hover:bg-brand-800">{t("Contact AmalCrew")}</Link></div></div> : <div className="p-5 text-sm leading-6 text-muted sm:p-6">{t("Your workspace subscription is being prepared. Please contact AmalCrew if this message remains after setup.")}</div>}
          </section>

          <section id="messaging" className="panel scroll-mt-24 overflow-hidden">
            <div className="panel-header"><h2 className="section-title">{t("Messaging channels")}</h2><p className="mt-1 text-xs text-muted">{t("Verified worker connections currently stored in Supabase.")}</p></div>
            <div className="divide-y divide-stone-100">
              <div className="flex items-center gap-4 p-5 sm:p-6"><span className="grid size-11 place-items-center rounded-2xl bg-sky-50 text-sky-700"><MessageCircleMore size={21} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-semibold text-ink">Telegram Bot</p><StatusPill tone={telegramCount ? "green" : "gray"}>{t(telegramCount ? "Connected" : "Awaiting workers")}</StatusPill></div><p className="mt-1 text-xs text-muted">{t("{count} verified workers · automatic project and timesheet notifications", { count: telegramCount })}</p></div><Link href="/help?topic=messaging" className="rounded-xl border border-stone-200 p-2 text-stone-500 hover:bg-stone-50" aria-label="Telegram"><ChevronRight size={18} /></Link></div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
