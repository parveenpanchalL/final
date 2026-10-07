import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { q1 } from "@/lib/db";
import { todayStr } from "@/lib/utils/date";
import { q } from "@/lib/db";
import { StatCard } from "@/components/ui/stat-card";
import { getMonthAttendance, getLeaveBalances, fmtHours } from "@/lib/queries/employee";


export default async function EmployeeDashboard() {
  const s = (await getSession())!;
  const TODAY = todayStr();
  const emp = (await q1<{ employee_id: string; name: string; department: string; designation: string }>(
    `SELECT employee_id, name, department, designation FROM employees WHERE id = ?`, [s.dbId]))!;
  const { counts, pct, presentDays } = await getMonthAttendance(s.dbId, TODAY.slice(0, 7));
  const balances = await getLeaveBalances(s.dbId);
  const total = balances.reduce((a, b) => a + b.remaining, 0);
  const today = await q1<{ in_time: string | null; out_time: string | null; working_hours: number | null; status: string }>(
    `SELECT in_time, out_time, working_hours, status FROM attendance WHERE employee_db_id = ? AND date = ?`, [s.dbId, TODAY]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{emp.name}</h1>
        <p className="text-xs text-gray-500">{emp.employee_id} · {emp.department} · {emp.designation}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Attendance (this month)" value={`${pct}%`} />
        <StatCard label="Present Days" value={presentDays} />
        <StatCard label="Absent Days" value={counts.absent} />
        <StatCard label="Leave Balance" value={`${total} days`} sub={balances.map((b) => `${b.code}: ${b.remaining}`).join(" · ")} />
      </div>

      <div className="border border-gray-200 rounded-md bg-white p-4">
        <p className="text-xs text-gray-500 mb-1">Today ({TODAY})</p>
        {today ? (
          <p className="text-sm text-gray-900">
            {today.status.replace("_", " ")} · In {today.in_time || "—"} | Out {today.out_time || "—"} · {fmtHours(today.working_hours)}
          </p>
        ) : (
          <p className="text-sm text-gray-500">No attendance record for today yet.</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[["/attendance", "Attendance"], ["/leave", "Apply Leave"], ["/attendance#calendar", "Calendar"], ["/payslips", "Payslip"], ["/profile", "Profile"]].map(([h, l]) => (
          <Link key={h} href={h} className="border border-gray-200 rounded-md p-3 text-sm text-gray-700 bg-white hover:border-gray-400 text-center">{l}</Link>
        ))}
      </div>
    </div>
  );
}
