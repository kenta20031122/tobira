import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tobira — Discover Hidden Kyushu',
  description:
    "Go beyond Tokyo. Tobira guides you to Japan's most authentic, lesser-known experiences in Kyushu — curated by locals, powered by AI.",
  openGraph: {
    title: 'Tobira — Discover Hidden Kyushu',
    description: "Japan's authentic travel guide, beyond the tourist trail.",
    type: 'website',
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
