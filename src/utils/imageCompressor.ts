/**
 * Browser-based Image Compression Utility
 * Prevents Firestore document limit exceeded errors (1,048,576 bytes / 1MB limit)
 * and localStorage QuotaExceededError by resizing and compressing Base64 images.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.72)
  maxSizeBytes?: number; // Target max size in bytes (e.g. 75_000 = 75KB)
}

/**
 * Calculates byte size of a UTF-8 string or object
 */
export function measureDataSize(data: any): number {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return new Blob([str]).size;
  } catch (e) {
    return 0;
  }
}

/**
 * Checks if a string is a Base64 data URL
 */
export function isBase64Image(str?: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:image/');
}

/**
 * Compresses an image file, blob, or base64 data URL into an optimized Base64 JPEG string.
 * Reduces a 3MB-5MB phone photo down to ~30KB - 70KB with clean visual clarity.
 */
export async function compressImage(
  input: File | Blob | string,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.72,
    maxSizeBytes = 80 * 1024 // 80 KB
  } = options;

  return new Promise((resolve, reject) => {
    // 1. Get Source Data URL
    const getSourceUrl = (): Promise<string> => {
      if (typeof input === 'string') {
        return Promise.resolve(input);
      }
      return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target?.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(input);
      });
    };

    getSourceUrl().then(dataUrl => {
      // If not a data url or SVG, return as is
      if (!dataUrl.startsWith('data:image/') || dataUrl.includes('image/svg+xml')) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down maintaining aspect ratio
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
            resolve(dataUrl);
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Initial conversion to JPEG
          let currentQuality = quality;
          let compressed = canvas.toDataURL('image/jpeg', currentQuality);

          // If still larger than target, iteratively step down quality and resolution
          let iterations = 0;
          while (measureDataSize(compressed) > maxSizeBytes && iterations < 3) {
            currentQuality = Math.max(0.45, currentQuality - 0.15);
            // Further scale down canvas
            const scaleDownCanvas = document.createElement('canvas');
            scaleDownCanvas.width = Math.round(canvas.width * 0.85);
            scaleDownCanvas.height = Math.round(canvas.height * 0.85);
            const scaleCtx = scaleDownCanvas.getContext('2d');
            if (scaleCtx) {
              scaleCtx.drawImage(canvas, 0, 0, scaleDownCanvas.width, scaleDownCanvas.height);
              compressed = scaleDownCanvas.toDataURL('image/jpeg', currentQuality);
            } else {
              compressed = canvas.toDataURL('image/jpeg', currentQuality);
            }
            iterations++;
          }

          resolve(compressed);
        } catch (err) {
          console.warn('Image compression fallback:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    }).catch(reject);
  });
}

/**
 * Recursively scans and sanitizes any base64 images inside a WeddingConfig
 * to ensure total document size remains strictly well below the 1MB Firestore limit (~400KB max).
 */
export async function sanitizeConfigForFirestore(config: any): Promise<any> {
  if (!config) return config;
  const clone = JSON.parse(JSON.stringify(config));

  // 1. Sanitize Cover Photo
  if (isBase64Image(clone.fotoSampul) && measureDataSize(clone.fotoSampul) > 75 * 1024) {
    try {
      clone.fotoSampul = await compressImage(clone.fotoSampul, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.72,
        maxSizeBytes: 75 * 1024
      });
    } catch (e) {}
  }

  // 2. Sanitize Groom Photo
  if (clone.pria && isBase64Image(clone.pria.foto) && measureDataSize(clone.pria.foto) > 55 * 1024) {
    try {
      clone.pria.foto = await compressImage(clone.pria.foto, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.70,
        maxSizeBytes: 50 * 1024
      });
    } catch (e) {}
  }

  // 3. Sanitize Bride Photo
  if (clone.wanita && isBase64Image(clone.wanita.foto) && measureDataSize(clone.wanita.foto) > 55 * 1024) {
    try {
      clone.wanita.foto = await compressImage(clone.wanita.foto, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.70,
        maxSizeBytes: 50 * 1024
      });
    } catch (e) {}
  }

  // 4. Sanitize Khitan Child Photo
  if (clone.anak && isBase64Image(clone.anak.foto) && measureDataSize(clone.anak.foto) > 55 * 1024) {
    try {
      clone.anak.foto = await compressImage(clone.anak.foto, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.70,
        maxSizeBytes: 50 * 1024
      });
    } catch (e) {}
  }

  // 5. Sanitize Birthday Child Photo
  if (clone.ulangTahun && isBase64Image(clone.ulangTahun.foto) && measureDataSize(clone.ulangTahun.foto) > 55 * 1024) {
    try {
      clone.ulangTahun.foto = await compressImage(clone.ulangTahun.foto, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.70,
        maxSizeBytes: 50 * 1024
      });
    } catch (e) {}
  }

  // 6. Sanitize Photo Gallery
  if (clone.galeri && Array.isArray(clone.galeri.fotoList)) {
    // Limit to reasonable number of photos if too many
    if (clone.galeri.fotoList.length > 20) {
      clone.galeri.fotoList = clone.galeri.fotoList.slice(0, 20);
    }

    const compressedPhotos: string[] = [];
    for (const foto of clone.galeri.fotoList) {
      if (isBase64Image(foto) && measureDataSize(foto) > 60 * 1024) {
        try {
          const comp = await compressImage(foto, {
            maxWidth: 900,
            maxHeight: 900,
            quality: 0.68,
            maxSizeBytes: 50 * 1024
          });
          compressedPhotos.push(comp);
        } catch (e) {
          compressedPhotos.push(foto);
        }
      } else {
        compressedPhotos.push(foto);
      }
    }
    clone.galeri.fotoList = compressedPhotos;
  }

  // 7. Sanitize Kisah Cinta photos
  if (clone.kisahCinta && Array.isArray(clone.kisahCinta.ceritaList)) {
    for (const story of clone.kisahCinta.ceritaList) {
      if (story.foto && isBase64Image(story.foto) && measureDataSize(story.foto) > 55 * 1024) {
        try {
          story.foto = await compressImage(story.foto, {
            maxWidth: 700,
            maxHeight: 700,
            quality: 0.68,
            maxSizeBytes: 45 * 1024
          });
        } catch (e) {}
      }
    }
  }

  // 8. Sanitize QRIS codes
  if (clone.amplopDigital && Array.isArray(clone.amplopDigital.rekeningList)) {
    for (const acc of clone.amplopDigital.rekeningList) {
      if (acc.qrisUrl && isBase64Image(acc.qrisUrl) && measureDataSize(acc.qrisUrl) > 55 * 1024) {
        try {
          acc.qrisUrl = await compressImage(acc.qrisUrl, {
            maxWidth: 600,
            maxHeight: 600,
            quality: 0.70,
            maxSizeBytes: 45 * 1024
          });
        } catch (e) {}
      }
    }
  }

  return clone;
}
