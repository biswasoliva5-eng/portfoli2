import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import { Plus, Edit2, Trash2, Calendar, MapPin, ExternalLink, X, Check } from 'lucide-react';
import { Exhibition, ExhibitionType } from '../../types.js';
import { api } from '../../api/client.js';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal.js';

export const AdminExhibitionsManager: React.FC = () => {
  const { data, reloadData, showToast } = usePortfolio();

  const [isEditing, setIsEditing] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);

  const [title, setTitle] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dateString, setDateString] = useState('');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<ExhibitionType>('Solo');
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');

  const [exhibitionToDelete, setExhibitionToDelete] = useState<Exhibition | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const exhibitions = data?.exhibitions || [];

  const handleOpenAdd = () => {
    setEditingExhibition(null);
    setTitle('');
    setYear(new Date().getFullYear());
    setDateString('');
    setVenue('');
    setLocation('');
    setType('Solo');
    setDescription('');
    setExternalLink('');
    setIsEditing(true);
  };

  const handleOpenEdit = (ex: Exhibition) => {
    setEditingExhibition(ex);
    setTitle(ex.title);
    setYear(Number(ex.year) || new Date().getFullYear());
    setDateString(ex.dateString || '');
    setVenue(ex.venue);
    setLocation(ex.location);
    setType(ex.type);
    setDescription(ex.description || '');
    setExternalLink(ex.externalLink || '');
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim() || !location.trim()) {
      showToast('Title, venue, and location are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const exData: Partial<Exhibition> = {
        title: title.trim(),
        year: Number(year) || new Date().getFullYear(),
        dateString: dateString.trim(),
        venue: venue.trim(),
        location: location.trim(),
        type,
        description: description.trim(),
        externalLink: externalLink.trim(),
      };

      if (editingExhibition) {
        await api.updateExhibition(editingExhibition.id, exData);
        showToast('Exhibition updated.', 'success');
      } else {
        await api.createExhibition(exData);
        showToast('Exhibition added to record.', 'success');
      }

      await reloadData();
      setIsEditing(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save exhibition.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!exhibitionToDelete) return;
    const target = exhibitionToDelete;
    try {
      setDeleting(true);
      await Promise.race([
        api.deleteExhibition(target.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Deletion timed out. Please try again.')), 12000))
      ]);
      setExhibitionToDelete(null);
      await reloadData();
      showToast('Exhibition removed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete exhibition.', 'error');
    } finally {
      setDeleting(false);
      setExhibitionToDelete(null);
    }
  };

  return (
    <div id="admin-exhibitions-manager" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
            Chronology
          </span>
          <h1 className="font-serif text-3xl tracking-wide text-white">Exhibitions Record</h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Exhibition
        </button>
      </div>

      {/* Editor Modal / Form */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-[#161616] p-6 sm:p-8 border border-neutral-700 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="font-serif text-lg text-white">
              {editingExhibition ? `Edit Exhibition: ${editingExhibition.title}` : 'Add Exhibition'}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            <div className="sm:col-span-8 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Exhibition Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. The Material Unconscious"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="sm:col-span-4 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Type *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ExhibitionType)}
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white cursor-pointer"
              >
                <option value="Solo">Solo Exhibition</option>
                <option value="Group">Group Exhibition</option>
                <option value="Biennial">Biennial / Triennial</option>
                <option value="Museum">Museum Survey</option>
                <option value="Art Fair">Art Fair Project</option>
              </select>
            </div>

            <div className="sm:col-span-6 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Venue / Institution *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="e.g. Palais des Arts Contemporains"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="sm:col-span-6 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Location (City, Country) *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Paris, France"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="sm:col-span-4 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Year *
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white font-mono"
              />
            </div>

            <div className="sm:col-span-8 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Exact Date String (Optional)
              </label>
              <input
                type="text"
                value={dateString}
                onChange={e => setDateString(e.target.value)}
                placeholder="e.g. Oct 12, 2024 – Feb 15, 2025"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="sm:col-span-12 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Description / Curatorial Text
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Exhibition context, featured series, curators..."
                className="w-full bg-[#202020] border border-neutral-700 p-4 text-xs text-white focus:outline-hidden focus:border-white leading-relaxed"
              />
            </div>

            <div className="sm:col-span-12 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                External Link (Catalogue or Museum Press URL)
              </label>
              <input
                type="url"
                value={externalLink}
                onChange={e => setExternalLink(e.target.value)}
                placeholder="https://palais-des-arts.fr/exhibitions/oliva-biswas"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Exhibition'}
            </button>
          </div>
        </form>
      )}

      {/* Exhibitions List */}
      <div className="bg-[#161616] border border-neutral-800 divide-y divide-neutral-800/80">
        {exhibitions.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs">
            No exhibitions recorded yet.
          </div>
        ) : (
          exhibitions.map(ex => (
            <div
              key={ex.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-300 text-[9px] uppercase tracking-wider font-mono">
                    {ex.type}
                  </span>
                  <h3 className="font-serif text-base text-white">{ex.title}</h3>
                </div>
                <div className="text-xs text-neutral-400 font-light flex items-center gap-2">
                  <span className="text-white font-medium">{ex.venue}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-500" /> {ex.location}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  {ex.dateString || ex.year}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenEdit(ex)}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  title="Edit exhibition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setExhibitionToDelete(ex)}
                  className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-300"
                  title="Delete exhibition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(exhibitionToDelete)}
        title="Delete Exhibition"
        message={`Are you sure you want to remove "${exhibitionToDelete?.title}" from the exhibitions record?`}
        isDeleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => setExhibitionToDelete(null)}
      />
    </div>
  );
};
