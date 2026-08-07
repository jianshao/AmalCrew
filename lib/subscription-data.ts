import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-data";

export type SubscriptionSettingsData = {
  subscription: {
    plan: string;
    status: string;
    activeWorkerLimit: number | null;
    activeProjectLimit: number | null;
    managerLimit: number | null;
    endsAt: string | null;
  } | null;
  activeWorkerCount: number;
  activeProjectCount: number;
};

export async function getSubscriptionSettingsData(): Promise<SubscriptionSettingsData> {
  const workspace = await getWorkspaceContext();
  if (!workspace.organization) {
    return {
      subscription: null,
      activeWorkerCount: 0,
      activeProjectCount: 0,
    };
  }

  const supabase = await createClient();
  const organizationId = workspace.organization.id;
  const [subscriptionResult, workersResult, projectsResult] = await Promise.all([
    supabase
      .from("organization_subscriptions")
      .select("plan, status, active_worker_limit, active_project_limit, manager_limit, ends_at")
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("workers")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "ACTIVE"),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "ACTIVE"),
  ]);

  if (subscriptionResult.error) throw new Error(`Unable to load subscription: ${subscriptionResult.error.message}`);
  if (workersResult.error) throw new Error(`Unable to load active workers: ${workersResult.error.message}`);
  if (projectsResult.error) throw new Error(`Unable to load active projects: ${projectsResult.error.message}`);

  const subscription = subscriptionResult.data;
  return {
    subscription: subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          activeWorkerLimit: subscription.active_worker_limit,
          activeProjectLimit: subscription.active_project_limit,
          managerLimit: subscription.manager_limit,
          endsAt: subscription.ends_at,
        }
      : null,
    activeWorkerCount: workersResult.count ?? 0,
    activeProjectCount: projectsResult.count ?? 0,
  };
}
