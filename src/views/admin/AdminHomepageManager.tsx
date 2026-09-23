import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import {
  Upload,
  Check,
  Sliders,
  Image as ImageIcon,
  Move,
  Type,
  Palette,
  Eye,
  Info,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { ImageEditorModal } from '../../components/ImageEditorModal.js';
import { CoverPosition } from '../../types.js';

export const AdminHomepageManager: React.FC = () => {
  const { data, reloadData, showToast } = usePortfolio();

  // Basic hero copywriting
  const [artistName, setArtistName] = useState('');
  const [headerSubtitle, setHeaderSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [coverTagline, setCoverTagline] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [enterButtonText, setEnterButtonText] = useState('ENTER');
  const [showCoverOnLanding, setShowCoverOnLanding] = useState(true);
  const [studioLocation, setStudioLocation] = useState('');

  // Positioning
  const [coverNamePosition, setCoverNamePosition] = useState<CoverPosition>('bottom-left');
  const [coverEnterPosition, setCoverEnterPosition] = useState<CoverPosition>('bottom-right');

  // Font Sizes & Typography
  const [coverNameFontSize, setCoverNameFontSize] = useState('8xl');
  const [coverSubtitleFontSize, setCoverSubtitleFontSize] = useState('sm');
  const [coverEnterFontSize, setCoverEnterFontSize] = useState('sm');
  const [coverFontFamily, setCoverFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [coverNameLetterSpacing, setCoverNameLetterSpacing] = useState<'normal' | 'wide' | 'wider' | 'widest'>('wider');
  const [coverEnterShape, setCoverEnterShape] = useState<'rectangle' | 'rounded' | 'pill'>('rectangle');

  // Colors & Visuals
  const [coverNameColor, setCoverNameColor] = useState('#ffffff');
  const [coverSubtitleColor, setCoverSubtitleColor] = useState('#e5e5e5');
  const [coverEnterTextColor, setCoverEnterTextColor] = useState('#ffffff');
  const [coverEnterBgColor, setCoverEnterBgColor] = useState('transparent');
  const [coverEnterBorderColor, setCoverEnterBorderColor] = useState('#ffffff');
  const [coverOverlayStyle, setCoverOverlayStyle] = useState<'gradient' | 'dark' | 'medium' | 'light' | 'none'>('gradient');

  const [saving, setSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      setArtistName(data.settings.artistName || 'OLIVA BISWAS');
      setHeaderSubtitle(data.settings.headerSubtitle !== undefined ? data.settings.headerSubtitle : '');
      setTagline(data.settings.tagline || '');
      setCoverTagline(data.settings.coverTagline || '');
      setCoverImage(data.settings.coverImage || '');
      setEnterButtonText(data.settings.enterButtonText || 'ENTER');
      setShowCoverOnLanding(data.settings.showCoverOnLanding !== false);
      setStudioLocation(data.settings.studioLocation || '');

      // Layout & styles
      setCoverNamePosition(data.settings.coverNamePosition || 'bottom-left');
      setCoverEnterPosition(data.settings.coverEnterPosition || 'bottom-right');
      setCoverNameFontSize(data.settings.coverNameFontSize || '8xl');
      setCoverSubtitleFontSize(data.settings.coverSubtitleFontSize || 'sm');
      setCoverEnterFontSize(data.settings.coverEnterFontSize || 'sm');
      setCoverFontFamily(data.settings.coverFontFamily || 'sans');
      setCoverNameLetterSpacing(data.settings.coverNameLetterSpacing || 'wider');
      setCoverEnterShape(data.settings.coverEnterShape || 'rectangle');

      setCoverNameColor(data.settings.coverNameColor || '#ffffff');
      setCoverSubtitleColor(data.settings.coverSubtitleColor || '#e5e5e5');
      setCoverEnterTextColor(data.settings.coverEnterTextColor || '#ffffff');
      setCoverEnterBgColor(data.settings.coverEnterBgColor || 'transparent');
      setCoverEnterBorderColor(data.settings.coverEnterBorderColor || '#ffffff');
      setCoverOverlayStyle(data.settings.coverOverlayStyle || 'gradient');
    }
  }, [data?.settings]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await api.uploadFile(file);
      const newUrl = res.fileUrl || res.url;
      if (newUrl) {
        setCoverImage(newUrl);
        // Immediately persist the uploaded cover photo into settings
        await api.updateSettings({ coverImage: newUrl });
        await reloadData();
        showToast('কভার ফটো সফলভাবে আপলোড ও সেভ হয়েছে (Cover photo saved successfully).', 'success');
      }
    } catch (err: any) {
      showToast('কভার ফটো আপলোড ব্যর্থ হয়েছে: ' + (err.message || 'Upload failed'), 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleQuickSaveCover = async () => {
    if (!coverImage || !coverImage.trim()) {
      showToast('অনুগ্রহ করে কভার ফটোর লিঙ্ক দিন অথবা ছবি আপলোড করুন।', 'error');
      return;
    }
    try {
      setSaving(true);
      await api.updateSettings({ coverImage: coverImage.trim() });
      await reloadData();
      showToast('কভার ফটো সফলভাবে সংরক্ষিত হয়েছে (Cover photo saved successfully)!', 'success');
    } catch (err: any) {
      showToast('কভার ফটো সেভ ব্যর্থ হয়েছে: ' + (err.message || 'Failed to save'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings({
        artistName: artistName.trim(),
        headerSubtitle: headerSubtitle.trim(),
        tagline: tagline.trim(),
        coverTagline: coverTagline.trim(),
        coverImage: coverImage.trim(),
        enterButtonText: enterButtonText.trim() || 'ENTER',
        showCoverOnLanding,
        studioLocation: studioLocation.trim(),

        // Placement & layout
        coverNamePosition,
        coverEnterPosition,

        // Typography & sizing
        coverNameFontSize,
        coverSubtitleFontSize,
        coverEnterFontSize,
        coverFontFamily,
        coverNameLetterSpacing,
        coverEnterShape,

        // Colors
        coverNameColor,
        coverSubtitleColor,
        coverEnterTextColor,
        coverEnterBgColor,
        coverEnterBorderColor,
        coverOverlayStyle,
      });
      await reloadData();
      showToast('হোমপেজ সেটিংস ও কভার ফটো সফলভাবে সেভ হয়েছে (Settings saved successfully).', 'success');
    } catch (err: any) {
      showToast('সেটিংস সেভ ব্যর্থ হয়েছে: ' + (err.message || 'Failed to save settings.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditedCover = async (dataUrl: string) => {
    try {
      const res = await api.saveEditedImage(dataUrl, 'cover-edited.jpg');
      setCoverImage(res.fileUrl);
      showToast('Edited cover applied. Remember to click "Save Changes".', 'info');
    } catch (e) {
      showToast('Failed to process image.', 'error');
    }
  };

  const resetToDefaultLayout = () => {
    setCoverNamePosition('bottom-left');
    setCoverEnterPosition('bottom-right');
    setCoverNameFontSize('8xl');
    setCoverNameColor('#ffffff');
    setCoverEnterTextColor('#ffffff');
    setCoverEnterBgColor('transparent');
    setCoverEnterBorderColor('#ffffff');
    setCoverOverlayStyle('gradient');
    showToast('Reset styles to default layout (Name: Bottom-Left, Enter: Bottom-Right).', 'info');
  };

  // Helper classes for live mini preview
  const getMiniPositionClass = (pos: CoverPosition) => {
    switch (pos) {
      case 'bottom-center':
        return 'bottom-3 left-1/2 -translate-x-1/2 text-center items-center';
      case 'bottom-right':
        return 'bottom-3 right-4 text-right items-end';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center items-center';
      case 'top-left':
        return 'top-4 left-4 text-left items-start';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2 text-center items-center';
      case 'top-right':
        return 'top-4 right-4 text-right items-end';
      case 'bottom-left':
      default:
        return 'bottom-3 left-4 text-left items-start';
    }
  };

  const getMiniNameSize = () => {
    switch (coverNameFontSize) {
      case '9xl':
        return 'text-lg sm:text-2xl font-normal';
      case '7xl':
        return 'text-sm sm:text-lg font-normal';
      case '6xl':
        return 'text-xs sm:text-base font-normal';
      case '5xl':
      case '4xl':
        return 'text-xs sm:text-sm font-normal';
      case '8xl':
      default:
        return 'text-base sm:text-xl font-normal';
    }
  };

  const colorPresets = [
    { label: 'White', hex: '#ffffff' },
    { label: 'Warm Cream', hex: '#f6f4ee' },
    { label: 'Platinum Gray', hex: '#d4d4d8' },
    { label: 'Ochre Gold', hex: '#eab308' },
    { label: 'Charcoal Black', hex: '#18181b' },
    { label: 'Soft Terracotta', hex: '#fb923c' },
  ];

  return (
    <div id="admin-homepage-manager" className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
            Hero & Cover Customizer
          </span>
          <h1 className="font-serif text-3xl tracking-wide text-white">Homepage & Cover Customization</h1>
        </div>
        <button
          type="button"
          onClick={resetToDefaultLayout}
          className="self-start sm:self-auto px-3.5 py-1.5 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Guide Banner for User */}
      <div className="bg-[#1a1a1a] border-l-4 border-white p-4 text-xs text-neutral-300 space-y-1">
        <div className="flex items-center gap-2 text-white font-medium text-sm">
          <Info className="w-4 h-4 text-neutral-300 shrink-0" />
          <span>কিভাবে কভারের লেখা, অবস্থান ও কালার এডিট করবেন:</span>
        </div>
        <p className="text-neutral-400 leading-relaxed">
          ১. <strong>অবস্থান (Placement):</strong> নিচের অপশন থেকে শিল্পী নাম ও এন্টার বাটনের অবস্থান (যেমন: নিচে বামে, নিচে ডানে, মাঝে ইত্যাদি) সিলেক্ট করুন।<br />
          ২. <strong>ফন্ট সাইজ ও কালার:</strong> পছন্দমতো টেক্সটের কালার পিকার ও ফন্ট সাইজ পরিবর্তন করুন। উপরে সরাসরি লাইভ প্রিভিউ দেখতে পাবেন।<br />
          ৩. কাজ শেষে নিচে <strong>"Save Homepage Settings"</strong> বাটনে ক্লিক করলে ওয়েবসাইটে সাথে সাথে কার্যকর হবে।
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
        {/* 1. Live Interactive Visual Preview */}
        <div className="bg-[#161616] p-6 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-white" />
              <span>Interactive Live Preview (রিয়েল-টাইম প্রিভিউ)</span>
            </h2>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
              Name: {coverNamePosition} | Enter: {coverEnterPosition}
            </span>
          </div>

          <div className="relative aspect-16/9 bg-neutral-900 border border-neutral-700 overflow-hidden group select-none">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover Preview"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
                <ImageIcon className="w-10 h-10 opacity-40" />
                <span className="text-xs">No cover image configured</span>
              </div>
            )}

            {/* Overlay simulation */}
            <div
              className={`absolute inset-0 pointer-events-none transition-colors ${
                coverOverlayStyle === 'dark'
                  ? 'bg-black/70'
                  : coverOverlayStyle === 'medium'
                  ? 'bg-black/45'
                  : coverOverlayStyle === 'light'
                  ? 'bg-black/20'
                  : coverOverlayStyle === 'none'
                  ? 'bg-transparent'
                  : 'bg-gradient-to-t from-black/85 via-black/25 to-black/30'
              }`}
            />

            {/* Simulated Live Name & Enter components */}
            {coverNamePosition === coverEnterPosition ? (
              <div
                className={`absolute z-10 p-3 max-w-[80%] flex flex-col gap-2 ${getMiniPositionClass(
                  coverNamePosition
                )}`}
              >
                <div>
                  {headerSubtitle ? (
                    <div
                      style={{ color: coverSubtitleColor }}
                      className="text-[9px] uppercase tracking-widest font-light"
                    >
                      {headerSubtitle}
                    </div>
                  ) : null}
                  <div
                    style={{ color: coverNameColor }}
                    className={`uppercase tracking-wider drop-shadow-md ${getMiniNameSize()}`}
                  >
                    {artistName || 'OLIVA BISWAS'}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      color: coverEnterTextColor,
                      backgroundColor:
                        coverEnterBgColor === 'transparent' ? 'transparent' : coverEnterBgColor,
                      borderColor: coverEnterBorderColor,
                    }}
                    className={`inline-block border px-3 py-1 text-[9px] uppercase tracking-widest ${
                      coverEnterShape === 'rounded'
                        ? 'rounded-xs'
                        : coverEnterShape === 'pill'
                        ? 'rounded-full'
                        : 'rounded-none'
                    }`}
                  >
                    {enterButtonText || 'ENTER'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Live Name */}
                <div
                  className={`absolute z-10 p-3 max-w-[65%] flex flex-col ${getMiniPositionClass(
                    coverNamePosition
                  )}`}
                >
                  {headerSubtitle ? (
                    <div
                      style={{ color: coverSubtitleColor }}
                      className="text-[9px] uppercase tracking-widest font-light"
                    >
                      {headerSubtitle}
                    </div>
                  ) : null}
                  <div
                    style={{ color: coverNameColor }}
                    className={`uppercase tracking-wider drop-shadow-md ${getMiniNameSize()}`}
                  >
                    {artistName || 'OLIVA BISWAS'}
                  </div>
                </div>

                {/* Live Enter */}
                <div className={`absolute z-10 p-3 ${getMiniPositionClass(coverEnterPosition)}`}>
                  <span
                    style={{
                      color: coverEnterTextColor,
                      backgroundColor:
                        coverEnterBgColor === 'transparent' ? 'transparent' : coverEnterBgColor,
                      borderColor: coverEnterBorderColor,
                    }}
                    className={`inline-block border px-3.5 py-1 text-[9px] uppercase tracking-widest ${
                      coverEnterShape === 'rounded'
                        ? 'rounded-xs'
                        : coverEnterShape === 'pill'
                        ? 'rounded-full'
                        : 'rounded-none'
                    }`}
                  >
                    {enterButtonText || 'ENTER'}
                  </span>
                </div>
              </>
            )}

            {/* Edit image button */}
            {coverImage && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(true)}
                  className="px-3 py-1.5 bg-white text-black text-[11px] uppercase tracking-wider font-medium flex items-center gap-1.5 shadow-lg hover:bg-neutral-200 transition-colors"
                >
                  <Sliders className="w-3 h-3" /> Adjust Crop / Brightness
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
            <div className="sm:col-span-8">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="sm:col-span-4 flex flex-col justify-end">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block mb-1">
                Or Upload File
              </span>
              <label className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-neutral-700 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Quick Save Action Bar for Cover Photo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800/80 bg-neutral-900/50 p-3 rounded-xs">
            <div className="text-[11px] text-neutral-400 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>ছবি আপলোড করলে সাথে সাথে অটো-সেভ হবে। ম্যানুয়াল URL দিলে ডানের বাটনে ক্লিক করুন:</span>
            </div>
            <button
              type="button"
              onClick={handleQuickSaveCover}
              disabled={saving || uploading}
              className="px-4 py-2 bg-neutral-100 hover:bg-white text-black text-[11px] uppercase tracking-widest font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Cover Photo'}</span>
            </button>
          </div>
        </div>

        {/* 2. PLACEMENT & POSITIONING CONTROLS */}
        <div className="bg-[#161616] p-6 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-medium flex items-center gap-2">
              <Move className="w-4 h-4 text-white" />
              <span>অবস্থান ও প্লেসমেন্ট (Placement & Layout)</span>
            </h2>
            <span className="text-[11px] text-neutral-400">কোথায় নাম ও বাটন থাকবে সিলেক্ট করুন</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Artist Name Position Selector */}
            <div className="space-y-3">
              <label className="text-[11px] uppercase tracking-[0.2em] text-neutral-300 block font-medium">
                শিল্পী নামের অবস্থান (Artist Name Position)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'top-left', label: 'উপরে বামে (Top Left)' },
                  { key: 'top-center', label: 'উপরে মাঝে (Top Center)' },
                  { key: 'top-right', label: 'উপরে ডানে (Top Right)' },
                  { key: 'center', label: 'একদম মাঝে (Center)', colSpan: true },
                  { key: 'bottom-left', label: 'নিচে বামে (Bottom Left - Default)' },
                  { key: 'bottom-center', label: 'নিচে মাঝে (Bottom Center)' },
                  { key: 'bottom-right', label: 'নিচে ডানে (Bottom Right)' },
                ].map(pos => (
                  <button
                    key={pos.key}
                    type="button"
                    onClick={() => setCoverNamePosition(pos.key as CoverPosition)}
                    className={`py-2 px-2 text-[11px] tracking-wide border transition-all cursor-pointer ${
                      pos.colSpan ? 'col-span-3 font-medium' : ''
                    } ${
                      coverNamePosition === pos.key
                        ? 'bg-white text-black border-white font-medium shadow-sm'
                        : 'bg-[#202020] text-neutral-300 border-neutral-700 hover:border-neutral-500 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500">
                বর্তমানে সিলেক্টেড: <span className="text-white font-mono uppercase">{coverNamePosition}</span>
              </p>
            </div>

            {/* Enter Button Position Selector */}
            <div className="space-y-3">
              <label className="text-[11px] uppercase tracking-[0.2em] text-neutral-300 block font-medium">
                এন্টার বাটনের অবস্থান (Enter Button Position)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'top-left', label: 'উপরে বামে (Top Left)' },
                  { key: 'top-center', label: 'উপরে মাঝে (Top Center)' },
                  { key: 'top-right', label: 'উপরে ডানে (Top Right)' },
                  { key: 'center', label: 'একদম মাঝে (Center)', colSpan: true },
                  { key: 'bottom-left', label: 'নিচে বামে (Bottom Left)' },
                  { key: 'bottom-center', label: 'নিচে মাঝে (Bottom Center)' },
                  { key: 'bottom-right', label: 'নিচে ডানে (Bottom Right - Default)' },
                ].map(pos => (
                  <button
                    key={pos.key}
                    type="button"
                    onClick={() => setCoverEnterPosition(pos.key as CoverPosition)}
                    className={`py-2 px-2 text-[11px] tracking-wide border transition-all cursor-pointer ${
                      pos.colSpan ? 'col-span-3 font-medium' : ''
                    } ${
                      coverEnterPosition === pos.key
                        ? 'bg-white text-black border-white font-medium shadow-sm'
                        : 'bg-[#202020] text-neutral-300 border-neutral-700 hover:border-neutral-500 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500">
                বর্তমানে সিলেক্টেড: <span className="text-white font-mono uppercase">{coverEnterPosition}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. FONT SIZES & TYPOGRAPHY */}
        <div className="bg-[#161616] p-6 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-medium flex items-center gap-2">
              <Type className="w-4 h-4 text-white" />
              <span>ফন্ট সাইজ ও টাইপোগ্রাফি (Font Size & Typography)</span>
            </h2>
            <span className="text-[11px] text-neutral-400">টেক্সট সাইজ ও ফন্ট স্টাইল নির্ধারণ করুন</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Artist Name Font Size */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                শিল্পী নামের সাইজ (Artist Name Size)
              </label>
              <select
                value={coverNameFontSize}
                onChange={e => setCoverNameFontSize(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              >
                <option value="9xl">Colossal / Giant (9xl) — সবচেয়ে বড়</option>
                <option value="8xl">Extra Large (8xl) — ডিফল্ট বড়</option>
                <option value="7xl">Large (7xl) — বড়</option>
                <option value="6xl">Medium-Large (6xl) — মাঝারি বড়</option>
                <option value="5xl">Medium (5xl) — মাঝারি</option>
                <option value="4xl">Compact (4xl) — কম্প্যাক্ট</option>
              </select>
            </div>

            {/* Subtitle Font Size */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                সাবটাইটেল সাইজ (Subtitle Size)
              </label>
              <select
                value={coverSubtitleFontSize}
                onChange={e => setCoverSubtitleFontSize(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              >
                <option value="xs">Extra Small (9px/11px)</option>
                <option value="sm">Small (11px/13px - Default)</option>
                <option value="base">Medium (13px/15px)</option>
                <option value="lg">Large (15px/17px)</option>
              </select>
            </div>

            {/* Enter Button Font Size */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                এন্টার বাটন সাইজ (Enter Button Size)
              </label>
              <select
                value={coverEnterFontSize}
                onChange={e => setCoverEnterFontSize(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              >
                <option value="xs">Compact (ছোট বাটন)</option>
                <option value="sm">Regular (স্ট্যান্ডার্ড - Default)</option>
                <option value="base">Medium (মাঝারি বড় বাটন)</option>
                <option value="lg">Large (বড় বাটন)</option>
              </select>
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                ফন্ট ফ্যামিলি (Font Family)
              </label>
              <select
                value={coverFontFamily}
                onChange={e => setCoverFontFamily(e.target.value as 'sans' | 'serif' | 'mono')}
                className="w-full bg-[#202020] border border-neutral-700 px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              >
                <option value="sans">Modern Minimalist (Sans-serif)</option>
                <option value="serif">Classic Fine Art (Serif)</option>
                <option value="mono">Editorial Contemporary (Monospace)</option>
              </select>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                লেটার স্পেসিং (Letter Spacing / Tracking)
              </label>
              <select
                value={coverNameLetterSpacing}
                onChange={e => setCoverNameLetterSpacing(e.target.value as any)}
                className="w-full bg-[#202020] border border-neutral-700 px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              >
                <option value="normal">Normal</option>
                <option value="wide">Wide (0.08em)</option>
                <option value="wider">Wider (0.14em - Default)</option>
                <option value="widest">Widest (0.25em)</option>
              </select>
            </div>

            {/* Button Border Shape */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                বাটন শেপ (Button Shape)
              </label>
              <select
                value={coverEnterShape}
                onChange={e => setCoverEnterShape(e.target.value as 'rectangle' | 'rounded' | 'pill')}
                className="w-full bg-[#202020] border border-neutral-700 px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              >
                <option value="rectangle">Rectangle (শার্প কর্নার - Default)</option>
                <option value="rounded">Slightly Rounded (হালকা গোল কর্নার)</option>
                <option value="pill">Full Pill (ক্যাপসুল / পিল শেপ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. COLORS & APPEARANCE */}
        <div className="bg-[#161616] p-6 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-medium flex items-center gap-2">
              <Palette className="w-4 h-4 text-white" />
              <span>কালার ও থিম কন্ট্রোল (Colors & Appearance)</span>
            </h2>
            <span className="text-[11px] text-neutral-400">লেখা ও বাটনের যেকোনো কালার পরিবর্তন করুন</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Artist Name Color */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                শিল্পী নামের কালার (Name Font Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={coverNameColor}
                  onChange={e => setCoverNameColor(e.target.value)}
                  className="w-9 h-9 p-0 bg-transparent border border-neutral-700 rounded-xs cursor-pointer"
                />
                <input
                  type="text"
                  value={coverNameColor}
                  onChange={e => setCoverNameColor(e.target.value)}
                  className="flex-1 bg-[#202020] border border-neutral-700 px-3 py-2 text-xs text-white font-mono uppercase focus:outline-hidden focus:border-white"
                />
              </div>
              {/* Quick swatches */}
              <div className="flex items-center gap-1.5 pt-1">
                {colorPresets.map(preset => (
                  <button
                    key={preset.hex}
                    type="button"
                    title={preset.label}
                    onClick={() => setCoverNameColor(preset.hex)}
                    style={{ backgroundColor: preset.hex }}
                    className="w-5 h-5 rounded-full border border-neutral-600 hover:scale-115 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            </div>

            {/* Subtitle Color */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                সাবটাইটেল কালার (Subtitle Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={coverSubtitleColor.startsWith('#') ? coverSubtitleColor : '#e5e5e5'}
                  onChange={e => setCoverSubtitleColor(e.target.value)}
                  className="w-9 h-9 p-0 bg-transparent border border-neutral-700 rounded-xs cursor-pointer"
                />
                <input
                  type="text"
                  value={coverSubtitleColor}
                  onChange={e => setCoverSubtitleColor(e.target.value)}
                  className="flex-1 bg-[#202020] border border-neutral-700 px-3 py-2 text-xs text-white font-mono uppercase focus:outline-hidden focus:border-white"
                />
              </div>
            </div>

            {/* Enter Button Text Color */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                এন্টার বাটন টেক্সট কালার (Button Text)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={coverEnterTextColor.startsWith('#') ? coverEnterTextColor : '#ffffff'}
                  onChange={e => setCoverEnterTextColor(e.target.value)}
                  className="w-9 h-9 p-0 bg-transparent border border-neutral-700 rounded-xs cursor-pointer"
                />
                <input
                  type="text"
                  value={coverEnterTextColor}
                  onChange={e => setCoverEnterTextColor(e.target.value)}
                  className="flex-1 bg-[#202020] border border-neutral-700 px-3 py-2 text-xs text-white font-mono uppercase focus:outline-hidden focus:border-white"
                />
              </div>
            </div>

            {/* Enter Button Background Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                  বাটন ব্যাকগ্রাউন্ড (Button Background)
                </label>
                <button
                  type="button"
                  onClick={() => setCoverEnterBgColor('transparent')}
                  className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Set Transparent
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={coverEnterBgColor.startsWith('#') ? coverEnterBgColor : '#000000'}
                  onChange={e => setCoverEnterBgColor(e.target.value)}
                  className="w-9 h-9 p-0 bg-transparent border border-neutral-700 rounded-xs cursor-pointer"
                />
                <input
                  type="text"
                  value={coverEnterBgColor}
                  onChange={e => setCoverEnterBgColor(e.target.value)}
                  placeholder="transparent"
                  className="flex-1 bg-[#202020] border border-neutral-700 px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-white"
                />
              </div>
            </div>

            {/* Enter Button Border Color */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                বাটন বর্ডার কালার (Button Border Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={coverEnterBorderColor.startsWith('#') ? coverEnterBorderColor : '#ffffff'}
                  onChange={e => setCoverEnterBorderColor(e.target.value)}
                  className="w-9 h-9 p-0 bg-transparent border border-neutral-700 rounded-xs cursor-pointer"
                />
                <input
                  type="text"
                  value={coverEnterBorderColor}
                  onChange={e => setCoverEnterBorderColor(e.target.value)}
                  className="flex-1 bg-[#202020] border border-neutral-700 px-3 py-2 text-xs text-white font-mono uppercase focus:outline-hidden focus:border-white"
                />
              </div>
            </div>

            {/* Background Contrast Overlay */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                কভার ব্যাকগ্রাউন্ড ওভারলে (Background Tint)
              </label>
              <select
                value={coverOverlayStyle}
                onChange={e => setCoverOverlayStyle(e.target.value as any)}
                className="w-full bg-[#202020] border border-neutral-700 px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              >
                <option value="gradient">Bottom Gradient (নিচে গ্রেডিয়েন্ট - Default)</option>
                <option value="dark">Deep Dark Tint (গাঢ় কালো টিন্ট 70%)</option>
                <option value="medium">Medium Tint (মাঝারি টিন্ট 45%)</option>
                <option value="light">Subtle Light Tint (হালকা টিন্ট 20%)</option>
                <option value="none">No Tint (কোনো টিন্ট ছাড়া আসল ছবি)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. TEXT CONTENT & LABELS */}
        <div className="bg-[#161616] p-6 border border-neutral-800 space-y-6">
          <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-medium">
            টেক্সট কনটেন্ট (Text Content & Identity)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                শিল্পী নাম (Artist Name)
              </label>
              <input
                type="text"
                required
                value={artistName}
                onChange={e => setArtistName(e.target.value)}
                placeholder="OLIVA BISWAS"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white uppercase tracking-wider focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                  সাবটাইটেল (Subtitle / Eyebrow)
                </label>
                {headerSubtitle ? (
                  <button
                    type="button"
                    onClick={() => setHeaderSubtitle('')}
                    className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider underline cursor-pointer"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <input
                type="text"
                value={headerSubtitle}
                onChange={e => setHeaderSubtitle(e.target.value)}
                placeholder="Contemporary Art (ফাঁকা রাখলে মুছে যাবে)"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                এন্টার বাটন টেক্সট (Enter Button Text)
              </label>
              <input
                type="text"
                value={enterButtonText}
                onChange={e => setEnterButtonText(e.target.value)}
                placeholder="ENTER"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white uppercase tracking-wider focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                স্টুডিও লোকেশন (Studio Locations)
              </label>
              <input
                type="text"
                value={studioLocation}
                onChange={e => setStudioLocation(e.target.value)}
                placeholder="Dhaka / Kolkata / Paris"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <input
                id="toggle-cover-landing"
                type="checkbox"
                checked={showCoverOnLanding}
                onChange={e => setShowCoverOnLanding(e.target.checked)}
                className="w-4 h-4 accent-white rounded-xs cursor-pointer"
              />
              <label htmlFor="toggle-cover-landing" className="text-xs text-neutral-300 select-none cursor-pointer">
                প্রথম ভিজিটে কভার ফটো স্ক্রিন দেখান (Show Cover Photo Landing Screen)
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Homepage Settings'}</span>
          </button>
        </div>
      </form>

      {/* Image Editor Modal */}
      {isEditorOpen && coverImage && (
        <ImageEditorModal
          isOpen={true}
          imageUrl={coverImage}
          onSave={handleSaveEditedCover}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
