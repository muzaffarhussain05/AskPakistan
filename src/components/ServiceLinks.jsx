'use client';

import servicesData from '../../data/services.json';

export default function ServiceLinks({ uiLang = 'en' }) {
  const isUrdu = uiLang === 'ur';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 my-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{isUrdu ? 'سرکاری پورٹلز کے براہِ راست لنکس' : 'Go Straight to Official Portals'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isUrdu
              ? 'سرکاری ویب سائٹس کے آن لائن خدمات کے پورٹل'
              : 'Direct links to official Pakistani government service portals'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicesData.map((svc) => (
          <a
            key={svc.id}
            href={svc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel glass-panel-hover rounded-2xl p-4 flex items-start justify-between group border border-slate-800"
          >
            <div className="space-y-1 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  {svc.category}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                {svc.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                {svc.description}
              </p>
              <div className="text-[11px] text-emerald-400/80 font-mono pt-1">
                {svc.url}
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
