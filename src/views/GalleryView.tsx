import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';
import { Search, Eye, X } from 'lucide-react';
import { Lightbox } from '../components/Lightbox.js';
import { Artwork } from '../types.js';

interface GalleryViewProps {
  categorySlug: string;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ categorySlug }) => {
  const { data, navigate } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMedium, setSelectedMedium] = useState<string>('all');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  const isAllWorks = categorySlug === 'works' || categorySlug === 'all-works' || categorySlug === 'all';
  const category = !isAllWorks ? data?.categories.find(c => c.slug === categorySlug) : undefined;
  const categoryName = isAllWorks
    ? 'All Works'
    : category
    ? category.name
    : categorySlug.replace(/-/g, ' ').toUpperCase();

  // Filter artworks belonging to this category or all
  const categoryArtworks = useMemo(() => {
    if (!data?.artworks) return [];
    if (isAllWorks) return data.artworks;
    return data.artworks.filter(a => a.categorySlug === categorySlug);
  }, [data?.artworks, categorySlug, isAllWorks]);

  // Extract unique years sorted descending
  const years = useMemo(() => {
    const set = new Set<string>();
    categoryArtworks.forEach(a => {
      if (a.year) set.add(String(a.year));
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [categoryArtworks]);

  const mediums = useMemo(() => {
    const set = new Set<string>();
    categoryArtworks.forEach(a => {
      if (a.medium) {
        // Extract primary medium words
        const primary = a.medium.split(',')[0].trim();
        if (primary) set.add(primary);
      }
    });
    return Array.from(set).sort();
  }, [categoryArtworks]);

  // Filtered artworks
  const filteredArtworks = useMemo(() => {
    return categoryArtworks.filter(a => {
      const matchesSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.medium.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(a.year).includes(searchQuery);

      const matchesYear = selectedYear === 'all' || String(a.year) === selectedYear;
      const matchesMedium =
        selectedMedium === 'all' || a.medium.toLowerCase().includes(selectedMedium.toLowerCase());

      return matchesSearch && matchesYear && matchesMedium;
    });
  }, [categoryArtworks, searchQuery, selectedYear, selectedMedium]);

  const handleQuickView = (e: React.MouseEvent, artwork: Artwork) => {
    e.stopPropagation();
    setSelectedArtwork(artwork);
    setLightboxImageIndex(0);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedYear('all');
    setSelectedMedium('all');
  };

  return (
    <div id="gallery-view" className="w-full pb-24">
      {/* Category Header */}
      <div className="mb-10 border-b border-neutral-200 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 font-medium">
              Portfolio Archive
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl tracking-wide uppercase text-neutral-900 font-normal">
              {categoryName}
            </h1>
            {category?.description && (
              <p className="text-sm text-neutral-600 font-light leading-relaxed pt-2">
                {category.description}
              </p>
            )}
          </div>

          <div className="text-xs tracking-widest uppercase text-neutral-500 font-mono">
            Showing {filteredArtworks.length} of {categoryArtworks.length} works
          </div>
        </div>

        {/* Minimalist Side-by-Side Years Bar (No dropdown select) */}
        {years.length > 0 && (
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto py-1 no-scrollbar text-xs font-mono tracking-widest uppercase">
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-sans font-medium shrink-0">
                  Year:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedYear('all')}
                  className={`shrink-0 transition-all cursor-pointer pb-1 ${
                    selectedYear === 'all'
                      ? 'text-neutral-900 font-bold border-b-2 border-neutral-900'
                      : 'text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  ALL
                </button>
                {years.map(y => {
                  const count = categoryArtworks.filter(a => String(a.year) === y).length;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setSelectedYear(y)}
                      className={`shrink-0 transition-all cursor-pointer pb-1 ${
                        selectedYear === y
                          ? 'text-neutral-900 font-bold border-b-2 border-neutral-900'
                          : 'text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      {y}
                      <span className="text-[10px] ml-1 opacity-50 font-normal">({count})</span>
                    </button>
                  );
                })}
              </div>

              {(selectedYear !== 'all' || selectedMedium !== 'all' || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900 underline underline-offset-4 self-start sm:self-auto"
                >
                  Show All
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search & Optional Medium Bar */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search works..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 text-xs bg-transparent border-b border-neutral-300 focus:outline-hidden focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-light"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {mediums.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium shrink-0">
                Medium:
              </span>
              <button
                onClick={() => setSelectedMedium('all')}
                className={`px-2 py-0.5 text-[11px] uppercase tracking-wider rounded-xs transition-colors shrink-0 ${
                  selectedMedium === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                All
              </button>
              {mediums.slice(0, 5).map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMedium(m)}
                  className={`px-2 py-0.5 text-[11px] uppercase tracking-wider rounded-xs transition-colors shrink-0 ${
                    selectedMedium === m
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Artworks Gallery Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="py-20 text-center space-y-4 border border-dashed border-neutral-200 p-8">
          <p className="font-serif text-2xl text-neutral-700">No artworks found</p>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {categoryArtworks.length === 0
              ? `There are currently no catalogued works in the ${categoryName} category. You can add new artworks via the Admin Panel.`
              : 'No artworks matched your current filter or search criteria.'}
          </p>
          {(searchQuery || selectedYear !== 'all' || selectedMedium !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-5 py-2 text-xs uppercase tracking-widest bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {filteredArtworks.map(artwork => (
            <div
              key={artwork.id}
              onClick={() => navigate(`/artwork/${artwork.slug}`)}
              className="group flex flex-col cursor-pointer"
            >
              {/* Image Frame */}
              <div className="relative aspect-4/5 overflow-hidden bg-neutral-100 border border-neutral-200 group-hover:border-neutral-400 transition-all">
                <img
                  src={artwork.mainImage}
                  alt={artwork.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  loading="lazy"
                />

                {/* Badges: Featured / Multiple images count */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                  {artwork.isFeatured && (
                    <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest bg-black/80 text-white backdrop-blur-xs font-mono">
                      Featured
                    </span>
                  )}
                  {artwork.images && artwork.images.length > 1 && (
                    <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest bg-white/90 text-black backdrop-blur-xs font-mono">
                      {artwork.images.length} Views
                    </span>
                  )}
                </div>

                {/* Hover overlay with Quick Lightbox button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={e => handleQuickView(e, artwork)}
                    className="px-4 py-2 bg-white text-black text-[11px] uppercase tracking-widest font-medium flex items-center gap-1.5 shadow-xl hover:bg-neutral-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Lightbox
                  </button>
                </div>
              </div>

              {/* Artwork Information with Year positioned clearly on the side */}
              <div className="pt-3.5 flex items-start justify-between gap-4">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-neutral-900 group-hover:text-neutral-600 transition-colors font-normal truncate">
                    {artwork.title}
                  </h3>
                  <div className="text-xs text-neutral-600 font-light truncate">{artwork.medium}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">{artwork.dimensions}</div>
                </div>
                <div className="text-right shrink-0 pt-0.5">
                  <span className="text-xs text-neutral-600 font-mono font-medium tracking-wider">
                    {artwork.year}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox for Quick View */}
      <Lightbox
        isOpen={Boolean(selectedArtwork)}
        artwork={selectedArtwork}
        imageIndex={lightboxImageIndex}
        onClose={() => setSelectedArtwork(null)}
        onPrev={() => setLightboxImageIndex(i => Math.max(0, i - 1))}
        onNext={() =>
          setLightboxImageIndex(i =>
            Math.min((selectedArtwork?.images?.length || 1) - 1, i + 1)
          )
        }
        onSelectImageIndex={setLightboxImageIndex}
      />
    </div>
  );
};
