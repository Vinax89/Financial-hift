// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FocusTrap, KeyboardShortcuts, announce } from '@/utils/accessibility';

describe('FocusTrap', () => {
  let container;
  let focusTrap;

  beforeEach(() => {
    // Create a test container with focusable elements
    container = document.createElement('div');
    container.innerHTML = `
      <button id="first">First</button>
      <input id="input" type="text" />
      <button id="last">Last</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (focusTrap) {
      focusTrap.deactivate();
    }
    document.body.removeChild(container);
  });

  it('should create a focus trap instance', () => {
    focusTrap = new FocusTrap(container);
    expect(focusTrap).toBeDefined();
    expect(focusTrap.element).toBe(container);
  });

  it('should activate and focus first element', () => {
    focusTrap = new FocusTrap(container);
    const firstButton = container.querySelector('#first');
    
    focusTrap.activate();
    
    expect(document.activeElement).toBe(firstButton);
  });

  it('should trap tab navigation within container', () => {
    focusTrap = new FocusTrap(container);
    focusTrap.activate();
    
    const lastButton = container.querySelector('#last');
    lastButton.focus();
    
    // Simulate Tab key
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    container.dispatchEvent(tabEvent);
    
    // Should cycle back to first element
    expect(focusTrap.focusableElements.length).toBe(3);
  });

  it('should trap shift+tab navigation', () => {
    focusTrap = new FocusTrap(container);
    focusTrap.activate();
    
    const firstButton = container.querySelector('#first');
    firstButton.focus();
    
    // Simulate Shift+Tab key
    const shiftTabEvent = new KeyboardEvent('keydown', { 
      key: 'Tab', 
      shiftKey: true, 
      bubbles: true 
    });
    container.dispatchEvent(shiftTabEvent);
    
    // Should cycle to last element
    expect(focusTrap.focusableElements.length).toBe(3);
  });

  it('should restore focus on deactivate', () => {
    const externalButton = document.createElement('button');
    externalButton.id = 'external';
    document.body.appendChild(externalButton);
    externalButton.focus();
    
    focusTrap = new FocusTrap(container);
    focusTrap.activate();
    
    expect(document.activeElement).not.toBe(externalButton);
    
    focusTrap.deactivate();
    
    expect(document.activeElement).toBe(externalButton);
    document.body.removeChild(externalButton);
  });

  it('should handle disabled elements', () => {
    container.innerHTML = `
      <button id="first">First</button>
      <button id="disabled" disabled>Disabled</button>
      <input id="last" type="text" />
    `;
    
    focusTrap = new FocusTrap(container);
    focusTrap.activate();
    
    // Should only include enabled elements
    expect(focusTrap.focusableElements.length).toBe(2);
    expect(focusTrap.focusableElements.map(el => el.id)).toEqual(['first', 'last']);
  });

  it('should update focusable elements dynamically', () => {
    focusTrap = new FocusTrap(container);
    focusTrap.activate();
    
    expect(focusTrap.focusableElements.length).toBe(3);
    
    // Add new button
    const newButton = document.createElement('button');
    newButton.id = 'new';
    container.appendChild(newButton);
    
    focusTrap.updateFocusableElements();
    
    expect(focusTrap.focusableElements.length).toBe(4);
  });
});

describe('KeyboardShortcuts', () => {
  let shortcuts;

  beforeEach(() => {
    shortcuts = new KeyboardShortcuts();
  });

  afterEach(() => {
    shortcuts.destroy();
  });

  it('should create keyboard shortcuts manager', () => {
    expect(shortcuts).toBeDefined();
    expect(shortcuts.shortcuts).toEqual({});
  });

  it('should register a keyboard shortcut', () => {
    const handler = vi.fn();
    
    shortcuts.register('ctrl+s', handler, 'Save');
    
    expect(shortcuts.shortcuts['ctrl+s']).toBeDefined();
    expect(shortcuts.shortcuts['ctrl+s'].description).toBe('Save');
  });

  it('should trigger shortcut on keypress', () => {
    const handler = vi.fn();
    shortcuts.register('ctrl+s', handler);
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true
    });
    
    document.dispatchEvent(event);
    
    expect(handler).toHaveBeenCalled();
  });

  it('should handle multiple modifiers', () => {
    const handler = vi.fn();
    shortcuts.register('ctrl+shift+k', handler);
    
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true
    });
    
    document.dispatchEvent(event);
    
    expect(handler).toHaveBeenCalled();
  });

  it('should unregister shortcut', () => {
    const handler = vi.fn();
    shortcuts.register('ctrl+n', handler);
    
    expect(shortcuts.shortcuts['ctrl+n']).toBeDefined();
    
    shortcuts.unregister('ctrl+n');
    
    expect(shortcuts.shortcuts['ctrl+n']).toBeUndefined();
  });

  it('should not trigger when input is focused', () => {
    const handler = vi.fn();
    shortcuts.register('ctrl+s', handler);
    
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true
    });
    
    input.dispatchEvent(event);
    
    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('should get all registered shortcuts', () => {
    shortcuts.register('ctrl+s', vi.fn(), 'Save');
    shortcuts.register('ctrl+n', vi.fn(), 'New');
    shortcuts.register('escape', vi.fn(), 'Close');
    
    const allShortcuts = shortcuts.getAll();
    
    expect(allShortcuts.length).toBe(3);
    expect(allShortcuts[0].key).toBe('ctrl+s');
    expect(allShortcuts[0].description).toBe('Save');
  });

  it('should destroy and cleanup', () => {
    const handler = vi.fn();
    shortcuts.register('ctrl+s', handler);
    
    shortcuts.destroy();
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true
    });
    
    document.dispatchEvent(event);
    
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('announce', () => {
  it('should create ARIA live region', () => {
    announce('Test message');
    
    const liveRegion = document.querySelector('[role="status"]');
    expect(liveRegion).toBeDefined();
  });

  it('should announce message with polite priority', () => {
    announce('Polite message', 'polite');
    
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeDefined();
    expect(liveRegion.textContent).toBe('Polite message');
  });

  it('should announce message with assertive priority', () => {
    announce('Urgent message', 'assertive');
    
    const liveRegion = document.querySelector('[aria-live="assertive"]');
    expect(liveRegion).toBeDefined();
    expect(liveRegion.textContent).toBe('Urgent message');
  });

  it('should remove announcement after delay', async () => {
    announce('Temporary message');
    
    const liveRegion = document.querySelector('[role="status"]');
    expect(liveRegion).toBeDefined();
    
    // Wait for cleanup (default 1000ms)
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const removedRegion = document.querySelector('[role="status"]');
    expect(removedRegion).toBeNull();
  });
});

