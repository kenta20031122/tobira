import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'AI Trip Planner',
  description:
    'Build a personalized Kyushu itinerary powered by AI. Tell us your interests and get a day-by-day plan.',
  openGraph: {
    title: 'AI Trip Planner',
    description:
      'Build a personalized Kyushu itinerary powered by AI. Tell us your interests and get a day-by-day plan.',
    images: [{ url: 'https://tobira.vercel.app/og.jpg', width: 1200, height: 630 }],
  },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
