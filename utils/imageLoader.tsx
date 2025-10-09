/**
 * @fileoverview Image optimization utilities
 * @description Utilities for image loading, optimization, and transformation
 */

import type { ImageDimensions, LazyLoadOptions } from '../types/imageLoader.types';

/**
 * Generates a blur data URL for image placeholders
 * @param src - Original image URL
 * @param width - Blur image width (smaller = faster)
 * @param height - Blur image height
 * @returns Base64 blur data URL
 * 
 * @example
 * const blurDataURL = await generateBlurDataURL('/image.jpg', 10, 10);
 */
export async function generateBlurDataURL(src: string, width = 10, height = 10): Promise<string> {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    // Load and draw image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });

    ctx.drawImage(img, 0, 0, width, height);

    // Return base64
    return canvas.toDataURL('image/jpeg', 0.5);
  } catch (error) {
    console.warn('Failed to generate blur placeholder:', error);
    return '';
  }
}

/**
 * Preloads an image
 * @param src - Image URL to preload
 * @returns Promise that resolves when image is loaded
 * 
 * @example
 * await preloadImage('/hero.jpg');
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preloads multiple images
 * @param sources - Array of image URLs
 * @returns Promise that resolves when all images are loaded
 * 
 * @example
 * await preloadImages(['/img1.jpg', '/img2.jpg', '/img3.jpg']);
 */
export function preloadImages(sources: string[]): Promise<void[]> {
  return Promise.all(sources.map((src: string) => preloadImage(src)));
}

/**
 * Gets optimal image size for device
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum width constraint
 * @param maxHeight - Maximum height constraint
 * @returns Optimal dimensions
 * 
 * @example
 * const { width, height } = getOptimalImageSize(1920, 1080, 800, 600);
 */
export function getOptimalImageSize(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
): ImageDimensions {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // Scale down if larger than max
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Determines if WebP is supported
 * @returns {Promise<boolean>}
 * 
 * @example
 * const supportsWebP = await isWebPSupported();
 */
export function isWebPSupported() {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Gets the best image format for the browser
 * @param baseURL - Base image URL without extension
 * @returns Best image URL with format
 * 
 * @example
 * const src = await getBestImageFormat('/images/hero');
 * // Returns '/images/hero.webp' or '/images/hero.jpg'
 */
export async function getBestImageFormat(baseURL: string): Promise<string> {
  const supportsWebP = await isWebPSupported();
  return supportsWebP ? `${baseURL}.webp` : `${baseURL}.jpg`;
}

/**
 * Generates srcSet string for responsive images
 * @param baseURL - Base image URL
 * @param widths - Array of widths
 * @param extension - Image extension
 * @returns srcSet string
 * 
 * @example
 * const srcSet = generateSrcSet('/img/hero', [400, 800, 1200], 'jpg');
 * // Returns: '/img/hero-400.jpg 400w, /img/hero-800.jpg 800w, /img/hero-1200.jpg 1200w'
 */
export function generateSrcSet(baseURL: string, widths: number[], extension = 'jpg'): string {
  return widths
    .map((width: number) => `${baseURL}-${width}.${extension} ${width}w`)
    .join(', ');
}

/**
 * Calculates image file size (approximate)
 * @param width - Image width
 * @param height - Image height
 * @param quality - JPEG quality (0-1)
 * @returns Estimated file size in bytes
 * 
 * @example
 * const size = estimateImageSize(1920, 1080, 0.8);
 * console.log(`Estimated size: ${(size / 1024).toFixed(2)} KB`);
 */
export function estimateImageSize(width: number, height: number, quality = 0.8): number {
  // Rough estimation: pixels * bytes per pixel * quality factor
  const pixels = width * height;
  const bytesPerPixel = 3; // RGB
  const compressionFactor = quality;
  return Math.round(pixels * bytesPerPixel * compressionFactor);
}

/**
 * Lazy loads images in viewport
 * @param selector - CSS selector for images
 * @param options - Intersection Observer options
 * 
 * @example
 * lazyLoadImages('[data-lazy]', { rootMargin: '50px' });
 */
export function lazyLoadImages(selector: string, options: LazyLoadOptions = {}): () => void {
  const images = document.querySelectorAll<HTMLImageElement>(selector);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px',
    ...options
  });

  images.forEach(img => observer.observe(img));

  return () => images.forEach(img => observer.unobserve(img));
}

/**
 * Converts image to Base64
 * @param file - Image file
 * @returns Base64 string
 * 
 * @example
 * const base64 = await imageToBase64(file);
 */
export function imageToBase64(file: File | Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes image file
 * @param file - Image file to resize
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param quality - JPEG quality (0-1)
 * @returns Resized image blob
 * 
 * @example
 * const resized = await resizeImage(file, 800, 600, 0.8);
 */
export async function resizeImage(
  file: File, 
  maxWidth: number, 
  maxHeight: number, 
  quality = 0.8
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get 2D context'));
      return;
    }

    img.onload = () => {
      const { width, height } = getOptimalImageSize(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default {
  generateBlurDataURL,
  preloadImage,
  preloadImages,
  getOptimalImageSize,
  isWebPSupported,
  getBestImageFormat,
  generateSrcSet,
  estimateImageSize,
  lazyLoadImages,
  imageToBase64,
  resizeImage
};
