import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const OG_IMAGE =
  'https://khgpsvnrorfigvubxhmd.supabase.co/storage/v1/object/public/spot-images/pixta_91488261_M%20(1).jpg';

export const metadata: Metadata = {
  metadataBase: new URL('https://tobira.vercel.app'),
  title: {
    default: 'Tobira — Discover Hidden Kyushu',
    template: '%s | Tobira',
  },
  description:
    "Go beyond Tokyo. Tobira guides you to Japan's most authentic, lesser-known experiences in Kyushu — curated by locals, powered by AI.",
  openGraph: {
    title: 'Tobira — Discover Hidden Kyushu',
    description: "Japan's authentic travel guide, beyond the tourist trail.",
    type: 'website',
    url: 'https://tobira.vercel.app',
    siteName: 'Tobira',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Mt. Aso Caldera, Kyushu Japan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tobira — Discover Hidden Kyushu',
    description: "Japan's authentic travel guide, beyond the tourist trail.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased bg-stone-50 font-sans`}>
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
