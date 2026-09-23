import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';
import { Menu, X } from 'lucide-react';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const {
    data,
    currentPath,
    navigate,
    selectedYear,
    setSelectedYear,
    selectedCategory,
    setSelectedCategory,
    clearFilters,
    isAdmin,
    setHasEntered,
  } = usePortfolio();

  const artistName = data?.settings.artistName || 'OLIVA BISWAS';
  // Split name for the two-line presentation like in the reference image
  const nameParts = artistName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Oliva';
  const lastName = nameParts.slice(1).join(' ') || 'Biswas';

  // Extract unique sorted years combining configured custom years and artworks
  const years = React.useMemo(() => {
    const set = new Set<string>();
    const custom = data?.settings?.customYears || data?.years || ['2025', '2024', '2023', '2022', '2021', '2020'];
    custom.forEach(y => set.add(String(y)));
    data?.artworks?.forEach(a => {
      if (a.year) set.add(String(a.year));
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [data?.settings?.customYears, data?.years, data?.artworks]);

  const categories = data?.categories || [];

  const handleArtistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearFilters();
    setHasEntered(true);
    navigate('/');
    onItemClick?.();
  };

  const handleYearClick = (year: string) => {
    setHasEntered(true);
    if (selectedYear === year) {
      setSelectedYear(null);
    } else {
      setSelectedYear(year);
      setSelectedCategory(null);
    }
    if (currentPath !== '/') {
      navigate('/');
    }
    onItemClick?.();
  };

  const handleCategoryClick = (slug: string) => {
    setHasEntered(true);
    if (selectedCategory === slug) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(slug);
      setSelectedYear(null);
    }
    if (currentPath !== '/') {
      navigate('/');
    }
    onItemClick?.();
  };

  const handleNavClick = (path: string) => {
    clearFilters();
    if (path === '/cover') {
      setHasEntered(false);
    } else {
      setHasEntered(true);
    }
    navigate(path);
    onItemClick?.();
  };

  const isHomeActive = currentPath === '/' && !selectedYear && !selectedCategory;

  return (
    <aside className="w-full text-neutral-900 font-sans select-none">
      {/* 1. Artist Brand Name (Two Lines like Juan Arango / Palacios) */}
      <div className="mb-8">
        <a
          href="/"
          onClick={handleArtistClick}
          className="group inline-block focus:outline-hidden"
          title="Return to all works"
        >
          {data?.settings?.headerSubtitle?.trim() ? (
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium block mb-1">
              {data.settings.headerSubtitle}
            </span>
          ) : null}
          <h1 className="text-[19px] sm:text-[21px] font-normal leading-[1.22] tracking-tight text-neutral-950 group-hover:opacity-75 transition-opacity">
            <span className="block">{firstName}</span>
            <span className="block">{lastName}</span>
          </h1>
        </a>
      </div>

      {/* 2. Years list (Vertical, clean, unadorned) */}
      {years.length > 0 && (
        <div className="mb-8 space-y-1.5 text-[13.5px]">
          {years.map(y => {
            const isYearActive = currentPath === '/' && selectedYear === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => handleYearClick(y)}
                className={`block text-left transition-colors cursor-pointer py-0.5 ${
                  isYearActive
                    ? 'text-neutral-950 font-bold'
                    : 'text-neutral-600 hover:text-neutral-950 font-normal'
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Categories / Disciplines (Uppercase, minimal) */}
      {categories.length > 0 && (
        <div className="mb-8 space-y-2 text-[12.5px] uppercase tracking-wider">
          {categories.map(cat => {
            const isCatActive = currentPath === '/' && selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`block text-left transition-colors cursor-pointer leading-snug ${
                  isCatActive
                    ? 'text-neutral-950 font-bold'
                    : 'text-neutral-600 hover:text-neutral-950 font-normal'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Pages Navigation */}
      <div className="space-y-1.5 text-[13.5px]">
        <button
          type="button"
          onClick={() => handleNavClick('/cover')}
          className={`block text-left transition-colors cursor-pointer py-0.5 ${
            currentPath === '/cover'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-600 hover:text-neutral-950 font-normal'
          }`}
        >
          Cover
        </button>
        <button
          type="button"
          onClick={() => handleNavClick('/about')}
          className={`block text-left transition-colors cursor-pointer py-0.5 ${
            currentPath === '/about'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-600 hover:text-neutral-950 font-normal'
          }`}
        >
          About
        </button>
        <button
          type="button"
          onClick={() => handleNavClick('/cv')}
          className={`block text-left transition-colors cursor-pointer py-0.5 ${
            currentPath === '/cv'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-600 hover:text-neutral-950 font-normal'
          }`}
        >
          CV
        </button>
        <button
          type="button"
          onClick={() => handleNavClick('/exhibitions')}
          className={`block text-left transition-colors cursor-pointer py-0.5 ${
            currentPath === '/exhibitions'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-600 hover:text-neutral-950 font-normal'
          }`}
        >
          Exhibitions
        </button>
        <button
          type="button"
          onClick={() => handleNavClick('/contact')}
          className={`block text-left transition-colors cursor-pointer py-0.5 ${
            currentPath === '/contact'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-600 hover:text-neutral-950 font-normal'
          }`}
        >
          Contact
        </button>
        <button
          type="button"
          onClick={() => handleNavClick('/admin')}
          className={`block text-left transition-colors cursor-pointer py-0.5 ${
            currentPath.startsWith('/admin')
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-600 hover:text-neutral-950 font-normal'
          }`}
        >
          Admin
        </button>
      </div>

      {/* 5. The subtle "." dot admin link at the bottom, exactly as in the reference image */}
      <div className="mt-8 pt-2">
        <a
          href="/admin"
          onClick={e => {
            e.preventDefault();
            handleNavClick('/admin');
          }}
          className="text-neutral-400 hover:text-neutral-900 text-sm inline-block px-1 select-none transition-colors"
          title={isAdmin ? 'Admin Dashboard' : 'Admin Login'}
        >
          .
        </a>
      </div>
    </aside>
  );
};
