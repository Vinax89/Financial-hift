/**
 * @fileoverview Tests for Loading Components
 * @description Unit tests for PulseLoader, SkeletonLoader, ProgressBar, SpinnerLoader
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PulseLoader,
  SkeletonLoader,
  ProgressBar,
  SpinnerLoader,
} from '@/ui/loading';

describe('PulseLoader', () => {
  it('renders with default props', () => {
    const { container } = render(<PulseLoader />);
    
    const loader = container.querySelector('[role="status"]');
    expect(loader).toBeInTheDocument();
  });

  it('displays loading text', () => {
    render(<PulseLoader />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('accepts custom text', () => {
    render(<PulseLoader text="Processing..." />);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    const { container, rerender } = render(<PulseLoader size="sm" />);
    
    let dots = container.querySelectorAll('.animate-pulse');
    expect(dots[0]).toHaveClass('h-2', 'w-2');

    rerender(<PulseLoader size="md" />);
    dots = container.querySelectorAll('.animate-pulse');
    expect(dots[0]).toHaveClass('h-3', 'w-3');

    rerender(<PulseLoader size="lg" />);
    dots = container.querySelectorAll('.animate-pulse');
    expect(dots[0]).toHaveClass('h-4', 'w-4');
  });

  it('renders three animated dots', () => {
    const { container } = render(<PulseLoader />);
    
    const dots = container.querySelectorAll('.animate-pulse');
    expect(dots).toHaveLength(3);
  });

  it('has proper ARIA attributes', () => {
    const { container } = render(<PulseLoader />);
    
    const loader = container.querySelector('[role="status"]');
    expect(loader).toHaveAttribute('aria-live', 'polite');
    expect(loader).toHaveAttribute('aria-busy', 'true');
  });

  it('hides text from screen readers', () => {
    render(<PulseLoader text="Loading data" />);
    
    const text = screen.getByText('Loading data');
    expect(text).toHaveClass('sr-only');
  });
});

describe('SkeletonLoader', () => {
  it('renders skeleton with default props', () => {
    const { container } = render(<SkeletonLoader />);
    
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('supports different variants', () => {
    const { container, rerender } = render(<SkeletonLoader variant="text" />);
    
    let skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('h-4');

    rerender(<SkeletonLoader variant="circular" />);
    skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('rounded-full');

    rerender(<SkeletonLoader variant="rectangular" />);
    skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('rounded');
  });

  it('accepts custom dimensions', () => {
    const { container } = render(<SkeletonLoader width="200px" height="100px" />);
    
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '100px',
    });
  });

  it('can render multiple lines', () => {
    const { container } = render(<SkeletonLoader variant="text" count={3} />);
    
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3);
  });

  it('has proper ARIA attributes', () => {
    const { container } = render(<SkeletonLoader />);
    
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });
});

describe('ProgressBar', () => {
  it('renders progress bar with value', () => {
    render(<ProgressBar value={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('displays correct progress value', () => {
    render(<ProgressBar value={75} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });

  it('displays progress percentage text', () => {
    render(<ProgressBar value={60} showPercentage />);
    
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('accepts custom label', () => {
    render(<ProgressBar value={80} label="Upload Progress" />);
    
    expect(screen.getByText('Upload Progress')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<ProgressBar value={45} max={100} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '45');
  });

  it('calculates percentage correctly', () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    
    const bar = container.querySelector('.bg-primary');
    expect(bar).toHaveStyle({ width: '50%' });
  });

  it('clamps value between 0 and max', () => {
    const { rerender, container } = render(<ProgressBar value={-10} />);
    
    let bar = container.querySelector('.bg-primary');
    expect(bar).toHaveStyle({ width: '0%' });

    rerender(<ProgressBar value={150} max={100} />);
    bar = container.querySelector('.bg-primary');
    expect(bar).toHaveStyle({ width: '100%' });
  });

  it('supports different sizes', () => {
    const { container, rerender } = render(<ProgressBar value={50} size="sm" />);
    
    let progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('h-2');

    rerender(<ProgressBar value={50} size="md" />);
    progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('h-3');

    rerender(<ProgressBar value={50} size="lg" />);
    progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('h-4');
  });
});

describe('SpinnerLoader', () => {
  it('renders spinner', () => {
    const { container } = render(<SpinnerLoader />);
    
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toBeInTheDocument();
  });

  it('displays loading text', () => {
    render(<SpinnerLoader />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('accepts custom text', () => {
    render(<SpinnerLoader text="Fetching data..." />);
    
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    const { container, rerender } = render(<SpinnerLoader size="sm" />);
    
    let spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<SpinnerLoader size="md" />);
    spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-8', 'w-8');

    rerender(<SpinnerLoader size="lg" />);
    spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('has proper ARIA attributes', () => {
    const { container } = render(<SpinnerLoader />);
    
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(spinner).toHaveAttribute('aria-busy', 'true');
  });

  it('centers spinner when fullscreen', () => {
    const { container } = render(<SpinnerLoader fullscreen />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });
});

describe('Loading States Integration', () => {
  it('PulseLoader renders within a form', () => {
    render(
      <form>
        <PulseLoader text="Saving..." />
        <button type="submit">Submit</button>
      </form>
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('SkeletonLoader can be used as placeholder', () => {
    const { container } = render(
      <div>
        <SkeletonLoader variant="text" count={3} />
        <SkeletonLoader variant="circular" width="40px" height="40px" />
      </div>
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it('ProgressBar updates value dynamically', () => {
    const { rerender } = render(<ProgressBar value={0} showPercentage />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();

    rerender(<ProgressBar value={50} showPercentage />);
    expect(screen.getByText('50%')).toBeInTheDocument();

    rerender(<ProgressBar value={100} showPercentage />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
