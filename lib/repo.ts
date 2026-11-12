import type { Activity, Notification, Task, TaskEvent, Transaction, User } from "@/types";
import { db, mutate } from "./store";
import { id } from "./crypto";

export function findUser(userId: string | null | undefined): User | null {
  if (!userId) return null;
  return db().users.find((u) => u.id === userId) ?? null;
}

export function findUserByEmail(email: string): User | null {
  const needle = email.trim().toLowerCase();
  return db().users.find((u) => u.email.toLowerCase() === needle) ?? null;
}

export function findTask(taskId: string): Task | null {
  return db().tasks.find((t) => t.id === taskId) ?? null;
}

export function findTaskByCode(code: string): Task | null {
  return db().tasks.find((t) => t.code.toUpperCase() === code.toUpperCase()) ?? null;
}

export function providerFor(task: Task): User | null {
  return findUser(task.providerId);
}

export function pushEvent(
  task: Task,
  type: TaskEvent["type"],
  actor: TaskEvent["actor"],
  message: string,
): TaskEvent {
  const event: TaskEvent = {
    id: id("ev_"),
    at: new Date().toISOString(),
    type,
    actor,
    message,
  };
  task.timeline.push(event);
  task.updatedAt = event.at;
  return event;
}

export function notify(userId: string, title: string, body: string, taskId?: string): void {
  const note: Notification = {
    id: id("n_"),
    userId,
    title,
    body,
    taskId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  mutate((data) => {
    data.notifications.unshift(note);
  });
}

export function logActivity(actor: string, action: string, detail: string): void {
  const entry: Activity = {
    id: id("a_"),
    at: new Date().toISOString(),
    actor,
    action,
    detail,
  };
  mutate((data) => {
    data.activity.unshift(entry);
    data.activity = data.activity.slice(0, 200);
  });
}

export function recordTransaction(task: Task): Transaction {
  const tx: Transaction = {
    id: id("tx_"),
    taskId: task.id,
    taskCode: task.code,
    buyerId: task.buyerId,
    providerId: task.providerId,
    orderId: task.payment.orderId,
    captureId: task.payment.captureId,
    amount: task.payment.amount,
    fee: task.payment.fee,
    total: task.payment.total,
    currency: task.payment.currency,
    status: task.payment.status,
    mode: task.payment.mode,
    createdAt: task.payment.capturedAt ?? new Date().toISOString(),
  };
  mutate((data) => {
    data.transactions.unshift(tx);
  });
  return tx;
}

export function platformStats() {
  const data = db();
  const tasks = data.tasks;
  const captured = tasks.filter((t) => t.payment.status === "captured");
  const completed = tasks.filter((t) => t.status === "completed");
  const active = tasks.filter((t) =>
    ["open", "assigned", "in_progress", "submitted", "ai_review", "awaiting_confirmation"].includes(
      t.status,
    ),
  );
  const revenue = captured.reduce((sum, t) => sum + t.payment.total, 0);
  const fees = captured.reduce((sum, t) => sum + t.payment.fee, 0);
  return {
    providers: data.users.filter((u) => u.role === "provider").length,
    customers: data.users.filter((u) => u.role === "customer").length,
    totalTasks: tasks.length,
    activeTasks: active.length,
    completedTasks: completed.length,
    disputed: tasks.filter((t) => t.status === "disputed").length,
    capturedPayments: captured.length,
    failedPayments: tasks.filter((t) => t.payment.status === "failed").length,
    grossVolume: Math.round(revenue * 100) / 100,
    platformFees: Math.round(fees * 100) / 100,
    avgTicket: captured.length ? Math.round((revenue / captured.length) * 100) / 100 : 0,
    verificationRate: (() => {
      const withV = tasks.filter((t) => t.verification);
      if (!withV.length) return 0;
      const ok = withV.filter((t) => t.verification!.verdict === "verified").length;
      return Math.round((ok / withV.length) * 100);
    })(),
  };
}

export function tasksForUser(user: User): Task[] {
  const data = db();
  if (user.role === "provider") {
    return data.tasks.filter((t) => t.providerId === user.id);
  }
  if (user.role === "admin") return data.tasks;
  return data.tasks.filter((t) => t.buyerId === user.id);
}
