import React from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';
import { CoverPosition } from '../types.js';

export const CoverView: React.FC = () => {
  const { data, navigate, enterPortfolio } = usePortfolio();

  const settings = data?.settings;
  const artistName = settings?.artistName || 'OLIVA BISWAS';
  const headerSubtitle = settings?.headerSubtitle?.trim() || '';
  const coverImage =
    settings?.coverImage ||
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=2400&auto=format&fit=crop';
  const enterText = settings?.enterButtonText || 'ENTER';

  // Positioning configuration (Defaults: Name on bottom-left, Enter on bottom-right)
  const namePos: CoverPosition = settings?.coverNamePosition || 'bottom-left';
  const enterPos: CoverPosition = settings?.coverEnterPosition || 'bottom-right';

  // Typography & Sizing configuration
  const nameFontSizeKey = settings?.coverNameFontSize || '8xl';
  const subtitleFontSizeKey = settings?.coverSubtitleFontSize || 'sm';
  const enterFontSizeKey = settings?.coverEnterFontSize || 'sm';
  const fontFamilyKey = settings?.coverFontFamily || 'sans';
  const letterSpacingKey = settings?.coverNameLetterSpacing || 'wider';
  const enterShapeKey = settings?.coverEnterShape || 'rectangle';
  const overlayStyleKey = settings?.coverOverlayStyle || 'gradient';

  // Colors
  const nameColor = settings?.coverNameColor || '#ffffff';
  const subtitleColor = settings?.coverSubtitleColor || 'rgba(255, 255, 255, 0.85)';
  const enterTextColor = settings?.coverEnterTextColor || '#ffffff';
  const enterBgColor =
    settings?.coverEnterBgColor && settings.coverEnterBgColor !== 'transparent'
      ? settings.coverEnterBgColor
      : 'transparent';
  const enterBorderColor = settings?.coverEnterBorderColor || '#ffffff';

  const handleEnter = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    enterPortfolio();
  };

  // Font size classes mapping
  const getNameFontSizeClass = () => {
    switch (nameFontSizeKey) {
      case '9xl':
        return 'text-5xl sm:text-7xl md:text-8xl lg:text-9xl';
      case '7xl':
        return 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl';
      case '6xl':
        return 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl';
      case '5xl':
        return 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl';
      case '4xl':
        return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';
      case '8xl':
      default:
        return 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl';
    }
  };

  const getSubtitleFontSizeClass = () => {
    switch (subtitleFontSizeKey) {
      case 'xs':
        return 'text-[9px] sm:text-[11px] tracking-[0.3em]';
      case 'base':
        return 'text-xs sm:text-sm tracking-[0.3em]';
      case 'lg':
        return 'text-sm sm:text-base tracking-[0.25em]';
      case 'sm':
      default:
        return 'text-[11px] sm:text-[13px] tracking-[0.35em]';
    }
  };

  const getEnterButtonSizeClass = () => {
    switch (enterFontSizeKey) {
      case 'xs':
        return 'px-6 sm:px-8 py-1.5 sm:py-2 text-[10px] sm:text-xs tracking-[0.25em]';
      case 'base':
        return 'px-9 sm:px-14 py-2.5 sm:py-3 text-sm sm:text-base tracking-[0.3em]';
      case 'lg':
        return 'px-10 sm:px-16 py-3 sm:py-3.5 text-base sm:text-lg tracking-[0.3em]';
      case 'sm':
      default:
        return 'px-8 sm:px-12 py-2 sm:py-2.5 text-xs sm:text-sm tracking-[0.28em]';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamilyKey) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  const getLetterSpacingClass = () => {
    switch (letterSpacingKey) {
      case 'normal':
        return 'tracking-normal';
      case 'wide':
        return 'tracking-[0.08em]';
      case 'widest':
        return 'tracking-[0.25em]';
      case 'wider':
      default:
        return 'tracking-[0.14em]';
    }
  };

  const getEnterShapeClass = () => {
    switch (enterShapeKey) {
      case 'rounded':
        return 'rounded-md';
      case 'pill':
        return 'rounded-full';
      case 'rectangle':
      default:
        return 'rounded-none';
    }
  };

  // Overlay class
  const getOverlayClass = () => {
    switch (overlayStyleKey) {
      case 'dark':
        return 'bg-black/70';
      case 'medium':
        return 'bg-black/45';
      case 'light':
        return 'bg-black/20';
      case 'none':
        return 'bg-transparent';
      case 'gradient':
      default:
        return 'bg-gradient-to-t from-black/85 via-black/25 to-black/30';
    }
  };

  // Position classes mapping
  const getPositionClasses = (position: CoverPosition) => {
    switch (position) {
      case 'bottom-center':
        return 'absolute bottom-6 sm:bottom-10 md:bottom-12 lg:bottom-16 left-1/2 -translate-x-1/2 text-center items-center';
      case 'bottom-right':
        return 'absolute bottom-6 right-6 sm:bottom-10 sm:right-10 md:bottom-12 md:right-12 lg:bottom-16 lg:right-16 text-right items-end';
      case 'center':
        return 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center items-center';
      case 'top-left':
        return 'absolute top-6 left-6 sm:top-10 sm:left-10 md:top-12 md:left-12 lg:top-16 lg:left-16 text-left items-start';
      case 'top-center':
        return 'absolute top-6 sm:top-10 md:top-12 lg:top-16 left-1/2 -translate-x-1/2 text-center items-center';
      case 'top-right':
        return 'absolute top-16 right-6 sm:top-20 sm:right-10 md:right-12 lg:right-16 text-right items-end';
      case 'bottom-left':
      default:
        return 'absolute bottom-6 left-6 sm:bottom-10 sm:left-10 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16 text-left items-start';
    }
  };

  const isSamePosition = namePos === enterPos;

  // Subtitle component
  const SubtitleBlock = headerSubtitle ? (
    <div
      style={{ color: subtitleColor }}
      className={`uppercase font-light mb-2 sm:mb-3 drop-shadow-md ${getSubtitleFontSizeClass()}`}
    >
      {headerSubtitle}
    </div>
  ) : null;

  // Artist Name component
  const ArtistNameBlock = (
    <h1
      style={{ color: nameColor }}
      className={`font-normal uppercase leading-[1.05] drop-shadow-lg ${getNameFontSizeClass()} ${getFontFamilyClass()} ${getLetterSpacingClass()}`}
    >
      {artistName}
    </h1>
  );

  // Enter button component
  const EnterButtonBlock = (
    <button
      id="cover-enter-btn"
      type="button"
      onClick={handleEnter}
      style={{
        color: enterTextColor,
        backgroundColor: enterBgColor,
        borderColor: enterBorderColor,
      }}
      className={`border uppercase font-light shadow-sm cursor-pointer backdrop-blur-xs transition-all duration-300 hover:brightness-110 active:scale-95 ${getEnterButtonSizeClass()} ${getEnterShapeClass()}`}
    >
      {enterText}
    </button>
  );

  return (
    <div
      id="portfolio-cover-screen"
      onClick={handleEnter}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-black select-none cursor-pointer flex items-center justify-center"
    >
      {/* 1. Full-bleed background artwork image */}
      <img
        src={coverImage}
        alt={`${artistName} Artwork Cover`}
        className="absolute inset-0 w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out hover:scale-102"
      />

      {/* 2. Ambient contrast scrim */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${getOverlayClass()}`} />

      {/* Top right Admin shortcut */}
      <a
        href="/admin"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          navigate('/admin');
        }}
        className="absolute top-5 right-6 z-20 text-white/60 hover:text-white text-[11px] uppercase tracking-[0.25em] font-normal transition-colors py-1.5 px-3 border border-white/20 hover:border-white/60 bg-black/30 backdrop-blur-xs cursor-pointer"
        title="Admin CMS Login"
      >
        Admin
      </a>

      {/* 3. Render Name and Enter Button */}
      {isSamePosition ? (
        /* Render together in one unified container */
        <div
          onClick={e => e.stopPropagation()}
          className={`z-10 p-4 max-w-4xl flex flex-col gap-5 sm:gap-7 pointer-events-auto ${getPositionClasses(namePos)}`}
        >
          <div>
            {SubtitleBlock}
            {ArtistNameBlock}
          </div>
          <div>{EnterButtonBlock}</div>
        </div>
      ) : (
        /* Render independently at distinct configured positions */
        <>
          {/* Artist Name Block */}
          <div
            onClick={e => e.stopPropagation()}
            className={`z-10 p-4 max-w-3xl lg:max-w-4xl flex flex-col pointer-events-auto ${getPositionClasses(namePos)}`}
          >
            {SubtitleBlock}
            {ArtistNameBlock}
          </div>

          {/* Enter Button Block */}
          <div
            onClick={e => e.stopPropagation()}
            className={`z-10 p-4 pointer-events-auto ${getPositionClasses(enterPos)}`}
          >
            {EnterButtonBlock}
          </div>
        </>
      )}
    </div>
  );
};

