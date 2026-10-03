'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                AP
              </div>
              <span className="text-base font-bold text-white">Ask Pakistan</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Ask Pakistan is a free, independent community project providing retrieval-augmented answers on Pakistani government services drawn strictly from verified official <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400">.gov.pk</code> portals.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              Bot User-Agent: AskPakistanBot/1.0 (+https://ask-pakistan.vercel.app/about)
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home Q&A</Link></li>
              <li><Link href="/directory" className="hover:text-emerald-400 transition-colors">Indexed Official Sites</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">How It Works & Limitations</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">Privacy & Trust</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>No Login or User Accounts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Client-Side CNIC/Phone Masking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Zero Hallucination Retrieval</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Ask Pakistan. Independent non-governmental assistant.</p>
          <p className="text-slate-500">
            Disclaimer: Answers are for informational reference only. Always confirm fees and requirements on official portals.
          </p>
        </div>
      </div>
    </footer>
  );
}
