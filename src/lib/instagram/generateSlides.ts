import type { Spot } from '@/types/index'
import type { SlideData } from '@/types/instagram'

const MAX_SLIDES = 10
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

function toInstagramAspectRatio(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('unsplash.com')) {
      parsed.searchParams.set('w', '1080')
      parsed.searchParams.set('h', '1350')
      parsed.searchParams.set('fit', 'crop')
      parsed.searchParams.set('auto', 'format')
    } else if (parsed.hostname.includes('supabase.co')) {
      parsed.searchParams.set('width', '1080')
      parsed.searchParams.set('height', '1350')
      parsed.searchParams.set('resize', 'cover')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

export function generateCarouselSlides(spots: Spot[], themeTitle?: string): SlideData[] {
  const spotSlides = spots.slice(0, MAX_SLIDES - 1).map((spot, index) => {
    const slide_caption = buildSlideCaption(spot)
    return {
      spot_id: spot.id,
      image_url: toInstagramAspectRatio(spot.image_url),
      slide_caption,
      order: index + 1,
    }
  })

  if (!themeTitle) return spotSlides.map((s, i) => ({ ...s, order: i }))

  const bgUrl = spots[0]?.image_url ? toInstagramAspectRatio(spots[0].image_url) : ''
  const coverUrl = `${SITE_URL}/api/og/instagram-cover?title=${encodeURIComponent(themeTitle)}${bgUrl ? `&bg=${encodeURIComponent(bgUrl)}` : ''}`
  const cover: SlideData = {
    spot_id: 'cover',
    image_url: coverUrl,
    slide_caption: themeTitle,
    order: 0,
  }

  return [cover, ...spotSlides]
}

function buildSlideCaption(spot: Spot): string {
  const lines: string[] = [
    `${spot.name} — ${spot.prefecture}`,
    spot.highlights[0] ?? spot.description.slice(0, 100),
  ]

  if (spot.best_season) {
    lines.push(`Best season: ${spot.best_season}`)
  }

  return lines.join('\n').slice(0, 500)
}
