'use client';

export default function SourceList({ sources, lastChecked, isUrdu = false }) {
  if (!sources || sources.length === 0) return null;

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{isUrdu ? 'سرکاری ذرائع (.gov.pk):' : 'Verified Official Sources (.gov.pk):'}</span>
        </h4>
        {lastChecked && (
          <span className="text-[11px] text-slate-400">
            {isUrdu ? 'آخری چیک:' : 'Last checked:'} {formatDate(lastChecked)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, idx) => (
          <a
            key={idx}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0 mt-0.5">
              [{idx + 1}]
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                {src.title || src.site}
              </div>
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <span>{src.site}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400/80 group-hover:underline truncate">{src.url}</span>
              </div>
            </div>
            <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
