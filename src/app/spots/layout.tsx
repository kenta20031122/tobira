import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Spots',
  description:
    'Browse hidden gems across Kyushu — active volcanoes, sacred shrines, secret onsen towns, and more.',
  openGraph: {
    title: 'Explore Kyushu Spots',
    description:
      'Browse hidden gems across Kyushu — active volcanoes, sacred shrines, secret onsen towns, and more.',
  },
};

export default function SpotsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
