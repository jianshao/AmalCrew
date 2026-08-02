import "server-only";

import { cache } from "react";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Tables = Database["public"]["Tables"];
type Organization = Tables["organizations"]["Row"];
type Membership = Tables["organization_members"]["Row"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];
type WorkerStatus = Database["public"]["Enums"]["worker_status"];
type TimesheetStatus = Database["public"]["Enums"]["timesheet_status"];
type Channel = Database["public"]["Enums"]["channel_type"];
export type ProjectRecord = Tables["projects"]["Row"];
export type WorkerRecord = Tables["workers"]["Row"];
export type WorkerChannelRecord = Tables["worker_channel_identities"]["Row"];
export type ProjectInviteRecord = Tables["project_invites"]["Row"];
export type ProjectJoinRequestRecord = Tables["project_join_requests"]["Row"];

export type WorkspaceContext = {
  configured: boolean;
  organization: Organization | null;
  membership: Membership | null;
};

export type ProjectListItem = {
  id: string;
  code: string;
  name: string;
  location: string;
  status: ProjectStatus;
  supervisor: string;
  workers: number;
  hours: number;
  completion: number;
};

export type WorkerListItem = {
  id: string;
  name: string;
  trade: string;
  phone: string;
  language: string;
  status: WorkerStatus;
  project: string;
  channel: Channel | null;
  channelVerified: boolean;
  todayMinutes: number;
};

export type TimesheetListItem = {
  id: string;
  workerId: string;
  projectId: string;
  worker: string;
  initials: string;
  project: string;
  workDate: string;
  regularMinutes: number;
  overtimeMinutes: number;
  status: TimesheetStatus;
  submittedAt: string;
  version: number;
};

const approvedReportStatuses: TimesheetStatus[] = [
  "APPROVED",
  "CONFIRMED",
  "LOCKED",
];

function queryError(scope: string, message: string) {
  return new Error(`Unable to load ${scope}: ${message}`);
}

export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext> => {
  if (!isSupabaseConfigured) {
    return { configured: false, organization: null, membership: null };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError) throw queryError("your session", claimsError.message);
  if (!userId) return { configured: true, organization: null, membership: null };

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw queryError("your organization membership", membershipError.message);
  }
  if (!membership) {
    return { configured: true, organization: null, membership: null };
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .single();

  if (organizationError) {
    throw queryError("your organization", organizationError.message);
  }

  return { configured: true, organization, membership };
});

export function getDateInTimeZone(timeZone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function getRecentDates(endDate: string, count = 7) {
  return Array.from({ length: count }, (_, index) => addDays(endDate, index - count + 1));
}

export function formatMinutes(minutes: number, empty = "—") {
  if (!minutes) return empty;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder}m`;
  if (!remainder) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

export function formatWorkDate(date: string, locale = "en-GB") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatTime(date: string, timeZone: string, locale = "en-GB") {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(date));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function shortId(prefix: string, id: string) {
  return `${prefix}-${id.replaceAll("-", "").slice(0, 6).toUpperCase()}`;
}

function projectCompletion(
  status: ProjectStatus,
  startsOn: string | null,
  endsOn: string | null,
  today: string,
) {
  if (status === "COMPLETED" || status === "ARCHIVED") return 100;
  if (!startsOn || !endsOn) return 0;
  const start = Date.parse(`${startsOn}T00:00:00Z`);
  const end = Date.parse(`${endsOn}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  if (end <= start) return current >= end ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round(((current - start) / (end - start)) * 100)));
}

export async function getNavigationData() {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) {
    return { workspace, pendingApprovals: 0, channels: [] as Channel[] };
  }

  const supabase = await createClient();
  const organizationId = workspace.organization.id;
  const [pendingResult, channelsResult] = await Promise.all([
    supabase
      .from("timesheets")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "SUBMITTED"),
    supabase
      .from("worker_channel_identities")
      .select("channel")
      .eq("organization_id", organizationId)
      .eq("is_enabled", true)
      .eq("is_verified", true),
  ]);

  if (pendingResult.error) throw queryError("pending approvals", pendingResult.error.message);
  if (channelsResult.error) throw queryError("messaging channels", channelsResult.error.message);

  return {
    workspace,
    pendingApprovals: pendingResult.count ?? 0,
    channels: [...new Set((channelsResult.data ?? []).map((item) => item.channel))],
  };
}

