/**
 * High-performance, client-side image compressor.
 * Downscales huge camera/phone photos (e.g. 5MB-15MB) into high-fidelity, web-optimized images (~200KB-400KB).
 * Prevents browser memory spikes, quota exceeded errors, and slow network uploads.
 */

export interface CompressionResult {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(
  file: File,
  maxWidth = 2048,
  maxHeight = 2048,
  quality = 0.85
): Promise<CompressionResult> {
  // If not an image or SVG/GIF (preserve animation or vector), return as-is
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      dataUrl,
      width: 0,
      height: 0,
      originalSize: file.size,
      compressedSize: file.size,
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const rawUrl = (e.target?.result as string) || '';
          resolve({
            file,
            dataUrl: rawUrl,
            width,
            height,
            originalSize: file.size,
            compressedSize: file.size,
          });
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Decide output format: webp if supported, otherwise jpeg (fallback to png for transparent pngs)
        const isPngWithTransparency = file.type === 'image/png';
        const outputMime = isPngWithTransparency ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, quality);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const extension = outputMime === 'image/jpeg' ? '.jpg' : '.png';
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${baseName}${extension}`, {
                type: outputMime,
                lastModified: Date.now(),
              });
              resolve({
                file: compressedFile,
                dataUrl,
                width,
                height,
                originalSize: file.size,
                compressedSize: blob.size,
              });
            } else {
              // If compression didn't reduce size (already very small), keep original file with dataUrl
              resolve({
                file,
                dataUrl,
                width,
                height,
                originalSize: file.size,
                compressedSize: file.size,
              });
            }
          },
          outputMime,
          quality
        );
      };

      img.onerror = () => {
        const rawUrl = (e.target?.result as string) || '';
        resolve({
          file,
          dataUrl: rawUrl,
          width: 0,
          height: 0,
          originalSize: file.size,
          compressedSize: file.size,
        });
      };

      img.src = (e.target?.result as string) || '';
    };

    reader.onerror = () => {
      resolve({
        file,
        dataUrl: '',
        width: 0,
        height: 0,
        originalSize: file.size,
        compressedSize: file.size,
      });
    };

    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
