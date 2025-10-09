/**
 * Accessibility Utilities
 * 
 * Comprehensive utilities for improving accessibility including:
 * - Focus management and focus traps
 * - Keyboard navigation helpers
 * - ARIA live announcements
 * - Screen reader utilities
 */

/**
 * Create a focus trap within a container
 * Useful for modals, dialogs, and dropdowns
 */
export class FocusTrap {
    private element: HTMLElement;
    private focusableElements: HTMLElement[];
    private firstFocusableElement: HTMLElement | null;
    private lastFocusableElement: HTMLElement | null;
    private previousActiveElement: HTMLElement | null;

    constructor(element: HTMLElement) {
        this.element = element;
        this.focusableElements = [];
        this.firstFocusableElement = null;
        this.lastFocusableElement = null;
        this.previousActiveElement = null;
    }

    /**
     * Activate the focus trap
     */
    activate() {
        this.previousActiveElement = document.activeElement as HTMLElement;
        this.updateFocusableElements();
        
        if (this.firstFocusableElement) {
            this.firstFocusableElement.focus();
        }

        this.element.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Deactivate the focus trap and restore focus
     */
    deactivate() {
        this.element.removeEventListener('keydown', this.handleKeyDown);
        
        if (this.previousActiveElement && this.previousActiveElement.focus) {
            this.previousActiveElement.focus();
        }
    }

    /**
     * Update the list of focusable elements
     */
    updateFocusableElements() {
        const focusableSelector = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(',');

        this.focusableElements = Array.from(
            this.element.querySelectorAll(focusableSelector)
        ) as HTMLElement[];

        this.firstFocusableElement = this.focusableElements[0];
        this.lastFocusableElement = 
            this.focusableElements[this.focusableElements.length - 1];
    }

    /**
     * Handle keyboard navigation within the trap
     */
    handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (this.focusableElements.length === 1) {
            e.preventDefault();
            return;
        }

        if (e.shiftKey) {
            // Shift + Tab: Move backwards
            if (document.activeElement === this.firstFocusableElement && this.lastFocusableElement) {
                e.preventDefault();
                this.lastFocusableElement.focus();
            }
        } else {
            // Tab: Move forwards
            if (document.activeElement === this.lastFocusableElement && this.firstFocusableElement) {
                e.preventDefault();
                this.firstFocusableElement.focus();
            }
        }
    };
}

/**
 * Create and manage a focus trap
 * @param {HTMLElement} element - Container element
 * @returns {FocusTrap} Focus trap instance
 */
export function createFocusTrap(element: HTMLElement): FocusTrap {
    return new FocusTrap(element);
}

/**
 * ARIA Live Announcer for screen readers
 */
class AriaAnnouncer {
    private liveRegion: HTMLDivElement | null;

    constructor() {
        this.liveRegion = null;
        this.initialize();
    }

    /**
     * Initialize the live region
     */
    initialize() {
        if (this.liveRegion) return;

        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.setAttribute('role', 'status');
        this.liveRegion.style.position = 'absolute';
        this.liveRegion.style.left = '-10000px';
        this.liveRegion.style.width = '1px';
        this.liveRegion.style.height = '1px';
        this.liveRegion.style.overflow = 'hidden';

        document.body.appendChild(this.liveRegion);
    }

    /**
     * Announce a message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' | 'assertive'
     * @param {number} delay - Delay before announcement (ms)
     */
    announce(message: string, priority: 'polite' | 'assertive' = 'polite', delay: number = 100) {
        if (!this.liveRegion) {
            this.initialize();
        }

        this.liveRegion!.setAttribute('aria-live', priority);
        
        // Clear previous message
        this.liveRegion!.textContent = '';

        // Announce new message after a brief delay
        setTimeout(() => {
            this.liveRegion!.textContent = message;
        }, delay);

        // Clear message after it's been read
        setTimeout(() => {
            this.liveRegion!.textContent = '';
        }, delay + 5000);
    }

    /**
     * Announce an error message
     * @param {string} message - Error message
     */
    announceError(message: string) {
        this.announce(message, 'assertive', 0);
    }

