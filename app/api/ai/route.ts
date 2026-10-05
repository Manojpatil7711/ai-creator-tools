import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ProviderResult = { text: string; provider: string };

function buildPrompt(workflow: string, request: string) {
  const instructions: Record<string, string> = {
    "Content Studio":
      "Act as an expert content strategist. Create ready-to-publish posts, captions, hooks or scripts as requested. Match the requested platform, audience and tone. Give polished copy, not an explanation.",
    "Business Campaign":
      "Act as a performance marketing strategist. Turn the idea into a complete practical campaign: positioning, headline/hooks, primary copy, CTA and useful platform variations when appropriate.",
    "Social Pack":
      "Create a platform-ready social content pack from the idea. Adapt the message for Instagram, Facebook, LinkedIn, X and short-video content. Keep each version native to the platform.",
    "Resume & Jobs":
      "Act as an expert resume and job-application writer. Produce ATS-friendly, truthful, professional material. Never invent qualifications, employers, dates, achievements or credentials.",
    Repurpose:
      "Act as a content repurposing editor. Transform the supplied content into multiple useful formats such as a short post, caption, hook, short-video script, LinkedIn version and key takeaways.",
  };

  return (
    (instructions[workflow] ||
      "Create a practical, ready-to-use result. Be concise, useful and professional.") +
    "\n\nWorkflow: " +
    workflow +
    "\nUser request/content:\n" +
    request +
    "\n\nReturn the finished output directly. Use clear headings and formatting where useful."
  );
}

async function openrouter(prompt: string): Promise<ProviderResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("not_configured");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://ai-creator-tools-hh1l.vercel.app",
      "X-Title": "AI Creator Tools",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error("provider_error");
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("empty_response");
  return { text, provider: "openrouter" };
}

async function groq(prompt: string): Promise<ProviderResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("not_configured");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error("provider_error");
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("empty_response");
  return { text, provider: "groq" };
}

async function gemini(prompt: string): Promise<ProviderResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("not_configured");

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" +
      encodeURIComponent(key),
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!res.ok) throw new Error("provider_error");
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("empty_response");
  return { text, provider: "gemini" };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workflow =
      typeof body?.workflow === "string" ? body.workflow.trim() : "";
    const requestText =
      typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!workflow || !requestText || requestText.length > 6000) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const prompt = buildPrompt(workflow, requestText);

    // Quality-first, low-latency routing: Gemini first (already configured), then OpenRouter, then Groq.
    // This avoids adding a new paid dependency while keeping fallbacks ready for traffic growth.
    for (const provider of [gemini, openrouter, groq]) {
      try {
        return NextResponse.json(await provider(prompt));
      } catch {
        // Try the next provider without exposing provider/API details to users.
      }
    }

    return NextResponse.json(
      { error: "AI service is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
