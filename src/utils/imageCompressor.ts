/**
 * Client-Side Image Compressor for Passport Photos
 * 
 * Automatically resizes and compresses student images using HTML5 Canvas
 * to prevent MongoDB Atlas M0 (512MB) storage exhaustion.
 * 
 * Reduces 2MB-5MB camera photos to ~20KB - 30KB without visual quality loss.
 */

export interface CompressionResult {
  dataUrl: string;
  sizeInKb: number;
  originalSizeKb: number;
  width: number;
  height: number;
}

export async function compressPassportPhoto(
  file: File,
  maxWidth = 300,
  maxHeight = 380,
  quality = 0.8
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('फ़ाइल पढ़ने में त्रुटि हुई'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('अमान्य छवि फ़ाइल'));
      img.onload = () => {
        let { width, height } = img;

        // Maintain aspect ratio within passport limits
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        if (ratio < 1) {
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context प्रारंभ करने में असमर्थ'));
          return;
        }

        // Apply high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeInKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          sizeInKb,
          originalSizeKb,
          width,
          height
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
