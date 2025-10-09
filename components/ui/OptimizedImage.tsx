/**
 * @fileoverview Optimized image component with lazy loading and blur-up effect
 * @description Provides optimized image loading with progressive enhancement,
 * lazy loading, blur placeholders, and error handling
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { ReactNode, SyntheticEvent } from 'react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  placeholder?: 'blur' | 'skeleton' | 'none';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
  onLoad?: (e: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: SyntheticEvent<HTMLImageElement>) => void;
  [key: string]: any;
}

export interface ImageSource {
  src: string;
  width: number;
}

export interface ResponsiveImageProps {
  srcSet: ImageSource[];
  alt: string;
  sizes: string;
  className?: string;
  [key: string]: any;
}

export interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: number;
  fallback?: string;
  className?: string;
}

export interface BackgroundImageProps {
  src: string;
  children?: ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * Optimized Image Component with lazy loading and blur-up effect
 * @component
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 * @param {string} props.placeholder - Placeholder type: 'blur', 'skeleton', 'none'
 * @param {string} props.blurDataURL - Base64 blur placeholder (optional)
 * @param {string} props.loading - Loading strategy: 'lazy', 'eager'
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onLoad - Callback when image loads
 * @param {Function} props.onError - Callback on error
 * @returns {JSX.Element}
 * 
 * @example
 * <OptimizedImage
 *   src="/hero.jpg"
 *   alt="Dashboard"
 *   width={800}
 *   height={600}
 *   placeholder="blur"
 *   loading="lazy"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  placeholder = 'blur',
  blurDataURL,
  loading = 'lazy',
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [loading]);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Generate blur placeholder if not provided
  const getPlaceholder = () => {
    if (placeholder === 'none') return null;
    
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
          aria-hidden="true"
        />
      );
    }

    if (placeholder === 'skeleton' || placeholder === 'blur') {
      return (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      );
    }

    return null;
  };

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && getPlaceholder()}

      {/* Actual Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * Responsive image with multiple sources
 * @component
 * @param {Object} props
 * @param {Array<{src: string, width: number}>} props.srcSet - Array of image sources
 * @param {string} props.alt - Alt text
 * @param {string} props.sizes - Sizes attribute
 * @returns {JSX.Element}
 * 
 * @example
 * <ResponsiveImage
 *   srcSet={[
 *     { src: '/hero-400.jpg', width: 400 },
 *     { src: '/hero-800.jpg', width: 800 },
 *     { src: '/hero-1200.jpg', width: 1200 }
 *   ]}
 *   alt="Hero"
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 */
export function ResponsiveImage({ srcSet, alt, sizes, className, ...props }: ResponsiveImageProps) {
  const srcSetString = srcSet
    .map(({ src, width }: ImageSource) => `${src} ${width}w`)
    .join(', ');

  const largestImage = srcSet[srcSet.length - 1];

  return (
    <OptimizedImage
      src={largestImage.src} // Fallback to largest
      width={largestImage.width}
      height={largestImage.width} // Assume square or provide height in props
      alt={alt}
      className={className}
      {...props}
    />
  );
}

/**
 * Avatar image with rounded corners and fallback
 * @component
 * @param {Object} props
 * @param {string} props.src - Avatar image URL
 * @param {string} props.alt - Alt text (usually user name)
 * @param {number} props.size - Avatar size in pixels
 * @param {string} props.fallback - Fallback text (initials)
 * @returns {JSX.Element}
 * 
 * @example
 * <AvatarImage
 *   src="/user-avatar.jpg"
 *   alt="John Doe"
 *   size={40}
 *   fallback="JD"
 * />
 */
export function AvatarImage({ src, alt, size = 40, fallback, className }: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {fallback || alt?.charAt(0) || '?'}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setHasError(true)}
      className={cn("rounded-full", className)}
      placeholder="skeleton"
    />
  );
}

/**
 * Background image with lazy loading
 * @component
 * @param {Object} props
 * @param {string} props.src - Background image URL
 * @param {React.ReactNode} props.children - Content to overlay
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 * 
 * @example
 * <BackgroundImage src="/hero-bg.jpg" className="h-96">
 *   <h1>Welcome</h1>
 * </BackgroundImage>
 */
export function BackgroundImage({ src, children, className, ...props }: BackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [isInView, src]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      {...props}
    >
      {!isLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default OptimizedImage;
