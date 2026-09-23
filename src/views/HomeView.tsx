import React, { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';
import { Artwork } from '../types.js';

export const HomeView: React.FC = () => {
  const { data, navigate, selectedYear, selectedCategory, clearFilters } = usePortfolio();

  const artworks = data?.artworks || [];

  // Filter artworks by selectedYear or selectedCategory if active
  const filteredArtworks = useMemo(() => {
    return artworks.filter(art => {
      if (selectedYear && String(art.year) !== selectedYear) {
        return false;
      }
      if (selectedCategory && art.categorySlug !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [artworks, selectedYear, selectedCategory]);

  return (
    <div id="home-view" className="w-full">
      {/* Optional active filter indicator */}
      {(selectedYear || selectedCategory) && (
        <div className="mb-8 flex items-center justify-between border-b border-neutral-100 pb-3 text-xs text-neutral-500 font-mono">
          <div>
            Filtered by:{' '}
            <span className="text-neutral-900 font-medium">
              {selectedYear ? `Year ${selectedYear}` : ''}
              {selectedCategory
                ? data?.categories.find(c => c.slug === selectedCategory)?.name || selectedCategory
                : ''}
            </span>{' '}
            ({filteredArtworks.length} works)
          </div>
          <button
            onClick={clearFilters}
            className="text-neutral-600 hover:text-black underline underline-offset-4 cursor-pointer"
          >
            Show All
          </button>
        </div>
      )}

      {/* 3-Column Artworks Grid matching the exact reference aesthetic */}
      {filteredArtworks.length === 0 ? (
        <div className="py-24 text-center text-neutral-500 font-sans space-y-3">
          <p className="text-sm">No artworks found for this selection.</p>
          <button
            onClick={clearFilters}
            className="text-xs text-neutral-900 underline underline-offset-4"
          >
            Reset to all works
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-16">
          {filteredArtworks.map(artwork => (
            <article
              key={artwork.id}
              onClick={() => navigate(`/artwork/${artwork.slug}`)}
              className="group flex flex-col cursor-pointer"
            >
              {/* Image Frame with natural/clean aspect ratio */}
              <div className="relative aspect-4/5 w-full bg-neutral-50 overflow-hidden flex items-center justify-center">
                <img
                  src={artwork.mainImage}
                  alt={artwork.title}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                  loading="lazy"
                />
                {artwork.videoUrl && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-xs text-white text-[10px] tracking-wider uppercase flex items-center gap-1 font-mono">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Video</span>
                  </div>
                )}
              </div>

              {/* Centered Caption matching the reference site */}
              <div className="mt-4 px-2 text-center space-y-1">
                <h2 className="text-[14px] sm:text-[15px] text-neutral-900 font-normal leading-snug group-hover:text-neutral-600 transition-colors">
                  {artwork.title}
                </h2>
                <div className="text-[12.5px] text-neutral-500 font-light">
                  {artwork.medium ? `${artwork.medium}` : ''}
                  {artwork.year ? ` · ${artwork.year}` : ''}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
