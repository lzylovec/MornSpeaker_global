"use client"

import { ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SUPPORTED_LANGUAGES, type Language } from "@/components/voice-chat-interface"
import { useI18n } from "@/components/i18n-provider"

type LanguageSelectorProps = {
  userLanguage: Language
  targetLanguage: Language
  onUserLanguageChange: (language: Language) => void
  onTargetLanguageChange: (language: Language) => void
  onSwap: () => void
  variant?: "panel" | "compact"
}

export function LanguageSelector({
  userLanguage,
  targetLanguage,
  onUserLanguageChange,
  onTargetLanguageChange,
  onSwap,
  variant = "panel",
}: LanguageSelectorProps) {
  const { t } = useI18n()
  const isCompact = variant === "compact"

  if (isCompact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="sr-only">{t("language.source")}</div>
          <Select
            value={userLanguage.code}
            onValueChange={(code) => {
              const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code)
              if (lang) onUserLanguageChange(lang)
            }}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue>
                <span className="flex items-center gap-2 truncate">
                  <span>{userLanguage.flag}</span>
                  <span className="truncate">{userLanguage.name}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="icon" onClick={onSwap} className="h-9 w-9 shrink-0">
          <ArrowLeftRight className="w-5 h-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="sr-only">{t("language.target")}</div>
          <Select
            value={targetLanguage.code}
            onValueChange={(code) => {
              const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code)
              if (lang) onTargetLanguageChange(lang)
            }}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue>
                <span className="flex items-center gap-2 truncate">
                  <span>{targetLanguage.flag}</span>
                  <span className="truncate">{targetLanguage.name}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 bg-card rounded-xl p-4 border border-border">
      <p className="text-sm text-muted-foreground text-center">
        {t("language.hint", { source: userLanguage.name, target: targetLanguage.name })}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t("language.source")}</label>
          <Select
            value={userLanguage.code}
            onValueChange={(code) => {
              const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code)
              if (lang) onUserLanguageChange(lang)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{userLanguage.flag}</span>
                  <span>{userLanguage.name}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="icon" onClick={onSwap} className="mt-6 shrink-0">
          <ArrowLeftRight className="w-5 h-5" />
        </Button>

        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t("language.target")}</label>
          <Select
            value={targetLanguage.code}
            onValueChange={(code) => {
              const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code)
              if (lang) onTargetLanguageChange(lang)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{targetLanguage.flag}</span>
                  <span>{targetLanguage.name}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
