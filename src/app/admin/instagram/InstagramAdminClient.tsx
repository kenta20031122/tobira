'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { InstagramDraft, SlideData } from '@/types/instagram'
import CarouselPreview from './CarouselPreview'
import { THEMES } from '@/lib/instagram/themes'

type Props = {
  drafts: InstagramDraft[]
  secret: string
  currentStatus?: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

export default function InstagramAdminClient({ drafts, secret, currentStatus }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<InstagramDraft | null>(drafts[0] ?? null)
  const [caption, setCaption] = useState(selected?.caption ?? '')
  const [generating, setGenerating] = useState(false)
  const [themeKey, setThemeKey] = useState(THEMES[0].theme_key)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  const apiHeaders = { 'Content-Type': 'application/json', 'x-instagram-secret': secret }

  function selectDraft(draft: InstagramDraft) {
    setSelected(draft)
    setCaption(draft.caption)
    setMessage('')
  }

  async function handleGenerate() {
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetch('/api/instagram/generate', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ theme_key: themeKey }),
      })
      const json = await res.json() as { ok?: boolean; error?: string; id?: string }
      if (!res.ok) throw new Error(json.error ?? 'Generate failed')
      setMessage(`ドラフト生成完了: ${json.id}`)
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveCaption() {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/instagram/drafts/${selected.id}`, {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({ caption }),
      })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(json.error)
      setMessage('キャプション保存完了')
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'エラー')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleApprove() {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/instagram/drafts/${selected.id}`, {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({ status: 'approved' }),
      })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(json.error)
      setMessage('承認しました')
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'エラー')
    } finally {
      setActionLoading(false)
    }
  }

  async function handlePublish() {
    if (!selected || selected.status !== 'approved') return
    if (!confirm('Instagram に投稿しますか？')) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ id: selected.id }),
      })
      const json = await res.json() as { ok?: boolean; error?: string; ig_permalink?: string }
      if (!res.ok) throw new Error(json.error)
      setMessage(`投稿完了: ${json.ig_permalink}`)
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'エラー')
    } finally {
      setActionLoading(false)
    }
  }

  const statusFilters = ['', 'draft', 'approved', 'published', 'failed'] as const

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Instagram Drafts</h1>
        <div className="flex gap-2 items-center">
          <select
            value={themeKey}
            onChange={e => setThemeKey(e.target.value)}
            className="text-sm border rounded px-2 py-1.5 bg-white"
          >
            {THEMES.map(t => (
              <option key={t.theme_key} value={t.theme_key}>{t.theme_title_ja}</option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {generating ? '生成中…' : '+ 生成'}
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 mb-4">
        {statusFilters.map(s => (
          <a
            key={s}
            href={`?secret=${secret}${s ? `&status=${s}` : ''}`}
            className={`px-3 py-1 text-sm rounded ${currentStatus === s || (!currentStatus && !s) ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border'}`}
          >
            {s || 'すべて'}
          </a>
        ))}
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">{message}</div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {/* Draft list */}
        <div className="col-span-2 flex flex-col gap-2">
          {drafts.length === 0 && (
            <p className="text-gray-400 text-sm p-4">ドラフトがありません</p>
          )}
          {drafts.map(draft => (
            <button
              key={draft.id}
              onClick={() => selectDraft(draft)}
              className={`text-left p-3 rounded-xl border transition ${selected?.id === draft.id ? 'border-indigo-500 bg-indigo-50' : 'bg-white hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-gray-900 truncate">
                  {draft.theme_title_ja}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[draft.status]}`}>
                  {draft.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {(draft.slide_data as SlideData[]).length}枚
                {draft.likes_count != null && ` · ❤${draft.likes_count} 💬${draft.comments_count ?? 0}`}
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="col-span-3 bg-white rounded-xl border p-4">
          {!selected ? (
            <p className="text-gray-400 text-sm">左からドラフトを選択</p>
          ) : (
            <div className="flex flex-col gap-4">
              <CarouselPreview
                slides={selected.slide_data as SlideData[]}
                themeTitle={selected.theme_title_ja}
              />

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  rows={6}
                  className="w-full text-sm border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <div className="flex justify-end mt-1">
                  <button
                    onClick={handleSaveCaption}
                    disabled={actionLoading}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    保存
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Hashtags</label>
                <div className="flex flex-wrap gap-1">
                  {(selected.hashtags ?? []).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                {selected.status === 'draft' && (
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    承認
                  </button>
                )}
                {selected.status === 'approved' && (
                  <button
                    onClick={handlePublish}
                    disabled={actionLoading}
                    className="flex-1 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Instagram に投稿 ↑
                  </button>
                )}
                {selected.ig_permalink && (
                  <a
                    href={selected.ig_permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 text-sm text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50"
                  >
                    投稿を見る
                  </a>
                )}
              </div>

              {selected.error_message && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  エラー: {selected.error_message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
