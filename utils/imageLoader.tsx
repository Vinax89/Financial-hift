/**
 * @fileoverview Image optimization utilities
 * @description Utilities for image loading, optimization, and transformation
 */

/**
 * Generates a blur data URL for image placeholders
 * @param {string} src - Original image URL
 * @param {number} width - Blur image width (smaller = faster)
 * @param {number} height - Blur image height
 * @returns {Promise<string>} Base64 blur data URL
 * 
 * @example
 * const blurDataURL = await generateBlurDataURL('/image.jpg', 10, 10);
 */
export async function generateBlurDataURL(src, width = 10, height = 10) {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Load and draw image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
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
 * @param {string} src - Image URL to preload
 * @returns {Promise<void>}
 * 
 * @example
 * await preloadImage('/hero.jpg');
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preloads multiple images
 * @param {Array<string>} sources - Array of image URLs
 * @returns {Promise<void[]>}
 * 
 * @example
 * await preloadImages(['/img1.jpg', '/img2.jpg', '/img3.jpg']);
 */
export function preloadImages(sources) {
  return Promise.all(sources.map(src => preloadImage(src)));
}

/**
 * Gets optimal image size for device
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxWidth - Maximum width constraint
 * @param {number} maxHeight - Maximum height constraint
 * @returns {{width: number, height: number}} Optimal dimensions
 * 
 * @example
 * const { width, height } = getOptimalImageSize(1920, 1080, 800, 600);
 */
export function getOptimalImageSize(originalWidth, originalHeight, maxWidth, maxHeight) {
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
 * @param {string} baseURL - Base image URL without extension
 * @returns {Promise<string>} Best image URL with format
 * 
 * @example
 * const src = await getBestImageFormat('/images/hero');
 * // Returns '/images/hero.webp' or '/images/hero.jpg'
 */
export async function getBestImageFormat(baseURL) {
  const supportsWebP = await isWebPSupported();
  return supportsWebP ? `${baseURL}.webp` : `${baseURL}.jpg`;
}

/**
 * Generates srcSet string for responsive images
 * @param {string} baseURL - Base image URL
 * @param {Array<number>} widths - Array of widths
 * @param {string} extension - Image extension
 * @returns {string} srcSet string
 * 
 * @example
 * const srcSet = generateSrcSet('/img/hero', [400, 800, 1200], 'jpg');
 * // Returns: '/img/hero-400.jpg 400w, /img/hero-800.jpg 800w, /img/hero-1200.jpg 1200w'
 */
export function generateSrcSet(baseURL, widths, extension = 'jpg') {
  return widths
    .map(width => `${baseURL}-${width}.${extension} ${width}w`)
    .join(', ');
}

/**
 * Calculates image file size (approximate)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} quality - JPEG quality (0-1)
 * @returns {number} Estimated file size in bytes
 * 
 * @example
 * const size = estimateImageSize(1920, 1080, 0.8);
 * console.log(`Estimated size: ${(size / 1024).toFixed(2)} KB`);
 */
export function estimateImageSize(width, height, quality = 0.8) {
  // Rough estimation: pixels * bytes per pixel * quality factor
  const pixels = width * height;
  const bytesPerPixel = 3; // RGB
  const compressionFactor = quality;
  return Math.round(pixels * bytesPerPixel * compressionFactor);
}

/**
 * Lazy loads images in viewport
 * @param {string} selector - CSS selector for images
 * @param {Object} options - Intersection Observer options
 * 
 * @example
 * lazyLoadImages('[data-lazy]', { rootMargin: '50px' });
 */
export function lazyLoadImages(selector, options = {}) {
  const images = document.querySelectorAll(selector);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
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
 * @param {File|Blob} file - Image file
 * @returns {Promise<string>} Base64 string
 * 
 * @example
 * const base64 = await imageToBase64(file);
 */
export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes image file
 * @param {File} file - Image file to resize
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} Resized image blob
 * 
 * @example
 * const resized = await resizeImage(file, 800, 600, 0.8);
 */
export async function resizeImage(file, maxWidth, maxHeight, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

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
        blob => resolve(blob),
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
