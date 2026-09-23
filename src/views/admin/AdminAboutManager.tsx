import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import { Upload, Check, Sliders, Image as ImageIcon } from 'lucide-react';
import { api } from '../../api/client.js';
import { ImageEditorModal } from '../../components/ImageEditorModal.js';

export const AdminAboutManager: React.FC = () => {
  const { data, reloadData, showToast } = usePortfolio();

  const [biography, setBiography] = useState('');
  const [statement, setStatement] = useState('');
  const [education, setEducation] = useState('');
  const [awards, setAwards] = useState('');
  const [residencies, setResidencies] = useState('');
  const [collections, setCollections] = useState('');
  const [press, setPress] = useState('');
  const [portraitImage, setPortraitImage] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (data?.about) {
      setBiography(data.about.biography || '');
      setStatement(data.about.statement || '');
      setEducation(data.about.education || '');
      setAwards(data.about.awards || '');
      setResidencies(data.about.residencies || '');
      setCollections(data.about.collections || '');
      setPress(data.about.press || '');
      setPortraitImage(data.about.portraitImage || '');
    }
  }, [data?.about]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await api.uploadFile(file);
      if (res.fileUrl) {
        setPortraitImage(res.fileUrl);
        showToast('Artist portrait uploaded.', 'success');
      }
    } catch (err: any) {
      showToast('Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateAbout({
        biography: biography.trim(),
        statement: statement.trim(),
        education: education.trim(),
        awards: awards.trim(),
        residencies: residencies.trim(),
        collections: collections.trim(),
        press: press.trim(),
        portraitImage: portraitImage.trim(),
      });
      await reloadData();
      showToast('About & Biography saved successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save about details.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="admin-about-manager" className="space-y-8">
      <div className="pb-6 border-b border-neutral-800">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
          Biographical Archive
        </span>
        <h1 className="font-serif text-3xl tracking-wide text-white">About & Statement</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* Portrait Image */}
        <div className="bg-[#161616] p-6 border border-neutral-800 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-medium">
            Artist Studio Portrait
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-44 bg-neutral-900 border border-neutral-700 overflow-hidden shrink-0 relative">
              {portraitImage ? (
                <img src={portraitImage} alt="Oliva Biswas" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1 w-full">
              <input
                type="url"
                value={portraitImage}
                onChange={e => setPortraitImage(e.target.value)}
                placeholder="Portrait Image URL..."
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2 text-xs text-white focus:outline-hidden focus:border-white"
              />

              <div className="flex flex-wrap items-center gap-2">
                <label className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border border-neutral-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'Upload Portrait'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                {portraitImage && (
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(true)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs uppercase tracking-wider flex items-center gap-1.5 border border-neutral-700"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Edit in Studio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Biography & Statement */}
        <div className="bg-[#161616] p-6 border border-neutral-800 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
              Biography
            </label>
            <textarea
              rows={8}
              value={biography}
              onChange={e => setBiography(e.target.value)}
              placeholder="Artist biographical narrative..."
              className="w-full bg-[#202020] border border-neutral-700 p-4 text-xs text-white focus:outline-hidden focus:border-white leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
              Artist Statement
            </label>
            <textarea
              rows={6}
              value={statement}
              onChange={e => setStatement(e.target.value)}
              placeholder="Philosophy, conceptual inquiry, and technical approach..."
              className="w-full bg-[#202020] border border-neutral-700 p-4 text-xs text-white focus:outline-hidden focus:border-white leading-relaxed font-serif"
            />
          </div>
        </div>

        {/* Structured Sections */}
        <div className="bg-[#161616] p-6 border border-neutral-800 space-y-6">
          <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-medium">
            Accolades & History
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Education
              </label>
              <textarea
                rows={4}
                value={education}
                onChange={e => setEducation(e.target.value)}
                placeholder="Degree, Institution, Year..."
                className="w-full bg-[#202020] border border-neutral-700 p-3 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Awards & Fellowships
              </label>
              <textarea
                rows={4}
                value={awards}
                onChange={e => setAwards(e.target.value)}
                placeholder="Grant, Foundation, Year..."
                className="w-full bg-[#202020] border border-neutral-700 p-3 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Residencies
              </label>
              <textarea
                rows={4}
                value={residencies}
                onChange={e => setResidencies(e.target.value)}
                placeholder="Residency program, Location, Year..."
                className="w-full bg-[#202020] border border-neutral-700 p-3 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Selected Permanent Collections
              </label>
              <textarea
                rows={4}
                value={collections}
                onChange={e => setCollections(e.target.value)}
                placeholder="Museums, foundations, institutions..."
                className="w-full bg-[#202020] border border-neutral-700 p-3 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Selected Press & Publications
              </label>
              <textarea
                rows={4}
                value={press}
                onChange={e => setPress(e.target.value)}
                placeholder="Reviews, monographs, essays..."
                className="w-full bg-[#202020] border border-neutral-700 p-3 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Biography & Sections'}</span>
          </button>
        </div>
      </form>

      {/* Portrait image editor */}
      {isEditorOpen && portraitImage && (
        <ImageEditorModal
          isOpen={true}
          imageUrl={portraitImage}
          onSave={async dataUrl => {
            const res = await api.saveEditedImage(dataUrl, 'portrait-edited.jpg');
            setPortraitImage(res.fileUrl);
            showToast('Edited portrait ready. Remember to click Save.', 'info');
          }}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
