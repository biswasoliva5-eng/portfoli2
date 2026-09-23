import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Artwork } from '../../types.js';
import { api } from '../../api/client.js';
import { AdminArtworkEditorModal } from './AdminArtworkEditorModal.js';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal.js';

interface AdminArtworksManagerProps {
  onAddNewRequest?: boolean;
  onClearAddNewRequest?: () => void;
}

export const AdminArtworksManager: React.FC<AdminArtworksManagerProps> = ({
  onAddNewRequest,
  onClearAddNewRequest,
}) => {
  const { data, reloadData, showToast, navigate } = usePortfolio();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
  const [deleting, setDeleting] = useState(false);

  // If parent triggered add new
  React.useEffect(() => {
    if (onAddNewRequest) {
      setEditingArtwork(null);
      setIsEditorOpen(true);
      onClearAddNewRequest?.();
    }
  }, [onAddNewRequest, onClearAddNewRequest]);

  const categories = data?.categories || [];
  const artworks = data?.artworks || [];

  const filtered = useMemo(() => {
    return artworks.filter(a => {
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.medium.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'all' || a.categorySlug === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [artworks, search, categoryFilter]);

  const handleToggleFeatured = async (artwork: Artwork) => {
    try {
      await api.updateArtwork(artwork.id, {
        isFeatured: !artwork.isFeatured,
      });
      await reloadData();
      showToast(
        artwork.isFeatured
          ? `Removed "${artwork.title}" from featured.`
          : `Marked "${artwork.title}" as featured on homepage.`,
        'success'
      );
    } catch (e: any) {
      showToast('Failed to update featured status.', 'error');
    }
  };

  const handleDeleteArtwork = async () => {
    if (!artworkToDelete) return;
    const target = artworkToDelete;
    try {
      setDeleting(true);
      await Promise.race([
        api.deleteArtwork(target.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Deletion timed out. Please try again.')), 12000))
      ]);
      setArtworkToDelete(null);
      await reloadData();
      showToast(`Artwork "${target.title}" deleted.`, 'info');
    } catch (e: any) {
      console.error('Delete artwork error:', e);
      showToast(e.message || 'Failed to delete artwork.', 'error');
    } finally {
      setDeleting(false);
      setArtworkToDelete(null);
    }
  };

  return (
    <div id="admin-artworks-manager" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
            Artwork Catalog
          </span>
          <h1 className="font-serif text-3xl tracking-wide text-white">Manage Artworks</h1>
        </div>

        <button
          onClick={() => {
            setEditingArtwork(null);
            setIsEditorOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add New Artwork
        </button>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#161616] p-4 border border-neutral-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by title, medium, concept..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#202020] border border-neutral-700 text-white focus:outline-hidden focus:border-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-[#202020] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-white"
          >
            <option value="all">All Disciplines ({artworks.length})</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-[#161616] border border-neutral-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 text-[10px] uppercase tracking-[0.2em] text-neutral-400 bg-[#141414]">
              <th className="p-4 w-16">Work</th>
              <th className="p-4">Title & Details</th>
              <th className="p-4">Discipline</th>
              <th className="p-4">Year</th>
              <th className="p-4 text-center">Featured</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  No artworks found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map(artwork => (
                <tr key={artwork.id} className="hover:bg-neutral-800/30 transition-colors">
                  {/* Thumbnail */}
                  <td className="p-4">
                    <div className="w-12 h-12 bg-neutral-900 border border-neutral-700 overflow-hidden shrink-0">
                      <img
                        src={artwork.mainImage}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>

                  {/* Title & info */}
                  <td className="p-4 space-y-0.5">
                    <div className="font-serif text-sm text-white font-medium">
                      {artwork.title}
                    </div>
                    <div className="text-[11px] text-neutral-400 line-clamp-1">{artwork.medium}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{artwork.dimensions}</div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] tracking-wider uppercase font-mono">
                      {artwork.categoryName}
                    </span>
                  </td>

                  {/* Year */}
                  <td className="p-4 font-mono text-neutral-300">{artwork.year}</td>

                  {/* Featured toggle */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(artwork)}
                      className={`p-1.5 transition-colors ${
                        artwork.isFeatured
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-neutral-600 hover:text-neutral-400'
                      }`}
                      title={artwork.isFeatured ? 'Featured on cover' : 'Mark as featured'}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/artwork/${artwork.slug}`)}
                      className="p-1.5 text-neutral-400 hover:text-white"
                      title="View public page"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingArtwork(artwork);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 text-neutral-300 hover:text-white"
                      title="Edit artwork"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setArtworkToDelete(artwork)}
                      className="p-1.5 text-red-400 hover:text-red-300"
                      title="Delete artwork"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      <AdminArtworkEditorModal
        isOpen={isEditorOpen}
        artworkToEdit={editingArtwork}
        onClose={() => setIsEditorOpen(false)}
        onSaved={async () => {
          await reloadData();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(artworkToDelete)}
        title="Delete Artwork"
        message={`Are you sure you want to permanently remove "${artworkToDelete?.title}" from the portfolio catalog? This action cannot be undone.`}
        isDeleting={deleting}
        onConfirm={handleDeleteArtwork}
        onCancel={() => setArtworkToDelete(null)}
      />
    </div>
  );
};
