import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, ChevronDown } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.js';

export const Navbar: React.FC = () => {
  const { data, currentPath, navigate, isAdmin, adminUser } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
  }, [currentPath]);

  const categories = data?.categories || [];

  const isCategoryActive = (slug: string) =>
    currentPath === `/${slug}` || currentPath.startsWith(`/${slug}/`);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const isHomePage = currentPath === '/';

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#faf9f6]/95 backdrop-blur-md py-4 border-b border-neutral-200/80 shadow-xs'
          : isHomePage
          ? 'bg-transparent py-6 text-neutral-900'
          : 'bg-[#faf9f6] py-6 border-b border-neutral-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand / Artist Name */}
        <a
          id="brand-logo-link"
          href="/"
          onClick={e => handleLinkClick(e, '/')}
          className="group flex flex-col"
        >
          <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] font-normal uppercase text-neutral-900 group-hover:opacity-75 transition-opacity">
            {data?.settings.artistName || 'OLIVA BISWAS'}
          </span>
          {data?.settings?.headerSubtitle?.trim() ? (
            <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 font-sans mt-0.5">
              {data.settings.headerSubtitle}
            </span>
          ) : null}
        </a>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden lg:flex items-center gap-8 text-xs tracking-[0.18em] uppercase font-sans">
          {/* Categories Dropdown / Direct links */}
          <div className="relative group">
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              className="flex items-center gap-1.5 text-neutral-800 hover:text-neutral-500 transition-colors py-2"
            >
              <span>Works</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Dropdown menu */}
            <div
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
              className={`absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 shadow-xl py-2 transition-all duration-150 ${
                categoriesDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
              }`}
            >
              {categories.map(cat => (
                <a
                  key={cat.id}
                  href={`/${cat.slug}`}
                  onClick={e => handleLinkClick(e, `/${cat.slug}`)}
                  className={`block px-5 py-2.5 text-[11px] tracking-[0.2em] transition-colors ${
                    isCategoryActive(cat.slug)
                      ? 'bg-neutral-100 text-black font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
                  }`}
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links to core categories */}
          {categories.slice(0, 3).map(cat => (
            <a
              key={cat.id}
              href={`/${cat.slug}`}
              onClick={e => handleLinkClick(e, `/${cat.slug}`)}
              className={`transition-colors py-1 relative ${
                isCategoryActive(cat.slug)
                  ? 'text-black font-medium after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-black'
                  : 'text-neutral-700 hover:text-neutral-400'
              }`}
            >
              {cat.name}
            </a>
          ))}

          <a
            href="/exhibitions"
            onClick={e => handleLinkClick(e, '/exhibitions')}
            className={`transition-colors py-1 ${
              currentPath === '/exhibitions'
                ? 'text-black font-medium border-b border-black'
                : 'text-neutral-700 hover:text-neutral-400'
            }`}
          >
            Exhibitions
          </a>

          <a
            href="/about"
            onClick={e => handleLinkClick(e, '/about')}
            className={`transition-colors py-1 ${
              currentPath === '/about'
                ? 'text-black font-medium border-b border-black'
                : 'text-neutral-700 hover:text-neutral-400'
            }`}
          >
            About
          </a>

          <a
            href="/cv"
            onClick={e => handleLinkClick(e, '/cv')}
            className={`transition-colors py-1 ${
              currentPath === '/cv'
                ? 'text-black font-medium border-b border-black'
                : 'text-neutral-700 hover:text-neutral-400'
            }`}
          >
            CV
          </a>

          <a
            href="/contact"
            onClick={e => handleLinkClick(e, '/contact')}
            className={`transition-colors py-1 ${
              currentPath === '/contact'
                ? 'text-black font-medium border-b border-black'
                : 'text-neutral-700 hover:text-neutral-400'
            }`}
          >
            Contact
          </a>

          {/* Admin badge / login link */}
          {isAdmin ? (
            <a
              href="/admin"
              onClick={e => handleLinkClick(e, '/admin')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 text-white text-[10px] tracking-widest hover:bg-neutral-800 transition-colors"
              title="Admin CMS Dashboard"
            >
              <Shield className="w-3 h-3" />
              <span>CMS</span>
            </a>
          ) : (
            <a
              href="/admin/login"
              onClick={e => handleLinkClick(e, '/admin/login')}
              className="opacity-40 hover:opacity-100 transition-opacity p-1 text-neutral-600"
              title="Artist Admin Access"
              aria-label="Admin Login"
            >
              <Shield className="w-3.5 h-3.5" />
            </a>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          {isAdmin && (
            <a
              href="/admin"
              onClick={e => handleLinkClick(e, '/admin')}
              className="p-1.5 bg-neutral-900 text-white text-xs"
            >
              <Shield className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-900 hover:text-neutral-600 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="lg:hidden fixed inset-x-0 top-[73px] bottom-0 bg-[#faf9f6] z-50 overflow-y-auto p-8 flex flex-col justify-between border-t border-neutral-200"
        >
          <div className="space-y-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-medium">
              Portfolio Categories
            </div>
            <div className="space-y-3 pl-2">
              {categories.map(cat => (
                <a
                  key={cat.id}
                  href={`/${cat.slug}`}
                  onClick={e => handleLinkClick(e, `/${cat.slug}`)}
                  className={`block text-xl font-serif tracking-wide transition-colors ${
                    isCategoryActive(cat.slug) ? 'text-black font-semibold' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {cat.name}
                </a>
              ))}
            </div>

            <div className="pt-6 border-t border-neutral-200 space-y-4">
              <a
                href="/exhibitions"
                onClick={e => handleLinkClick(e, '/exhibitions')}
                className="block text-lg font-serif tracking-wide text-neutral-800"
              >
                Exhibitions
              </a>
              <a
                href="/about"
                onClick={e => handleLinkClick(e, '/about')}
                className="block text-lg font-serif tracking-wide text-neutral-800"
              >
                About the Artist
              </a>
              <a
                href="/cv"
                onClick={e => handleLinkClick(e, '/cv')}
                className="block text-lg font-serif tracking-wide text-neutral-800"
              >
                Curriculum Vitae
              </a>
              <a
                href="/contact"
                onClick={e => handleLinkClick(e, '/contact')}
                className="block text-lg font-serif tracking-wide text-neutral-800"
              >
                Contact & Studio
              </a>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-200 flex items-center justify-between text-xs tracking-widest uppercase text-neutral-500">
            <span>{data?.settings.studioLocation || 'Paris / New York'}</span>
            <a
              href={isAdmin ? '/admin' : '/admin/login'}
              onClick={e => handleLinkClick(e, isAdmin ? '/admin' : '/admin/login')}
              className="text-neutral-800 underline underline-offset-4"
            >
              {isAdmin ? `CMS (${adminUser})` : 'Admin Access'}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
