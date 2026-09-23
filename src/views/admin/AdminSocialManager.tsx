import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import { Plus, Edit2, Trash2, Globe, Check, X } from 'lucide-react';
import { SocialLink } from '../../types.js';
import { api } from '../../api/client.js';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal.js';

export const AdminSocialManager: React.FC = () => {
  const { data, reloadData, showToast } = usePortfolio();

  const [isEditing, setIsEditing] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

  const [platform, setPlatform] = useState('Instagram');
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');

  const [linkToDelete, setLinkToDelete] = useState<SocialLink | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const links = data?.socialLinks || [];

  const handleOpenAdd = () => {
    setEditingLink(null);
    setPlatform('Instagram');
    setUrl('');
    setLabel('Instagram (@olivabiswas.studio)');
    setIsEditing(true);
  };

  const handleOpenEdit = (l: SocialLink) => {
    setEditingLink(l);
    setPlatform(l.platform);
    setUrl(l.url);
    setLabel(l.label || '');
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform.trim() || !url.trim()) {
      showToast('Platform and URL are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const linkData = {
        platform: platform.trim(),
        url: url.trim(),
        label: label.trim() || platform.trim(),
        order: editingLink ? editingLink.order : links.length + 1,
      };

      if (editingLink) {
        await api.updateSocialLink(editingLink.id, linkData);
        showToast('Social link updated.', 'success');
      } else {
        await api.createSocialLink(linkData);
        showToast('Social link added.', 'success');
      }

      await reloadData();
      setIsEditing(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save social link.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;
    const target = linkToDelete;
    try {
      setDeleting(true);
      await Promise.race([
        api.deleteSocialLink(target.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Deletion timed out. Please try again.')), 12000))
      ]);
      setLinkToDelete(null);
      await reloadData();
      showToast('Social link removed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete social link.', 'error');
    } finally {
      setDeleting(false);
      setLinkToDelete(null);
    }
  };

  return (
    <div id="admin-social-manager" className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
            Channels
          </span>
          <h1 className="font-serif text-3xl tracking-wide text-white">Social Media Links</h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Social Link
        </button>
      </div>

      {/* Form */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-[#161616] p-6 sm:p-8 border border-neutral-700 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="font-serif text-lg text-white">
              {editingLink ? `Edit ${editingLink.platform} Link` : 'Add Social Platform'}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Platform Name *
              </label>
              <input
                type="text"
                required
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                placeholder="e.g. Instagram, LinkedIn, Behance"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Display Label
              </label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Instagram (@olivabiswas.studio)"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Full Profile URL *
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://instagram.com/olivabiswas.studio"
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
              {saving ? 'Saving...' : 'Save Link'}
            </button>
          </div>
        </form>
      )}

      {/* Links List */}
      <div className="bg-[#161616] border border-neutral-800 divide-y divide-neutral-800/80">
        {links.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No social media platforms added yet.
          </div>
        ) : (
          links.map(l => (
            <div
              key={l.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-medium text-white text-sm">
                  <Globe className="w-4 h-4 text-neutral-400" />
                  <span>{l.label || l.platform}</span>
                </div>
                <div className="text-xs text-neutral-400 font-mono truncate max-w-md">
                  {l.url}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenEdit(l)}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  title="Edit link"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLinkToDelete(l)}
                  className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-300"
                  title="Delete link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(linkToDelete)}
        title="Remove Social Link"
        message={`Are you sure you want to remove the link to ${linkToDelete?.platform}?`}
        isDeleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => setLinkToDelete(null)}
      />
    </div>
  );
};
