'use client';

export default function LanguageToggle({ currentLang, onLangChange }) {
  const options = [
    { id: 'en', label: 'English' },
    { id: 'ur', label: 'اردو', isUrdu: true },
    { id: 'roman-ur', label: 'Roman Urdu' }
  ];

  return (
    <div className="inline-flex p-1 bg-slate-900/80 border border-slate-800 rounded-xl shadow-inner">
      {options.map((opt) => {
        const isActive = currentLang === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onLangChange(opt.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              isActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            } ${opt.isUrdu ? 'font-urdu text-sm' : ''}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
