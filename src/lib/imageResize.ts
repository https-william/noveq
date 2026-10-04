/**
 * Client-side Image Optimization Utility
 * 
 * Resizes an uploaded image file down to a maximum of 800px bounding square
 * and converts to modern WebP format before network transmission.
 */

export interface ResizeOptions {
  maxDimension?: number; // Defaults to 800px
  quality?: number; // 0 to 1, defaults to 0.88
  squareCrop?: boolean; // Crop to 1:1 square or preserve natural aspect ratio
}

export async function resizeImageToWebP(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {
  const { maxDimension = 800, quality = 0.88, squareCrop = false } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        let canvasWidth = width;
        let canvasHeight = height;
        let sx = 0;
        let sy = 0;
        let sWidth = width;
        let sHeight = height;

        if (squareCrop) {
          // Center-crop to 1:1 square
          const minDim = Math.min(width, height);
          sx = (width - minDim) / 2;
          sy = (height - minDim) / 2;
          sWidth = minDim;
          sHeight = minDim;
          canvasWidth = Math.min(minDim, maxDimension);
          canvasHeight = canvasWidth;
        } else {
          // Preserve aspect ratio within maxDimension box
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              canvasHeight = Math.round((height * maxDimension) / width);
              canvasWidth = maxDimension;
            } else {
              canvasWidth = Math.round((width * maxDimension) / height);
              canvasHeight = maxDimension;
            }
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (squareCrop) {
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
        } else {
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to encode image to WebP'));
              return;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '');
            const webpFile = new File([blob], `${cleanName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image file into browser'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
