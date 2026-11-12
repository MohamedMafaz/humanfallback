import type { ProviderMatch, Task, User } from "@/types";
import { orderCode, id } from "./crypto";
import { quote } from "./money";
import { db, mutate } from "./store";
import { findUser, logActivity, notify, pushEvent } from "./repo";
import { providerPrice } from "./matching";
import type { TaskDraft } from "./ai/agents";

export function nextTaskCode(): string {
  const nums = db()
    .tasks.map((t) => Number(t.code.replace(/\D/g, "")))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 1040) + 1;
  return `HF-${next}`;
}

export interface CreateTaskInput {
  buyer: User;
  draft: TaskDraft;
  providerId: string;
  matches: ProviderMatch[];
}

export function createTask({ buyer, draft, providerId, matches }: CreateTaskInput): Task {
  const provider = findUser(providerId);
  if (!provider || provider.role !== "provider") throw new Error("Unknown provider");

  const price = providerPrice(provider, draft.category, draft.budget);
  const q = quote(price);
  const now = new Date().toISOString();
  const taskId = id("t_");

  const safeMatches: ProviderMatch[] = matches
    .filter((m) => Boolean(findUser(m.providerId)))
    .slice(0, 5)
    .map((m) => ({
      providerId: m.providerId,
      score: Math.max(0, Math.min(100, Number(m.score) || 0)),
      distanceKm: Number(m.distanceKm) || 0,
      etaMins: Number(m.etaMins) || 0,
      price: Number(m.price) || 0,
      reasons: Array.isArray(m.reasons) ? m.reasons.slice(0, 5) : [],
      rationale: String(m.rationale ?? "").slice(0, 400),
      source: m.source === "agent" ? "agent" : "heuristic",
    }));

  const task: Task = {
    id: taskId,
    code: nextTaskCode(),
    title: draft.title,
    description: draft.description,
    category: draft.category,
    status: "awaiting_payment",
    buyerId: buyer.id,
    providerId,
    location: draft.location,
    lat: buyer.lat,
    lng: buyer.lng,
    budget: draft.budget,
    price: q.price,
    fee: q.fee,
    total: q.total,
    currency: "USD",
    priority: draft.priority,
    instructions: draft.instructions,
    completionCriteria: draft.completionCriteria,
    requiredEvidence: draft.requiredEvidence,
    agent: {
      input: draft.summary,
      summary: draft.summary,
      confidence: draft.confidence,
      model: draft.model,
      steps: [
        { label: "Understood request", detail: draft.summary, at: now },
        { label: "Extracted requirements", detail: `${draft.completionCriteria.length} completion criteria`, at: now },
        { label: "Shortlisted providers", detail: `${safeMatches.length} candidates ranked`, at: now },
      ],
      missing: draft.missing,
    },
    matches: safeMatches,
    payment: {
      mode: "simulated",
      status: "pending",
      orderId: null,
      captureId: null,
      amount: q.price,
      fee: q.fee,
      total: q.total,
      currency: "USD",
      createdAt: null,
      capturedAt: null,
    },
    verification: null,
    evidence: [],
    timeline: [
      {
        id: id("ev_"),
        at: now,
        type: "created",
        actor: "agent",
        message: `Task drafted from a natural-language request and assigned to ${provider.name}.`,
      },
    ],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };

  mutate((data) => {
    data.tasks.unshift(task);
  });
  logActivity("Task Understanding Agent", "Drafted task", `${task.code} · ${task.title}`);
  return task;
}

export type LifecycleAction = "accept" | "start" | "confirm" | "dispute" | "cancel";

export function applyAction(
  task: Task,
  action: LifecycleAction,
  user: User,
): { ok: true } | { ok: false; error: string } {
  const isBuyer = user.id === task.buyerId;
  const isProvider = user.id === task.providerId;
  const isAdmin = user.role === "admin";

  switch (action) {
    case "accept":
      if (!isProvider) return { ok: false, error: "Only the assigned provider can accept this task." };
      if (task.status !== "open") return { ok: false, error: "This task is not open for acceptance." };
      task.status = "assigned";
      pushEvent(task, "accepted", "provider", `${user.name} accepted the task.`);
      notify(task.buyerId, "Provider accepted your task", `${task.code} · ${task.title}`, task.id);
      logActivity(user.name, "Accepted task", task.code);
      break;

    case "start":
      if (!isProvider) return { ok: false, error: "Only the assigned provider can start this task." };
      if (task.status !== "assigned") return { ok: false, error: "Accept the task before starting it." };
      task.status = "in_progress";
      pushEvent(task, "started", "provider", `${user.name} started work on site.`);
      notify(task.buyerId, "Work started", `${user.name} has started ${task.code}.`, task.id);
      logActivity(user.name, "Started task", task.code);
      break;

    case "confirm":
      if (!(isBuyer || isAdmin)) return { ok: false, error: "Only the customer can confirm completion." };
      if (!["submitted", "ai_review", "awaiting_confirmation"].includes(task.status)) {
        return { ok: false, error: "There is no submitted evidence to confirm yet." };
      }
      task.status = "completed";
      task.completedAt = new Date().toISOString();
      pushEvent(task, "confirmed", "customer", `${user.name} confirmed completion.`);
      if (task.providerId) {
        const provider = findUser(task.providerId);
        if (provider) {
          provider.completedTasks += 1;
          provider.earned = Math.round((provider.earned + task.price) * 100) / 100;
          notify(provider.id, "Task completed", `${task.code} confirmed. $${task.price.toFixed(2)} marked payable.`, task.id);
        }
      }
      logActivity(user.name, "Confirmed completion", task.code);
      break;

    case "dispute":
      if (!(isBuyer || isProvider || isAdmin)) return { ok: false, error: "Not permitted." };
      if (task.status === "completed" || task.status === "cancelled") {
        return { ok: false, error: "This task can no longer be disputed." };
      }
      task.status = "disputed";
      pushEvent(task, "disputed", user.role === "provider" ? "provider" : "customer", `${user.name} raised a dispute.`);
      notify(task.buyerId, "Dispute opened", `${task.code} needs manual review.`, task.id);
      logActivity(user.name, "Opened dispute", task.code);
      break;

    case "cancel":
      if (!(isBuyer || isAdmin)) return { ok: false, error: "Only the customer can cancel this task." };
      if (task.status === "completed") return { ok: false, error: "Completed tasks cannot be cancelled." };
      task.status = "cancelled";
      if (task.payment.status === "captured") task.payment.status = "refunded";
      pushEvent(task, "cancelled", "customer", `${user.name} cancelled the task.`);
      logActivity(user.name, "Cancelled task", task.code);
      break;
  }

  task.updatedAt = new Date().toISOString();
  return { ok: true };
}

export function publicTaskView(task: Task) {
  const buyer = findUser(task.buyerId);
  const provider = findUser(task.providerId);
  return {
    ...task,
    buyer: buyer
      ? { id: buyer.id, name: buyer.name, tone: buyer.tone, location: buyer.location }
      : null,
    provider: provider
      ? {
          id: provider.id,
          name: provider.name,
          tone: provider.tone,
          headline: provider.headline,
          rating: provider.rating,
          completedTasks: provider.completedTasks,
          verified: provider.verified,
        }
      : null,
  };
}

export { orderCode };