    /**
     * Announce a success message
     * @param {string} message - Success message
     */
    announceSuccess(message: string) {
        this.announce(message, 'polite', 100);
    }

    /**
     * Announce loading state
     * @param {string} message - Loading message
     */
    announceLoading(message: string = 'Loading...') {
        this.announce(message, 'polite', 0);
    }
}

// Create singleton instance
const announcer = new AriaAnnouncer();

/**
 * Announce a message to screen readers
 */
export const announce = announcer.announce.bind(announcer);
export const announceError = announcer.announceError.bind(announcer);
export const announceSuccess = announcer.announceSuccess.bind(announcer);
export const announceLoading = announcer.announceLoading.bind(announcer);

/**
 * Keyboard navigation helper
 */
export class KeyboardNavigator {
    /**
     * Handle arrow key navigation in a list
     * @param {KeyboardEvent} event - Keyboard event
     * @param {HTMLElement[]} elements - Navigable elements
     * @param {number} currentIndex - Current focused index
     * @param {Object} options - Navigation options
     * @returns {number} New index
     */
    static handleArrowKeys(
        event: KeyboardEvent, 
        elements: HTMLElement[], 
        currentIndex: number, 
        options: {
            loop?: boolean;
            horizontal?: boolean;
            onNavigate?: (index: number, element: HTMLElement) => void;
        } = {}
    ): number {
        const {
            loop = true,
            horizontal = false,
            onNavigate = () => {},
        } = options;

        const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
        const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
        let newIndex = currentIndex;

        if (event.key === nextKey) {
            event.preventDefault();
            newIndex = currentIndex + 1;
            if (newIndex >= elements.length) {
                newIndex = loop ? 0 : elements.length - 1;
            }
        } else if (event.key === prevKey) {
            event.preventDefault();
            newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = loop ? elements.length - 1 : 0;
            }
        } else if (event.key === 'Home') {
            event.preventDefault();
            newIndex = 0;
        } else if (event.key === 'End') {
            event.preventDefault();
            newIndex = elements.length - 1;
        }

        if (newIndex !== currentIndex) {
            elements[newIndex]?.focus();
            onNavigate(newIndex, elements[newIndex]);
        }

        return newIndex;
    }

    /**
     * Create keyboard navigation for a grid
     * @param {KeyboardEvent} event - Keyboard event
     * @param {number} currentRow - Current row index
     * @param {number} currentCol - Current column index
     * @param {number} totalRows - Total number of rows
     * @param {number} totalCols - Total number of columns
     * @returns {{row: number, col: number}} New position
     */
    static handleGridNavigation(
        event: KeyboardEvent, 
        currentRow: number, 
        currentCol: number, 
        totalRows: number, 
        totalCols: number
    ): { row: number; col: number } {
        let newRow = currentRow;
        let newCol = currentCol;

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                newRow = Math.max(0, currentRow - 1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                newRow = Math.min(totalRows - 1, currentRow + 1);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                newCol = Math.max(0, currentCol - 1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                newCol = Math.min(totalCols - 1, currentCol + 1);
                break;
            case 'Home':
                event.preventDefault();
                newCol = event.ctrlKey ? 0 : 0; // Ctrl+Home goes to first cell
                if (event.ctrlKey) newRow = 0;
                break;
            case 'End':
                event.preventDefault();
                newCol = event.ctrlKey ? totalCols - 1 : totalCols - 1;
                if (event.ctrlKey) newRow = totalRows - 1;
                break;
        }

        return { row: newRow, col: newCol };
    }
}

/**
 * Skip link utilities for keyboard navigation
 */
export function createSkipLink(targetId: string, label: string = 'Skip to main content'): HTMLAnchorElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-link';
    skipLink.textContent = label;
    skipLink.style.cssText = `
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;

    skipLink.addEventListener('focus', () => {
        skipLink.style.cssText = `
            position: fixed;
            left: 10px;
            top: 10px;
            z-index: 9999;
            padding: 8px 16px;
            background: #000;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
        `;
    });

    skipLink.addEventListener('blur', () => {
        skipLink.style.cssText = `
            position: absolute;
            left: -10000px;
            top: auto;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
    });

    return skipLink;
}

