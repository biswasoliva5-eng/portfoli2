import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import {
  LayoutDashboard,
  Palette,
  FolderKanban,
  Home,
  User,
  Calendar,
  FileText,
  Share2,
  Settings,
  Mail,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Clock,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  children,
}) => {
  const { adminUser, logoutAdmin, navigate, setHasEntered } = usePortfolio();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'artworks', label: 'Artworks', icon: Palette },
    { id: 'years', label: 'Archive Years', icon: Clock },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'homepage', label: 'Homepage Cover', icon: Home },
    { id: 'about', label: 'About & Bio', icon: User },
    { id: 'exhibitions', label: 'Exhibitions', icon: Calendar },
    { id: 'cv', label: 'Curriculum Vitae', icon: FileText },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'messages', label: 'Inquiries', icon: Mail },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
  ];

  return (
    <div id="admin-layout" className="min-h-screen bg-[#111111] text-neutral-100 flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#181818] border-b border-neutral-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-white" />
          <span className="font-serif text-base tracking-wider text-white">OLIVA BISWAS CMS</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider text-red-300 hover:text-white bg-red-950/40 border border-red-900/50 transition-colors cursor-pointer"
            title="Logout to website"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Logout</span>
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#161616] border-r border-neutral-800 flex flex-col justify-between transition-transform duration-300 overflow-y-auto lg:static lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col min-h-full justify-between">
          <div>
            {/* CMS Header */}
            <div className="p-6 border-b border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-medium">
                  Artist Studio CMS
                </span>
              </div>
              <h2 className="font-serif text-xl tracking-wider text-white mt-1">OLIVA BISWAS</h2>
              <div className="text-[11px] text-neutral-500 font-mono mt-1 truncate">
                Admin: {adminUser}
              </div>
            </div>

            {/* Navigation links */}
            <nav className="p-4 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs tracking-wider uppercase transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-xs'
                        : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Direct Logout & Return Options directly below navigation items */}
              <div className="pt-4 mt-3 border-t border-neutral-800/80 space-y-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    setSidebarOpen(false);
                    await logoutAdmin();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs tracking-wider uppercase transition-all bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-900/60 font-medium cursor-pointer group"
                  title="Logout from Admin and return to website"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Logout to Website</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    setHasEntered(true);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 text-xs tracking-wider uppercase transition-all text-neutral-400 hover:text-white hover:bg-neutral-800/70 border border-neutral-800 cursor-pointer"
                  title="View live portfolio without logging out"
                >
                  <ExternalLink className="w-4 h-4 shrink-0 text-neutral-400" />
                  <span>Back to Website</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Bottom actions: View Site & Logout */}
          <div className="p-4 border-t border-neutral-800 space-y-2 bg-[#121212] mt-6">
            <button
              onClick={() => {
                setHasEntered(true);
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-widest text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Site</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-widest text-red-400 hover:text-white hover:bg-red-950/70 border border-red-900/60 transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar with Section Title and Quick Actions */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-[#141414] border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
              Studio CMS
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              {navItems.find(i => i.id === currentTab)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setHasEntered(true);
                navigate('/');
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Website</span>
            </button>

            <button
              type="button"
              onClick={logoutAdmin}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
