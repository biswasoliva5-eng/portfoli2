import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import {
  Palette,
  FolderKanban,
  Calendar,
  FileText,
  Mail,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ContactMessage } from '../../types.js';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onAddNewArtwork: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  onNavigateTab,
  onAddNewArtwork,
}) => {
  const { data } = usePortfolio();

  const artworksCount = data?.artworks.length || 0;
  const featuredCount = data?.artworks.filter(a => a.isFeatured).length || 0;
  const categoriesCount = data?.categories.length || 0;
  const exhibitionsCount = data?.exhibitions.length || 0;
  const unreadMessages = data?.inquiries?.filter((m: ContactMessage) => !m.read).length || 0;
  const hasCV = Boolean(data?.cv?.url);

  return (
    <div id="admin-dashboard-overview" className="space-y-10">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
            Control Center
          </span>
          <h1 className="font-serif text-3xl tracking-wide text-white">Studio Overview</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddNewArtwork}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Artwork
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => onNavigateTab('artworks')}
          className="p-5 bg-[#181818] border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <Palette className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Catalog</span>
          </div>
          <div className="text-2xl font-serif text-white">{artworksCount}</div>
          <div className="text-[11px] text-neutral-500">Artworks</div>
        </div>

        <div
          onClick={() => onNavigateTab('artworks')}
          className="p-5 bg-[#181818] border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs">★</span>
            <span className="text-[10px] uppercase tracking-wider">Cover</span>
          </div>
          <div className="text-2xl font-serif text-white">{featuredCount}</div>
          <div className="text-[11px] text-neutral-500">Featured Works</div>
        </div>

        <div
          onClick={() => onNavigateTab('categories')}
          className="p-5 bg-[#181818] border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <FolderKanban className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Series</span>
          </div>
          <div className="text-2xl font-serif text-white">{categoriesCount}</div>
          <div className="text-[11px] text-neutral-500">Categories</div>
        </div>

        <div
          onClick={() => onNavigateTab('exhibitions')}
          className="p-5 bg-[#181818] border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">History</span>
          </div>
          <div className="text-2xl font-serif text-white">{exhibitionsCount}</div>
          <div className="text-[11px] text-neutral-500">Exhibitions</div>
        </div>

        <div
          onClick={() => onNavigateTab('cv')}
          className="p-5 bg-[#181818] border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <FileText className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Document</span>
          </div>
          <div className="text-sm font-serif text-white flex items-center gap-1.5 pt-2">
            {hasCV ? (
              <span className="text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active PDF
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Needs Upload
              </span>
            )}
          </div>
          <div className="text-[11px] text-neutral-500">Curriculum Vitae</div>
        </div>

        <div
          onClick={() => onNavigateTab('messages')}
          className="p-5 bg-[#181818] border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <Mail className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Inbox</span>
          </div>
          <div className="text-2xl font-serif text-white">
            {unreadMessages > 0 ? (
              <span className="text-blue-400">{unreadMessages} New</span>
            ) : (
              '0'
            )}
          </div>
          <div className="text-[11px] text-neutral-500">Inquiries</div>
        </div>
      </div>

      {/* Quick Launchpad & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Management Actions */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-medium">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('homepage')}
              className="p-4 bg-[#161616] border border-neutral-800 hover:border-neutral-600 text-left transition-colors flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="text-xs text-white font-medium uppercase tracking-wider">
                  Update Homepage Cover
                </div>
                <div className="text-[11px] text-neutral-400">Change hero banner image & tagline</div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            </button>

            <button
              onClick={() => onNavigateTab('cv')}
              className="p-4 bg-[#161616] border border-neutral-800 hover:border-neutral-600 text-left transition-colors flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="text-xs text-white font-medium uppercase tracking-wider">
                  Manage CV PDF
                </div>
                <div className="text-[11px] text-neutral-400">Upload or replace curriculum vitae</div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            </button>

            <button
              onClick={() => onNavigateTab('about')}
              className="p-4 bg-[#161616] border border-neutral-800 hover:border-neutral-600 text-left transition-colors flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="text-xs text-white font-medium uppercase tracking-wider">
                  Edit Biography
                </div>
                <div className="text-[11px] text-neutral-400">Update artist statement & education</div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className="p-4 bg-[#161616] border border-neutral-800 hover:border-neutral-600 text-left transition-colors flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="text-xs text-white font-medium uppercase tracking-wider">
                  Security & Password
                </div>
                <div className="text-[11px] text-neutral-400">Change login credentials</div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            </button>
          </div>
        </div>

        {/* Right: Latest Inquiries */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-medium">
              Recent Inquiries
            </h2>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white"
            >
              View All ({data?.inquiries?.length || 0})
            </button>
          </div>

          <div className="bg-[#161616] border border-neutral-800 divide-y divide-neutral-800/80">
            {(!data?.inquiries || data.inquiries.length === 0) && (
              <div className="p-8 text-center text-xs text-neutral-500">
                No inquiries submitted yet.
              </div>
            )}
            {data?.inquiries?.slice(0, 3).map((inq: ContactMessage) => (
              <div
                key={inq.id}
                onClick={() => onNavigateTab('messages')}
                className="p-4 hover:bg-neutral-800/40 transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white">{inq.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(inq.receivedAt || inq.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-neutral-300 truncate">{inq.subject || 'Inquiry'}</div>
                <div className="text-[11px] text-neutral-500 truncate">{inq.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
