'use client';

import topicsData from '../../data/topics.json';

export default function TopicGrid({ onSelectQuestion, uiLang = 'en' }) {
  const isUrdu = uiLang === 'ur';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 my-12">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <span>{isUrdu ? 'موضوع کے لحاظ سے تلاش کریں' : 'Browse Services by Topic'}</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          {isUrdu
            ? 'کسی بھی زمرے کا انتخاب کریں اور عام سوالات پر کلک کریں'
            : 'Select any category below to view official guidance & frequent questions'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topicsData.map((topic) => {
          const title = isUrdu ? topic.title.ur : topic.title.en;
          const desc = isUrdu ? topic.description.ur : topic.description.en;

          return (
            <div
              key={topic.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 flex flex-col justify-between border border-slate-800/80"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                    {topic.id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold text-slate-100 ${isUrdu ? 'font-urdu' : ''}`}>
                      {title}
                    </h3>
                    <p className={`text-xs text-slate-400 ${isUrdu ? 'font-urdu' : ''}`}>
                      {desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample pre-filled question links */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                {topic.questions.map((q, idx) => {
                  const qText = isUrdu ? q.ur : q.en;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSelectQuestion(qText)}
                      className={`w-full text-left text-xs p-2 rounded-lg bg-slate-900/60 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 transition-colors flex items-center justify-between group ${
                        isUrdu ? 'font-urdu text-right' : ''
                      }`}
                    >
                      <span className="truncate pr-2">{qText}</span>
                      <svg className={`w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 ${isUrdu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
