import { formatWorkDate, getTimesheetsData } from "@/lib/workspace-data";

function csv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { workspace, timesheets } = await getTimesheetsData();
  if (!workspace.organization) return new Response("Unauthorized", { status: 401 });
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status");
  const project = searchParams.get("project");
  const days = searchParams.get("days") ?? "30";
  const cutoffDate = new Date();
  if (days !== "all") cutoffDate.setUTCDate(cutoffDate.getUTCDate() - Number(days) + 1);
  const cutoff = cutoffDate.toISOString().slice(0, 10);
  const rows = timesheets.filter((entry) => {
    const statusMatch = !status || status === "all" ||
      (status === "pending" && entry.status === "SUBMITTED") ||
      (status === "approved" && ["APPROVED", "WORKER_CONFIRMATION_REQUIRED"].includes(entry.status)) ||
      (status === "confirmed" && ["CONFIRMED", "LOCKED"].includes(entry.status)) ||
      (status === "disputed" && entry.status === "DISPUTED");
    return (!query || `${entry.worker} ${entry.project}`.toLowerCase().includes(query)) && statusMatch && (!project || entry.project === project) && (days === "all" || entry.workDate >= cutoff);
  });
  const body = [
    ["Worker", "Project", "Work date", "Regular minutes", "Overtime minutes", "Status", "Submitted at"],
    ...rows.map((entry) => [entry.worker, entry.project, formatWorkDate(entry.workDate), entry.regularMinutes, entry.overtimeMinutes, entry.status, entry.submittedAt]),
  ].map((row) => row.map(csv).join(",")).join("\r\n");
  return new Response(`\uFEFF${body}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="amalcrew-timesheets-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
