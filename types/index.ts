/**
 * HumanFallback domain model: marketplace users and tasks, plus the
 * agent-delegation, evidence and PayPal entities that drive the workflow.
 */

export type Role = "customer" | "provider" | "admin";

export const CATEGORIES = [
  "physical_inspection",
  "photography",
  "document_collection",
  "local_errand",
  "product_verification",
  "inventory_audit",
  "on_site_support",
  "general_assistance",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  physical_inspection: "Physical inspection",
  photography: "Photography",
  document_collection: "Document collection",
  local_errand: "Local errand",
  product_verification: "Product verification",
  inventory_audit: "Inventory audit",
  on_site_support: "On-site support",
  general_assistance: "General assistance",
};

export interface Service {
  id: string;
  title: string;
  category: Category;
  price: number;
  durationMins: number;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  headline: string;
  bio: string;
  location: string;
  lat: number;
  lng: number;
  skills: string[];
  languages: string[];
  hourlyRate: number;
  rating: number;
  reviews: number;
  completedTasks: number;
  earned: number;
  isAvailable: boolean;
  verified: boolean;
  tone: Tone;
  services: Service[];
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;

export type Tone =
  | "sunset"
  | "citrus"
  | "mint"
  | "ocean"
  | "lilac"
  | "clay"
  | "sand"
  | "berry";

export type TaskStatus =
  | "draft"
  | "awaiting_payment"
  | "open"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "ai_review"
  | "awaiting_confirmation"
  | "completed"
  | "cancelled"
  | "disputed";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "Draft",
  awaiting_payment: "Awaiting payment",
  open: "Open",
  assigned: "Assigned",
  in_progress: "In progress",
  submitted: "Submitted",
  ai_review: "AI review",
  awaiting_confirmation: "Awaiting confirmation",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

export interface MatchReason {
  label: string;
  detail: string;
}

export interface ProviderMatch {
  providerId: string;
  score: number;
  distanceKm: number;
  etaMins: number;
  price: number;
  reasons: MatchReason[];
  /** Narrative written by the matching agent. Never invents provider facts. */
  rationale: string;
  source: "heuristic" | "agent";
}

export interface Verification {
  id: string;
  verdict: "verified" | "partially_verified" | "insufficient" | "failed";
  confidence: number;
  summary: string;
  missing: string[];
  extracted: Record<string, string> | null;
  model: string;
  advisory: true;
  createdAt: string;
}

export type EvidenceKind = "image" | "document" | "note";

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  note: string;
  uploadedById: string;
  uploadedAt: string;
}

export type PaymentStatus =
  | "pending"
  | "awaiting_approval"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export interface Payment {
  /** "paypal" when live Sandbox credentials are configured, "simulated" otherwise. */
  mode: "paypal" | "simulated";
  status: PaymentStatus;
  orderId: string | null;
  captureId: string | null;
  amount: number;
  fee: number;
  total: number;
  currency: string;
  payerEmail?: string;
  createdAt: string | null;
  capturedAt: string | null;
  error?: string;
}

export interface TaskEvent {
  id: string;
  at: string;
  type:
    | "created"
    | "matched"
    | "proposal"
    | "payment_created"
    | "payment_captured"
    | "payment_failed"
    | "accepted"
    | "started"
    | "evidence"
    | "ai_review"
    | "confirmed"
    | "disputed"
    | "cancelled";
  actor: "agent" | "customer" | "provider" | "system";
  message: string;
}

export interface AgentRun {
  input: string;
  summary: string;
  confidence: number;
  model: string;
  steps: { label: string; detail: string; at: string }[];
  missing: string[];
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  category: Category;
  status: TaskStatus;
  buyerId: string;
  providerId: string | null;
  location: string;
  lat: number;
  lng: number;
  budget: number;
  price: number;
  fee: number;
  total: number;
  currency: string;
  priority: "low" | "normal" | "high" | "urgent";
  instructions: string;
  completionCriteria: string[];
  requiredEvidence: string[];
  agent: AgentRun;
  matches: ProviderMatch[];
  payment: Payment;
  verification: Verification | null;
  evidence: Evidence[];
  timeline: TaskEvent[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Transaction {
  id: string;
  taskId: string;
  taskCode: string;
  buyerId: string;
  providerId: string | null;
  orderId: string | null;
  captureId: string | null;
  amount: number;
  fee: number;
  total: number;
  currency: string;
  status: PaymentStatus;
  mode: "paypal" | "simulated";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export interface DB {
  version: number;
  seededAt: string;
  users: User[];
  tasks: Task[];
  transactions: Transaction[];
  notifications: Notification[];
  activity: Activity[];
}
