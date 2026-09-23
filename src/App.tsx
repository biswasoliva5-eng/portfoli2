import React, { useEffect, useState } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext.js';
import { Sidebar } from './components/Sidebar.js';
import { ToastContainer } from './components/ToastContainer.js';
import { HomeView } from './views/HomeView.js';
import { GalleryView } from './views/GalleryView.js';
import { ArtworkDetailView } from './views/ArtworkDetailView.js';
import { AboutView } from './views/AboutView.js';
import { ExhibitionsView } from './views/ExhibitionsView.js';
import { CVView } from './views/CVView.js';
import { ContactView } from './views/ContactView.js';
import { CoverView } from './views/CoverView.js';
import { AdminView } from './views/admin/AdminView.js';
import { AdminLoginView } from './views/admin/AdminLoginView.js';
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPath, data, loading, clearFilters, navigate, hasEntered } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Update browser document title based on current view
  useEffect(() => {
    const baseTitle = data?.settings.siteTitle || 'Oliva Biswas';
    if (currentPath === '/') {
      document.title = baseTitle;
    } else if (currentPath.startsWith('/admin')) {
      document.title = `Admin | Oliva Biswas Studio`;
    } else if (currentPath === '/about') {
      document.title = `About | Oliva Biswas`;
    } else if (currentPath === '/exhibitions') {
      document.title = `Exhibitions | Oliva Biswas`;
    } else if (currentPath === '/cv') {
      document.title = `CV | Oliva Biswas`;
    } else if (currentPath === '/contact') {
      document.title = `Contact | Oliva Biswas`;
    } else if (currentPath.startsWith('/artwork/')) {
      const slug = currentPath.replace('/artwork/', '');
      const art = data?.artworks.find(a => a.slug === slug);
      document.title = art ? `${art.title} (${art.year}) | Oliva Biswas` : `Artwork | Oliva Biswas`;
    } else {
      const catSlug = currentPath.replace(/^\//, '');
      const cat = data?.categories.find(c => c.slug === catSlug);
      document.title = cat ? `${cat.name} | Oliva Biswas` : baseTitle;
    }
  }, [currentPath, data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-lg font-normal tracking-tight text-neutral-900">
            Oliva Biswas
          </div>
          <div className="text-xs text-neutral-400 font-sans tracking-widest uppercase">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // 1. Admin Routes (rendered in its own self-contained view)
  if (currentPath === '/admin/login') {
    return (
      <>
        <AdminLoginView />
        <ToastContainer />
      </>
    );
  }

  if (currentPath.startsWith('/admin')) {
    return (
      <>
        <AdminView />
        <ToastContainer />
      </>
    );
  }

  // Cover Screen Route (Full-Screen Hero Presentation)
  // Shows full-screen cover on initial landing until user clicks ENTER, or if navigated to /cover
  const isCover = currentPath === '/cover' || (currentPath === '/' && !hasEntered);

  if (isCover) {
    return (
      <>
        <CoverView />
        <ToastContainer />
      </>
    );
  }

  // 2. Public Routes (Inside Minimal Sidebar Layout)
  let mainView: React.ReactNode = null;

  if (currentPath === '/') {
    mainView = <HomeView />;
  } else if (currentPath === '/about') {
    mainView = <AboutView />;
  } else if (currentPath === '/exhibitions') {
    mainView = <ExhibitionsView />;
  } else if (currentPath === '/cv') {
    mainView = <CVView />;
  } else if (currentPath === '/contact') {
    mainView = <ContactView />;
  } else if (currentPath.startsWith('/artwork/')) {
    const slug = currentPath.replace('/artwork/', '');
    mainView = <ArtworkDetailView slug={slug} />;
  } else {
    // Check if category slug matches
    const catSlug = currentPath.replace(/^\//, '');
    mainView = <GalleryView categorySlug={catSlug} />;
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            clearFilters();
            navigate('/');
          }}
          className="text-left"
        >
          <span className="font-normal text-base text-neutral-950 block leading-tight">
            {data?.settings.artistName || 'Oliva Biswas'}
          </span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-neutral-700 hover:text-black"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-20 bg-white px-8 py-6 overflow-y-auto border-b border-neutral-200">
          <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Left Sidebar (Sticky, clean, minimal like reference) */}
      <div className="hidden md:block w-48 lg:w-56 shrink-0 sticky top-0 h-screen overflow-y-auto pt-12 pb-10 pl-8 lg:pl-12 pr-4 border-r border-transparent">
        <Sidebar />
      </div>

      {/* Main Content Area (Right) */}
      <main className="flex-1 min-w-0 min-h-screen pt-8 md:pt-12 pb-24 px-6 md:px-10 lg:px-14">
        {mainView}
      </main>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}
