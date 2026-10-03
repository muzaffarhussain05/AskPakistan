'use client';

import { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import SourceList from './SourceList';

export default function AnswerCard({ result, isLoading, error }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto glass-panel rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-900/50"></div>
          <div className="h-4 bg-slate-800 rounded w-1/3"></div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-800 rounded w-4/6"></div>
        </div>
        <div className="h-20 bg-slate-900/80 border border-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto glass-panel rounded-2xl p-6 border-red-500/40 bg-red-950/20 text-red-200 space-y-3">
        <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error Processing Question</span>
        </div>
        <p className="text-xs text-red-300">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  const { answer, language, sources, confidence, lastChecked } = result;
  const isUrdu = language === 'ur';

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sanitize rendered markdown safely
  const rawHtml = marked.parse(answer || '');
  const cleanHtml = typeof window !== 'undefined' ? DOMPurify.sanitize(rawHtml) : rawHtml;

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel rounded-2xl p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-800">
      {/* Confidence Header & Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {isUrdu ? 'سرکاری جواب (تصدیق شدہ)' : 'Official Sourced Answer'}
          </span>
          {confidence === 'low' && (
            <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded text-[10px] font-semibold">
              {isUrdu ? 'کم اعتماد' : 'Low Confidence'}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">{isUrdu ? 'کاپی ہو گیا' : 'Copied!'}</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{isUrdu ? 'کاپی کریں' : 'Copy'}</span>
            </>
          )}
        </button>
      </div>

      {/* Low Confidence Warning Banner */}
      {confidence === 'low' && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 text-xs text-amber-200/90 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {isUrdu
              ? 'تنبہی: اس سوال کی معلومات مکمل طور پر واضح نہیں ہیں۔ برائے مہربانی سرکاری ویب سائٹ سے بھی تصدیق کریں۔'
              : 'Notice: This topic has limited matches in our current index. Please double-check details on the official portal links below.'}
          </span>
        </div>
      )}

      {/* Main Answer Text Body */}
      <div
        dir={isUrdu ? 'rtl' : 'ltr'}
        className={`prose prose-invert max-w-none text-slate-100 text-base leading-relaxed ${
          isUrdu ? 'font-urdu text-lg leading-loose' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />

      {/* Source Links List */}
      <SourceList sources={sources} lastChecked={lastChecked} isUrdu={isUrdu} />

      {/* Helpful Feedback Buttons */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span>{isUrdu ? 'کیا یہ جواب کارآمد تھا؟' : 'Was this answer helpful?'}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedback('yes')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              feedback === 'yes'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
            }`}
          >
            👍 {isUrdu ? 'ہاں' : 'Yes'}
          </button>
          <button
            onClick={() => setFeedback('no')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              feedback === 'no'
                ? 'bg-rose-950 text-rose-300 border-rose-600'
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
            }`}
          >
            👎 {isUrdu ? 'نہیں' : 'No'}
          </button>
        </div>
      </div>
    </div>
  );
}
