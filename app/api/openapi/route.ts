import fs from "node:fs";
import path from "node:path";
import { fail } from "@/lib/http";

/**
 * Serves the OpenAPI 3.1 contract. The same file is consumed by the APIMatic
 * CLI to generate SDKs, documentation portals and agent context plugins.
 */
export async function GET() {
  try {
    const file = path.join(process.cwd(), "openapi", "humanfallback.yaml");
    const spec = fs.readFileSync(file, "utf8");
    return new Response(spec, {
      headers: {
        "Content-Type": "application/yaml; charset=utf-8",
        "Content-Disposition": 'inline; filename="humanfallback.yaml"',
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return fail("OpenAPI specification not found", 404);
  }
}