/**
 * Enhanced focus management utilities
 */
export const FocusManager = {
    /**
     * Save current focus position
     */
    saveFocus(): Element | null {
        return document.activeElement;
    },

    /**
     * Restore focus to an element
     */
    restoreFocus(element: HTMLElement | Element | null): void {
        if (element && 'focus' in element && typeof element.focus === 'function') {
            element.focus();
        }
    },

    /**
     * Focus first invalid input in a form
     */
    focusFirstInvalid(formElement: HTMLElement): boolean {
        const firstInvalid = formElement.querySelector('[aria-invalid="true"], .error') as HTMLElement;
        if (firstInvalid) {
            firstInvalid.focus();
            return true;
        }
        return false;
    },

    /**
     * Focus first element in container
     */
    focusFirst(container: HTMLElement): void {
        const focusable = container.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        if (focusable) {
            focusable.focus();
        }
    },

    /**
     * Check if element is focusable
     */
    isFocusable(element: HTMLElement | null): boolean {
        if (!element || (element as any).disabled) return false;
        
        const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
        if (focusableTags.includes(element.tagName)) return true;
        
        const tabindex = element.getAttribute('tabindex');
        return tabindex !== null && tabindex !== '-1';
    },
};

/**
 * ARIA attributes helper
 */
export const AriaHelper = {
    /**
     * Set ARIA expanded state
     */
    setExpanded(element: HTMLElement, expanded: boolean): void {
        element.setAttribute('aria-expanded', expanded.toString());
    },

    /**
     * Set ARIA pressed state (for toggle buttons)
     */
    setPressed(element: HTMLElement, pressed: boolean): void {
        element.setAttribute('aria-pressed', pressed.toString());
    },

    /**
     * Set ARIA selected state
     */
    setSelected(element: HTMLElement, selected: boolean): void {
        element.setAttribute('aria-selected', selected.toString());
    },

    /**
     * Set ARIA checked state
     */
    setChecked(element: HTMLElement, checked: boolean): void {
        element.setAttribute('aria-checked', checked.toString());
    },

    /**
     * Set ARIA disabled state
     */
    setDisabled(element: HTMLElement, disabled: boolean): void {
        element.setAttribute('aria-disabled', disabled.toString());
        if (disabled) {
            element.setAttribute('tabindex', '-1');
        } else {
            element.removeAttribute('tabindex');
        }
    },

    /**
     * Set ARIA invalid state with error message
     */
    setInvalid(element: HTMLElement, invalid: boolean, errorId: string | null = null): void {
        element.setAttribute('aria-invalid', invalid.toString());
        if (invalid && errorId) {
            element.setAttribute('aria-describedby', errorId);
        } else {
            element.removeAttribute('aria-describedby');
        }
    },

    /**
     * Set ARIA live region
     */
    setLive(element: HTMLElement, politeness: 'polite' | 'assertive' = 'polite'): void {
        element.setAttribute('aria-live', politeness);
        element.setAttribute('aria-atomic', 'true');
    },

    /**
     * Set ARIA label
     */
    setLabel(element: HTMLElement, label: string): void {
        element.setAttribute('aria-label', label);
    },

    /**
     * Set ARIA labelledby
     */
    setLabelledBy(element: HTMLElement, labelId: string): void {
        element.setAttribute('aria-labelledby', labelId);
    },

    /**
     * Set ARIA describedby
     */
    setDescribedBy(element: HTMLElement, descriptionId: string): void {
        element.setAttribute('aria-describedby', descriptionId);
    },
};

/**
 * Screen reader utility text
 */
