'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  async function fetchProStatus(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .single();
    setIsPro(data?.status === 'active');
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      if (data.user) fetchProStatus(data.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) fetchProStatus(session.user.id);
      else setIsPro(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

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
          {userEmail ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-stone-500 text-xs">
                <User size={14} />
                {userEmail}
              </span>
              {isPro && (
                <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Pro
                </span>
              )}
              <form onSubmit={(e) => { e.preventDefault(); handleSignOut(); }}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
            >
              <LogIn size={15} />
              Log In
            </Link>
          )}
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
          {userEmail ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-stone-400 text-xs">{userEmail}</span>
                {isPro && (
                  <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                )}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSignOut(); }}>
                <button type="submit" className="flex items-center gap-1.5 text-stone-700">
                  <LogOut size={15} />
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-full text-center justify-center"
              onClick={() => setOpen(false)}
            >
              <LogIn size={15} />
              Log In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
