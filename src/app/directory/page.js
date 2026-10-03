'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import sourcesData from '../../../data/sources.json';

export default function DirectoryPage() {
  const [currentLang, setCurrentLang] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');

  const filteredSources = sourcesData.filter((src) => {
    const matchesSearch = src.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          src.baseUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || src.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen">
      <Navbar currentLang={currentLang} onLangChange={setCurrentLang} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
            <span>Verified Domain Index</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Official Indexed Websites Directory
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Ask Pakistan indexes public documents exclusively from official Pakistani government websites ending in <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">.gov.pk</code>.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by agency or URL..."
            className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Topics ({sourcesData.length})</option>
              <option value="id">ID & Identity</option>
              <option value="passport">Passport</option>
              <option value="tax">Tax & Filer</option>
              <option value="jobs">Jobs & Exams</option>
              <option value="support">Social Support</option>
              <option value="business">Business & SECP</option>
              <option value="vehicles">Vehicles & License</option>
              <option value="phones">Mobile & PTA</option>
              <option value="education">Education</option>
              <option value="overseas">Overseas Pakistanis</option>
            </select>
          </div>
        </div>

        {/* Sources Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((src) => (
            <div
              key={src.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 flex flex-col justify-between border border-slate-800"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60 uppercase">
                    {src.topic}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Depth: {src.maxDepth || 3}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white">
                  {src.name}
                </h3>
                <a
                  href={src.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline font-mono truncate block"
                >
                  {src.baseUrl}
                </a>
              </div>

              <div className="pt-3 border-t border-slate-800/60 space-y-1 text-xs text-slate-400">
                <div className="font-semibold text-slate-300">Seed URLs:</div>
                <ul className="space-y-0.5 font-mono text-[11px] text-slate-400 truncate">
                  {src.seedUrls.map((seed, idx) => (
                    <li key={idx} className="truncate">• {seed}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
