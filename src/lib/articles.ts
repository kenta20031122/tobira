export interface Article {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readMinutes: number;
  intro: string;
  sections: { heading: string; body: string }[];
  ctaHeading: string;
  ctaBody: string;
  relatedRegion?: string;
}

export const ARTICLES: Article[] = [
  {
    slug: 'best-places-in-japan-beyond-tokyo',
    title: 'Best Places in Japan Beyond Tokyo',
    description: 'Tokyo is just the beginning. Discover the most rewarding destinations across Japan that most visitors never reach — from mountain villages to volcanic coastlines.',
    publishedAt: '2025-03-13',
    readMinutes: 7,
    relatedRegion: undefined,
    intro: 'Most first-time visitors to Japan spend their entire trip in Tokyo, Kyoto, and Osaka. Those cities are worth visiting — but they represent a tiny fraction of what Japan has to offer. The country has 47 prefectures, each with its own food, dialect, landscape, and character. Here are the destinations that reward the effort of going further.',
    sections: [],
    ctaHeading: 'Find the Japan that fits you',
    ctaBody: 'Answer a few questions about what draws you to Japan — nature, history, food, or onsen — and we\'ll match you with the spots that fit your style.',
  },
  {
    slug: 'second-trip-to-japan',
    title: 'Where to Go in Japan for a Second Trip',
    description: 'Done Tokyo and Kyoto? Here\'s where to go on your second visit to Japan — slower, deeper, and further off the tourist trail.',
    publishedAt: '2025-03-13',
    readMinutes: 6,
    relatedRegion: undefined,
    intro: 'Your first trip to Japan probably followed the Golden Route — Tokyo, Hakone, Kyoto, Osaka. Maybe Hiroshima. It\'s a great introduction, but Japan rewards return visits. The second trip is where it gets interesting: smaller cities, quieter landscapes, and a Japan that feels genuinely discovered rather than toured.',
    sections: [],
    ctaHeading: 'Ready to go deeper?',
    ctaBody: 'Tell us what you loved about your last trip — and what you want more of. We\'ll find the spots that match your next chapter in Japan.',
  },
  {
    slug: 'alternatives-to-kyoto',
    title: '10 Alternatives to Kyoto Without the Crowds',
    description: 'Kyoto is unforgettable — and overcrowded. These 10 destinations offer the same ancient temples, castle towns, and traditional culture without the queues.',
    publishedAt: '2025-03-13',
    readMinutes: 8,
    relatedRegion: 'kinki',
    intro: 'Kyoto received over 50 million visitors in 2023. The most famous sites are genuinely beautiful — but experiencing them surrounded by tour groups and selfie sticks is a different thing entirely. Japan has dozens of cities with the same feudal history, Buddhist temples, and traditional crafts. These are the alternatives worth knowing.',
    sections: [],
    ctaHeading: 'Find your version of old Japan',
    ctaBody: 'History, temples, and traditional culture — there\'s more of it than Kyoto. Tell us what calls to you and we\'ll point you to the places that still feel discovered.',
  },
  {
    slug: 'hidden-gems-kyushu',
    title: 'Best Hidden Gems in Kyushu',
    description: 'Kyushu is Japan\'s southernmost main island — volcanic, subtropical, and home to some of the country\'s best onsen, food, and off-the-beaten-path landscapes.',
    publishedAt: '2025-03-13',
    readMinutes: 7,
    relatedRegion: 'kyushu',
    intro: 'Kyushu gets far fewer international visitors than Honshu, which is exactly why it\'s worth prioritising. The island has active volcanoes, world-class onsen towns, subtropical coastline, and a food culture — built around tonkotsu ramen, fresh seafood, and shochu — that stands apart from the rest of Japan.',
    sections: [],
    ctaHeading: 'Explore Kyushu your way',
    ctaBody: 'Whether you\'re after volcanic landscapes, onsen retreats, or coastal adventures — take the quiz and find the Kyushu spots that match your style.',
  },
  {
    slug: 'hidden-gems-tohoku',
    title: 'Best Hidden Gems in Tohoku',
    description: 'Tohoku — Japan\'s wild northeast — is one of the country\'s least-visited regions. Deep mountains, ancient pilgrimage routes, and festivals unlike anything in the south.',
    publishedAt: '2025-03-13',
    readMinutes: 7,
    relatedRegion: 'tohoku',
    intro: 'Tohoku sits just north of Tokyo, but most visitors never go. That\'s a mistake. The region has some of Japan\'s most dramatic mountain scenery, samurai castle towns that see a fraction of Kyoto\'s crowds, and summer festivals — the Nebuta in Aomori, the Tanabata in Sendai — that rank among the country\'s most spectacular.',
    sections: [],
    ctaHeading: 'Discover the real north of Japan',
    ctaBody: 'Tohoku rewards travellers who go looking for it. Tell us what you\'re after and we\'ll find the hidden spots that make the journey worthwhile.',
  },
  {
    slug: 'best-places-without-a-car',
    title: 'Best Places in Japan Without a Car',
    description: 'Japan\'s train network is legendary — but some of the best destinations are far more accessible than you\'d expect. Here\'s where to go without renting a car.',
    publishedAt: '2025-03-13',
    readMinutes: 6,
    relatedRegion: undefined,
    intro: 'One of the most common misconceptions about travel in rural Japan is that you need a car. For some destinations you do — but Japan\'s train and bus network is extensive enough that many of the most rewarding off-the-beaten-path spots are reachable without one. Here\'s where to focus.',
    sections: [],
    ctaHeading: 'Plan your car-free Japan trip',
    ctaBody: 'Tell us your interests and travel pace — we\'ll match you with spots that are reachable by train or bus, and build a day-by-day itinerary around them.',
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug);
}

export function getAllArticles(): Article[] {
  return ARTICLES;
}

export function getRelatedArticles(currentSlug: string, count = 2): Article[] {
  return ARTICLES.filter(a => a.slug !== currentSlug).slice(0, count);
}
