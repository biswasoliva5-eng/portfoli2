import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Mail, Share2, Check, Video, Image as ImageIcon } from 'lucide-react';
import { Lightbox } from '../components/Lightbox.js';

interface ArtworkDetailViewProps {
  slug: string;
}

export const ArtworkDetailView: React.FC<ArtworkDetailViewProps> = ({ slug }) => {
  const { data, navigate } = usePortfolio();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video'>('image');

  // Find artwork
  const artwork = useMemo(() => {
    if (!data?.artworks) return null;
    return data.artworks.find(a => a.slug === slug || a.id === slug);
  }, [data?.artworks, slug]);

  // Find siblings in same category for prev/next
  const siblings = useMemo(() => {
    if (!data?.artworks || !artwork) return [];
    return data.artworks.filter(a => a.categorySlug === artwork.categorySlug);
  }, [data?.artworks, artwork]);

  const currentIndex = siblings.findIndex(a => a.id === artwork?.id);
  const prevArtwork = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextArtwork = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  if (!artwork) {
    return (
      <div className="min-h-screen pt-40 pb-24 max-w-4xl mx-auto px-6 text-center space-y-6">
        <h1 className="font-serif text-3xl text-neutral-900">Artwork Not Found</h1>
        <p className="text-xs text-neutral-500">
          The requested artwork could not be located or has been archived.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 text-xs uppercase tracking-widest bg-neutral-900 text-white"
        >
          Return to Portfolio
        </button>
      </div>
    );
  }

  const allImages =
    artwork.images && artwork.images.length > 0
      ? artwork.images
      : [{ id: 'main', url: artwork.mainImage, alt: artwork.title, order: 1, isPrimary: true }];

  const currentDisplayImage = allImages[activeImageIndex] || allImages[0];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInquire = () => {
    navigate(`/contact?subject=${encodeURIComponent(`Inquiry: ${artwork.title} (${artwork.year})`)}`);
  };

  return (
    <div id="artwork-detail-view" className="w-full pb-20">
      {/* Navigation Top Bar */}
      <div className="pb-6 mb-8 border-b border-neutral-100 flex items-center justify-between text-xs tracking-wider">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Works</span>
        </button>

        {/* Prev / Next within category */}
        <div className="flex items-center gap-6 text-neutral-500 text-xs">
          {prevArtwork ? (
            <button
              onClick={() => navigate(`/artwork/${prevArtwork.slug}`)}
              className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer"
              title={prevArtwork.title}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <span className="opacity-30 cursor-not-allowed flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Previous
            </span>
          )}

          <span className="text-neutral-200">/</span>

          {nextArtwork ? (
            <button
              onClick={() => navigate(`/artwork/${nextArtwork.slug}`)}
              className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer"
              title={nextArtwork.title}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="opacity-30 cursor-not-allowed flex items-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* Main Detail Grid: Left large image/video + gallery, Right technical info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Main Viewer & Thumbnails */}
          <div className="lg:col-span-8 space-y-6">
            {/* If artwork has video, show switcher tabs */}
            {artwork.videoUrl && (
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('image')}
                  className={`px-4 py-2 text-xs uppercase tracking-widest flex items-center gap-2 font-medium transition-colors ${
                    activeMediaTab === 'image'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Images ({allImages.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className={`px-4 py-2 text-xs uppercase tracking-widest flex items-center gap-2 font-medium transition-colors ${
                    activeMediaTab === 'video'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Documentation</span>
                </button>
              </div>
            )}

            {activeMediaTab === 'video' && artwork.videoUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-16/10 bg-black overflow-hidden border border-neutral-200 shadow-xs flex items-center justify-center">
                  <video
                    src={artwork.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support HTML5 video.
                  </video>
                </div>
                {artwork.videoTitle && (
                  <p className="text-xs text-neutral-600 font-mono italic">
                    {artwork.videoTitle}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div
                  onClick={() => setLightboxOpen(true)}
                  className="relative aspect-4/3 sm:aspect-16/11 bg-neutral-100 border border-neutral-200 overflow-hidden cursor-zoom-in group shadow-xs"
                >
                  <img
                    src={currentDisplayImage.url}
                    alt={currentDisplayImage.alt || artwork.title}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-101"
                  />
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/75 text-white text-[10px] tracking-widest uppercase flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                    <Eye className="w-3.5 h-3.5" /> Fullscreen Lightbox
                  </div>
                </div>

                {/* Thumbnails if more than 1 image */}
                {allImages.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {allImages.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-20 h-20 shrink-0 border transition-all overflow-hidden bg-neutral-100 ${
                          idx === activeImageIndex
                            ? 'border-neutral-900 scale-102 shadow-xs'
                            : 'border-neutral-300 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Technical Details & Description */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
            <div className="space-y-3 pb-6 border-b border-neutral-200">
              <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 font-medium">
                {artwork.categoryName}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl tracking-wide text-neutral-900 font-normal">
                {artwork.title}
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-700 tracking-wider pt-1">
                <span className="uppercase text-neutral-400 text-[10px] tracking-[0.25em]">Year:</span>
                <span className="font-semibold text-neutral-900">{artwork.year}</span>
              </div>
            </div>

            {/* Medium & Dimensions specifications */}
            <div className="space-y-4 text-xs tracking-wider">
              <div>
                <span className="uppercase text-neutral-400 block text-[10px] tracking-[0.2em] mb-1">
                  Medium
                </span>
                <p className="text-neutral-800 leading-relaxed font-light">{artwork.medium}</p>
              </div>

              <div>
                <span className="uppercase text-neutral-400 block text-[10px] tracking-[0.2em] mb-1">
                  Dimensions
                </span>
                <p className="text-neutral-800 font-mono">{artwork.dimensions}</p>
              </div>

              {artwork.notes && (
                <div>
                  <span className="uppercase text-neutral-400 block text-[10px] tracking-[0.2em] mb-1">
                    Provenance / Collection
                  </span>
                  <p className="text-neutral-600 italic font-serif text-sm">{artwork.notes}</p>
                </div>
              )}
            </div>

            {/* Description / Artist statement on artwork */}
            {artwork.description && (
              <div className="pt-4 border-t border-neutral-100">
                <span className="uppercase text-neutral-400 block text-[10px] tracking-[0.2em] mb-2">
                  Work Notes
                </span>
                <p className="text-sm text-neutral-700 font-light leading-relaxed whitespace-pre-line">
                  {artwork.description}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-6 border-t border-neutral-200 space-y-3">
              <button
                onClick={handleInquire}
                className="w-full py-3.5 px-6 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" /> Inquire About This Work
              </button>

              <button
                onClick={handleShare}
                className="w-full py-2.5 px-6 border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" /> Link Copied
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" /> Share Work
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        artwork={artwork}
        imageIndex={activeImageIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setActiveImageIndex(i => Math.max(0, i - 1))}
        onNext={() => setActiveImageIndex(i => Math.min(allImages.length - 1, i + 1))}
        onSelectImageIndex={setActiveImageIndex}
      />
    </div>
  );
};
