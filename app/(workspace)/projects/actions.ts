"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dispatchPendingTelegramNotifications } from "@/lib/telegram";
import { getTelegramBotUsername } from "@/lib/telegram-config";
import { getWorkspaceContext } from "@/lib/workspace-data";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function managedWorkspace(path: string) {
  const workspace = await getWorkspaceContext();
  const role = workspace.membership?.role;
  if (!workspace.organization || !role) fail(path, "Organization setup is required.");
  if (!(["OWNER", "ADMIN", "SUPERVISOR"] as const).includes(role)) {
    fail(path, "You do not have permission to manage projects.");
  }
  return workspace;
}

function projectValues(formData: FormData, path: string) {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase().replaceAll(" ", "-");
  const location = String(formData.get("location") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT");
  const startsOn = String(formData.get("startsOn") ?? "") || null;
  const endsOn = String(formData.get("endsOn") ?? "") || null;
  const assignSelf = formData.get("assignSelf") === "on";

  if (name.length < 2 || name.length > 160) fail(path, "Project name must be 2–160 characters.");
  if (!/^[A-Z0-9][A-Z0-9-]{1,31}$/.test(code)) {
    fail(path, "Project code must use 2–32 letters, numbers or hyphens.");
  }
  if (!(["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED"] as const).includes(status as "DRAFT")) {
    fail(path, "Select a valid project status.");
  }
  if (startsOn && endsOn && endsOn < startsOn) fail(path, "End date cannot be before start date.");

  return { name, code, location: location || null, status, startsOn, endsOn, assignSelf };
}

export async function createProject(formData: FormData) {
  const path = "/projects/new";
  const workspace = await managedWorkspace(path);
  const values = projectValues(formData, path);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      organization_id: workspace.organization!.id,
      name: values.name,
      code: values.code,
      location: values.location,
      status: values.status as "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED",
      starts_on: values.startsOn,
      ends_on: values.endsOn,
      supervisor_member_id: values.assignSelf ? workspace.membership!.id : null,
    })
    .select("id")
    .single();

  if (error) {
    fail(path, error.code === "23505" ? "That project code is already in use." : error.message);
  }
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${data.id}?success=${encodeURIComponent("Project created successfully.")}`);
}

export async function updateProject(projectId: string, formData: FormData) {
  const path = `/projects/${projectId}`;
  const workspace = await managedWorkspace(path);
  const values = projectValues(formData, path);
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      name: values.name,
      code: values.code,
      location: values.location,
      status: values.status as "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED",
      starts_on: values.startsOn,
      ends_on: values.endsOn,
      supervisor_member_id: values.assignSelf ? workspace.membership!.id : null,
    })
    .eq("organization_id", workspace.organization!.id)
    .eq("id", projectId);

  if (error) fail(path, error.code === "23505" ? "That project code is already in use." : error.message);
  revalidatePath("/projects");
  revalidatePath(path);
  revalidatePath("/dashboard");
  redirect(`${path}?success=${encodeURIComponent("Project saved successfully.")}`);
}

export async function createTelegramInvite(projectId: string) {
  const path = `/projects/${projectId}`;
  const workspace = await managedWorkspace(path);
  if (!getTelegramBotUsername()) fail(path, "Configure TELEGRAM_BOT_USERNAME before creating invitations.");
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("organization_id", workspace.organization!.id)
    .eq("id", projectId)
    .maybeSingle();
  if (!project) fail(path, "Project not found.");

  const token = randomBytes(24).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await supabase.from("project_invites").insert({
    organization_id: workspace.organization!.id,
    project_id: projectId,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString(),
    created_by: workspace.membership!.user_id,
  });
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?invite=${encodeURIComponent(token)}&success=${encodeURIComponent("Telegram invitation created. It expires in 30 days.")}`);
}

async function reviewJoinRequest(projectId: string, requestId: string, decision: "approve" | "reject") {
  const path = `/projects/${projectId}`;
  const workspace = await managedWorkspace(path);
  const supabase = await createClient();
  const { data: request, error: readError } = await supabase
    .from("project_join_requests")
    .select("id, status")
    .eq("organization_id", workspace.organization!.id)
    .eq("project_id", projectId)
    .eq("id", requestId)
    .maybeSingle();
  if (readError) fail(path, readError.message);
  if (!request || request.status !== "PENDING") fail(path, "This join request is no longer pending.");
  const rpcName = decision === "approve" ? "approve_project_join_request" : "reject_project_join_request";
  const { error } = await supabase.rpc(rpcName, { target_request_id: requestId });
  if (error) fail(path, error.message);

  let notificationMessage = decision === "approve" ? "Worker approved and notified on Telegram." : "Request rejected and worker notified on Telegram.";
  try {
    const result = await dispatchPendingTelegramNotifications({ organizationId: workspace.organization!.id, limit: 10 });
    if (result.failed) notificationMessage = "Decision saved. Telegram delivery is queued for retry.";
  } catch {
    notificationMessage = "Decision saved. Telegram notification is queued until messaging is configured.";
  }
  revalidatePath(path);
  revalidatePath("/workers");
  revalidatePath("/dashboard");
  redirect(`${path}?success=${encodeURIComponent(notificationMessage)}`);
}

export async function approveJoinRequest(projectId: string, requestId: string) {
  await reviewJoinRequest(projectId, requestId, "approve");
}

export async function rejectJoinRequest(projectId: string, requestId: string) {
  await reviewJoinRequest(projectId, requestId, "reject");
}
