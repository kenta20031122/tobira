import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const OG_IMAGE = 'https://tobira-travel.com/og.jpg';

export const metadata: Metadata = {
  metadataBase: new URL('https://tobira-travel.com'),
  title: {
    default: 'Tobira — Beyond Tokyo | Discover Real Japan',
    template: '%s | Tobira',
  },
  description:
    "Go beyond Tokyo. Tobira guides you to Japan's most authentic experiences across Western Japan — Kyushu, Okinawa, and Hiroshima. Curated by locals, powered by AI.",
  openGraph: {
    title: 'Tobira — Beyond Tokyo | Discover Real Japan',
    description:
      "Go beyond Tokyo. Japan's authentic travel guide for Kyushu, Okinawa & Hiroshima — curated by locals, powered by AI.",
    type: 'website',
    url: 'https://tobira-travel.com',
    siteName: 'Tobira',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Western Japan travel guide — Tobira' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tobira — Beyond Tokyo | Discover Real Japan',
    description:
      "Go beyond Tokyo. Japan's authentic travel guide for Kyushu, Okinawa & Hiroshima — curated by locals, powered by AI.",
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
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
