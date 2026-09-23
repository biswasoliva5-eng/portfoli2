import React from 'react';
import { Instagram, Linkedin, Globe, Shield } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.js';

export const Footer: React.FC = () => {
  const { data, navigate, isAdmin } = usePortfolio();
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <footer id="main-footer" className="bg-[#141414] text-neutral-300 pt-20 pb-12 mt-28 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-neutral-800">
          {/* Brand & Artist Statement snippet */}
          <div className="md:col-span-6 space-y-4">
            <h2 className="font-serif text-2xl tracking-[0.25em] uppercase text-white font-light">
              {data?.settings.artistName || 'OLIVA BISWAS'}
            </h2>
            <p className="text-xs text-neutral-400 max-w-md leading-relaxed tracking-wider font-light">
              {data?.settings.tagline ||
                'Contemporary practice spanning painting, drawing, sculpture, and atmospheric material transformations.'}
            </p>
            <div className="pt-2 text-xs tracking-widest text-neutral-500 uppercase">
              Studio: {data?.settings.studioLocation || 'Paris / New York'}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
              Navigation
            </div>
            <ul className="space-y-2 text-xs tracking-widest uppercase text-neutral-400">
              <li>
                <a href="/about" onClick={e => handleLinkClick(e, '/about')} className="hover:text-white transition-colors">
                  Biography & Statement
                </a>
              </li>
              <li>
                <a href="/exhibitions" onClick={e => handleLinkClick(e, '/exhibitions')} className="hover:text-white transition-colors">
                  Exhibitions
                </a>
              </li>
              <li>
                <a href="/cv" onClick={e => handleLinkClick(e, '/cv')} className="hover:text-white transition-colors">
                  Curriculum Vitae
                </a>
              </li>
              <li>
                <a href="/contact" onClick={e => handleLinkClick(e, '/contact')} className="hover:text-white transition-colors">
                  Inquiries & Studio
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links & Inquiries */}
          <div className="md:col-span-3 space-y-4">
            <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
              Connect
            </div>
            <div className="flex flex-col gap-2.5">
              {data?.socialLinks?.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-xs tracking-wider text-neutral-400 hover:text-white transition-colors"
                >
                  {getSocialIcon(link.platform)}
                  <span>{link.label || link.platform}</span>
                </a>
              ))}
              {(!data?.socialLinks || data.socialLinks.length === 0) && (
                <a
                  href="https://instagram.com/olivabiswas.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs tracking-wider text-neutral-400 hover:text-white"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
            <div className="pt-2 text-xs text-neutral-400">
              <a href={`mailto:${data?.settings.contactEmail || 'studio@olivabiswas.com'}`} className="hover:text-white underline underline-offset-4">
                {data?.settings.contactEmail || 'studio@olivabiswas.com'}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] tracking-widest text-neutral-500 uppercase gap-4">
          <div>
            &copy; {currentYear} {data?.settings.artistName || 'OLIVA BISWAS'}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a
              href={isAdmin ? '/admin' : '/admin/login'}
              onClick={e => handleLinkClick(e, isAdmin ? '/admin' : '/admin/login')}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Admin Dashboard' : 'Artist CMS'}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
