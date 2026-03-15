import type { ThemeSpec } from '@/types/instagram'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAllSpots } from '@/lib/spots'
import { selectSpotsForTheme } from './selectSpots'
import { validateImageUrl } from './validateImageUrl'
import { generateCarouselSlides } from './generateSlides'
import { generateThemeCaption } from './generateCaption'
import { generateHashtags } from './generateHashtags'

const MIN_SLIDES = 2

/** Returns start of the current ISO week (Monday 00:00:00 UTC) */
function getWeekStart(): string {
  const now = new Date()
  const dayOfWeek = now.getUTCDay() // 0=Sun, 1=Mon...
  const diffToMonday = (dayOfWeek + 6) % 7
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - diffToMonday)
  monday.setUTCHours(0, 0, 0, 0)
  return monday.toISOString()
}

export async function buildDraft(theme: ThemeSpec): Promise<string> {
  const supabase = createAdminClient()

  // Duplicate check: same theme_key this week
  const weekStart = getWeekStart()
  const { data: existing } = await supabase
    .from('instagram_drafts')
    .select('id')
    .gte('created_at', weekStart)
    .eq('theme_key', theme.theme_key)
    .maybeSingle()

  if (existing) {
    throw new Error(`Draft for theme "${theme.theme_key}" already exists this week`)
  }

  // Fetch and select spots
  const allSpots = await getAllSpots()
  const selectedSpots = selectSpotsForTheme(allSpots, theme)

  // Generate slides, filtering out invalid image URLs
  const rawSlides = generateCarouselSlides(selectedSpots, theme.theme_title_en)
  const validSlides = rawSlides.filter(slide => {
    // Cover slide (spot_id='cover') uses an OG image URL — skip URL validation for it
    if (slide.spot_id === 'cover') return true
    const ok = validateImageUrl(slide.image_url)
    if (!ok) console.warn(`[draftBuilder] Skipping invalid image URL: ${slide.image_url}`)
    return ok
  })

  if (validSlides.length < MIN_SLIDES) {
    throw new Error(
      `Not enough valid slides for theme "${theme.theme_key}": got ${validSlides.length}, need at least ${MIN_SLIDES}`
    )
  }

  const caption = generateThemeCaption(theme, selectedSpots)
  const hashtags = generateHashtags(theme)
  const spotIds = validSlides.map(s => s.spot_id)

  const { data, error } = await supabase
    .from('instagram_drafts')
    .insert({
      theme_type: theme.type,
      theme_key: theme.theme_key,
      theme_title_ja: theme.theme_title_ja,
      theme_title_en: theme.theme_title_en,
      content_type: 'carousel',
      spot_ids: spotIds,
      slide_data: validSlides,
      caption,
      hashtags,
      status: 'draft',
    })
    .select('id')

  if (error) throw new Error(`Supabase insert failed: ${error.message}`)

  return (data as Array<{ id: string }>)[0].id
}
