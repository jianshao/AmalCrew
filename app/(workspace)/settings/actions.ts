"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-data";

const countries = new Set(["AE", "SA", "QA"]);
const timezones = new Set(["Asia/Dubai", "Asia/Riyadh", "Asia/Qatar"]);
const languages = new Set(["en", "ar", "ur", "hi"]);

export async function updateOrganization(formData: FormData) {
  const workspace = await getWorkspaceContext();
  const organization = workspace.organization;
  const role = workspace.membership?.role;

  if (!organization || (role !== "OWNER" && role !== "ADMIN")) {
    throw new Error("You do not have permission to update this organization.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const countryCode = String(formData.get("countryCode") ?? "");
  const timezone = String(formData.get("timezone") ?? "");
  const defaultLanguage = String(formData.get("defaultLanguage") ?? "");
  const weekStartsOn = Number(formData.get("weekStartsOn"));

  if (name.length < 2 || name.length > 160) throw new Error("Enter a valid organization name.");
  if (!countries.has(countryCode)) throw new Error("Select a supported country.");
  if (!timezones.has(timezone)) throw new Error("Select a supported time zone.");
  if (!languages.has(defaultLanguage)) throw new Error("Select a supported language.");
  if (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
    throw new Error("Select a valid start of week.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      country_code: countryCode,
      timezone,
      default_language: defaultLanguage,
      week_starts_on: weekStartsOn,
    })
    .eq("id", organization.id);

  if (error) throw new Error(`Unable to save organization settings: ${error.message}`);

  revalidatePath("/", "layout");
  redirect(`/settings?success=${encodeURIComponent("Organization settings saved.")}`);
}
