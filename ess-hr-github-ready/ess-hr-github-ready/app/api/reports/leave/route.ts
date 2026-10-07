import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { q } from "@/lib/db";
import { csvEscape } from "@/lib/queries/reports";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const me = await getSession();
  if (!me || me.role !== "HR") return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  const p = new URL(req.url).searchParams;
  const params: string[] = [p.get("from") || "1970-01-01", p.get("to") || "2100-01-01"];
  let text = `SELECT e.employee_id, e.name, e.department, lt.code, lr.from_date, lr.to_date, lr.days, lr.status, lr.reason
    FROM leave_requests lr JOIN employees e ON e.id = lr.employee_db_id JOIN leave_types lt ON lt.id = lr.leave_type_id
    WHERE lr.from_date >= ? AND lr.from_date <= ?`;
  if (p.get("employeeId")) { text += ` AND e.employee_id = ?`; params.push(p.get("employeeId")!.toUpperCase()); }
  if (p.get("department")) { text += ` AND e.department = ?`; params.push(p.get("department")!); }
  if (p.get("leaveType")) { text += ` AND lt.code = ?`; params.push(p.get("leaveType")!); }
  if (p.get("status")) { text += ` AND lr.status = ?`; params.push(p.get("status")!); }
  text += ` ORDER BY lr.from_date DESC LIMIT 100000`;
  const rows = await q<Record<string, unknown>>(text, params);
  const body = ["Employee ID,Name,Department,Leave Type,From,To,Days,Status,Reason",
    ...rows.map((r) => [r.employee_id, r.name, r.department, r.code, r.from_date, r.to_date, r.days, r.status, r.reason].map(csvEscape).join(","))].join("\n");
  return new NextResponse("\uFEFF" + body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="leave-report.csv"` } });
}
