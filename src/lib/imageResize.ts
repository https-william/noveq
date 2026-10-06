/**
 * Client-side Image Optimization Utility
 * 
 * Resizes an uploaded image file down to a maximum bounding dimension (default 1200px)
 * and converts to modern WebP format before network transmission.
 * Includes graceful fallbacks for mobile browsers, HEIC, and canvas memory limits.
 */

export interface ResizeOptions {
  maxDimension?: number; // Defaults to 1200px
  quality?: number; // 0 to 1, defaults to 0.88
  squareCrop?: boolean; // Crop to 1:1 square or preserve natural aspect ratio
}

export async function resizeImageToWebP(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {
  const { maxDimension = 1200, quality = 0.88, squareCrop = false } = options;

  // If file is HEIC or RAW (unsupported by standard browser canvas), return original for server Sharp conversion
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.heic') || lowerName.endsWith('.heif') || lowerName.endsWith('.raw')) {
    return file;
  }

  return new Promise((resolve) => {
    // If not running in browser environment, return original file
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(file);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          if (!width || !height) {
            resolve(file);
            return;
          }

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
            resolve(file);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          if (squareCrop) {
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
          } else {
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          }

          // Try WebP first
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const cleanName = file.name.replace(/\.[^/.]+$/, '');
                const webpFile = new File([blob], `${cleanName}.webp`, {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(webpFile);
                return;
              }

              // Fallback to JPEG if browser canvas cannot export WebP
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    const cleanName = file.name.replace(/\.[^/.]+$/, '');
                    const jpegFile = new File([jpegBlob], `${cleanName}.jpg`, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    });
                    resolve(jpegFile);
                  } else {
                    resolve(file);
                  }
                },
                'image/jpeg',
                quality
              );
            },
            'image/webp',
            quality
          );
        } catch {
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
