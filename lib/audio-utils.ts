function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }
    const id = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)
    const onAbort = () => {
      cleanup()
      reject(new DOMException("Aborted", "AbortError"))
    }
    const cleanup = () => {
      clearTimeout(id)
      if (signal) signal.removeEventListener("abort", onAbort)
    }
    if (signal) signal.addEventListener("abort", onAbort, { once: true })
  })
}

async function parseErrorMessage(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as { error?: string; message?: string } | null
  return data?.error || data?.message || `请求失败（${response.status}）`
}

export async function transcribeAudio(audioBlob: Blob, language: string): Promise<string> {
  const formData = new FormData()
  formData.append("audio", audioBlob, "recording.webm")
  formData.append("language", language)

  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const data = (await response.json()) as { text: string }
      return data.text
    }

    if (response.status === 429 && attempt < maxAttempts) {
      const delayMs = Math.min(8000, 1000 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250)
      await sleep(delayMs)
      continue
    }

    const message = await parseErrorMessage(response)
    throw new Error(message || "转写失败")
  }

  throw new Error("转写失败")
}

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  signal?: AbortSignal,
): Promise<string> {
  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
      signal,
    })

    if (response.ok) {
      const data = (await response.json()) as { translatedText: string }
      return data.translatedText
    }

    if (response.status === 429 && attempt < maxAttempts) {
      const delayMs = Math.min(8000, 1200 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250)
      await sleep(delayMs, signal)
      continue
    }

    const message = await parseErrorMessage(response)
    type HttpError = Error & { status?: number }
    const error: HttpError = new Error(message || `翻译失败（${response.status}）`)
    error.status = response.status
    throw error
  }

  type HttpError = Error & { status?: number }
  const error: HttpError = new Error("翻译失败")
  error.status = 500
  throw error
}
