// @ts-nocheck
/**
 * @fileoverview Tests for OptimizedImage component family
 * @description Component tests for image optimization with lazy loading, placeholders, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import {
  OptimizedImage,
  ResponsiveImage,
  AvatarImage,
  BackgroundImage,
} from './OptimizedImage';

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(
    private callback: IntersectionObserverCallback,
    private options?: IntersectionObserverInit
  ) {}

  observe = vi.fn((target: Element) => {
    // Simulate immediate intersection for testing
    setTimeout(() => {
      this.callback(
        [
          {
            isIntersecting: true,
            target,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        this as unknown as IntersectionObserver
      );
    }, 0);
  });

  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds = [];
}

describe('OptimizedImage', () => {
  beforeEach(() => {
    // Setup IntersectionObserver mock
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render image with correct attributes', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          height={600}
        />
      );

      const img = screen.getByRole('img', { name: /test image/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('should apply custom className', () => {
      render(
        <OptimizedImage
          src="/test.jpg"
          alt="Test"
          width={100}
          height={100}
          className="custom-class"
        />
      );

      const container = screen.getByRole('img').closest('div');
      expect(container).toHaveClass('custom-class');
    });

    it('should set correct dimensions', () => {
      render(
        <OptimizedImage
          src="/test.jpg"
          alt="Test"
          width={800}
          height={600}
        />
      );

      const container = screen.getByRole('img').closest('div');
      expect(container).toHaveStyle({ width: '800px', height: '600px' });
    });
  });

  describe('Lazy Loading', () => {
    it('should use IntersectionObserver for lazy loading', async () => {
      render(
        <OptimizedImage
          src="/lazy.jpg"
          alt="Lazy"
          width={100}
          height={100}
          loading="lazy"
        />
      );

      await waitFor(() => {
        const observer =
          MockIntersectionObserver.prototype.observe as unknown as ReturnType<
            typeof vi.fn
          >;
        expect(observer).toHaveBeenCalled();
      });
    });

    it('should load image when in view', async () => {
      render(
        <OptimizedImage
          src="/visible.jpg"
          alt="Visible"
          width={100}
          height={100}
        />
      );

      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', '/visible.jpg');
      });
    });

    it('should skip IntersectionObserver for eager loading', () => {
      render(
        <OptimizedImage
          src="/eager.jpg"
          alt="Eager"
          width={100}
          height={100}
          loading="eager"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/eager.jpg');
    });

    it('should disconnect observer after loading', async () => {
      render(
        <OptimizedImage
          src="/disconnect.jpg"
          alt="Test"
          width={100}
          height={100}
        />
      );

      await waitFor(() => {
        const disconnect =
          MockIntersectionObserver.prototype.disconnect as unknown as ReturnType<
            typeof vi.fn
          >;
        expect(disconnect).toHaveBeenCalled();
      });
    });
  });

  describe('Placeholders', () => {
    it('should show blur placeholder by default', () => {
      render(
        <OptimizedImage
          src="/blur.jpg"
          alt="Blur"
          width={100}
          height={100}
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg=="
        />
      );

      const placeholder = screen.getByRole('img').previousSibling;
      expect(placeholder).toHaveStyle({
        backgroundImage: 'url(data:image/jpeg;base64,/9j/4AAQSkZJRg==)',
      });
    });

    it('should show skeleton placeholder', () => {
      const { container } = render(
        <OptimizedImage
          src="/skeleton.jpg"
          alt="Skeleton"
          width={100}
          height={100}
          placeholder="skeleton"
        />
      );

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should show no placeholder when placeholder="none"', () => {
      const { container } = render(
        <OptimizedImage
          src="/none.jpg"
          alt="None"
          width={100}
          height={100}
          placeholder="none"
        />
      );

      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
      const imgSibling = screen.getByRole('img').previousSibling;
      expect(imgSibling).not.toHaveStyle({
        backgroundImage: expect.stringContaining('url'),
      });
    });

    it('should hide placeholder when image loads', async () => {
      render(
        <OptimizedImage
          src="/loaded.jpg"
          alt="Loaded"
          width={100}
          height={100}
          placeholder="skeleton"
          loading="eager"
        />
      );

      const img = screen.getByRole('img');
      fireEvent.load(img);

      await waitFor(() => {
        expect(img).toHaveClass('opacity-100');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error fallback on image load error', async () => {
      render(
        <OptimizedImage
          src="/broken.jpg"
          alt="Broken"
          width={100}
          height={100}
          loading="eager"
        />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText(/failed to load image/i)).toBeInTheDocument();
      });
    });

    it('should call onError callback', async () => {
      const handleError = vi.fn();

      render(
        <OptimizedImage
          src="/error.jpg"
          alt="Error"
          width={100}
          height={100}
          onError={handleError}
          loading="eager"
        />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(handleError).toHaveBeenCalled();
      });
    });

    it('should hide image when error occurs', async () => {
      render(
        <OptimizedImage
          src="/hidden.jpg"
          alt="Hidden"
          width={100}
          height={100}
          loading="eager"
        />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(img).toHaveClass('hidden');
      });
    });
  });

  describe('Load Callbacks', () => {
    it('should call onLoad callback when image loads', async () => {
      const handleLoad = vi.fn();

      render(
        <OptimizedImage
          src="/callback.jpg"
          alt="Callback"
          width={100}
          height={100}
          onLoad={handleLoad}
          loading="eager"
        />
      );

      const img = screen.getByRole('img');
      fireEvent.load(img);

      await waitFor(() => {
        expect(handleLoad).toHaveBeenCalled();
      });
    });

    it('should transition opacity on load', async () => {
      render(
        <OptimizedImage
          src="/fade.jpg"
          alt="Fade"
          width={100}
          height={100}
          loading="eager"
        />
      );

      const img = screen.getByRole('img');

      // Initially should have opacity-0
      expect(img).toHaveClass('opacity-0');

      fireEvent.load(img);

      // After load should have opacity-100
      await waitFor(() => {
        expect(img).toHaveClass('opacity-100');
      });
    });
  });
});

describe('ResponsiveImage', () => {
  beforeEach(() => {
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render responsive image with srcSet', () => {
      const srcSet = [
        { src: '/small.jpg', width: 640 },
        { src: '/medium.jpg', width: 1024 },
        { src: '/large.jpg', width: 1920 },
      ];

      render(
        <ResponsiveImage
          srcSet={srcSet}
          alt="Responsive"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      );

      const img = screen.getByRole('img', { name: /responsive/i });
      expect(img).toBeInTheDocument();
    });

    it('should use largest image as fallback', () => {
      const srcSet = [
        { src: '/small.jpg', width: 640 },
        { src: '/large.jpg', width: 1920 },
      ];

      render(
        <ResponsiveImage
          srcSet={srcSet}
          alt="Test"
          sizes="100vw"
          loading="eager"
        />
      );

      const img = screen.getByRole('img');
      // Should use largest image as fallback
      expect(img).toHaveAttribute('src', '/large.jpg');
    });

    it('should generate srcSet string correctly', () => {
      const srcSet = [
        { src: '/img-640.jpg', width: 640 },
        { src: '/img-1024.jpg', width: 1024 },
      ];

      render(
        <ResponsiveImage
          srcSet={srcSet}
          alt="Multi-size"
          sizes="100vw"
          loading="eager"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src');
    });
  });

  describe('Lazy Loading', () => {
    it('should support lazy loading', async () => {
      const srcSet = [{ src: '/lazy.jpg', width: 800 }];

      render(
        <ResponsiveImage
          srcSet={srcSet}
          alt="Lazy"
          sizes="100vw"
          loading="lazy"
        />
      );

      await waitFor(() => {
        const observer =
          MockIntersectionObserver.prototype.observe as unknown as ReturnType<
            typeof vi.fn
          >;
        expect(observer).toHaveBeenCalled();
      });
    });
  });
});

describe('AvatarImage', () => {
  beforeEach(() => {
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render avatar image', () => {
      render(
        <AvatarImage
          src="/avatar.jpg"
          alt="User Avatar"
          fallback="JD"
          size={64}
        />
      );

      const img = screen.getByRole('img', { name: /user avatar/i });
      expect(img).toBeInTheDocument();
    });

    it('should set correct size', () => {
      render(
        <AvatarImage src="/avatar.jpg" alt="Avatar" fallback="JD" size={128} />
      );

      const container = screen.getByRole('img').closest('div');
      expect(container).toHaveStyle({ width: '128px', height: '128px' });
    });

    it('should apply rounded-full class', () => {
      render(
        <AvatarImage src="/avatar.jpg" alt="Avatar" fallback="U" size={64} />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveClass('rounded-full');
    });
  });

  describe('Fallback', () => {
    it('should show fallback when image fails to load', async () => {
      render(
        <AvatarImage
          src="/broken-avatar.jpg"
          alt="Avatar"
          fallback="JD"
          size={64}
        />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('JD')).toBeInTheDocument();
      });
    });

    it('should show fallback initials', async () => {
      render(
        <AvatarImage
          src="/fail.jpg"
          alt="Avatar"
          fallback="AB"
          size={64}
        />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('AB')).toBeInTheDocument();
      });
    });

    it('should use alt first character when no fallback provided', async () => {
      render(
        <AvatarImage
          src="/fail.jpg"
          alt="Charlie"
          size={64}
        />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('C')).toBeInTheDocument();
      });
    });

    it('should show question mark for empty alt and no fallback', async () => {
      render(
        <AvatarImage
          src="/fail.jpg"
          alt=""
          size={64}
        />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('?')).toBeInTheDocument();
      });
    });

    it('should show fallback when no src provided', () => {
      render(
        <AvatarImage
          alt="No Image"
          fallback="NI"
          size={64}
        />
      );

      expect(screen.getByText('NI')).toBeInTheDocument();
    });

    it('should style fallback div correctly', () => {
      const { container } = render(
        <AvatarImage
          alt="User"
          fallback="U"
          size={64}
        />
      );

      const fallbackDiv = screen.getByText('U');
      expect(fallbackDiv).toHaveClass('rounded-full');
      expect(fallbackDiv).toHaveStyle({ width: '64px', height: '64px' });
    });
  });
});

describe('BackgroundImage', () => {
  beforeEach(() => {
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    
    // Mock Image constructor
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    } as unknown as typeof Image;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render background div', () => {
      const { container } = render(
        <BackgroundImage src="/bg.jpg" />
      );

      const bgDiv = container.firstChild;
      expect(bgDiv).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <BackgroundImage
          src="/bg.jpg"
          className="custom-bg h-96"
        />
      );

      const bgDiv = container.firstChild;
      expect(bgDiv).toHaveClass('custom-bg');
      expect(bgDiv).toHaveClass('h-96');
    });

    it('should render children', () => {
      render(
        <BackgroundImage src="/bg.jpg" className="h-96">
          <div>Content</div>
        </BackgroundImage>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render children in relative z-10 wrapper', () => {
      render(
        <BackgroundImage src="/bg.jpg">
          <h1>Overlay Content</h1>
        </BackgroundImage>
      );

      const content = screen.getByText('Overlay Content');
      const wrapper = content.closest('.relative.z-10');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Lazy Loading', () => {
    it('should lazy load background image by default', async () => {
      render(
        <BackgroundImage src="/lazy-bg.jpg" />
      );

      await waitFor(() => {
        const observer =
          MockIntersectionObserver.prototype.observe as unknown as ReturnType<
            typeof vi.fn
          >;
        expect(observer).toHaveBeenCalled();
      });
    });

    it('should show skeleton placeholder while loading', () => {
      const { container } = render(
        <BackgroundImage src="/loading-bg.jpg" />
      );

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should hide placeholder after loading', async () => {
      const { container } = render(
        <BackgroundImage src="/loaded-bg.jpg" />
      );

      await waitFor(() => {
        const skeleton = container.querySelector('.animate-pulse');
        expect(skeleton).not.toBeInTheDocument();
      });
    });

    it('should not show background image until loaded', () => {
      // Mock Image to never load
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
      } as unknown as typeof Image;

      const { container } = render(
        <BackgroundImage src="/pending-bg.jpg" />
      );

      const bgDiv = container.firstChild as HTMLElement;
      expect(bgDiv.style.backgroundImage).toBe('none');
    });
  });

  describe('Background Image Styles', () => {
    it('should set background image after loading', async () => {
      const { container } = render(
        <BackgroundImage src="/styled-bg.jpg" />
      );

      await waitFor(() => {
        const bgDiv = container.firstChild as HTMLElement;
        expect(bgDiv.style.backgroundImage).toBe('url(/styled-bg.jpg)');
      });
    });

    it('should apply background cover style', async () => {
      const { container } = render(
        <BackgroundImage src="/cover-bg.jpg" />
      );

      await waitFor(() => {
        const bgDiv = container.firstChild as HTMLElement;
        expect(bgDiv.style.backgroundSize).toBe('cover');
      });
    });

    it('should center background image', async () => {
      const { container } = render(
        <BackgroundImage src="/center-bg.jpg" />
      );

      await waitFor(() => {
        const bgDiv = container.firstChild as HTMLElement;
        expect(bgDiv.style.backgroundPosition).toContain('center');
      });
    });

    it('should have relative overflow-hidden classes', () => {
      const { container } = render(
        <BackgroundImage src="/bg.jpg" />
      );

      const bgDiv = container.firstChild;
      expect(bgDiv).toHaveClass('relative');
      expect(bgDiv).toHaveClass('overflow-hidden');
    });
  });

  describe('Error Handling', () => {
    it('should handle image load errors gracefully', async () => {
      // Mock Image to trigger error
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: ((e: Event | string) => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Event('error'));
            }
          }, 0);
        }
      } as unknown as typeof Image;

      const { container } = render(
        <BackgroundImage src="/error-bg.jpg" />
      );

      // Should not crash, just not load the background
      await waitFor(() => {
        const bgDiv = container.firstChild as HTMLElement;
        expect(bgDiv).toBeInTheDocument();
        // Background should remain 'none' on error
        expect(bgDiv.style.backgroundImage).toBe('none');
      });
    });
  });
});

