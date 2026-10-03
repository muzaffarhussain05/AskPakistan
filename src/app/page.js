'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import AskBox from '@/components/AskBox';
import AnswerCard from '@/components/AnswerCard';
import TopicGrid from '@/components/TopicGrid';
import ServiceLinks from '@/components/ServiceLinks';

export default function Home() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const isUrdu = currentLang === 'ur';

  const handleAskQuestion = async (questionText) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText, uiLang: currentLang })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch answer.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar currentLang={currentLang} onLangChange={setCurrentLang} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-4xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isUrdu ? 'سرکاری ویب سائٹس کے مصدقہ جوابات' : 'Sourced strictly from official .gov.pk portals'}</span>
          </div>

          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? (
              <>
                السلام علیکم، <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">پاکستان</span>
              </>
            ) : (
              <>
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Pakistan</span>
              </>
            )}
          </h1>

          <p className={`text-base sm:text-lg text-slate-300 max-w-2xl mx-auto ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu
              ? 'شناختی کارڈ، پاسپورٹ، ٹیکس، بینظیر کفالت، اور دیگر سرکاری سروسز کے متعلق اپنا سوال پوچھیں اور فوری مصدقہ جواب پائیں۔'
              : 'Ask any question about Pakistani government services (CNIC, Passport, NTN, BISP, PTA) and get clear next steps with official source citations.'}
          </p>

          {/* Ask Input Box */}
          <div className="pt-4">
            <AskBox onSubmit={handleAskQuestion} isLoading={isLoading} uiLang={currentLang} />
          </div>
        </section>

        {/* Answer Output Card Section */}
        {(isLoading || result || error) && (
          <section id="answer-section" className="pt-4 scroll-mt-20">
            <AnswerCard result={result} isLoading={isLoading} error={error} />
          </section>
        )}

        {/* Trust Badges Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="glass-panel rounded-2xl p-5 space-y-2 border border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold">
              ✓
            </div>
            <h3 className="text-sm font-semibold text-slate-100">Official Sources Only</h3>
            <p className="text-xs text-slate-400">
              Answers are generated strictly from indexed <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">.gov.pk</code> documents. No invented memory.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-2 border border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold">
              🔒
            </div>
            <h3 className="text-sm font-semibold text-slate-100">Private by Default</h3>
            <p className="text-xs text-slate-400">
              Automatic client-side masking of CNIC numbers, phone numbers, and email before your query leaves your browser.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-2 border border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold">
              🌐
            </div>
            <h3 className="text-sm font-semibold text-slate-100">English, اردو & Roman Urdu</h3>
            <p className="text-xs text-slate-400">
              Ask in English, proper Urdu script, or Roman Urdu and receive an answer matching your language and script.
            </p>
          </div>
        </section>

        {/* Topic Grid */}
        <TopicGrid onSelectQuestion={handleAskQuestion} uiLang={currentLang} />

        {/* Quick Service Links */}
        <ServiceLinks uiLang={currentLang} />
      </main>
    </div>
  );
}
