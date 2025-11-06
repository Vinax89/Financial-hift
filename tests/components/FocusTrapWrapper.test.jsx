/**
 * FocusTrapWrapper Component Tests
 * Tests for React focus trap wrapper component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FocusTrapWrapper } from '@/components/FocusTrapWrapper';

describe('FocusTrapWrapper', () => {
  it('should render children', () => {
    render(
      <FocusTrapWrapper active={true}>
        <button>Test Button</button>
      </FocusTrapWrapper>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should trap focus when active', () => {
    render(
      <FocusTrapWrapper active={true}>
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      </FocusTrapWrapper>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('should call onEscape when Escape is pressed', () => {
    const handleEscape = vi.fn();
    
    render(
      <FocusTrapWrapper active={true} onEscape={handleEscape}>
        <button>Close</button>
      </FocusTrapWrapper>
    );
    
    // Simulate Escape key
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    
    expect(handleEscape).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FocusTrapWrapper active={true} className="custom-class">
        <button>Test</button>
      </FocusTrapWrapper>
    );
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
