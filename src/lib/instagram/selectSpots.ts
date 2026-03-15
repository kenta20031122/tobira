import type { Spot } from '@/types/index'
import type { ThemeSpec } from '@/types/instagram'
import { isGoodInSeason } from '@/lib/utils'

function scoreSpot(spot: Spot, preferCategories?: string[]): number {
  let score = 0
  if (spot.highlights.length > 2) score += 2
  if (!spot.is_premium) score += 1
  if (spot.image_url) score += 1
  if (preferCategories && preferCategories.some(c => spot.categories.includes(c as never))) score += 2
  return score
}

export function selectSpotsForTheme(spots: Spot[], theme: ThemeSpec): Spot[] {
  let filtered = [...spots]

  if (theme.region) {
    filtered = filtered.filter(s => s.region === theme.region)
  }

  if (theme.category) {
    filtered = filtered.filter(s => s.categories.includes(theme.category!))
  }

  if (theme.season) {
    filtered = filtered.filter(s => isGoodInSeason(s.best_season, theme.season!))
  }

  if (theme.accessKeywords && theme.accessKeywords.length > 0) {
    const kw = theme.accessKeywords
    filtered = filtered.filter(s =>
      kw.some(k => s.access.toLowerCase().includes(k.toLowerCase()))
    )
  }

  return filtered
    .sort((a, b) => scoreSpot(b, theme.preferCategories) - scoreSpot(a, theme.preferCategories))
    .slice(0, theme.maxCount)
}
