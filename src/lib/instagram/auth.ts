import { NextRequest, NextResponse } from 'next/server'

export function checkInstagramSecret(req: NextRequest): NextResponse | null {
  const secret = req.headers.get('x-instagram-secret')
  const expected = process.env.INSTAGRAM_ADMIN_SECRET
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
