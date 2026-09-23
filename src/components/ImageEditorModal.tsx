import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  Sliders,
  Crop as CropIcon,
  Check,
  RefreshCw,
  Maximize2,
} from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  imageUrl: string;
  onSave: (editedDataUrl: string) => Promise<void> | void;
  onClose: () => void;
}

type AspectPreset = 'original' | '1:1' | '4:5' | '16:9' | '3:2' | 'free';

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  imageUrl,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Transformations
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flippedH, setFlippedH] = useState<boolean>(false);
  const [aspect, setAspect] = useState<AspectPreset>('original');
  const [brightness, setBrightness] = useState<number>(0); // -50 to 50
  const [contrast, setContrast] = useState<number>(0); // -50 to 50
  const [saturation, setSaturation] = useState<number>(0); // -50 to 50
  const [targetWidth, setTargetWidth] = useState<number>(1200);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'crop' | 'transform'>('adjust');

  // Load original image
  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setOriginalImage(img);
      setTargetWidth(Math.min(img.naturalWidth, 1600));
      // Reset state
      setRotation(0);
      setFlippedH(false);
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setAspect('original');
    };
  }, [isOpen, imageUrl]);

  // Redraw canvas whenever parameters change
  const renderCanvas = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const naturalW = originalImage.naturalWidth;
    const naturalH = originalImage.naturalHeight;

    // Determine crop dimensions based on aspect ratio preset
    let cropW = naturalW;
    let cropH = naturalH;

    if (aspect === '1:1') {
      const minDim = Math.min(naturalW, naturalH);
      cropW = minDim;
      cropH = minDim;
    } else if (aspect === '4:5') {
      if (naturalW / naturalH > 4 / 5) {
        cropH = naturalH;
        cropW = naturalH * (4 / 5);
      } else {
        cropW = naturalW;
        cropH = naturalW * (5 / 4);
      }
    } else if (aspect === '16:9') {
      if (naturalW / naturalH > 16 / 9) {
        cropH = naturalH;
        cropW = naturalH * (16 / 9);
      } else {
        cropW = naturalW;
        cropH = naturalW * (9 / 16);
      }
    } else if (aspect === '3:2') {
      if (naturalW / naturalH > 3 / 2) {
        cropH = naturalH;
        cropW = naturalH * (3 / 2);
      } else {
        cropW = naturalW;
        cropH = naturalW * (2 / 3);
      }
    }

    const cropX = (naturalW - cropW) / 2;
    const cropY = (naturalH - cropH) / 2;

    // Account for rotation
    const isRotated90or270 = rotation === 90 || rotation === 270;
    const outputW = isRotated90or270 ? cropH : cropW;
    const outputH = isRotated90or270 ? cropW : cropH;

    // Scale to target width if specified
    const scale = targetWidth > 0 && targetWidth < outputW ? targetWidth / outputW : 1;
    const finalW = Math.round(outputW * scale);
    const finalH = Math.round(outputH * scale);

    canvas.width = finalW;
    canvas.height = finalH;

    // Apply color filters via CSS canvas filter
    // Brightness: 100% + val%
    // Contrast: 100% + val%
    // Saturation: 100% + val%
    const b = 100 + brightness;
    const c = 100 + contrast;
    const s = 100 + saturation;
    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;

    ctx.save();
    ctx.translate(finalW / 2, finalH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flippedH) {
      ctx.scale(-1, 1);
    }

    const drawW = Math.round(cropW * scale);
    const drawH = Math.round(cropH * scale);

    ctx.drawImage(
      originalImage,
      cropX,
      cropY,
      cropW,
      cropH,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );
    ctx.restore();
  }, [originalImage, rotation, flippedH, aspect, brightness, contrast, saturation, targetWidth]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (!canvasRef.current) return;
    try {
      setSaving(true);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
      await onSave(dataUrl);
      onClose();
    } catch (e) {
      console.error('Failed to save edited image:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setRotation(0);
    setFlippedH(false);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setAspect('original');
    if (originalImage) {
      setTargetWidth(Math.min(originalImage.naturalWidth, 1600));
    }
  };

  return (
    <div
      id="image-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs"
    >
      <div
        id="image-editor-container"
        className="bg-[#191919] text-neutral-100 max-w-5xl w-full h-[90vh] flex flex-col border border-neutral-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#121212]">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium tracking-wider uppercase text-neutral-200">
              Artwork Image Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider uppercase text-neutral-400 hover:text-white transition-colors"
              title="Reset all adjustments"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main body: Canvas preview on left, tools on right */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Canvas viewport */}
          <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-6 overflow-hidden relative">
            <canvas
              ref={canvasRef}
              className="max-h-full max-w-full object-contain shadow-2xl border border-neutral-800"
            />
          </div>

          {/* Right sidebar tools */}
          <div className="w-full lg:w-80 bg-[#141414] border-t lg:border-t-0 lg:border-l border-neutral-800 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-neutral-800 text-xs tracking-widest uppercase">
              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-3 px-2 text-center transition-colors ${
                  activeTab === 'adjust'
                    ? 'border-b-2 border-white text-white font-medium bg-neutral-900/50'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Adjust
              </button>
              <button
                onClick={() => setActiveTab('crop')}
                className={`flex-1 py-3 px-2 text-center transition-colors ${
                  activeTab === 'crop'
                    ? 'border-b-2 border-white text-white font-medium bg-neutral-900/50'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Aspect / Crop
              </button>
              <button
                onClick={() => setActiveTab('transform')}
                className={`flex-1 py-3 px-2 text-center transition-colors ${
                  activeTab === 'transform'
                    ? 'border-b-2 border-white text-white font-medium bg-neutral-900/50'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Transform
              </button>
            </div>

            {/* Controls content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {activeTab === 'adjust' && (
                <div className="space-y-6">
                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Brightness</span>
                      <span className="font-mono">{brightness > 0 ? `+${brightness}` : brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={brightness}
                      onChange={e => setBrightness(Number(e.target.value))}
                      className="w-full accent-white bg-neutral-800 h-1.5 rounded-none cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Contrast</span>
                      <span className="font-mono">{contrast > 0 ? `+${contrast}` : contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={contrast}
                      onChange={e => setContrast(Number(e.target.value))}
                      className="w-full accent-white bg-neutral-800 h-1.5 rounded-none cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Saturation</span>
                      <span className="font-mono">{saturation > 0 ? `+${saturation}` : saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={saturation}
                      onChange={e => setSaturation(Number(e.target.value))}
                      className="w-full accent-white bg-neutral-800 h-1.5 rounded-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'crop' && (
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-2">
                    Aspect Ratio Preset
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'original', label: 'Original' },
                      { key: '1:1', label: '1:1 Square' },
                      { key: '4:5', label: '4:5 Portrait' },
                      { key: '3:2', label: '3:2 Standard' },
                      { key: '16:9', label: '16:9 Cinema' },
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => setAspect(item.key as AspectPreset)}
                        className={`px-3 py-2 text-xs border text-left transition-colors ${
                          aspect === item.key
                            ? 'border-white bg-white text-black font-medium'
                            : 'border-neutral-800 text-neutral-300 hover:border-neutral-600'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'transform' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-3">
                      Rotation & Orientation
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                        className="p-3 border border-neutral-800 hover:border-neutral-600 flex flex-col items-center gap-1 text-xs text-neutral-300"
                        title="Rotate 90° counter-clockwise"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>-90°</span>
                      </button>
                      <button
                        onClick={() => setRotation(r => (r + 90) % 360)}
                        className="p-3 border border-neutral-800 hover:border-neutral-600 flex flex-col items-center gap-1 text-xs text-neutral-300"
                        title="Rotate 90° clockwise"
                      >
                        <RotateCw className="w-4 h-4" />
                        <span>+90°</span>
                      </button>
                      <button
                        onClick={() => setFlippedH(f => !f)}
                        className={`p-3 border flex flex-col items-center gap-1 text-xs transition-colors ${
                          flippedH
                            ? 'border-white bg-white text-black'
                            : 'border-neutral-800 text-neutral-300 hover:border-neutral-600'
                        }`}
                        title="Flip horizontally"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                        <span>Flip</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-2">
                      Maximum Output Width (px)
                    </span>
                    <input
                      type="number"
                      min="400"
                      max="3200"
                      step="100"
                      value={targetWidth}
                      onChange={e => setTargetWidth(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:outline-hidden focus:border-neutral-500 font-mono"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Controls file size and image optimization.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="p-4 border-t border-neutral-800 bg-[#101010] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-xs uppercase tracking-widest text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={saving}
                className="flex-1 py-2.5 text-xs uppercase tracking-widest bg-white text-black font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? 'Applying...' : 'Apply & Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
