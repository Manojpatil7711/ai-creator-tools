import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ProviderResult = { text: string; provider: string };

async function gemini(prompt: string): Promise<ProviderResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("not_configured");
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+encodeURIComponent(key), {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({contents:[{parts:[{text:prompt}]}]})
  });
  if (!res.ok) throw new Error("provider_error");
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("empty_response");
  return {text, provider:"gemini"};
}

async function groq(prompt: string): Promise<ProviderResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("not_configured");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:"POST", headers:{"content-type":"application/json","authorization":`Bearer ${key}`},
    body: JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:prompt}],temperature:0.7})
  });
  if (!res.ok) throw new Error("provider_error");
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("empty_response");
  return {text, provider:"groq"};
}

async function openrouter(prompt: string): Promise<ProviderResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("not_configured");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:"POST", headers:{"content-type":"application/json","authorization":`Bearer ${key}`},
    body: JSON.stringify({model:"openai/gpt-oss-120b",messages:[{role:"user",content:prompt}],temperature:0.7})
  });
  if (!res.ok) throw new Error("provider_error");
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("empty_response");
  return {text, provider:"openrouter"};
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt || prompt.length > 6000) return NextResponse.json({error:"Invalid prompt."},{status:400});
    const providers = [gemini, groq, openrouter];
    for (const provider of providers) {
      try { return NextResponse.json(await provider(prompt)); } catch {}
    }
    return NextResponse.json({error:"No AI provider is configured or available."},{status:503});
  } catch {
    return NextResponse.json({error:"Invalid request."},{status:400});
  }
}
