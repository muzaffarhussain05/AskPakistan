'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <div className="min-h-screen">
      <Navbar currentLang={currentLang} onLangChange={setCurrentLang} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
            <span>Project Architecture & Privacy Standard</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            About Ask Pakistan
          </h1>
          <p className="text-slate-300 text-base max-w-2xl">
            A free, independent public utility designed to help citizens quickly find clear, accurate, and sourced answers about Pakistani government services.
          </p>
        </div>

        {/* Disclaimer Warning Card */}
        <div className="glass-panel rounded-2xl p-6 border-amber-500/30 bg-amber-950/20 text-amber-200/90 space-y-3">
          <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Non-Governmental Disclaimer</span>
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
            <strong>Ask Pakistan is NOT a government website and is not affiliated with the Government of Pakistan or any government agency.</strong> It is an independent RAG system. Answers provided are for informational reference only. Always confirm official fee schedules, dates, and requirements directly on official <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">.gov.pk</code> portals.
          </p>
        </div>

        {/* How It Works Diagram / Steps */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">How It Works (Retrieval-Augmented Generation)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-5 space-y-3 border border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-slate-100">Polite Web Crawling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our Node.js crawler fetches pages from an allowlist of official <code className="text-emerald-400 bg-slate-900 px-1">.gov.pk</code> sites, respecting <code className="text-slate-300 font-mono">robots.txt</code> and rate limits.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-5 space-y-3 border border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-slate-100">Vector Indexing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pages are cleaned, split into 300-500 token chunks, embedded with Google Gemini 768-dim embeddings, and stored in MongoDB Atlas Vector Search.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-5 space-y-3 border border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-slate-100">Strict Grounded Q&A</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a citizen asks a question, the LLM generates an answer strictly using the top retrieved document chunks, inline citations, and zero outside memory.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy & Safety Guarantees */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Privacy & Safety Commitments</h2>
          <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-800">
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong>Client-Side CNIC & Phone Redaction:</strong> Before any query leaves your browser, regex filters replace any 13-digit CNIC (<code className="text-slate-200">XXXXX-XXXXXXX-X</code>) or phone number with <code className="text-emerald-400">[CNIC]</code> or <code className="text-emerald-400">[PHONE]</code>.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong>No Account or Log Storage:</strong> Ask Pakistan requires no login, no registration, and stores no personal user data.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong>Prompt Injection Defense:</strong> All retrieved crawled content is treated as untrusted reference text, wrapped in strict system boundaries.
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Technical Specifications Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Technology Stack</h2>
          <div className="overflow-x-auto glass-panel rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-3.5">Layer</th>
                  <th className="p-3.5">Technology</th>
                  <th className="p-3.5">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[12px]">
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-slate-200">Frontend / API</td>
                  <td className="p-3.5 text-emerald-400">Next.js 14+ (App Router)</td>
                  <td className="p-3.5 text-slate-400">Server-side rendering & API endpoints</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-slate-200">Styling & Urdu Font</td>
                  <td className="p-3.5 text-emerald-400">Tailwind CSS + Noto Nastaliq Urdu</td>
                  <td className="p-3.5 text-slate-400">Responsive UI & proper Urdu rendering</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-slate-200">Database & Vector Search</td>
                  <td className="p-3.5 text-emerald-400">MongoDB Atlas (Vector Search)</td>
                  <td className="p-3.5 text-slate-400">Document chunking & vector retrieval</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-slate-200">Embeddings & LLM</td>
                  <td className="p-3.5 text-emerald-400">Google Gemini API / Anthropic Claude</td>
                  <td className="p-3.5 text-slate-400">768-dim embeddings & grounded answer generation</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-slate-200">Crawler & Cron</td>
                  <td className="p-3.5 text-emerald-400">Node.js + Cheerio + GitHub Actions</td>
                  <td className="p-3.5 text-slate-400">Weekly re-crawling & SHA-256 change detection</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
