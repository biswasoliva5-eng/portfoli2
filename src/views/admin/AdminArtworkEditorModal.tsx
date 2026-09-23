import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sliders,
  Star,
  ArrowUp,
  ArrowDown,
  Check,
  Image as ImageIcon,
  AlertCircle,
  Video,
  Film,
} from 'lucide-react';
import { Artwork, ArtworkImage } from '../../types.js';
import { api } from '../../api/client.js';
import { ImageEditorModal } from '../../components/ImageEditorModal.js';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal.js';

interface AdminArtworkEditorModalProps {
  isOpen: boolean;
  artworkToEdit: Artwork | null;
  onClose: () => void;
  onSaved: () => void;
}

export const AdminArtworkEditorModal: React.FC<AdminArtworkEditorModalProps> = ({
  isOpen,
  artworkToEdit,
  onClose,
  onSaved,
}) => {
  const { data, showToast } = usePortfolio();

  const [title, setTitle] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [categorySlug, setCategorySlug] = useState('');
  const [medium, setMedium] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<ArtworkImage[]>([]);

  // Video state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'mixed'>('image');
  const [videoUploading, setVideoUploading] = useState(false);

  // Editing image state for ImageEditorModal
  const [editingImageIdx, setEditingImageIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete image confirmation
  const [imageToDeleteIdx, setImageToDeleteIdx] = useState<number | null>(null);

  // Manual URL input helper
  const [manualUrl, setManualUrl] = useState('');

  const categories = data?.categories || [];

  useEffect(() => {
    if (!isOpen) return;
    if (artworkToEdit) {
      setTitle(artworkToEdit.title);
      setYear(Number(artworkToEdit.year) || new Date().getFullYear());
      setCategorySlug(artworkToEdit.categorySlug);
      setMedium(artworkToEdit.medium);
      setDimensions(artworkToEdit.dimensions);
      setDescription(artworkToEdit.description || '');
      setNotes(artworkToEdit.notes || '');
      setIsFeatured(Boolean(artworkToEdit.isFeatured));
      setImages(artworkToEdit.images || []);
      setVideoUrl(artworkToEdit.videoUrl || '');
      setVideoTitle(artworkToEdit.videoTitle || '');
      setMediaType(artworkToEdit.mediaType || (artworkToEdit.videoUrl ? 'video' : 'image'));
    } else {
      // Default new artwork
      setTitle('');
      setYear(new Date().getFullYear());
      setCategorySlug(categories[0]?.slug || 'painting');
      setMedium('');
      setDimensions('');
      setDescription('');
      setNotes('');
      setIsFeatured(false);
      setImages([]);
      setVideoUrl('');
      setVideoTitle('');
      setMediaType('image');
    }
    setError(null);
    setManualUrl('');
  }, [isOpen, artworkToEdit?.id]);

  if (!isOpen) return null;

  // Handle file uploads for images
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError(null);
      const newImagesList: ArtworkImage[] = [];
      const currentImagesCount = images.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await api.uploadFile(file);
        if (res.fileUrl) {
          const newImg: ArtworkImage = {
            id: `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
            url: res.fileUrl,
            alt: title || file.name.replace(/\.[^/.]+$/, '') || 'Artwork view',
            order: currentImagesCount + i + 1,
            isPrimary: currentImagesCount === 0 && i === 0,
          };
          newImagesList.push(newImg);
        }
      }

      if (newImagesList.length > 0) {
        setImages(prev => {
          const combined = [...prev, ...newImagesList];
          // Ensure at least one primary image exists
          if (!combined.some(img => img.isPrimary) && combined.length > 0) {
            combined[0].isPrimary = true;
          }
          return combined;
        });
        showToast(`${newImagesList.length} image(s) uploaded successfully.`, 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
      showToast('Upload failed: ' + (err.message || ''), 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Handle video upload (supports up to 200MB)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      setVideoUploading(true);
      setError(null);
      const res = await api.uploadFile(file);
      if (res.fileUrl) {
        setVideoUrl(res.fileUrl);
        setMediaType('video');
        if (!videoTitle) {
          setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
        showToast('ভিডিও সফলভাবে আপলোড হয়েছে (Video uploaded successfully).', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Video upload failed.');
      showToast('ভিডিও আপলোড ব্যর্থ হয়েছে: ' + (err.message || 'Failed'), 'error');
    } finally {
      setVideoUploading(false);
      e.target.value = '';
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    const newImg: ArtworkImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: manualUrl.trim(),
      alt: title || 'Artwork view',
      order: images.length + 1,
      isPrimary: images.length === 0,
    };
    setImages(prev => [...prev, newImg]);
    setManualUrl('');
  };

  // Reordering
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    next.forEach((img, idx) => (img.order = idx + 1));
    setImages(next);
  };

  const makePrimary = (index: number) => {
    const next = images.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
    }));
    setImages(next);
  };

  const confirmDeleteImage = () => {
    if (imageToDeleteIdx === null) return;
    const next = images.filter((_, idx) => idx !== imageToDeleteIdx);
    if (next.length > 0 && !next.some(img => img.isPrimary)) {
      next[0].isPrimary = true;
    }
    setImages(next);
    setImageToDeleteIdx(null);
    showToast('Image removed.', 'info');
  };

  // Save edited image from canvas studio
  const handleSaveEditedImage = async (dataUrl: string) => {
    if (editingImageIdx === null) return;
    try {
      const res = await api.saveEditedImage(dataUrl, `edited-${title || 'artwork'}.jpg`);
      const next = [...images];
      next[editingImageIdx] = {
        ...next[editingImageIdx],
        url: res.fileUrl,
      };
      setImages(next);
      showToast('Image adjustments applied and saved.', 'success');
    } catch (err: any) {
      showToast('Failed to save edited image.', 'error');
    }
  };

  // Save Artwork
  const handleSaveArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an artwork title.');
      return;
    }
    if (images.length === 0) {
      setError('Please attach at least one artwork image.');
      return;
    }

    const cat = categories.find(c => c.slug === categorySlug);
    const categoryName = cat ? cat.name : 'Painting';
    const primaryImg = images.find(img => img.isPrimary) || images[0];

    const artworkData: Partial<Artwork> = {
      title: title.trim(),
      year: Number(year) || new Date().getFullYear(),
      categorySlug,
      categoryName,
      medium: medium.trim(),
      dimensions: dimensions.trim(),
      description: description.trim(),
      notes: notes.trim(),
      isFeatured,
      mainImage: primaryImg.url,
      images,
      videoUrl: videoUrl.trim() || undefined,
      videoTitle: videoTitle.trim() || undefined,
      mediaType: mediaType || (videoUrl.trim() ? 'video' : 'image'),
    };

    try {
      setSaving(true);
      setError(null);
      if (artworkToEdit) {
        await api.updateArtwork(artworkToEdit.id, artworkData);
        showToast('আর্টওয়ার্ক সফলভাবে আপডেট হয়েছে (Artwork updated successfully).', 'success');
      } else {
        await api.createArtwork(artworkData);
        showToast('নতুন আর্টওয়ার্ক সফলভাবে ক্যাটালগে যুক্ত হয়েছে (Artwork added successfully).', 'success');
      }
      await onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save artwork.');
      showToast('আর্টওয়ার্ক সেভ ব্যর্থ হয়েছে: ' + (err.message || 'Failed to save artwork.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="artwork-editor-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="artwork-editor-card"
        className="bg-[#181818] border border-neutral-800 text-neutral-100 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#141414]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
              Artwork Cataloguer
            </span>
            <h2 className="font-serif text-xl tracking-wide text-white">
              {artworkToEdit ? `Edit "${artworkToEdit.title}"` : 'Add New Artwork'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSaveArtwork} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            <div className="sm:col-span-8 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Artwork Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Untitled (Carbon & Ochre No. 4)"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white transition-colors"
              />
            </div>

            <div className="sm:col-span-4 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Year *
              </label>
              <input
                type="number"
                required
                list="available-years-list"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white transition-colors font-mono"
              />
              <datalist id="available-years-list">
                {(data?.settings?.customYears || data?.years || ['2025', '2024', '2023', '2022', '2021', '2020']).map(y => (
                  <option key={y} value={y} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(data?.settings?.customYears || data?.years || ['2025', '2024', '2023', '2022']).slice(0, 5).map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(Number(y))}
                    className={`px-2 py-0.5 text-[10px] border transition-colors cursor-pointer ${
                      year === Number(y)
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-6 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Category *
              </label>
              <select
                value={categorySlug}
                onChange={e => setCategorySlug(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white transition-colors cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-6 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={e => setDimensions(e.target.value)}
                placeholder="e.g. 180 × 140 cm (70.8 × 55.1 in)"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white transition-colors"
              />
            </div>

            <div className="sm:col-span-12 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Medium / Materials
              </label>
              <input
                type="text"
                value={medium}
                onChange={e => setMedium(e.target.value)}
                placeholder="e.g. Oil, raw pigment, pulverized limestone and graphite on raw linen"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white transition-colors"
              />
            </div>

            <div className="sm:col-span-12 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Artwork Description / Concept Notes
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Curatorial notes on technique, intention, or historical context..."
                className="w-full bg-[#202020] border border-neutral-700 p-4 text-xs text-white focus:outline-hidden focus:border-white transition-colors leading-relaxed"
              />
            </div>

            <div className="sm:col-span-12 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Provenance / Collection Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Private Collection, Zurich or Available through Studio"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white transition-colors"
              />
            </div>

            {/* Featured toggle */}
            <div className="sm:col-span-12 pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-white rounded-none cursor-pointer"
                />
                <span className="text-xs text-neutral-200">
                  Feature this artwork prominently on the Homepage Curated Selection
                </span>
              </label>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4 pt-6 border-t border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs uppercase tracking-[0.25em] text-white font-medium">
                  Artwork Images & Views ({images.length})
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Upload multiple detail views or angles. You can crop, rotate, and adjust brightness/contrast directly.
                </p>
              </div>

              {/* Upload input button */}
              <label className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors border border-neutral-700">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Or add via image URL */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Or paste an image web URL..."
                value={manualUrl}
                onChange={e => setManualUrl(e.target.value)}
                className="flex-1 bg-[#202020] border border-neutral-700 px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs uppercase tracking-wider border border-neutral-700"
              >
                Add URL
              </button>
            </div>

            {/* Images List */}
            {images.length === 0 ? (
              <div className="p-8 border border-dashed border-neutral-700 text-center space-y-2 text-neutral-400">
                <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs">No images attached to this artwork yet.</p>
                <p className="text-[11px] text-neutral-500">Upload JPG/PNG files or enter web URLs above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="p-3 bg-[#202020] border border-neutral-700 flex flex-col sm:flex-row items-center gap-4 group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-black shrink-0 overflow-hidden relative border border-neutral-800">
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-white text-black text-[9px] uppercase font-bold tracking-wider">
                          Primary
                        </span>
                      )}
                    </div>

                    {/* Metadata: Alt text */}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={img.alt || ''}
                        onChange={e => {
                          const next = [...images];
                          next[idx].alt = e.target.value;
                          setImages(next);
                        }}
                        placeholder="Image description / caption (e.g. Installation detail, raking light)"
                        className="w-full bg-[#181818] border border-neutral-800 px-3 py-1.5 text-xs text-neutral-200 focus:outline-hidden focus:border-white"
                      />
                      <div className="text-[11px] text-neutral-400 font-mono truncate max-w-md">
                        {img.url}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => makePrimary(idx)}
                          className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs transition-colors"
                          title="Set as primary cover image"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Launch Canvas Image Editor */}
                      <button
                        type="button"
                        onClick={() => setEditingImageIdx(idx)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs uppercase tracking-wider transition-colors"
                        title="Crop, rotate, adjust brightness & contrast"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Edit Image</span>
                      </button>

                      {/* Reordering */}
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'up')}
                        disabled={idx === 0}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'down')}
                        disabled={idx === images.length - 1}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setImageToDeleteIdx(idx)}
                        className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Section (Optional video clip / studio documentation / process video) */}
          <div className="space-y-4 pt-6 border-t border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs uppercase tracking-[0.25em] text-white font-medium flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Artwork Video / Process Clip (ঐচ্ছিক / Optional)</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Upload a studio video, time-lapse, or 360° documentation (MP4, WebM, MOV up to 200MB), or provide an external video link.
                </p>
              </div>

              {/* Upload video file button */}
              <label className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors border border-neutral-700">
                <Video className="w-3.5 h-3.5" />
                <span>{videoUploading ? 'Uploading Video...' : 'Upload Video File'}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/ogg,video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={videoUploading}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                  Video URL (Upload or paste MP4 / WebM link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://.../video.mp4 or upload above"
                    value={videoUrl}
                    onChange={e => {
                      setVideoUrl(e.target.value);
                      if (e.target.value.trim()) setMediaType('video');
                    }}
                    className="flex-1 bg-[#202020] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-white font-mono"
                  />
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setVideoUrl('');
                        setVideoTitle('');
                        setMediaType('image');
                      }}
                      className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs border border-red-800/40"
                      title="Clear video"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                  Video Caption / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Studio Documentation / Material Process"
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  className="w-full bg-[#202020] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-white"
                />
              </div>
            </div>

            {/* Video Preview if URL is present */}
            {videoUrl && (
              <div className="p-3 bg-[#202020] border border-neutral-700 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="uppercase tracking-widest font-mono text-neutral-300 flex items-center gap-1.5">
                    <Video className="w-3 h-3 text-emerald-400" />
                    Video Attached: {videoTitle || 'Untitled Video'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">READY</span>
                </div>
                <div className="max-w-md mx-auto aspect-video bg-black overflow-hidden border border-neutral-800">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-6 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-2.5 bg-white hover:bg-neutral-200 text-black text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Artwork'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Image Editor Modal for Canvas Adjustments */}
      {editingImageIdx !== null && images[editingImageIdx] && (
        <ImageEditorModal
          isOpen={true}
          imageUrl={images[editingImageIdx].url}
          onSave={handleSaveEditedImage}
          onClose={() => setEditingImageIdx(null)}
        />
      )}

      {/* Delete Image Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={imageToDeleteIdx !== null}
        title="Remove Image"
        message="Are you sure you want to remove this image view from the artwork?"
        onConfirm={confirmDeleteImage}
        onCancel={() => setImageToDeleteIdx(null)}
      />
    </div>
  );
};