export async function getProjectsData() {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) return { workspace, projects: [] as ProjectListItem[] };

  const supabase = await createClient();
  const organizationId = workspace.organization.id;
  const today = getDateInTimeZone(workspace.organization.timezone);
  const [projectsResult, assignmentsResult, timesheetsResult] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_workers")
      .select("project_id, worker_id")
      .eq("organization_id", organizationId),
    supabase
      .from("timesheets")
      .select("project_id, regular_minutes, overtime_minutes, work_date")
      .eq("organization_id", organizationId),
  ]);

  if (projectsResult.error) throw queryError("projects", projectsResult.error.message);
  if (assignmentsResult.error) throw queryError("project crews", assignmentsResult.error.message);
  if (timesheetsResult.error) throw queryError("project hours", timesheetsResult.error.message);

  const workerCounts = new Map<string, number>();
  for (const assignment of assignmentsResult.data ?? []) {
    workerCounts.set(assignment.project_id, (workerCounts.get(assignment.project_id) ?? 0) + 1);
  }

  const minuteTotals = new Map<string, number>();
  for (const timesheet of timesheetsResult.data ?? []) {
    minuteTotals.set(
      timesheet.project_id,
      (minuteTotals.get(timesheet.project_id) ?? 0) +
        timesheet.regular_minutes +
        timesheet.overtime_minutes,
    );
  }

  const projects: ProjectListItem[] = (projectsResult.data ?? []).map((project) => ({
    id: project.id,
    code: project.code,
    name: project.name,
    location: project.location || "Location not set",
    status: project.status,
    supervisor: project.supervisor_member_id
      ? project.supervisor_member_id === workspace.membership?.id
        ? "You"
        : "Assigned supervisor"
      : "Unassigned",
    workers: workerCounts.get(project.id) ?? 0,
    hours: Math.round((minuteTotals.get(project.id) ?? 0) / 60),
    completion: projectCompletion(project.status, project.starts_on, project.ends_on, today),
  }));

  return { workspace, projects };
}

export async function getWorkersData() {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) return { workspace, workers: [] as WorkerListItem[] };

  const supabase = await createClient();
  const organizationId = workspace.organization.id;
  const today = getDateInTimeZone(workspace.organization.timezone);
  const [workersResult, projectsResult, assignmentsResult, channelsResult, timesheetsResult] =
    await Promise.all([
      supabase
        .from("workers")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name").eq("organization_id", organizationId),
      supabase
        .from("project_workers")
        .select("project_id, worker_id, assigned_at")
        .eq("organization_id", organizationId)
        .order("assigned_at", { ascending: false }),
      supabase
        .from("worker_channel_identities")
        .select("worker_id, channel, is_preferred, is_verified, is_enabled")
        .eq("organization_id", organizationId)
        .eq("is_enabled", true)
        .order("is_preferred", { ascending: false }),
      supabase
        .from("timesheets")
        .select("worker_id, regular_minutes, overtime_minutes")
        .eq("organization_id", organizationId)
        .eq("work_date", today),
    ]);

  const results = [workersResult, projectsResult, assignmentsResult, channelsResult, timesheetsResult];
  const failed = results.find((result) => result.error);
  if (failed?.error) throw queryError("workers", failed.error.message);

  const projectNames = new Map((projectsResult.data ?? []).map((project) => [project.id, project.name]));
  const workerProjects = new Map<string, string>();
  for (const assignment of assignmentsResult.data ?? []) {
    if (!workerProjects.has(assignment.worker_id)) {
      workerProjects.set(assignment.worker_id, projectNames.get(assignment.project_id) ?? "Unknown project");
    }
  }

  const workerChannels = new Map<
    string,
    { channel: Channel; is_verified: boolean }
  >();
  for (const channel of channelsResult.data ?? []) {
    if (!workerChannels.has(channel.worker_id)) {
      workerChannels.set(channel.worker_id, channel);
    }
  }

  const todayMinutes = new Map<string, number>();
  for (const timesheet of timesheetsResult.data ?? []) {
    todayMinutes.set(
      timesheet.worker_id,
      (todayMinutes.get(timesheet.worker_id) ?? 0) +
        timesheet.regular_minutes +
        timesheet.overtime_minutes,
    );
  }

  const workers: WorkerListItem[] = (workersResult.data ?? []).map((worker) => {
    const channel = workerChannels.get(worker.id);
    return {
      id: worker.id,
      name: worker.full_name,
      trade: worker.trade || "Trade not set",
      phone: worker.phone_number || "No phone",
      language: worker.preferred_language.toUpperCase(),
      status: worker.status,
      project: workerProjects.get(worker.id) ?? "Unassigned",
      channel: channel?.channel ?? null,
      channelVerified: channel?.is_verified ?? false,
      todayMinutes: todayMinutes.get(worker.id) ?? 0,
    };
  });

  return { workspace, workers };
}

