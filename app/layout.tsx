import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});
const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-serif',
});

export const metadata: Metadata = {
  title: 'CS322 Project Gallery',
  description: 'Browse and submit CS322 student final projects.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#f4f4f4] font-sans text-neutral-900 antialiased">
        {/* Decorative fixed background — adapted from QuackHacks-3 gallery */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          {/* Gradient + dot grid base */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(227,241,230,0.55),transparent_45%),conic-gradient(from_140deg_at_85%_0%,rgba(21,71,51,0.10),transparent_30%),radial-gradient(60%_45%_at_10%_100%,rgba(112,191,153,0.30),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_1px_1px,#154733_1px,transparent_0)] [background-size:22px_22px]" />
          {/* Top-left: dashed diamond */}
          <div className="absolute top-[8%] left-[6%] h-20 w-20 rotate-45 border-2 border-dashed border-brand-700/40" />
          {/* Top-center: blur blob */}
          <div className="absolute top-[6%] left-[48%] h-36 w-36 rounded-full bg-amber-200/50 mix-blend-multiply blur-2xl" />
          {/* Top-right: large rotated square */}
          <div className="absolute -top-10 right-[6%] h-56 w-56 rotate-12 border-2 border-brand-700/30 bg-brand-300/20" />
          {/* Middle-left: triangle */}
          <svg className="absolute top-[44%] left-[4%] h-16 w-16 text-brand-700/40" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 95,80 5,80" stroke="currentColor" strokeWidth="3" />
          </svg>
          {/* Middle-right: concentric circles */}
          <svg className="absolute top-[42%] right-[5%] h-14 w-14 text-rose-400/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="5" />
          </svg>
          {/* Bottom-left: blur blob */}
          <div className="absolute bottom-[12%] left-[8%] h-28 w-28 rounded-full bg-brand-500/15 mix-blend-multiply blur-xl" />
          {/* Bottom-center: small rotated square */}
          <div className="absolute bottom-[10%] left-[44%] h-12 w-12 rotate-12 border-2 border-brand-700/25 bg-brand-300/15" />
          {/* Bottom-right: dashed circle */}
          <div className="absolute bottom-[8%] right-[7%] h-20 w-20 rounded-full border-2 border-dashed border-brand-700/30" />
        </div>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 bg-white py-5 text-center space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-superwide text-neutral-400">
            CS322 Project Gallery &mdash; University of Oregon
          </p>
          <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500">
            Managed by Ram Durairajan and Aziz Akturin
          </p>
        </footer>
      </body>
    </html>
  );
}
