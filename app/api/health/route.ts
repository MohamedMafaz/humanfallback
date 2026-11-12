import { ok } from "@/lib/http";
import { db } from "@/lib/store";

export async function GET() {
  const data = db();
  return ok({
    status: "ok",
    service: "humanfallback",
    version: 1,
    tasks: data.tasks.length,
    users: data.users.length,
    ai: Boolean(process.env.OLLAMA_API_KEY),
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    time: new Date().toISOString(),
  });
}
