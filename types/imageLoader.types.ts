/**
 * Type definitions for Image Loader utilities
 */

/**
 * Image dimensions
 */
export interface ImageDimensions {
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
}

/**
 * Options for Intersection Observer (lazy loading)
 */
export interface LazyLoadOptions {
  /** Margin around the root element */
  rootMargin?: string;
  /** Threshold(s) at which to trigger callback */
  threshold?: number | number[];
  /** The element to use as the viewport */
  root?: Element | null;
}

/**
 * Image data attribute interface
 */
export interface ImageElement extends HTMLImageElement {
  dataset: DOMStringMap & {
    src?: string;
    lazy?: string;
  };
}
