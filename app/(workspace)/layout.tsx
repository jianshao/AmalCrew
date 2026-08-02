import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { getNavigationData } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, navigationData] = await Promise.all([
    getCurrentUser(),
    getNavigationData(),
  ]);
  if (!user) redirect("/login");

  const organization = navigationData.workspace.organization;

  return (
    <AppShell
      user={user}
      workspace={
        organization
          ? {
              name: organization.name,
              countryCode: organization.country_code,
              timezone: organization.timezone,
              pendingApprovals: navigationData.pendingApprovals,
              channels: navigationData.channels,
            }
          : null
      }
    >
      {children}
    </AppShell>
  );
}
