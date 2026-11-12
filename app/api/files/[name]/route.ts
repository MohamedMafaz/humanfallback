import fs from "node:fs";
import path from "node:path";
import { fail } from "@/lib/http";
import { UPLOAD_DIR } from "@/lib/store";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".pdf": "application/pdf",
};

/** Serves evidence uploads from the runtime data directory. */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const safe = path.basename(name);
  if (safe !== name) return fail("Invalid path", 400);

  const filePath = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(filePath)) return fail("File not found", 404);

  const bytes = fs.readFileSync(filePath);
  const type = TYPES[path.extname(safe).toLowerCase()] ?? "application/octet-stream";
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(bytes.length),
    },
  });
}
