"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-data";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function managedWorkspace(path: string) {
  const workspace = await getWorkspaceContext();
  const role = workspace.membership?.role;
  if (!workspace.organization || !role) fail(path, "Organization setup is required.");
  if (!(["OWNER", "ADMIN", "SUPERVISOR"] as const).includes(role)) {
    fail(path, "You do not have permission to manage workers.");
  }
  return workspace;
}

function workerValues(formData: FormData, path: string) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const trade = String(formData.get("trade") ?? "").trim();
  const language = String(formData.get("language") ?? "en");
  const status = String(formData.get("status") ?? "ACTIVE");
  const projectId = String(formData.get("projectId") ?? "") || null;
  const channel = String(formData.get("channel") ?? "") || null;
  const channelIdentifier = String(formData.get("channelIdentifier") ?? "").trim() || null;

  if (fullName.length < 2 || fullName.length > 160) fail(path, "Worker name must be 2–160 characters.");
  if (phoneNumber && !/^\+?[0-9 ()-]{7,24}$/.test(phoneNumber)) fail(path, "Enter a valid phone number.");
  if (!(["en", "ar", "ur", "hi"] as const).includes(language as "en")) fail(path, "Select a supported language.");
  if (!(["ACTIVE", "INACTIVE"] as const).includes(status as "ACTIVE")) fail(path, "Select a valid worker status.");
  if (channel && channel !== "TELEGRAM") fail(path, "Only Telegram is supported for messaging.");

  return { fullName, phoneNumber: phoneNumber || null, trade: trade || null, language, status, projectId, channel, channelIdentifier };
}

async function saveAssignmentAndChannel({
  path,
  workerId,
  organizationId,
  projectId,
  channel,
  channelIdentifier,
  phoneNumber,
}: {
  path: string;
  workerId: string;
  organizationId: string;
  projectId: string | null;
  channel: string | null;
  channelIdentifier: string | null;
  phoneNumber: string | null;
}) {
  const supabase = await createClient();
  const { error: clearAssignmentError } = await supabase
    .from("project_workers")
    .delete()
    .eq("organization_id", organizationId)
    .eq("worker_id", workerId);
  if (clearAssignmentError) fail(path, clearAssignmentError.message);

  if (projectId) {
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("id", projectId)
      .maybeSingle();
    if (!project) fail(path, "The selected project is not available.");
    const { error } = await supabase.from("project_workers").insert({
      organization_id: organizationId,
      project_id: projectId,
      worker_id: workerId,
    });
    if (error) fail(path, error.message);
  }

  const { error: preferredError } = await supabase
    .from("worker_channel_identities")
    .update({ is_preferred: false })
    .eq("organization_id", organizationId)
    .eq("worker_id", workerId);
  if (preferredError) fail(path, preferredError.message);

  if (channel) {
    const typedChannel = channel as "TELEGRAM";
    const { error } = await supabase.from("worker_channel_identities").upsert(
      {
        organization_id: organizationId,
        worker_id: workerId,
        channel: typedChannel,
        external_user_id: channelIdentifier,
        phone_number: phoneNumber,
        is_enabled: true,
        is_preferred: true,
      },
      { onConflict: "worker_id,channel" },
    );
    if (error) fail(path, error.message);
  }
}

export async function createWorker(formData: FormData) {
  const path = "/workers/new";
  const workspace = await managedWorkspace(path);
  const values = workerValues(formData, path);
  const supabase = await createClient();
  const organizationId = workspace.organization!.id;
  const { data, error } = await supabase
    .from("workers")
    .insert({
      organization_id: organizationId,
      full_name: values.fullName,
      phone_number: values.phoneNumber,
      trade: values.trade,
      preferred_language: values.language,
      status: values.status as "ACTIVE" | "INACTIVE",
    })
    .select("id")
    .single();
  if (error) fail(path, error.message);

  await saveAssignmentAndChannel({
    path,
    workerId: data.id,
    organizationId,
    projectId: values.projectId,
    channel: values.channel,
    channelIdentifier: values.channelIdentifier,
    phoneNumber: values.phoneNumber,
  });

  revalidatePath("/workers");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/workers/${data.id}?success=${encodeURIComponent("Worker added successfully.")}`);
}

export async function updateWorker(workerId: string, formData: FormData) {
  const path = `/workers/${workerId}`;
  const workspace = await managedWorkspace(path);
  const values = workerValues(formData, path);
  const supabase = await createClient();
  const organizationId = workspace.organization!.id;
  const { error } = await supabase
    .from("workers")
    .update({
      full_name: values.fullName,
      phone_number: values.phoneNumber,
      trade: values.trade,
      preferred_language: values.language,
      status: values.status as "ACTIVE" | "INACTIVE",
    })
    .eq("organization_id", organizationId)
    .eq("id", workerId);
  if (error) fail(path, error.message);

  await saveAssignmentAndChannel({
    path,
    workerId,
    organizationId,
    projectId: values.projectId,
    channel: values.channel,
    channelIdentifier: values.channelIdentifier,
    phoneNumber: values.phoneNumber,
  });

  revalidatePath("/workers");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath(path);
  redirect(`${path}?success=${encodeURIComponent("Worker saved successfully.")}`);
}
