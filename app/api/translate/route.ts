import { generateText } from "ai"
import { mistral } from "@ai-sdk/mistral"

export const maxDuration = 30

function normalizeLanguageLabel(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return ""

  const normalized = raw.toLowerCase().replaceAll("_", "-")
  const primary = normalized.split("-")[0] ?? normalized

  if (primary === "zh" || raw === "中文" || raw === "汉语" || raw === "普通话") return "Chinese"
  if (primary === "en" || raw === "英语" || raw === "英文") return "English"
  if (primary === "ja" || raw === "日语" || raw === "日文") return "Japanese"
  if (primary === "ko" || raw === "韩语" || raw === "韩文") return "Korean"
  if (primary === "fr" || raw === "法语" || raw === "法文") return "French"
  if (primary === "de" || raw === "德语" || raw === "德文") return "German"
  if (primary === "es" || raw === "西班牙语" || raw === "西班牙文") return "Spanish"
  if (primary === "pt" || raw === "葡萄牙语" || raw === "葡萄牙文") return "Portuguese"

  return raw
}

export async function POST(req: Request) {
  try {
    const { text, sourceLanguage, targetLanguage } = await req.json()

    if (typeof text !== "string" || text.trim().length === 0) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sourceLabel = normalizeLanguageLabel(sourceLanguage)
    const targetLabel = normalizeLanguageLabel(targetLanguage)
    if (!sourceLabel || !targetLabel) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use Mistral for translation
    const { text: translatedText } = await generateText({
      model: mistral("mistral-large-latest"),
      prompt: `Translate the following text from ${sourceLabel} to ${targetLabel}. Only return the translated text, nothing else.\n\nText: ${text}`,
      maxOutputTokens: 1000,
      temperature: 0.3,
    })

    return Response.json({ translatedText: translatedText.trim() })
  } catch (error) {
    console.error("[v0] Translation error:", error)
    return Response.json({ error: "Failed to translate text" }, { status: 500 })
  }
}
