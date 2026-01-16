"use client"

import { Mic2, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsDialog, type AppSettings } from "@/components/settings-dialog"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { UI_LOCALES, type UiLocale } from "@/lib/i18n"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"

type HeaderProps = {
  onClearChat?: () => void
  messageCount?: number
  onSettingsChange?: (settings: AppSettings) => void
  roomId?: string
  userCount?: number
}

export function Header({ onClearChat, messageCount = 0, onSettingsChange, roomId, userCount }: HeaderProps) {
  const { profile, user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const { locale, setLocale, t } = useI18n()
  const currentLocale = UI_LOCALES.find((l) => l.value === locale) ?? UI_LOCALES[0]
  const persistLocale = async (next: UiLocale) => {
    const prev = locale
    setLocale(next)
    if (!user) return
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ data: { ui_locale: next } })
      if (error) throw error
    } catch {
      setLocale(prev)
    }
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Mic2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t("app.name")}</h1>
            <p className="text-sm text-muted-foreground">
              {roomId ? (
                <span className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  {t("header.online", { count: userCount ?? 0 })}
                  {messageCount > 0 && ` • ${t("header.messages", { count: messageCount })}`}
                </span>
              ) : messageCount > 0 ? (
                t("header.messages", { count: messageCount })
              ) : (
                t("header.subtitle.default")
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={locale} onValueChange={(value) => void persistLocale(value as UiLocale)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{currentLocale.flag}</span>
                  <span className="hidden sm:inline">{currentLocale.label}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {UI_LOCALES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isLoading && user && (
            <>
              <div className="hidden sm:block text-xs text-muted-foreground max-w-[220px] truncate">
                {profile?.display_name || user.email}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut()
                  router.replace("/login")
                }}
              >
                {t("common.logout")}
              </Button>
            </>
          )}
          {messageCount > 0 && onClearChat && (
            <Button variant="ghost" size="sm" onClick={onClearChat} className="gap-2">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t("common.clearChat")}</span>
            </Button>
          )}
          <SettingsDialog onSettingsChange={onSettingsChange} />
        </div>
      </div>
    </header>
  )
}
