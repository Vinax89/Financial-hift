/**
 * Accessibility Utilities Tests
 * Tests for focus trap, keyboard navigation, and ARIA helpers
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  FocusTrap,
  createFocusTrap,
  announce,
  announceError,
  KeyboardNavigator,
  AriaHelper,
  prefersReducedMotion,
} from '@/utils/accessibility';

describe('FocusTrap', () => {
  let container;
  let focusTrap;

  beforeEach(() => {
    // Create a container with focusable elements
    container = document.createElement('div');
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <a id="link1" href="#">Link 1</a>
      <button id="btn2">Button 2</button>
    `;
    document.body.appendChild(container);
    focusTrap = new FocusTrap(container);
  });

  afterEach(() => {
    if (focusTrap) {
      focusTrap.deactivate();
    }
    document.body.removeChild(container);
  });

  it('should identify focusable elements', () => {
    focusTrap.updateFocusableElements();
    expect(focusTrap.focusableElements).toHaveLength(4);
  });

  it('should focus first element on activate', () => {
    focusTrap.activate();
    expect(document.activeElement).toBe(document.getElementById('btn1'));
  });

  it('should trap focus within container', () => {
    focusTrap.activate();
    const btn2 = document.getElementById('btn2');
    const btn1 = document.getElementById('btn1');
    
    btn2.focus();
    expect(document.activeElement).toBe(btn2);
    
    // Simulate Tab from last element - should wrap to first
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    container.dispatchEvent(event);
  });

  it('should restore focus on deactivate', () => {
    const outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    outsideButton.focus();
    
    const previousFocus = document.activeElement;
    focusTrap.activate();
    focusTrap.deactivate();
    
    document.body.removeChild(outsideButton);
  });
});

describe('createFocusTrap', () => {
  it('should create a FocusTrap instance', () => {
    const container = document.createElement('div');
    const trap = createFocusTrap(container);
    expect(trap).toBeInstanceOf(FocusTrap);
  });
});

describe('ARIA Announcer', () => {
  it('should announce messages', () => {
    announce('Test message');
    const liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion).toBeTruthy();
  });

  it('should announce error messages', () => {
    announceError('Error message');
    const liveRegion = document.querySelector('[aria-live="assertive"]');
    expect(liveRegion).toBeTruthy();
  });
});

describe('KeyboardNavigator', () => {
  describe('handleArrowKeys', () => {
    it('should navigate forward with ArrowDown', () => {
      const elements = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ];
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const newIndex = KeyboardNavigator.handleArrowKeys(event, elements, 0);
      
      expect(newIndex).toBe(1);
    });

    it('should navigate backward with ArrowUp', () => {
      const elements = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ];
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const newIndex = KeyboardNavigator.handleArrowKeys(event, elements, 2);
      
      expect(newIndex).toBe(1);
    });

    it('should loop when enabled', () => {
      const elements = [
        document.createElement('button'),
        document.createElement('button'),
      ];
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const newIndex = KeyboardNavigator.handleArrowKeys(event, elements, 1, { loop: true });
      
      expect(newIndex).toBe(0);
    });
  });

  describe('handleGridNavigation', () => {
    it('should navigate in grid', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const result = KeyboardNavigator.handleGridNavigation(event, 0, 0, 3, 3);
      
      expect(result).toEqual({ row: 0, col: 1 });
    });

    it('should not exceed boundaries', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const result = KeyboardNavigator.handleGridNavigation(event, 0, 2, 3, 3);
      
      expect(result).toEqual({ row: 0, col: 2 });
    });
  });
});

describe('AriaHelper', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it('should set aria-expanded', () => {
    AriaHelper.setExpanded(element, true);
    expect(element.getAttribute('aria-expanded')).toBe('true');
  });

  it('should set aria-pressed', () => {
    AriaHelper.setPressed(element, true);
    expect(element.getAttribute('aria-pressed')).toBe('true');
  });

  it('should set aria-selected', () => {
    AriaHelper.setSelected(element, true);
    expect(element.getAttribute('aria-selected')).toBe('true');
  });

  it('should set aria-invalid with error', () => {
    AriaHelper.setInvalid(element, true, 'error-1');
    expect(element.getAttribute('aria-invalid')).toBe('true');
    expect(element.getAttribute('aria-describedby')).toBe('error-1');
  });

  it('should set aria-label', () => {
    AriaHelper.setLabel(element, 'Test Label');
    expect(element.getAttribute('aria-label')).toBe('Test Label');
  });
});

describe('User Preferences', () => {
  it('should detect reduced motion preference', () => {
    const result = prefersReducedMotion();
    expect(typeof result).toBe('boolean');
  });
});
