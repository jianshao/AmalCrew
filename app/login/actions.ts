"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function authenticate(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Supabase is not configured yet. Use the preview link below or add .env.local values.",
    };
  }

  const intent = String(formData.get("intent") || "login");
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid work email address." };
  }

  const supabase = await createClient();

  if (intent === "forgot") {
    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
    const protocol = headerStore.get("x-forwarded-proto") || "http";
    const redirectTo = host
      ? `${protocol}://${host}/auth/callback?next=/auth/update-password`
      : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { error: error.message };
    return { success: "If an account exists for this email, a password reset link is on its way." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (intent === "signup") {
    if (fullName.length < 2) {
      return { error: "Enter your full name." };
    }

    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
    const protocol = headerStore.get("x-forwarded-proto") || "http";
    const emailRedirectTo = host
      ? `${protocol}://${host}/auth/callback?next=/dashboard`
      : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { full_name: fullName, role: "OWNER" },
      },
    });

    if (error) return { error: error.message };
    if (!data.session) {
      return {
        success: "Check your inbox to confirm your email, then sign in.",
      };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Email or password is incorrect." };
  }

  redirect("/dashboard");
}

export async function updatePassword(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmation) return { error: "Passwords do not match." };
  if (!isSupabaseConfigured) return { error: "Supabase is not configured." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
