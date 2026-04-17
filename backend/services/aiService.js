/**
 * AI service — pluggable provider (Grok or Gemini).
 * Switch providers by setting AI_PROVIDER in .env.
 *
 * Required env vars:
 *   AI_PROVIDER=grok | gemini   (default: grok)
 *   GROK_API_KEY=...            (when AI_PROVIDER=grok)
 *   GEMINI_API_KEY=...          (when AI_PROVIDER=gemini)
 *
 * Exposes:
 *   chat(messages, { json, maxTokens, temperature })
 *     messages: [{ role: "system" | "user" | "assistant", content: string }]
 *     json: if true, instructs the model to return valid JSON
 */

const PROVIDER = (process.env.AI_PROVIDER || "grok").toLowerCase();

const GROK_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = process.env.GROK_MODEL || "grok-3-mini";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function chatGrok(messages, { json, maxTokens = 800, temperature = 0.2 }) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY not set in .env");

  const body = {
    model: GROK_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  };
  if (json) body.response_format = { type: "json_object" };

  const res = await fetch(GROK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Grok API ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function chatGemini(messages, { json, maxTokens = 800, temperature = 0.2 }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");

  // Gemini expects: contents + optional systemInstruction
  const systemMsgs = messages.filter((m) => m.role === "system");
  const conv = messages.filter((m) => m.role !== "system");

  const body = {
    contents: conv.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      // Disable "thinking" tokens — they eat into maxOutputTokens and we want all budget for the actual answer.
      thinkingConfig: { thinkingBudget: 0 },
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (systemMsgs.length) {
    body.systemInstruction = {
      parts: [{ text: systemMsgs.map((m) => m.content).join("\n\n") }],
    };
  }

  const url = `${GEMINI_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function chat(messages, opts = {}) {
  if (PROVIDER === "gemini") return chatGemini(messages, opts);
  return chatGrok(messages, opts);
}

module.exports = { chat, provider: PROVIDER };
