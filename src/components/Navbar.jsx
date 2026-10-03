'use client';

import Link from 'next/link';
import LanguageToggle from './LanguageToggle';

export default function Navbar({ currentLang, onLangChange }) {
  const isUrdu = currentLang === 'ur';

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform border border-emerald-400/30">
            AP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                Ask Pakistan
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                RAG 1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isUrdu ? 'سرکاری خدمات کی معلومات' : 'Independent Government Q&A'}
            </p>
          </div>
        </Link>

        {/* Navigation Links & Language Toggle */}
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              {isUrdu ? 'ہوم' : 'Home'}
            </Link>
            <Link href="/directory" className="hover:text-emerald-400 transition-colors">
              {isUrdu ? 'ڈائریکٹری' : 'Official Directory'}
            </Link>
            <Link href="/about" className="hover:text-emerald-400 transition-colors">
              {isUrdu ? 'ہمارے بارے میں' : 'About'}
            </Link>
          </nav>

          <LanguageToggle currentLang={currentLang} onLangChange={onLangChange} />
        </div>
      </div>
    </header>
  );
}
