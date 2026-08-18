import type { Message, Attachment } from "../types";
import { getErrorMessage } from "../lib/validation";

const BASE_URL = "https://openrouter.ai/api/v1";

interface TextPart { type: "text"; text: string; }
interface ImagePart { type: "image_url"; image_url: { url: string; }; }
type ContentPart = TextPart | ImagePart;

export interface ChatRequest {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string | ContentPart[] }>;
  signal?: AbortSignal;
}

export interface TestConnectionRequest {
  apiKey: string;
  model: string;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": window.location.origin,
    "X-Title": "DEVChat",
  };
}

export async function testConnection(
  req: TestConnectionRequest
): Promise<TestConnectionResult> {
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(req.apiKey),
      body: JSON.stringify({
        model: req.model,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 5,
      }),
    });

    if (res.ok) {
      return { success: true, message: "Connection successful" };
    }

    const data = await res.json().catch(() => null);
    const detail = data?.error?.message ?? getErrorMessage(res.status);
    return { success: false, message: `Connection failed: ${detail}` };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Unknown network error";
    return { success: false, message: `Network error: ${msg}` };
  }
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export async function* streamChat(
  req: ChatRequest
): AsyncGenerator<string | { type: "usage"; usage: Usage }, void, unknown> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(req.apiKey),
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      stream: true,
      stream_options: { include_usage: true },
    }),
    signal: req.signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = data?.error?.message ?? getErrorMessage(res.status);
    throw new Error(detail);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (typeof delta === "string") yield delta;
        if (parsed.usage) {
          yield { type: "usage", usage: parsed.usage as Usage };
        }
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export async function sendChat(req: ChatRequest): Promise<{ content: string; usage?: Usage }> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(req.apiKey),
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      stream: false,
    }),
    signal: req.signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = data?.error?.message ?? getErrorMessage(res.status);
    throw new Error(detail);
  }

  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    usage: data.usage,
  };
}

function buildContent(content: string, attachments?: Attachment[]): string | ContentPart[] {
  if (!attachments || attachments.length === 0) return content;

  const parts: ContentPart[] = [];
  if (content) {
    parts.push({ type: "text", text: content });
  }

  for (const att of attachments) {
    if (att.type.startsWith("image/")) {
      parts.push({
        type: "image_url",
        image_url: { url: att.dataUrl },
      });
    } else {
      // Text files: include as text content
      const base64 = att.dataUrl.includes(",")
        ? att.dataUrl.split(",")[1] || ""
        : "";
      try {
        const decoded = atob(base64);
        parts.push({ type: "text", text: `\n\n--- File: ${att.name} ---\n${decoded}\n--- End: ${att.name} ---` });
      } catch {
        parts.push({ type: "text", text: `\n\n--- File: ${att.name} (${att.type}) ---\n[Could not decode file]\n--- End: ${att.name} ---` });
      }
    }
  }

  return parts.length === 1 && parts[0].type === "text"
    ? (parts[0] as TextPart).text
    : parts;
}

export function formatMessagesForApi(messages: Message[], systemPrompt?: string): Array<{ role: string; content: string | ContentPart[] }> {
  const result: Array<{ role: string; content: string | ContentPart[] }> = [];
  if (systemPrompt) {
    result.push({ role: "system", content: systemPrompt });
  }
  for (const m of messages) {
    result.push({
      role: m.role === "assistant" ? "assistant" : m.role === "user" ? "user" : "system",
      content: buildContent(m.content, m.attachments),
    });
  }
  return result;
}
