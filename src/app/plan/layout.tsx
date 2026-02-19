import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Trip Planner',
  description:
    'Build a personalized Kyushu itinerary powered by AI. Tell us your interests and get a day-by-day plan.',
  openGraph: {
    title: 'AI Trip Planner',
    description:
      'Build a personalized Kyushu itinerary powered by AI. Tell us your interests and get a day-by-day plan.',
  },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
