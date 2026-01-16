import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

type AdRow = {
  id: string
  slot_key: string
  title: string | null
  image_url: string | null
  link_url: string | null
  is_active: boolean | null
  updated_at: string | null
  created_at: string | null
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const slotKey = url.searchParams.get("slotKey")?.trim() || null
  const limitParam = url.searchParams.get("limit")?.trim()
  const limit = limitParam ? Math.max(1, Math.min(20, Number(limitParam) || 1)) : 10

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: "缺少 Supabase 环境变量" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  let query = supabase
    .from("ads")
    .select("id,slot_key,title,image_url,link_url,is_active,updated_at,created_at")
    .eq("is_active", true)

  if (slotKey) query = query.eq("slot_key", slotKey)

  const { data, error } = await query
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const ads = (data as AdRow[]).map((ad) => ({
    id: ad.id,
    slotKey: ad.slot_key,
    title: ad.title,
    imageUrl: ad.image_url,
    linkUrl: ad.link_url,
  }))

  return Response.json(
    { ads },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}

