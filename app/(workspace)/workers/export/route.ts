import { getWorkersData } from "@/lib/workspace-data";

function csv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { workspace, workers } = await getWorkersData();
  if (!workspace.organization) return new Response("Unauthorized", { status: 401 });

  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const project = searchParams.get("project");
  const trade = searchParams.get("trade");
  const channel = searchParams.get("channel");
  const rows = workers.filter((worker) =>
    (!query || `${worker.name} ${worker.trade} ${worker.phone}`.toLowerCase().includes(query)) &&
    (!project || worker.project === project) &&
    (!trade || worker.trade === trade) &&
    (!channel || worker.channel === channel),
  );

  const body = [
    ["Worker", "Phone", "Trade", "Language", "Status", "Project", "Channel"],
    ...rows.map((worker) => [
      worker.name,
      worker.phone,
      worker.trade,
      worker.language,
      worker.status,
      worker.project,
      worker.channel ?? "",
    ]),
  ].map((row) => row.map(csv).join(",")).join("\r\n");

  return new Response(`\uFEFF${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amalcrew-workers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
