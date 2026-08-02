"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dispatchPendingTelegramNotifications } from "@/lib/telegram";
import { getWorkspaceContext } from "@/lib/workspace-data";

function fail(message: string): never {
  redirect(`/timesheets?error=${encodeURIComponent(message)}`);
}

export async function approveTimesheet(formData: FormData) {
  const timesheetId = String(formData.get("timesheetId") ?? "");
  const expectedVersion = Number(formData.get("version"));
  const workspace = await getWorkspaceContext();
  const role = workspace.membership?.role;
  if (!workspace.organization || !role) fail("Organization setup is required.");
  if (!(["OWNER", "ADMIN", "SUPERVISOR"] as const).includes(role)) {
    fail("You do not have permission to approve timesheets.");
  }
  if (!timesheetId || !Number.isInteger(expectedVersion)) fail("Invalid timesheet request.");

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("timesheets")
    .select("id, version, status")
    .eq("organization_id", workspace.organization.id)
    .eq("id", timesheetId)
    .maybeSingle();
  if (readError) fail(readError.message);
  if (!current) fail("Timesheet not found.");
  if (current.version !== expectedVersion) fail("This timesheet changed. Refresh and try again.");
  if (current.status !== "SUBMITTED" && current.status !== "DISPUTED") {
    fail("This timesheet is no longer awaiting approval.");
  }

  const { error } = await supabase.rpc("approve_timesheet", {
    target_timesheet_id: current.id,
    expected_version: current.version,
  });
  if (error) fail(error.message);

  let success = "Timesheet approved and worker notified on Telegram.";
  try {
    const notification = await dispatchPendingTelegramNotifications({ organizationId: workspace.organization.id, limit: 10 });
    if (notification.failed) success = "Timesheet approved. Telegram delivery is queued for retry.";
  } catch {
    success = "Timesheet approved. Telegram notification is queued until messaging is configured.";
  }

  revalidatePath("/timesheets");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  redirect(`/timesheets?success=${encodeURIComponent(success)}`);
}

export async function rejectTimesheet(formData: FormData) {
  const timesheetId = String(formData.get("timesheetId") ?? "");
  const expectedVersion = Number(formData.get("version"));
  const workspace = await getWorkspaceContext();
  const role = workspace.membership?.role;
  if (!workspace.organization || !role) fail("Organization setup is required.");
  if (!( ["OWNER", "ADMIN", "SUPERVISOR"] as const).includes(role)) fail("You do not have permission to reject timesheets.");
  if (!timesheetId || !Number.isInteger(expectedVersion)) fail("Invalid timesheet request.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_timesheet", {
    target_timesheet_id: timesheetId,
    expected_version: expectedVersion,
  });
  if (error) fail(error.message);

  let success = "Timesheet rejected and worker notified on Telegram.";
  try {
    const notification = await dispatchPendingTelegramNotifications({ organizationId: workspace.organization.id, limit: 10 });
    if (notification.failed) success = "Timesheet rejected. Telegram delivery is queued for retry.";
  } catch {
    success = "Timesheet rejected. Telegram notification is queued until messaging is configured.";
  }
  revalidatePath("/timesheets");
  revalidatePath("/dashboard");
  redirect(`/timesheets?success=${encodeURIComponent(success)}`);
}
