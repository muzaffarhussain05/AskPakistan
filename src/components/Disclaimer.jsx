'use client';

export default function Disclaimer() {
  return (
    <div className="w-full bg-slate-900/90 border-b border-amber-500/30 text-amber-200/90 text-xs py-2 px-4 text-center flex items-center justify-center gap-2 shadow-sm">
      <svg className="w-4 h-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>
        <strong>Independent Project</strong> — Not affiliated with the Government of Pakistan. Answers are retrieved strictly from public <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300 border border-amber-800/50">.gov.pk</code> websites.
      </span>
    </div>
  );
}
