"use client"

import { Mic, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useCallback, useEffect, useRef } from "react"
import { useI18n } from "@/components/i18n-provider"

type VoiceControlsProps = {
  isProcessing: boolean
  onRecordingComplete: (audioBlob: Blob) => void
}

export function VoiceControls({ isProcessing, onRecordingComplete }: VoiceControlsProps) {
  const { isRecording, recordingTime, audioBlob, startRecording, stopRecording } = useAudioRecorder()
  const { t } = useI18n()
  const isPressingRef = useRef(false)
  const shouldStopAfterStartRef = useRef(false)

  useEffect(() => {
    if (audioBlob && !isRecording) {
      onRecordingComplete(audioBlob)
    }
  }, [audioBlob, isRecording, onRecordingComplete])

  useEffect(() => {
    if (!isRecording) return

    const stop = () => stopRecording()

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") stop()
    }

    window.addEventListener("pointerup", stop, { passive: true })
    window.addEventListener("pointercancel", stop, { passive: true })
    window.addEventListener("blur", stop, { passive: true })
    document.addEventListener("visibilitychange", onVisibilityChange, { passive: true })

    return () => {
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
      window.removeEventListener("blur", stop)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [isRecording, stopRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePressStart = useCallback(
    async (event: React.PointerEvent<HTMLButtonElement>) => {
      if (isProcessing || isRecording) return
      if (typeof event.button === "number" && event.button !== 0) return

      event.preventDefault()
      isPressingRef.current = true
      shouldStopAfterStartRef.current = false

      if (typeof event.currentTarget.setPointerCapture === "function") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {}
      }

      try {
        await startRecording()
        if (!isPressingRef.current || shouldStopAfterStartRef.current) {
          stopRecording()
        }
      } catch (error) {
        console.error("[v0] Recording error:", error)
        isPressingRef.current = false
        shouldStopAfterStartRef.current = false
        alert(t("voice.micPermissionAlert"))
      }
    },
    [isProcessing, isRecording, startRecording, stopRecording, t],
  )

  const handlePressEnd = useCallback(
    (event?: React.PointerEvent<HTMLButtonElement>) => {
      event?.preventDefault()
      isPressingRef.current = false
      if (isRecording) stopRecording()
      else shouldStopAfterStartRef.current = true
    },
    [isRecording, stopRecording],
  )

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 pb-6">
      {isProcessing && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner className="w-4 h-4" />
          <span className="text-sm">{t("voice.processing")}</span>
        </div>
      )}

      {isRecording && !isProcessing && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-destructive">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-medium">{t("voice.recording")}</span>
          </div>
          <span className="text-lg font-mono text-foreground">{formatTime(recordingTime)}</span>
        </div>
      )}

      <Button
        size="lg"
        className={`w-20 h-20 rounded-full transition-all ${
          isRecording
            ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground scale-110"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        }`}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerCancel={handlePressEnd}
        onContextMenu={handleContextMenu}
        disabled={isProcessing}
      >
        {isRecording ? <Square className="w-8 h-8" fill="currentColor" /> : <Mic className="w-8 h-8" />}
      </Button>

      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {isRecording ? t("voice.hintRelease") : t("voice.hintHold")}
      </p>
    </div>
  )
}
