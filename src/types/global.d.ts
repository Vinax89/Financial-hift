/**
 * Global Type Declarations
 * 
 * This file contains global type augmentations and declarations
 * used throughout the Financial Shift application.
 */

// Window interface augmentation
interface Window {
  gtag: (
    command: 'config' | 'event' | 'set' | 'js',
    targetId: string | Date,
    config?: Record<string, any>
  ) => void;
}

// Base44 entity types
declare module '@/api/base44Client' {
  export interface Entity<T = any> {
    list: (options?: { filter?: Record<string, any> }) => Promise<T[]>;
    get: (id: string) => Promise<T>;
    create: (data: Partial<T>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
  }
}