export function createScreenReaderText(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    span.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    `;
    return span;
}

/**
 * Enhanced keyboard shortcuts manager
 */
export class KeyboardShortcuts {
    private shortcuts: Map<string, { callback: (event: KeyboardEvent) => void; description: string; preventDefault: boolean }>;
    private enabled: boolean;

    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
    }

    /**
     * Register a keyboard shortcut
     * @param {string} key - Key combination (e.g., 'ctrl+s', 'alt+n')
     * @param {Function} callback - Function to execute
     * @param {Object} options - Options
     */
    register(
        key: string, 
        callback: (event: KeyboardEvent) => void, 
        options: { description?: string; preventDefault?: boolean } = {}
    ): void {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.set(normalizedKey, {
            callback,
            description: options.description || '',
            preventDefault: options.preventDefault ?? true,
        });
    }

    /**
     * Unregister a keyboard shortcut
     */
    unregister(key: string): void {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.delete(normalizedKey);
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown = (event: KeyboardEvent): void => {
        if (!this.enabled) return;

        const key = this.getKeyFromEvent(event);
        const shortcut = this.shortcuts.get(key);

        if (shortcut) {
            if (shortcut.preventDefault) {
                event.preventDefault();
            }
            shortcut.callback(event);
        }
    };

    /**
     * Enable shortcuts
     */
    enable(): void {
        this.enabled = true;
        document.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Disable shortcuts
     */
    disable(): void {
        this.enabled = false;
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Get all registered shortcuts
     */
    getAll(): Array<{ key: string; description: string }> {
        return Array.from(this.shortcuts.entries()).map(([key, data]) => ({
            key,
            description: data.description,
        }));
    }

    /**
     * Normalize key string
     */
    normalizeKey(key: string): string {
        return key.toLowerCase().replace(/\s+/g, '');
    }

    /**
     * Get key combination from event
     */
    getKeyFromEvent(event: KeyboardEvent): string {
        const parts = [];
        
        if (event.ctrlKey || event.metaKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        
        const key = event.key.toLowerCase();
        if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
            parts.push(key);
        }

        return parts.join('+');
    }
}

/**
 * Create and manage keyboard shortcuts
 */
export function createKeyboardShortcuts() {
    return new KeyboardShortcuts();
}

/**
 * Utility to check if user prefers reduced motion
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Utility to check if user prefers high contrast
 */
export function prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Utility to check if user is using keyboard navigation
 */
export function detectKeyboardUser() {
    let isKeyboardUser = false;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            isKeyboardUser = true;
            document.body.classList.add('keyboard-user');
        }
    });

    document.addEventListener('mousedown', () => {
        isKeyboardUser = false;
        document.body.classList.remove('keyboard-user');
    });

    return () => isKeyboardUser;
}

/**
 * Initialize all accessibility features
 */
export function initializeAccessibility(options: {
    enableSkipLinks?: boolean;
    enableKeyboardShortcuts?: boolean;
    enableFocusVisible?: boolean;
    announcements?: boolean;
} = {}): KeyboardShortcuts | undefined {
    const {
        enableSkipLinks = true,
        enableKeyboardShortcuts = true,
        enableFocusVisible = true,
        announcements = true,
    } = options;

    // Add skip links
    if (enableSkipLinks) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            const skipLink = createSkipLink('main-content');
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
    }

    // Detect keyboard users
    if (enableFocusVisible) {
        detectKeyboardUser();
    }

    // Initialize announcer
    if (announcements) {
        announcer.initialize();
    }

    // Add keyboard shortcuts help
    if (enableKeyboardShortcuts) {
        const shortcuts = createKeyboardShortcuts();
        shortcuts.register('shift+?', () => {
            announce('Keyboard shortcuts available. Press Escape to close.');
            // Show shortcuts modal
        }, { description: 'Show keyboard shortcuts' });
        shortcuts.enable();
        
        return shortcuts;
    }
}

export default {
    FocusTrap,
    createFocusTrap,
    announce,
    announceError,
    announceSuccess,
    announceLoading,
    KeyboardNavigator,
    createSkipLink,
    FocusManager,
    AriaHelper,
    createScreenReaderText,
    KeyboardShortcuts,
    createKeyboardShortcuts,
    prefersReducedMotion,
    prefersHighContrast,
    detectKeyboardUser,
    initializeAccessibility,
};
