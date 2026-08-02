import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Check, Clock3, MessageCircleMore, Send, UserCheck, UserX } from "lucide-react";
import { ActionFeedback } from "@/components/action-feedback";
import { FormSubmitButton } from "@/components/form-submit-button";
import { CopyInviteLink } from "@/components/copy-invite-link";
import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/project-form";
import { StatusPill } from "@/components/status-pill";
import { getProjectFormData, getProjectTelegramData } from "@/lib/workspace-data";
import { getTelegramBotUsername } from "@/lib/telegram-config";
import { localeToIntl } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import {
  approveJoinRequest,
  createTelegramInvite,
  rejectJoinRequest,
  updateProject,
} from "../actions";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string; invite?: string }>;
}) {
  const [{ id }, feedback] = await Promise.all([params, searchParams]);
  const [{ workspace, project }, telegramData, { locale, t }] = await Promise.all([
    getProjectFormData(id),
    getProjectTelegramData(id),
    getI18n(),
  ]);
  if (!workspace.organization || !project) notFound();
  const organization = workspace.organization;

  const botUsername = getTelegramBotUsername();
  const inviteLink = feedback.invite && botUsername
    ? `https://t.me/${botUsername}?start=${feedback.invite}`
    : null;
  const qrCode = inviteLink
    ? await QRCode.toDataURL(inviteLink, { width: 360, margin: 2, errorCorrectionLevel: "M" })
    : null;
  const activeInvites = telegramData.invites.filter((invite) =>
    !invite.revoked_at && new Date(invite.expires_at) > new Date(),
  );
  const pendingRequests = telegramData.joinRequests.filter((request) => request.status === "PENDING");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={project.code}
        title={project.name}
        description={t("Manage project details, Telegram invitations and worker approvals.")}
      />
      <ActionFeedback error={feedback.error} success={feedback.success} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ProjectForm
          action={updateProject.bind(null, project.id)}
          project={project}
          isSelfAssigned={project.supervisor_member_id === workspace.membership?.id}
        />

        <section className="panel h-fit overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <MessageCircleMore size={18} className="text-sky-600" />
              <h2 className="section-title">{t("Telegram invitation")}</h2>
            </div>
            <p className="mt-1 text-xs text-muted">{t("Workers scan, start the bot and submit their details.")}</p>
          </div>
          {inviteLink && qrCode ? (
            <div className="p-5 text-center">
              <Image className="mx-auto rounded-2xl border border-stone-200" src={qrCode} alt={t("Telegram project invitation QR code")} width={260} height={260} unoptimized />
              <p className="mt-4 text-sm font-semibold text-ink">{t("Scan with a phone camera")}</p>
              <p className="mt-1 text-xs text-muted">{t("The worker must tap Start in Telegram.")}</p>
              <input className="field-input mt-4 text-xs" readOnly value={inviteLink} aria-label="Telegram invitation link" />
              <CopyInviteLink value={inviteLink} />
              <a className="primary-button mt-3 w-full justify-center" href={inviteLink} target="_blank" rel="noreferrer"><Send size={16} /> {t("Open invitation")}</a>
            </div>
          ) : (
            <div className="p-5">
              <div className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-950">
                <p className="font-semibold">{botUsername ? `@${botUsername}` : t("Bot username not configured")}</p>
                <p className="mt-1 text-xs leading-5 text-sky-800">{botUsername ? `${activeInvites.length} active invitation link${activeInvites.length === 1 ? "" : "s"}. Generate a fresh link to display its QR code.` : "Add TELEGRAM_BOT_USERNAME to the server environment first."}</p>
              </div>
              <form className="mt-4" action={createTelegramInvite.bind(null, project.id)}>
                <FormSubmitButton className="primary-button w-full justify-center" pendingLabel="Generating…" disabled={!botUsername}><Send size={16} /> {t("Generate QR & link")}</FormSubmitButton>
              </form>
            </div>
          )}
        </section>
      </div>

      <section className="panel mt-6 overflow-hidden">
        <div className="panel-header flex items-center justify-between gap-4">
          <div><h2 className="section-title">{t("Worker join requests")}</h2><p className="mt-1 text-xs text-muted">{t("Approving creates the worker, assigns this project and enables Telegram notifications.")}</p></div>
          <StatusPill tone={pendingRequests.length ? "amber" : "green"}>{pendingRequests.length} {t("Pending")}</StatusPill>
        </div>
        <div className="divide-y divide-stone-100">
          {telegramData.joinRequests.length ? telegramData.joinRequests.map((request) => (
            <div key={request.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:px-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sky-50 text-sm font-bold text-sky-700">{request.full_name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink">{request.full_name}</p><StatusPill tone={request.status === "PENDING" ? "amber" : request.status === "APPROVED" ? "green" : "gray"}>{request.status.toLowerCase()}</StatusPill></div>
                <p className="mt-1 text-xs text-muted">{request.trade || t("Trade not provided")} · {request.phone_number || t("No phone")} · {request.preferred_language.toUpperCase()}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-stone-400"><Clock3 size={12} /> {new Intl.DateTimeFormat(localeToIntl(locale), { dateStyle: "medium", timeStyle: "short", timeZone: organization.timezone }).format(new Date(request.created_at))}</p>
              </div>
              {request.status === "PENDING" ? <div className="flex gap-2">
                <form action={rejectJoinRequest.bind(null, project.id, request.id)}><FormSubmitButton className="secondary-button" pendingLabel="Rejecting…"><UserX size={15} /> {t("Reject")}</FormSubmitButton></form>
                <form action={approveJoinRequest.bind(null, project.id, request.id)}><FormSubmitButton className="primary-button" pendingLabel="Approving…"><UserCheck size={15} /> {t("Approve")}</FormSubmitButton></form>
              </div> : request.status === "APPROVED" ? <span className="flex items-center gap-1 text-xs font-semibold text-brand-700"><Check size={14} /> {t("Worker added")}</span> : null}
            </div>
          )) : <p className="px-6 py-12 text-center text-sm text-muted">{t("No workers have submitted this project invitation yet.")}</p>}
        </div>
      </section>
    </div>
  );
}
