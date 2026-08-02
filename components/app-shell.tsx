"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  ChevronDown,
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageCircleMore,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/locale-provider";
import { signOut } from "@/app/login/actions";
import type { AppUser } from "@/lib/auth";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/workers", label: "Workers", icon: Users },
  { href: "/timesheets", label: "Timesheets", icon: CalendarClock },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

type ShellWorkspace = {
  name: string;
  countryCode: string;
  timezone: string;
  pendingApprovals: number;
  channels: ("WHATSAPP" | "TELEGRAM")[];
};

function SidebarContent({
  pathname,
  user,
  workspace,
  onNavigate,
}: {
  pathname: string;
  user: AppUser;
  workspace: ShellWorkspace | null;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  const city = workspace?.timezone.split("/").at(-1)?.replaceAll("_", " ");

  return (
    <>
      <div className="px-5 pb-5 pt-6">
        <Brand />
      </div>

      <div className="mx-3 mb-6 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-[0_8px_28px_rgba(22,35,28,0.04)]">
        <Link href="/settings" className="flex w-full items-center gap-3 text-start">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-sm font-bold text-amber-900">
            {workspace
              ? workspace.name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "—"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink">
              {workspace?.name ?? t("No organization")}
            </span>
            <span className="block text-xs text-muted">
              {workspace ? `${city} · ${workspace.countryCode}` : t("Setup required")}
            </span>
          </span>
          <ChevronDown size={15} className="text-stone-400" />
        </Link>
      </div>

      <nav className="flex-1 px-3" aria-label={t("Primary navigation")}>
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
          {t("Workspace")}
        </p>
        <div className="space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                href={href}
                key={href}
                onClick={onNavigate}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-800"
                    : "text-stone-600 hover:bg-white hover:text-ink"
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={active ? "text-brand-700" : "text-stone-400 group-hover:text-stone-600"}
                />
                <span className="flex-1">{t(label)}</span>
                {href === "/timesheets" && workspace?.pendingApprovals ? (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                    {workspace.pendingApprovals}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <p className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
          {t("Manage")}
        </p>
        <div className="space-y-1">
          <Link
            href="/settings"
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname.startsWith("/settings")
                ? "bg-brand-50 text-brand-800"
                : "text-stone-600 hover:bg-white hover:text-ink"
            }`}
          >
            <Settings size={19} className="text-stone-400" /> {t("Settings")}
          </Link>
          <Link
            href="/help"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-ink"
          >
            <CircleHelp size={19} className="text-stone-400" /> {t("Help & support")}
          </Link>
        </div>
      </nav>

      <div className="m-3 rounded-2xl bg-ink p-4 text-white">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <MessageCircleMore size={16} className="text-brand-300" /> {t("Channels online")}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-stone-300">
          <span className="flex items-center gap-1.5">
            <i
              className={`size-1.5 rounded-full ${
                workspace?.channels.includes("TELEGRAM") ? "bg-sky-400" : "bg-stone-500"
              }`}
            />{" "}
            Telegram
          </span>
        </div>
      </div>

      <div className="border-t border-stone-200 px-4 pt-4">
        <LanguageSwitcher />
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
            {user.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink">{user.name}</span>
            <span className="block text-[11px] font-medium text-muted">{user.role}</span>
          </span>
          <form action={signOut}>
            <button
              className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-ink"
              type="submit"
              aria-label={t("Sign out")}
              title={t("Sign out")}
            >
              <BriefcaseBusiness size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export function AppShell({
  children,
  user,
  workspace,
}: {
  children: ReactNode;
  user: AppUser;
  workspace: ShellWorkspace | null;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-e border-stone-200 bg-sand-50 lg:flex">
        <SidebarContent pathname={pathname} user={user} workspace={workspace} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-canvas/95 px-4 backdrop-blur lg:hidden">
          <Brand />
          <div className="flex items-center gap-1">
            <Link href="/timesheets?status=pending" className="relative rounded-xl p-2 text-stone-600" aria-label={t("Open pending timesheets")}>
              <Bell size={20} />
              {!!workspace?.pendingApprovals && <span className="absolute end-1 top-1 size-2 rounded-full bg-orange-500" />}
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-stone-600"
              aria-label={t("Open navigation")}
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-ink/35 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label={t("Close navigation")}
            />
            <aside className="absolute inset-y-0 start-0 flex w-[290px] flex-col bg-sand-50 shadow-2xl">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute end-3 top-4 z-10 rounded-xl p-2 text-stone-500"
                aria-label={t("Close navigation")}
              >
                <X size={20} />
              </button>
              <SidebarContent
                pathname={pathname}
                user={user}
                workspace={workspace}
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        )}

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
          {user.demo && (
            <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
              <span>
                <strong>{t("Preview mode:")}</strong> {t("connect Supabase to use live organization data.")}
              </span>
              <Link href="/settings" className="shrink-0 font-semibold underline underline-offset-2">
                {t("Setup")}
              </Link>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
