import { NextRequest, NextResponse } from 'next/server'
import { checkInstagramSecret } from '@/lib/instagram/auth'
import { buildDraft } from '@/lib/instagram/draftBuilder'
import { getThemeByKey, THEMES } from '@/lib/instagram/themes'

export async function POST(req: NextRequest) {
  const authError = checkInstagramSecret(req)
  if (authError) return authError

  const body = await req.json().catch(() => null) as { theme_key?: string } | null
  if (!body?.theme_key) {
    return NextResponse.json(
      { error: 'Missing theme_key', available: THEMES.map(t => t.theme_key) },
      { status: 400 }
    )
  }

  const theme = getThemeByKey(body.theme_key)
  if (!theme) {
    return NextResponse.json(
      { error: `Unknown theme_key: ${body.theme_key}`, available: THEMES.map(t => t.theme_key) },
      { status: 400 }
    )
  }

  try {
    const id = await buildDraft(theme)
    return NextResponse.json({ ok: true, id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
