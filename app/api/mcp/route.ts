import type { NextRequest } from "next/server";
import type { Category } from "@/types";
import { fail, ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { db, publicUser } from "@/lib/store";
import { findTask } from "@/lib/repo";
import { shortlist, understandTask } from "@/lib/ai/agents";
import { runVerification } from "@/lib/evidence";

export const runtime = "nodejs";
export const maxDuration = 90;

/**
 * MCP endpoint (JSON-RPC 2.0 over HTTP).
 *
 * Lets any external agent — Claude Desktop, an autonomous procurement agent,
 * a Postman flow — discover humans and delegate physical work without going
 * through the web UI.
 */
const TOOLS = [
  {
    name: "search_humans",
    description:
      "Search available human providers by location, category and price. Returns factual provider profiles.",
    inputSchema: {
      type: "object",
      properties: {
        location: { type: "string" },
        category: {
          type: "string",
          enum: [
            "physical_inspection",
            "photography",
            "document_collection",
            "local_errand",
            "product_verification",
            "inventory_audit",
            "on_site_support",
            "general_assistance",
          ],
        },
        max_price: { type: "number" },
      },
    },
  },
  {
    name: "preview_task",
    description:
      "Convert a natural-language request into a structured task and return ranked human providers with reasons. Nothing is charged.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string" },
        location: { type: "string" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "get_task",
    description: "Fetch the current state, payment status and evidence verdict for a task.",
    inputSchema: {
      type: "object",
      properties: { task_id: { type: "string" } },
      required: ["task_id"],
    },
  },
  {
    name: "analyze_evidence",
    description:
      "Run the evidence verification agent over a task's submitted photos and return a structured verdict.",
    inputSchema: {
      type: "object",
      properties: { task_id: { type: "string" } },
      required: ["task_id"],
    },
  },
];

function textResult(payload: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

async function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "search_humans": {
      const category = args.category as Category | undefined;
      const maxPrice = Number(args.max_price) || 0;
      const providers = db()
        .users.filter((u) => u.role === "provider" && u.isAvailable)
        .filter((p) => (category ? p.services.some((s) => s.category === category) : true))
        .filter((p) => (maxPrice ? p.services.some((s) => s.price <= maxPrice) : true))
        .sort((a, b) => b.rating - a.rating);
      return textResult({
        count: providers.length,
        humans: providers.map((p) => ({
          id: p.id,
          name: p.name,
          headline: p.headline,
          location: p.location,
          rating: p.rating,
          completed_tasks: p.completedTasks,
          verified: p.verified,
          services: p.services.map((s) => ({ title: s.title, category: s.category, price: s.price })),
        })),
      });
    }

    case "preview_task": {
      const prompt = String(args.prompt ?? "");
      if (prompt.length < 8) throw new Error("prompt is required");
      const user = await currentUser();
      const location = String(args.location ?? user?.location ?? "San Francisco, CA");
      const draft = await understandTask(prompt, { location });
      const matches = await shortlist(
        {
          title: draft.title,
          category: draft.category,
          location: draft.location,
          budget: draft.budget,
          lat: user?.lat ?? 37.7749,
          lng: user?.lng ?? -122.4194,
          requiredEvidence: draft.requiredEvidence,
        },
        db().users.filter((u) => u.role === "provider"),
      );
      return textResult({ draft, matches });
    }

    case "get_task": {
      const task = findTask(String(args.task_id ?? ""));
      if (!task) throw new Error("Task not found");
      return textResult({
        id: task.id,
        code: task.code,
        title: task.title,
        status: task.status,
        payment: task.payment,
        verification: task.verification,
        evidence_count: task.evidence.length,
      });
    }

    case "analyze_evidence": {
      const task = findTask(String(args.task_id ?? ""));
      if (!task) throw new Error("Task not found");
      if (!task.evidence.length) throw new Error("No evidence submitted yet");
      const verification = await runVerification(task, null);
      return textResult(verification);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function GET() {
  return ok({
    protocol: "mcp",
    transport: "http-jsonrpc",
    endpoint: "/api/mcp",
    tools: TOOLS.map((t) => t.name),
  });
}

export async function POST(req: NextRequest) {
  let rpc: { id?: string | number; method?: string; params?: Record<string, unknown> };
  try {
    rpc = await req.json();
  } catch {
    return fail("Invalid JSON-RPC body");
  }

  const id = rpc.id ?? null;
  const respond = (result: unknown) => ok({ jsonrpc: "2.0", id, result });
  const respondError = (message: string, code = -32603) =>
    ok({ jsonrpc: "2.0", id, error: { code, message } });

  try {
    switch (rpc.method) {
      case "initialize":
        return respond({
          protocolVersion: "2024-11-05",
          serverInfo: { name: "humanfallback", version: "2.1.0" },
          capabilities: { tools: {} },
        });
      case "notifications/initialized":
        return ok({ jsonrpc: "2.0", id, result: {} });
      case "tools/list":
        return respond({ tools: TOOLS });
      case "tools/call": {
        const params = rpc.params ?? {};
        const name = String(params.name ?? "");
        const args = (params.arguments ?? {}) as Record<string, unknown>;
        return respond(await callTool(name, args));
      }
      case "ping":
        return respond({});
      default:
        return respondError(`Unknown method: ${rpc.method}`, -32601);
    }
  } catch (error) {
    return respondError(error instanceof Error ? error.message : "Tool call failed");
  }
}
