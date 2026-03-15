import type { ThemeSpec } from '@/types/instagram'

export const THEMES: ThemeSpec[] = [
  // Regional
  {
    theme_key: 'hokkaido-best',
    theme_title_ja: '北海道の絶景スポット5選',
    theme_title_en: 'Beyond Sapporo: 5 Scenic Spots Worth the Detour',
    type: 'regional',
    region: 'hokkaido',
    maxCount: 5,
  },
  {
    theme_key: 'tohoku-nature',
    theme_title_ja: '東北の自然スポット5選',
    theme_title_en: '5 Tohoku Views Beyond the Tourist Trail',
    type: 'regional',
    region: 'tohoku',
    maxCount: 5,
  },
  {
    theme_key: 'kanto-hidden',
    theme_title_ja: '関東の穴場スポット5選',
    theme_title_en: '5 Kanto Spots Most Visitors Miss',
    type: 'regional',
    region: 'kanto',
    maxCount: 5,
  },
  {
    theme_key: 'kansai-history',
    theme_title_ja: '関西の歴史スポット5選',
    theme_title_en: 'Beyond Kyoto: 5 Historic Gems in Kansai',
    type: 'regional',
    region: 'kinki',
    maxCount: 5,
  },
  {
    theme_key: 'kyushu-best',
    theme_title_ja: '九州の絶景スポット5選',
    theme_title_en: '5 Kyushu Landscapes Worth Leaving Tokyo For',
    type: 'regional',
    region: 'kyushu',
    maxCount: 5,
  },
  {
    theme_key: 'okinawa-beaches',
    theme_title_ja: '沖縄の絶景ビーチ5選',
    theme_title_en: '5 Okinawa Beaches Beyond the Resort Pools',
    type: 'regional',
    region: 'okinawa',
    maxCount: 5,
  },
  {
    theme_key: 'chugoku-gems',
    theme_title_ja: '中国地方の隠れた名所5選',
    theme_title_en: 'Top 5 Hidden Gems in Chugoku',
    type: 'regional',
    region: 'chugoku',
    maxCount: 5,
  },
  {
    theme_key: 'shikoku-spiritual',
    theme_title_ja: '四国のパワースポット5選',
    theme_title_en: 'Top 5 Spiritual Spots in Shikoku',
    type: 'regional',
    region: 'shikoku',
    maxCount: 5,
  },

  // Seasonal
  {
    theme_key: 'spring-nature',
    theme_title_ja: '春に行きたい絶景スポット5選',
    theme_title_en: 'Top 5 Scenic Spots to Visit in Spring',
    type: 'seasonal',
    season: 'spring',
    maxCount: 5,
  },
  {
    theme_key: 'summer-nature',
    theme_title_ja: '夏に行きたい絶景スポット5選',
    theme_title_en: 'Top 5 Scenic Spots to Visit in Summer',
    type: 'seasonal',
    season: 'summer',
    maxCount: 5,
  },
  {
    theme_key: 'autumn-foliage',
    theme_title_ja: '秋の紅葉スポット5選',
    theme_title_en: 'Top 5 Autumn Foliage Spots',
    type: 'seasonal',
    season: 'autumn',
    maxCount: 5,
  },
  {
    theme_key: 'winter-onsen',
    theme_title_ja: '冬の秘湯5選',
    theme_title_en: '5 Winter Onsen Worth Braving the Cold For',
    type: 'seasonal',
    season: 'winter',
    maxCount: 5,
  },

  // Category
  {
    theme_key: 'best-onsen',
    theme_title_ja: '日本の名湯5選',
    theme_title_en: 'Top 5 Hot Spring Resorts in Japan',
    type: 'category',
    category: 'onsen',
    maxCount: 5,
  },
  {
    theme_key: 'spiritual-gems',
    theme_title_ja: '日本の秘境パワースポット5選',
    theme_title_en: 'Top 5 Mystical Power Spots in Japan',
    type: 'category',
    category: 'spiritual',
    maxCount: 5,
  },
  {
    theme_key: 'food-adventures',
    theme_title_ja: '食で旅する日本5選',
    theme_title_en: 'Top 5 Food Destinations in Japan',
    type: 'category',
    category: 'food',
    maxCount: 5,
  },
  {
    theme_key: 'history-journey',
    theme_title_ja: '日本の歴史スポット5選',
    theme_title_en: 'Top 5 Historical Sites in Japan',
    type: 'category',
    category: 'history',
    maxCount: 5,
  },

  // Access
  {
    theme_key: 'car-free-spots',
    theme_title_ja: '車なしで行ける絶景5選',
    theme_title_en: '5 Stunning Spots You Can Reach Without a Car',
    type: 'access',
    accessKeywords: ['JR', '電車', 'バス', 'train', 'bus', '徒歩', 'walk'],
    maxCount: 5,
  },
]

export function getThemeByKey(key: string): ThemeSpec | undefined {
  return THEMES.find(t => t.theme_key === key)
}
