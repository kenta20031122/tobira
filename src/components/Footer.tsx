import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div>
            <p className="text-white font-bold text-xl mb-1">tobira</p>
            <p className="text-stone-500 text-sm">扉 · beyond tokyo</p>
            <p className="text-stone-500 text-sm mt-3 max-w-xs">
              Discover the real Japan — authentic, unhurried, unforgettable.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-stone-300 font-medium mb-1">Explore</p>
              <Link href="/spots" className="hover:text-white transition-colors">
                All Spots
              </Link>
              <Link
                href="/spots?prefecture=Kumamoto"
                className="hover:text-white transition-colors"
              >
                Kumamoto
              </Link>
              <Link
                href="/spots?prefecture=Oita"
                className="hover:text-white transition-colors"
              >
                Oita
              </Link>
              <Link
                href="/spots?prefecture=Miyazaki"
                className="hover:text-white transition-colors"
              >
                Miyazaki
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-stone-300 font-medium mb-1">Product</p>
              <Link href="/plan" className="hover:text-white transition-colors">
                AI Trip Planner
              </Link>
              <Link href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-10 pt-6 text-xs text-stone-600 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} Tobira. All rights reserved.</p>
          <p>Made with ❤ in Japan</p>
        </div>
      </div>
    </footer>
  );
}
