import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Artwork } from '../types.js';

interface LightboxProps {
  isOpen: boolean;
  artwork: Artwork | null;
  imageIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectImageIndex: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  artwork,
  imageIndex,
  onClose,
  onPrev,
  onNext,
  onSelectImageIndex,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !artwork) return null;

  const currentImage =
    artwork.images && artwork.images[imageIndex]
      ? artwork.images[imageIndex].url
      : artwork.mainImage;

  const totalImages = artwork.images?.length || 1;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div
      id="artwork-lightbox-overlay"
      className="fixed inset-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-md flex flex-col text-neutral-200 animate-in fade-in duration-200"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-black/40">
        <div className="flex items-baseline gap-3">
          <h3 className="font-serif text-lg tracking-wide text-neutral-100 font-normal">
            {artwork.title}
          </h3>
          <span className="text-xs text-neutral-400 font-mono">({artwork.year})</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none">
        {/* Navigation arrows */}
        {totalImages > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/80 text-white rounded-full transition-all border border-neutral-800 z-10"
              title="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/80 text-white rounded-full transition-all border border-neutral-800 z-10"
              title="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <img
          src={currentImage}
          alt={artwork.title}
          className="max-h-[75vh] max-w-[90vw] object-contain shadow-2xl transition-transform duration-300"
        />
      </div>

      {/* Bottom bar: Details & thumbnails */}
      <div className="px-6 py-4 border-t border-neutral-800/80 bg-black/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-neutral-400 space-y-0.5">
          <div className="font-serif text-sm text-neutral-200">{artwork.medium}</div>
          <div>{artwork.dimensions}</div>
        </div>

        {/* Thumbnails if multiple images */}
        {totalImages > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {artwork.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => onSelectImageIndex(idx)}
                className={`w-12 h-12 shrink-0 border transition-all overflow-hidden ${
                  idx === imageIndex
                    ? 'border-white opacity-100 scale-105'
                    : 'border-neutral-700 opacity-50 hover:opacity-80'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