export async function getTimesheetsData(options?: {
  from?: string;
  before?: string;
  limit?: number;
}) {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) return { workspace, timesheets: [] as TimesheetListItem[] };

  const supabase = await createClient();
  const organizationId = workspace.organization.id;
  let timesheetsQuery = supabase
      .from("timesheets")
      .select("*")
      .eq("organization_id", organizationId)
      .order("submitted_at", { ascending: false });
  if (options?.from) timesheetsQuery = timesheetsQuery.gte("work_date", options.from);
  if (options?.before) timesheetsQuery = timesheetsQuery.lt("work_date", options.before);
  timesheetsQuery = timesheetsQuery.limit(options?.limit ?? 100);

  const [timesheetsResult, workersResult, projectsResult] = await Promise.all([
    timesheetsQuery,
    supabase.from("workers").select("id, full_name").eq("organization_id", organizationId),
    supabase.from("projects").select("id, name").eq("organization_id", organizationId),
  ]);

  if (timesheetsResult.error) throw queryError("timesheets", timesheetsResult.error.message);
  if (workersResult.error) throw queryError("timesheet workers", workersResult.error.message);
  if (projectsResult.error) throw queryError("timesheet projects", projectsResult.error.message);

  const workerNames = new Map((workersResult.data ?? []).map((worker) => [worker.id, worker.full_name]));
  const projectNames = new Map((projectsResult.data ?? []).map((project) => [project.id, project.name]));
  const timesheets: TimesheetListItem[] = (timesheetsResult.data ?? []).map((timesheet) => {
    const worker = workerNames.get(timesheet.worker_id) ?? "Unknown worker";
    return {
      id: timesheet.id,
      workerId: timesheet.worker_id,
      projectId: timesheet.project_id,
      worker,
      initials: initials(worker),
      project: projectNames.get(timesheet.project_id) ?? "Unknown project",
      workDate: timesheet.work_date,
      regularMinutes: timesheet.regular_minutes,
      overtimeMinutes: timesheet.overtime_minutes,
      status: timesheet.status,
      submittedAt: timesheet.submitted_at,
      version: timesheet.version,
    };
  });

  return { workspace, timesheets };
}

export async function getReportsData(month?: string) {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) {
    return {
      workspace,
      projects: [] as ProjectListItem[],
      timesheets: [] as TimesheetListItem[],
      selectedMonth: /^\d{4}-\d{2}$/.test(month ?? "") ? month! : "",
    };
  }

  const fallbackMonth = getDateInTimeZone(workspace.organization.timezone).slice(0, 7);
  const selectedMonth = /^\d{4}-\d{2}$/.test(month ?? "") ? month! : fallbackMonth;
  const [year, monthNumber] = selectedMonth.split("-").map(Number);
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1)).toISOString().slice(0, 10);
  const [{ projects }, { timesheets }] = await Promise.all([
    getProjectsData(),
    getTimesheetsData({ from: `${selectedMonth}-01`, before: nextMonth, limit: 1000 }),
  ]);
  return { workspace, projects, timesheets, selectedMonth };
}

export async function getDashboardData() {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) {
    return {
      workspace,
      projects: [] as ProjectListItem[],
      workers: [] as WorkerListItem[],
      timesheets: [] as TimesheetListItem[],
      channels: [] as Channel[],
      retryNotifications: 0,
    };
  }

  const supabase = await createClient();
  const organizationId = workspace.organization.id;
  const [{ projects }, { workers }, { timesheets }, channelsResult, notificationResult] =
    await Promise.all([
      getProjectsData(),
      getWorkersData(),
      getTimesheetsData(),
      supabase
        .from("worker_channel_identities")
        .select("channel")
        .eq("organization_id", organizationId)
        .eq("is_enabled", true)
        .eq("is_verified", true),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .in("status", ["PENDING", "FAILED"]),
    ]);

  if (channelsResult.error) throw queryError("channel health", channelsResult.error.message);
  if (notificationResult.error) {
    throw queryError("notification health", notificationResult.error.message);
  }

  return {
    workspace,
    projects,
    workers,
    timesheets,
    channels: (channelsResult.data ?? []).map((item) => item.channel),
    retryNotifications: notificationResult.count ?? 0,
  };
}

