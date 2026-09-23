import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';
import { MapPin, ExternalLink, Calendar, Filter } from 'lucide-react';
import { ExhibitionType } from '../types.js';

export const ExhibitionsView: React.FC = () => {
  const { data } = usePortfolio();
  const [selectedType, setSelectedType] = useState<string>('all');

  const exhibitions = data?.exhibitions || [];

  const types = useMemo(() => {
    const set = new Set<string>();
    exhibitions.forEach(e => set.add(e.type));
    return Array.from(set);
  }, [exhibitions]);

  const filteredExhibitions = useMemo(() => {
    if (selectedType === 'all') return exhibitions;
    return exhibitions.filter(e => e.type === selectedType);
  }, [exhibitions, selectedType]);

  return (
    <div id="exhibitions-view" className="w-full max-w-3xl pb-24">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-6 mb-10 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-normal text-neutral-950 tracking-tight">
            Exhibitions
          </h1>
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                selectedType === 'all'
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-black'
              }`}
            >
              All ({exhibitions.length})
            </button>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                  selectedType === t
                    ? 'bg-neutral-900 text-white font-medium'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-black'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exhibitions Timeline */}
      {filteredExhibitions.length === 0 ? (
        <div className="py-20 text-center text-xs text-neutral-500">
          No exhibitions catalogued under this filter.
        </div>
      ) : (
        <div className="space-y-12">
          {filteredExhibitions.map(ex => (
            <article
              key={ex.id}
              className="p-8 bg-white border border-neutral-200 hover:border-neutral-400 transition-all space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 text-[10px] tracking-widest uppercase bg-neutral-100 text-neutral-800 font-mono border border-neutral-200">
                    {ex.type}
                  </span>
                  <h2 className="font-serif text-2xl tracking-wide text-neutral-900 group-hover:text-black">
                    {ex.title}
                  </h2>
                </div>

                <div className="text-xs tracking-wider text-neutral-500 font-mono shrink-0">
                  {ex.dateString || ex.year}
                </div>
              </div>

              {/* Venue & Location */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600 font-light">
                <span className="font-medium text-neutral-800">{ex.venue}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {ex.location}
                </span>
              </div>

              {/* Description */}
              {ex.description && (
                <p className="text-sm text-neutral-700 font-light leading-relaxed whitespace-pre-line pt-2">
                  {ex.description}
                </p>
              )}

              {/* External Link */}
              {ex.externalLink && (
                <div className="pt-2">
                  <a
                    href={ex.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-neutral-900 hover:text-neutral-500 underline underline-offset-4"
                  >
                    <span>Exhibition Catalogue / Coverage</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
