import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  FolderKanban,
  Check,
  X,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { Category } from '../../types.js';
import { api } from '../../api/client.js';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal.js';

export const AdminCategoriesManager: React.FC = () => {
  const { data, reloadData, showToast } = usePortfolio();

  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categories = data?.categories || [];
  const artworks = data?.artworks || [];

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setCoverImage('');
    setIsEditing(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setCoverImage(cat.coverImage || '');
    setIsEditing(true);
  };

  const handleAutoSlug = (inputName: string) => {
    setName(inputName);
    if (!editingCategory) {
      setSlug(
        inputName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadFile(file);
      if (res.fileUrl) {
        setCoverImage(res.fileUrl);
        showToast('Category cover uploaded.', 'success');
      }
    } catch (err: any) {
      showToast('Failed to upload image.', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showToast('Name and slug are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const catData = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        coverImage: coverImage.trim(),
        order: editingCategory ? editingCategory.order : categories.length + 1,
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, catData);
        showToast(`Category "${name}" updated.`, 'success');
      } else {
        await api.createCategory(catData);
        showToast(`Category "${name}" created.`, 'success');
      }

      await reloadData();
      setIsEditing(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save category.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const moveCategory = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    try {
      const copy = [...categories];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;

      // Update orders
      for (let i = 0; i < copy.length; i++) {
        copy[i].order = i + 1;
        await api.updateCategory(copy[i].id, { order: i + 1 });
      }

      await reloadData();
      showToast('Categories reordered.', 'success');
    } catch (e: any) {
      showToast('Failed to reorder categories.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    const count = artworks.filter(a => a.categorySlug === categoryToDelete.slug).length;
    if (count > 0) {
      showToast(
        `Cannot delete "${categoryToDelete.name}" because it contains ${count} artworks. Please reassign or delete them first.`,
        'error'
      );
      setCategoryToDelete(null);
      return;
    }

    const target = categoryToDelete;
    try {
      setDeleting(true);
      await Promise.race([
        api.deleteCategory(target.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Deletion timed out. Please try again.')), 12000))
      ]);
      setCategoryToDelete(null);
      await reloadData();
      showToast(`Category "${target.name}" deleted.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category.', 'error');
    } finally {
      setDeleting(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div id="admin-categories-manager" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
            Structure & Series
          </span>
          <h1 className="font-serif text-3xl tracking-wide text-white">Categories & Disciplines</h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Add / Edit Form Drawer/Card */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-[#161616] p-6 sm:p-8 border border-neutral-700 shadow-xl space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="font-serif text-lg text-white">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Category'}
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
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => handleAutoSlug(e.target.value)}
                placeholder="e.g. Sculpture or Works on Paper"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="e.g. sculpture"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white font-mono"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Description / Curatorial Statement
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief intro shown at the top of this category's public gallery..."
                className="w-full bg-[#202020] border border-neutral-700 p-4 text-xs text-white focus:outline-hidden focus:border-white leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Cover Image (URL or Upload)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-[#202020] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-white"
                />
                <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs uppercase tracking-wider text-neutral-200 border border-neutral-700 cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
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
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="bg-[#161616] border border-neutral-800">
        <div className="divide-y divide-neutral-800/80">
          {categories.map((cat, idx) => {
            const count = artworks.filter(a => a.categorySlug === cat.slug).length;

            return (
              <div
                key={cat.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-800/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-900 border border-neutral-700 overflow-hidden shrink-0">
                    {cat.coverImage ? (
                      <img
                        src={cat.coverImage}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-xs">
                        DIR
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-base text-white">{cat.name}</h3>
                      <span className="text-[10px] text-neutral-400 font-mono">/{cat.slug}</span>
                    </div>
                    <p className="text-xs text-neutral-400 font-light line-clamp-1 max-w-xl">
                      {cat.description || 'No description provided.'}
                    </p>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {count} catalogued artwork{count === 1 ? '' : 's'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => moveCategory(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveCategory(idx, 'down')}
                    disabled={idx === categories.length - 1}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-300"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"?`}
        isDeleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