export async function getSettingsData() {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) return { workspace, channelCounts: new Map<Channel, number>() };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("worker_channel_identities")
    .select("channel")
    .eq("organization_id", workspace.organization.id)
    .eq("is_enabled", true)
    .eq("is_verified", true);

  if (error) throw queryError("messaging settings", error.message);
  const channelCounts = new Map<Channel, number>();
  for (const item of data ?? []) {
    channelCounts.set(item.channel, (channelCounts.get(item.channel) ?? 0) + 1);
  }
  return { workspace, channelCounts };
}

export async function getProjectFormData(projectId?: string) {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization || !projectId) {
    return { workspace, project: null as ProjectRecord | null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", workspace.organization.id)
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw queryError("project", error.message);
  return { workspace, project: data };
}

export async function getProjectTelegramData(projectId: string) {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) {
    return {
      workspace,
      invites: [] as ProjectInviteRecord[],
      joinRequests: [] as ProjectJoinRequestRecord[],
    };
  }
  const supabase = await createClient();
  const organizationId = workspace.organization.id;
  const [invitesResult, requestsResult] = await Promise.all([
    supabase
      .from("project_invites")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_join_requests")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
  ]);
  if (invitesResult.error) throw queryError("project invitations", invitesResult.error.message);
  if (requestsResult.error) throw queryError("join requests", requestsResult.error.message);
  return {
    workspace,
    invites: invitesResult.data ?? [],
    joinRequests: requestsResult.data ?? [],
  };
}

export async function getWorkerFormData(workerId?: string) {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) {
    return {
      workspace,
      worker: null as WorkerRecord | null,
      projects: [] as Pick<ProjectRecord, "id" | "name" | "status">[],
      projectId: null as string | null,
      channel: null as WorkerChannelRecord | null,
    };
  }

  const supabase = await createClient();
  const organizationId = workspace.organization.id;
  const [projectsResult, workerResult, assignmentResult, channelResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status")
      .eq("organization_id", organizationId)
      .in("status", ["DRAFT", "ACTIVE", "ON_HOLD"])
      .order("name"),
    workerId
      ? supabase
          .from("workers")
          .select("*")
          .eq("organization_id", organizationId)
          .eq("id", workerId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    workerId
      ? supabase
          .from("project_workers")
          .select("project_id")
          .eq("organization_id", organizationId)
          .eq("worker_id", workerId)
          .order("assigned_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    workerId
      ? supabase
          .from("worker_channel_identities")
          .select("*")
          .eq("organization_id", organizationId)
          .eq("worker_id", workerId)
          .eq("is_preferred", true)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (projectsResult.error) throw queryError("project options", projectsResult.error.message);
  if (workerResult.error) throw queryError("worker", workerResult.error.message);
  if (assignmentResult.error) throw queryError("worker assignment", assignmentResult.error.message);
  if (channelResult.error) throw queryError("worker channel", channelResult.error.message);

  return {
    workspace,
    worker: workerResult.data,
    projects: projectsResult.data ?? [],
    projectId: assignmentResult.data?.project_id ?? null,
    channel: channelResult.data,
  };
}

export function buildWeeklyHours(
  timesheets: TimesheetListItem[],
  endDate: string,
  statuses?: TimesheetStatus[],
  locale = "en-GB",
) {
  return getRecentDates(endDate).map((date) => {
    const minutes = timesheets
      .filter((item) => item.workDate === date && (!statuses || statuses.includes(item.status)))
      .reduce((total, item) => total + item.regularMinutes + item.overtimeMinutes, 0);
    return {
      date,
      day: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
        new Date(`${date}T00:00:00Z`),
      ),
      hours: Math.round((minutes / 60) * 10) / 10,
    };
  });
}

export function isApprovedForReports(status: TimesheetStatus) {
  return approvedReportStatuses.includes(status);
}
