import { getReportsData, isApprovedForReports } from "@/lib/workspace-data";

function csv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const month = new URL(request.url).searchParams.get("month") ?? undefined;
  const { workspace, projects, timesheets, selectedMonth } = await getReportsData(month);
  if (!workspace.organization) return new Response("Unauthorized", { status: 401 });
  const approved = timesheets.filter((entry) => isApprovedForReports(entry.status));
  const rows = projects.map((project) => {
    const entries = approved.filter((entry) => entry.projectId === project.id);
    const regular = entries.reduce((total, entry) => total + entry.regularMinutes, 0);
    const overtime = entries.reduce((total, entry) => total + entry.overtimeMinutes, 0);
    return [project.code, project.name, project.location, project.workers, regular, overtime, regular + overtime];
  }).filter((row) => Number(row[6]) > 0);
  const body = [
    ["Project code", "Project", "Location", "Assigned workers", "Regular minutes", "Overtime minutes", "Total minutes"],
    ...rows,
  ].map((row) => row.map(csv).join(",")).join("\r\n");
  return new Response(`\uFEFF${body}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="amalcrew-report-${selectedMonth}.csv"` } });
}
