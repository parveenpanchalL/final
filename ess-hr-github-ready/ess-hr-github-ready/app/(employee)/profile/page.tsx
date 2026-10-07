import { getSession } from "@/lib/auth/session";
import { q1 } from "@/lib/db";
import { q } from "@/lib/db";

export default async function ProfilePage() {
  const s = (await getSession())!;
  const e = (await q1<Record<string, string | null>>(
    `SELECT e.employee_id, e.name, e.department, e.designation, e.joining_date, e.email, e.phone, e.location, e.status, m.name AS manager
     FROM employees e LEFT JOIN employees m ON m.id = e.manager_id WHERE e.id = ?`, [s.dbId]))!;
  const fields: [string, string | null][] = [
    ["Employee ID", e.employee_id], ["Name", e.name], ["Department", e.department], ["Designation", e.designation],
    ["Joining Date", e.joining_date], ["Email", e.email], ["Phone", e.phone], ["Reporting Manager", e.manager],
    ["Location", e.location], ["Employment Status", e.status],
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
      <dl className="border border-gray-200 rounded-md bg-white divide-y divide-gray-100">
        {fields.map(([k, v]) => (
          <div key={k} className="px-4 py-2.5 flex justify-between text-sm">
            <dt className="text-gray-500">{k}</dt><dd className="text-gray-900">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
