import { getAllSpots } from '@/lib/spots';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://tobira-travel.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const spots = await getAllSpots();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,              changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/spots`,   changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/guides`,  changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/plan`,    changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const spotRoutes: MetadataRoute.Sitemap = spots.map((spot) => ({
    url: `${BASE_URL}/spots/${spot.id}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const guideRoutes: MetadataRoute.Sitemap = [
    'fukuoka', 'saga', 'nagasaki', 'kumamoto',
    'oita', 'miyazaki', 'kagoshima', 'okinawa', 'hiroshima',
    'yamaguchi', 'okayama', 'tottori', 'shimane',
    'ehime', 'kochi', 'tokushima', 'kagawa',
    'hokkaido',
    'aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima',
    'osaka', 'kyoto', 'nara', 'hyogo', 'shiga', 'wakayama', 'mie',
    'aichi', 'shizuoka', 'nagano', 'ishikawa', 'gifu',
    'tokyo', 'kanagawa', 'saitama', 'chiba', 'ibaraki', 'tochigi', 'gunma',
  ].map((pref) => ({
    url: `${BASE_URL}/guides/${pref}`,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...spotRoutes, ...guideRoutes];
}
