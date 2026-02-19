'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-stone-900">
            tobira
          </span>
          <span className="text-xs text-stone-400 font-medium hidden sm:block">
            扉 · beyond tokyo
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link href="/spots" className="hover:text-stone-900 transition-colors">
            Explore
          </Link>
          <Link href="/plan" className="hover:text-stone-900 transition-colors">
            Plan a Trip
          </Link>
          <Link
            href="/spots"
            className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
          >
            Start Exploring
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-stone-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 py-4 flex flex-col gap-4 text-sm font-medium text-stone-700">
          <Link href="/spots" onClick={() => setOpen(false)}>
            Explore Spots
          </Link>
          <Link href="/plan" onClick={() => setOpen(false)}>
            Plan a Trip
          </Link>
          <Link
            href="/spots"
            className="bg-red-600 text-white px-4 py-2 rounded-full text-center"
            onClick={() => setOpen(false)}
          >
            Start Exploring
          </Link>
        </div>
      )}
    </header>
  );
}
