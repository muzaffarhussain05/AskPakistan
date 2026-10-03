'use client';

import { useState } from 'react';
import { redact } from '@/lib/redact';

const exampleChips = [
  { en: 'How do I renew my expired CNIC online?', ur: 'شناختی کارڈ آن لائن کیسے رینیو کروائیں؟' },
  { en: 'What is the fee for a 10-year urgent passport?', ur: 'پاسپورٹ کی سرکاری فیس کتنی ہے؟' },
  { en: 'How do I register for NTN on FBR IRIS?', ur: 'ایف بی آر پورٹل پر نیا این ٹی این کیسے بنوائیں؟' },
  { en: 'How to check eligibility for BISP 8171 program?', ur: '8171 بینظیر کفالت پروگرام کی اہلیت کیسے چیک کریں؟' },
  { en: 'NICOP banwane ka tareeqa kya hai?', ur: 'نائیکوپ بنوانے کا کیا طریقہ ہے؟' },
  { en: 'PTA mobile phone registration tax check', ur: 'پی ٹی اے موبائل فون ٹیکس کی معلومات' }
];

export default function AskBox({ onSubmit, isLoading, uiLang = 'en' }) {
  const [question, setQuestion] = useState('');
  const [isRedactedNotice, setIsRedactedNotice] = useState(false);

  const handleTextChange = (e) => {
    const raw = e.target.value;
    const clean = redact(raw);
    setIsRedactedNotice(clean !== raw);
    setQuestion(raw);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!question.trim() || isLoading) return;

    // Perform client-side redaction before request leaves browser
    const redactedText = redact(question.trim());
    onSubmit(redactedText);
  };

  const handleChipClick = (chipText) => {
    setQuestion(chipText);
    const redactedText = redact(chipText);
    onSubmit(redactedText);
  };

  const isUrdu = uiLang === 'ur';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel rounded-2xl p-2 sm:p-3 transition-all border border-emerald-500/20 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-2xl">
          <textarea
            value={question}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={
              isUrdu
                ? 'اپنا سوال یہاں ٹائپ کریں... (مثلاً: شناختی کارڈ یا پاسپورٹ کی فیس)'
                : 'Ask a question about Pakistani government services (CNIC, Passport, NTN, BISP, PTA)...'
            }
            rows={3}
            dir={isUrdu ? 'rtl' : 'ltr'}
            className={`w-full bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none resize-none px-3 py-2 text-base sm:text-lg ${
              isUrdu ? 'font-urdu' : ''
            }`}
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 px-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{isUrdu ? 'پرائیویسی ریڈیکشن ایکٹو ہے' : 'Auto Privacy Redaction Active'}</span>
              {isRedactedNotice && (
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[10px] font-semibold animate-pulse">
                  {isUrdu ? 'حساس ڈیٹا ریڈیکٹڈ' : 'CNIC/Phone Redacted'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {question && (
                <button
                  type="button"
                  onClick={() => { setQuestion(''); setIsRedactedNotice(false); }}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {isUrdu ? 'صاف کریں' : 'Clear'}
                </button>
              )}

              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="glow-button px-5 py-2 rounded-xl text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isUrdu ? 'تلاش جاری ہے...' : 'Searching...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isUrdu ? 'سوال پوچھیں' : 'Ask Question'}</span>
                    <svg className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Example chips */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-medium px-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{isUrdu ? 'مشہور ترین سوالات:' : 'Try these questions:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {exampleChips.map((chip, idx) => {
            const chipText = isUrdu ? chip.ur : chip.en;
            return (
              <button
                key={idx}
                onClick={() => handleChipClick(chipText)}
                disabled={isLoading}
                className={`text-xs bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 rounded-full px-3 py-1.5 transition-all text-left ${
                  isUrdu ? 'font-urdu' : ''
                }`}
              >
                {chipText}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
