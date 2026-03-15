import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { InstagramDraft } from '@/types/instagram'
import InstagramAdminClient from './InstagramAdminClient'

type Props = {
  searchParams: Promise<{ secret?: string; status?: string }>
}

export default async function InstagramAdminPage({ searchParams }: Props) {
  const { secret, status } = await searchParams

  if (!secret || secret !== process.env.INSTAGRAM_ADMIN_SECRET) {
    redirect('/')
  }

  const supabase = createAdminClient()
  let query = supabase
    .from('instagram_drafts')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && ['draft', 'approved', 'published', 'failed'].includes(status)) {
    query = query.eq('status', status)
  }

  const { data: drafts } = await query

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <InstagramAdminClient
        drafts={(drafts ?? []) as InstagramDraft[]}
        secret={secret}
        currentStatus={status}
      />
    </div>
  )
}
