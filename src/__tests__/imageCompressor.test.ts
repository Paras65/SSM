import { describe, it, expect, vi } from 'vitest';
import { compressPassportPhoto } from '../utils/imageCompressor';

describe('Image Compressor Utility', () => {
  it('should export compressPassportPhoto function', () => {
    expect(typeof compressPassportPhoto).toBe('function');
  });

  it('should calculate canvas dimensions and compress correctly with mocked Canvas', async () => {
    // Mock canvas context
    const mockDrawImage = vi.fn();
    const mockToDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mockCompressedDataString123456');

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            imageSmoothingEnabled: false,
            imageSmoothingQuality: 'low',
            drawImage: mockDrawImage
          }),
          toDataURL: mockToDataURL
        } as any;
      }
      return document.createElement(tagName);
    });

    // Mock Image
    const originalImage = window.Image;
    (window as any).Image = class {
      onload: () => void = () => {};
      width = 800;
      height = 1000;
      set src(_val: string) {
        setTimeout(() => this.onload(), 10);
      }
    };

    // Mock FileReader
    const originalFileReader = window.FileReader;
    (window as any).FileReader = class {
      onload: () => void = () => {};
      result = 'data:image/jpeg;base64,mockOriginalData';
      readAsDataURL() {
        setTimeout(() => this.onload(), 10);
      }
    };

    const dummyFile = new File(['dummy-content'], 'student.jpg', { type: 'image/jpeg' });
    const result = await compressPassportPhoto(dummyFile, 300, 380, 0.8);

    expect(result).toBeDefined();
    expect(result.dataUrl).toContain('data:image/jpeg');
    expect(result.width).toBeLessThanOrEqual(300);
    expect(result.height).toBeLessThanOrEqual(380);
    expect(mockDrawImage).toHaveBeenCalled();

    // Restore
    window.Image = originalImage;
    window.FileReader = originalFileReader;
    vi.restoreAllMocks();
  });
});

