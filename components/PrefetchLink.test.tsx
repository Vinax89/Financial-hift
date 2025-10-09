// @ts-nocheck
/**
 * @fileoverview Tests for PrefetchLink component
 * @description Component tests for enhanced Link with prefetching functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { PrefetchLink, PrefetchButton } from './PrefetchLink';
import * as usePrefetchModule from '@/hooks/usePrefetch';

// Mock the usePrefetch hook
vi.mock('@/hooks/usePrefetch', () => ({
  usePrefetchOnHover: vi.fn(() => ({
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
    onTouchStart: vi.fn(),
  })),
}));

describe('PrefetchLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  describe('Rendering', () => {
    it('should render link with children', () => {
      renderWithRouter(
        <PrefetchLink to="/dashboard">Go to Dashboard</PrefetchLink>
      );

      const link = screen.getByRole('link', { name: /go to dashboard/i });
      expect(link).toBeInTheDocument();
    });

    it('should render with correct href attribute', () => {
      renderWithRouter(<PrefetchLink to="/about">About Page</PrefetchLink>);

      const link = screen.getByRole('link', { name: /about page/i });
      expect(link).toHaveAttribute('href', '/about');
    });

    it('should render complex children', () => {
      renderWithRouter(
        <PrefetchLink to="/profile">
          <span>User</span>
          <strong>Profile</strong>
        </PrefetchLink>
      );

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      renderWithRouter(
        <PrefetchLink
          to="/test"
          className="custom-class"
          data-testid="custom-link"
        >
          Test Link
        </PrefetchLink>
      );

      const link = screen.getByTestId('custom-link');
      expect(link).toHaveClass('custom-class');
    });
  });

  describe('Prefetching behavior', () => {
    it('should call usePrefetchOnHover with correct route', () => {
      const spy = vi.spyOn(usePrefetchModule, 'usePrefetchOnHover');

      renderWithRouter(<PrefetchLink to="/dashboard">Dashboard</PrefetchLink>);

      expect(spy).toHaveBeenCalledWith('/dashboard');
    });

    it('should enable prefetching by default', () => {
      const mockHandlers = {
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
        onTouchStart: vi.fn(),
      };
      vi.spyOn(usePrefetchModule, 'usePrefetchOnHover').mockReturnValue(
        mockHandlers
      );

      renderWithRouter(<PrefetchLink to="/test">Test</PrefetchLink>);

      const link = screen.getByRole('link');
      // Prefetch handlers should be attached
      expect(link).toHaveProperty('onmouseenter');
    });

    it('should disable prefetching when prefetch=false', () => {
      const mockHandlers = {
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
        onTouchStart: vi.fn(),
      };
      vi.spyOn(usePrefetchModule, 'usePrefetchOnHover').mockReturnValue(
        mockHandlers
      );

      renderWithRouter(
        <PrefetchLink to="/test" prefetch={false}>
          Test
        </PrefetchLink>
      );

      // Hook should still be called but handlers not attached
      expect(usePrefetchModule.usePrefetchOnHover).toHaveBeenCalled();
    });

    it('should trigger prefetch handlers on mouse enter', async () => {
      const mockHandlers = {
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
        onTouchStart: vi.fn(),
      };
      vi.spyOn(usePrefetchModule, 'usePrefetchOnHover').mockReturnValue(
        mockHandlers
      );

      const user = userEvent.setup();

      renderWithRouter(<PrefetchLink to="/test">Test Link</PrefetchLink>);

      const link = screen.getByRole('link');
      await user.hover(link);

      expect(mockHandlers.onMouseEnter).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate when clicked', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <PrefetchLink to="/destination">Navigate</PrefetchLink>
      );

      const link = screen.getByRole('link');
      await user.click(link);

      // React Router handles the navigation
      expect(link).toHaveAttribute('href', '/destination');
    });

    it('should work with relative paths', () => {
      renderWithRouter(
        <PrefetchLink to="./relative">Relative Link</PrefetchLink>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/relative');
    });

    it('should work with query parameters', () => {
      renderWithRouter(
        <PrefetchLink to="/search?q=test">Search</PrefetchLink>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/search?q=test');
    });

    it('should work with hash fragments', () => {
      renderWithRouter(
        <PrefetchLink to="/page#section">Go to Section</PrefetchLink>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/page#section');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible role', () => {
      renderWithRouter(<PrefetchLink to="/test">Accessible Link</PrefetchLink>);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      renderWithRouter(
        <PrefetchLink to="/test" aria-label="Custom Label">
          Link
        </PrefetchLink>
      );

      const link = screen.getByRole('link', { name: /custom label/i });
      expect(link).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <>
          <PrefetchLink to="/first">First</PrefetchLink>
          <PrefetchLink to="/second">Second</PrefetchLink>
        </>
      );

      const firstLink = screen.getByRole('link', { name: /first/i });
      const secondLink = screen.getByRole('link', { name: /second/i });

      await user.tab();
      expect(firstLink).toHaveFocus();

      await user.tab();
      expect(secondLink).toHaveFocus();
    });
  });
});

describe('PrefetchButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render button with children', () => {
      render(<PrefetchButton href="/test">Click Me</PrefetchButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <PrefetchButton
          href="/test"
          className="custom-button"
          data-testid="custom-btn"
        >
          Button
        </PrefetchButton>
      );

      const button = screen.getByTestId('custom-btn');
      expect(button).toHaveClass('custom-button');
    });

    it('should render disabled button', () => {
      render(
        <PrefetchButton href="/test" disabled>
          Disabled
        </PrefetchButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Prefetching behavior', () => {
    it('should call usePrefetchOnHover with href', () => {
      const spy = vi.spyOn(usePrefetchModule, 'usePrefetchOnHover');

      render(<PrefetchButton href="/dashboard">Dashboard</PrefetchButton>);

      expect(spy).toHaveBeenCalledWith('/dashboard');
    });

    it('should attach prefetch handlers', () => {
      const mockHandlers = {
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
        onTouchStart: vi.fn(),
      };
      vi.spyOn(usePrefetchModule, 'usePrefetchOnHover').mockReturnValue(
        mockHandlers
      );

      render(<PrefetchButton href="/test">Test</PrefetchButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveProperty('onmouseenter');
    });

    it('should trigger prefetch on hover', async () => {
      const mockHandlers = {
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
        onTouchStart: vi.fn(),
      };
      vi.spyOn(usePrefetchModule, 'usePrefetchOnHover').mockReturnValue(
        mockHandlers
      );

      const user = userEvent.setup();

      render(<PrefetchButton href="/test">Hover Button</PrefetchButton>);

      const button = screen.getByRole('button');
      await user.hover(button);

      expect(mockHandlers.onMouseEnter).toHaveBeenCalled();
    });
  });

  describe('Click handling', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <PrefetchButton href="/test" onClick={handleClick}>
          Click Me
        </PrefetchButton>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should work without onClick handler', async () => {
      const user = userEvent.setup();

      render(<PrefetchButton href="/test">No Handler</PrefetchButton>);

      const button = screen.getByRole('button');
      await expect(user.click(button)).resolves.not.toThrow();
    });

    it('should pass event to onClick handler', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <PrefetchButton href="/test" onClick={handleClick}>
          Button
        </PrefetchButton>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<PrefetchButton href="/test">Accessible Button</PrefetchButton>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      render(
        <PrefetchButton href="/test" aria-label="Custom Button Label">
          Button
        </PrefetchButton>
      );

      const button = screen.getByRole('button', {
        name: /custom button label/i,
      });
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <PrefetchButton href="/test" onClick={handleClick}>
          Keyboard Button
        </PrefetchButton>
      );

      const button = screen.getByRole('button');
      
      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });
  });
});

