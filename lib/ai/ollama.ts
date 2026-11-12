/**
 * Ollama Cloud client.
 *
 * Uses the OpenAI-compatible endpoint so the same code works against a local
 * Ollama daemon. Text tasks default to a light "flash" model to keep token
 * usage low; evidence verification uses a multimodal model.
 */

const BASE = process.env.OLLAMA_BASE_URL ?? "https://ollama.com";
const KEY = process.env.OLLAMA_API_KEY ?? "";

export const TEXT_MODEL = process.env.OLLAMA_TEXT_MODEL ?? "minimax-m3.1-flash";
export const VISION_MODEL = process.env.OLLAMA_VISION_MODEL ?? "gemma4:31b";

export function aiConfigured(): boolean {
  return KEY.length > 0;
}

export type ChatMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "user";
      content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
    };

interface ChatResult {
  content: string;
  model: string;
  ms: number;
  promptTokens?: number;
  completionTokens?: number;
}

export async function chat(
  messages: ChatMessage[],
  opts: { model?: string; maxTokens?: number; temperature?: number; timeoutMs?: number } = {},
): Promise<ChatResult> {
  if (!aiConfigured()) throw new Error("OLLAMA_API_KEY is not configured");
  const model = opts.model ?? TEXT_MODEL;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);
  try {
    const res = await fetch(`${BASE.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        max_tokens: opts.maxTokens ?? 800,
        temperature: opts.temperature ?? 0.2,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Ollama ${res.status}: ${detail.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      model?: string;
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    return {
      content: json.choices?.[0]?.message?.content ?? "",
      model: json.model ?? model,
      ms: Date.now() - started,
      promptTokens: json.usage?.prompt_tokens,
      completionTokens: json.usage?.completion_tokens,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Pulls the first JSON object/array out of a model response. */
export function extractJson(raw: string): unknown | null {
  if (!raw) return null;
  let text = raw.trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  // Strip leaked reasoning blocks some thinking models emit.
  const fence = text.lastIndexOf("</think>");
  if (fence !== -1) text = text.slice(fence + 8).trim();
  const start = text.search(/[[{]/);
  if (start === -1) return null;
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        const slice = text.slice(start, i + 1);
        try {
          return JSON.parse(slice);
        } catch {
          try {
            return JSON.parse(
              slice.replace(/,\s*([}\]])/g, "$1").replace(/[“”]/g, '"'),
            );
          } catch {
            return null;
          }
        }
      }
    }
  }
  return null;
}

export interface JsonCallResult<T> {
  data: T | null;
  raw: string;
  model: string;
  ms: number;
  error?: string;
}

export async function jsonCall<T>(
  args: {
    system: string;
    user: string;
    images?: string[];
    model?: string;
    maxTokens?: number;
    timeoutMs?: number;
  },
): Promise<JsonCallResult<T>> {
  const model = args.model ?? TEXT_MODEL;
  if (!aiConfigured()) {
    return { data: null, raw: "", model, ms: 0, error: "OLLAMA_API_KEY is not configured" };
  }
  const content: ChatMessage["content"] = args.images?.length
    ? [
        { type: "text" as const, text: args.user },
        ...args.images.map((url) => ({ type: "image_url" as const, image_url: { url } })),
      ]
    : args.user;

  const messages: ChatMessage[] = [
    { role: "system", content: args.system },
    { role: "user", content: content as never },
  ];

  let last: ChatResult | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      last = await chat(messages, {
        model,
        maxTokens: args.maxTokens ?? 700,
        timeoutMs: args.timeoutMs ?? 55_000,
      });
      const parsed = extractJson(last.content);
      if (parsed && typeof parsed === "object") {
        return { data: parsed as T, raw: last.content, model: last.model, ms: last.ms };
      }
      messages.push({ role: "assistant", content: last.content.slice(0, 1200) });
      messages.push({
        role: "user",
        content: "Your reply was not valid JSON. Reply again with ONLY the JSON object, no prose.",
      });
    } catch (error) {
      return {
        data: null,
        raw: last?.content ?? "",
        model,
        ms: last?.ms ?? 0,
        error: error instanceof Error ? error.message : "AI call failed",
      };
    }
  }
  return {
    data: null,
    raw: last?.content ?? "",
    model,
    ms: last?.ms ?? 0,
    error: "Model did not return valid JSON",
  };
}
