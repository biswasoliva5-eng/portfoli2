import React from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';

export const AboutView: React.FC = () => {
  const { data, navigate } = usePortfolio();
  const about = data?.about;
  const artistName = data?.settings.artistName || 'Oliva Biswas';

  if (!about) return null;

  return (
    <div id="about-view" className="w-full max-w-4xl pb-24">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-6 mb-10">
        <h1 className="text-xl sm:text-2xl font-normal text-neutral-950 tracking-tight">
          About
        </h1>
      </div>

      {/* Main Grid: Portrait and Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start">
        {/* Left: Portrait */}
        <div className="md:col-span-5 space-y-3">
          <div className="aspect-3/4 bg-neutral-50 overflow-hidden">
            <img
              src={
                about.portraitImage ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop'
              }
              alt={artistName}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-xs text-neutral-400 font-light flex items-center justify-between">
            <span>{artistName}</span>
            <span>{data?.settings.studioLocation || 'Paris / New York'}</span>
          </div>
        </div>

        {/* Right: Bio and Statement */}
        <div className="md:col-span-7 space-y-8">
          {/* Biography */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Biography
            </h2>
            <div className="text-sm text-neutral-800 font-light leading-relaxed whitespace-pre-line">
              {about.biography}
            </div>
          </div>

          {/* Statement */}
          {about.statement && (
            <div className="space-y-3 pt-6 border-t border-neutral-100">
              <h2 className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                Artist Statement
              </h2>
              <div className="text-sm text-neutral-800 font-light leading-relaxed whitespace-pre-line italic">
                "{about.statement}"
              </div>
            </div>
          )}

          {/* Contact link */}
          <div className="pt-4 border-t border-neutral-100">
            <button
              onClick={() => navigate('/contact')}
              className="text-xs text-neutral-900 underline underline-offset-4 hover:text-neutral-600 cursor-pointer"
            >
              Contact & Studio Inquiries →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
