import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "ADMIN" | "SUPERVISOR";
  demo: boolean;
};

export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  if (!isSupabaseConfigured) {
    return {
      id: "demo-owner",
      email: "omar@alnoor.ae",
      name: "Omar Hassan",
      role: "OWNER",
      demo: true,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) return null;

  const metadata = claims.user_metadata as
    | { full_name?: string; role?: AppUser["role"] }
    | undefined;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    name: metadata?.full_name || "AmalCrew user",
    role: metadata?.role || "OWNER",
    demo: false,
  };
});
