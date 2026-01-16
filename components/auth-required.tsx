"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/components/i18n-provider"
import { normalizeLocale, type UiLocale } from "@/lib/i18n"

export function AuthRequired({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { locale, setLocale } = useI18n()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
    }
  }, [isLoading, router, user])

  useEffect(() => {
    if (isLoading) return
    if (!user) return
    const raw = (user.user_metadata as Record<string, unknown> | null | undefined)?.ui_locale
    const next = normalizeLocale(raw) as UiLocale
    if (raw && next !== locale) setLocale(next)
  }, [isLoading, locale, setLocale, user])

  if (isLoading) return null
  if (!user) return null

  return children
}
