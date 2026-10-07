"use server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import * as emp from "@/lib/services/employee";

export type FormState = { error?: string; success?: string } | null;
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function requestCorrectionAction(_p: FormState, fd: FormData): Promise<FormState> {
  const me = await getSession();
  if (!me) return { error: "Not signed in." };
  const r = await emp.requestCorrection(me.dbId, s(fd, "date"), s(fd, "inTime"), s(fd, "outTime"), s(fd, "reason"));
  revalidatePath("/attendance");
  return "error" in r ? { error: r.error } : { success: r.message };
}
export async function applyLeaveAction(_p: FormState, fd: FormData): Promise<FormState> {
  const me = await getSession();
  if (!me) return { error: "Not signed in." };
  const r = await emp.applyLeave(me.dbId, s(fd, "leaveTypeId"), s(fd, "fromDate"), s(fd, "toDate"), s(fd, "reason"), fd.get("halfDay") === "on");
  revalidatePath("/leave");
  return "error" in r ? { error: r.error } : { success: r.message };
}
export async function cancelLeaveAction(id: string) {
  const me = await getSession();
  if (!me) return;
  await emp.cancelLeave(me.dbId, id);
  revalidatePath("/leave");
}
export async function markNotificationsReadAction() {
  const me = await getSession();
  if (!me) return;
  await emp.markAllRead(me.dbId);
  revalidatePath("/notifications");
}
