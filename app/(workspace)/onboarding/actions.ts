"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const countries = new Set(["AE", "SA", "QA"]);
const timezones = new Set(["Asia/Dubai", "Asia/Riyadh", "Asia/Qatar"]);

export async function createOrganization(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const countryCode = String(formData.get("countryCode") ?? "AE");
  const timezone = String(formData.get("timezone") ?? "Asia/Dubai");

  if (name.length < 2 || name.length > 160) redirect(`/onboarding?error=${encodeURIComponent("Enter a valid organization name.")}`);
  if (!countries.has(countryCode)) redirect(`/onboarding?error=${encodeURIComponent("Select a supported country.")}`);
  if (!timezones.has(timezone)) redirect(`/onboarding?error=${encodeURIComponent("Select a supported time zone.")}`);

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) redirect("/login");

  const { data: existingMembership, error: membershipError } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", claimsData.claims.sub)
    .limit(1)
    .maybeSingle();

  if (membershipError) redirect(`/onboarding?error=${encodeURIComponent(membershipError.message)}`);
  if (existingMembership) redirect("/dashboard");

  const { error } = await supabase.rpc("create_organization", {
    organization_name: name,
    organization_country_code: countryCode,
    organization_timezone: timezone,
  });

  if (error) redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
