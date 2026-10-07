import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { csvEscape, getMonthlySummary } from "@/lib/queries/reports";
import { currentMonth } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const me = await getSession();
  if (!me || me.role !== "HR") return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  const p = new URL(req.url).searchParams;
  const month = /^\d{4}-\d{2}$/.test(p.get("month") || "") ? p.get("month")! : currentMonth();
  const rows = await getMonthlySummary(month, p.get("department") || "");
  const body = ["Employee ID,Name,Department,Present,Absent,Leave,Weekly Off,Holiday,Attendance %",
    ...rows.map((r) => [r.employee_id, r.name, r.department, r.present, r.absent, r.leave, r.weeklyOff, r.holiday, r.pct].map(csvEscape).join(","))].join("\n");
  return new NextResponse("\uFEFF" + body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="monthly-summary-${month}.csv"` } });
}
