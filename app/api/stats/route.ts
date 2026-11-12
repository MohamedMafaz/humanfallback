import { ok } from "@/lib/http";
import { platformStats } from "@/lib/repo";
import { db } from "@/lib/store";
import { paypalConfigured, paypalMode } from "@/lib/payments";

export async function GET() {
  const data = db();
  const stats = platformStats();

  const byCategory = Object.entries(
    data.tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return ok({
    stats,
    byCategory,
    transactions: data.transactions.slice(0, 20),
    activity: data.activity.slice(0, 12),
    paypal: { mode: paypalMode(), configured: paypalConfigured() },
    ai: {
      configured: Boolean(process.env.OLLAMA_API_KEY),
      textModel: process.env.OLLAMA_TEXT_MODEL ?? "minimax-m3.1-flash",
      visionModel: process.env.OLLAMA_VISION_MODEL ?? "gemma4:31b",
    },
  });
}
