'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Image src="/UO_logo.png" alt="University of Oregon" width={28} height={28} className="object-contain" />
          <span className="font-mono text-[11px] uppercase tracking-superwide text-neutral-800">
            CS322 Gallery
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`font-mono text-[10px] uppercase tracking-superwide transition-colors ${
              path === '/' ? 'text-brand-600' : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/submit"
            className="bg-brand-700 hover:bg-brand-600 text-white font-mono text-[10px] uppercase tracking-superwide px-4 py-2 transition-colors"
          >
            Submit Project
          </Link>
        </div>
      </div>
    </nav>
  );
}
