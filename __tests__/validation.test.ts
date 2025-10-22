/**
 * @fileoverview Validation utility tests
 * @description Test suite for shift validation, transaction validation, and data integrity checks
 */

import { describe, it, expect } from 'vitest';
import { validateShift } from '../utils/validation';

/**
 * Test data: Sample shift object
 */
interface TestShift {
  id?: number;
  start_datetime: string;
  end_datetime: string;
  title?: string;
}

/**
 * Validation test suite for utility functions
 * 
 * Tests cover:
 * - Shift overlap detection
 * - Time validation (end after start)
 * - Required field validation
 * - Edge cases (back-to-back shifts, empty lists)
 * - Multiple overlap scenarios
 */
describe('validation utilities', () => {
  /**
   * Shift validation test suite
   * 
   * Validates shift scheduling logic including:
   * - Overlap detection between existing and new shifts
   * - Time range validation
   * - Field requirement checks
   */
  describe('validateShift', () => {
    /**
     * Mock shift data for testing
     * Represents typical shift schedule with morning and afternoon shifts
     */
    const existingShifts: TestShift[] = [
      {
        id: 1,
        start_datetime: '2024-01-15T09:00:00',
        end_datetime: '2024-01-15T17:00:00',
        title: 'Morning Shift'
      },
      {
        id: 2,
        start_datetime: '2024-01-16T14:00:00',
        end_datetime: '2024-01-16T22:00:00',
        title: 'Afternoon Shift'
      }
    ];

    /**
     * Test: Detect overlapping shifts
     * 
     * Scenario: New shift overlaps with existing "Morning Shift"
     * Expected: Validation fails with overlap error
     */
    it('should detect overlapping shifts', () => {
      const newShift: TestShift = {
        start_datetime: '2024-01-15T10:00:00',
        end_datetime: '2024-01-15T18:00:00'
      };

      const result = validateShift(newShift, existingShifts);
      expect(result.isValid).toBe(false);
      expect(result.errors.overlap).toBeDefined();
      expect(result.errors.overlap).toContain('Morning Shift');
    });

    /**
     * Test: Allow non-overlapping shifts
     * 
     * Scenario: New shift on different day with no conflicts
     * Expected: Validation passes
     */
    it('should allow non-overlapping shifts', () => {
      const newShift: TestShift = {
        start_datetime: '2024-01-17T09:00:00',
        end_datetime: '2024-01-17T17:00:00'
      };

      const result = validateShift(newShift, existingShifts);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    /**
     * Test: Allow editing existing shift
     * 
     * Scenario: Editing shift should not conflict with itself
     * Expected: Validation passes even if times overlap with own slot
     */
    it('should allow editing existing shift', () => {
      const editedShift: TestShift = {
        id: 1,
        start_datetime: '2024-01-15T10:00:00',
        end_datetime: '2024-01-15T18:00:00'
      };

      const result = validateShift(editedShift, existingShifts);
      expect(result.isValid).toBe(true);
    });

    /**
     * Test: Validate required fields
     * 
     * Scenario: Shift missing required datetime fields
     * Expected: Validation fails with field errors
     */
    it('should validate required fields', () => {
      const invalidShift: Partial<TestShift> = {};
      const result = validateShift(invalidShift as TestShift, existingShifts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    /**
     * Test: Detect back-to-back shifts as valid
     * 
     * Scenario: New shift starts exactly when another ends
     * Expected: Validation passes (no overlap, just adjacent)
     */
    it('should detect back-to-back shifts as valid', () => {
      const newShift: TestShift = {
        start_datetime: '2024-01-15T17:00:00',
        end_datetime: '2024-01-15T21:00:00'
      };

      const result = validateShift(newShift, existingShifts);
      expect(result.isValid).toBe(true);
    });

    /**
     * Test: Validate end time is after start time
     * 
     * Scenario: End time before start time (invalid range)
     * Expected: Validation fails with time order error
     */
    it('should validate end time is after start time', () => {
      const invalidShift: TestShift = {
        start_datetime: '2024-01-15T17:00:00',
        end_datetime: '2024-01-15T09:00:00'
      };

      const result = validateShift(invalidShift, existingShifts);
      expect(result.isValid).toBe(false);
    });

    /**
     * Test: Handle multiple overlaps
     * 
     * Scenario: New shift overlaps with multiple existing shifts
     * Expected: Validation fails, error contains overlap information
     */
    it('should handle multiple overlaps', () => {
      const manyShifts: TestShift[] = [
        ...existingShifts,
        {
          id: 3,
          start_datetime: '2024-01-15T12:00:00',
          end_datetime: '2024-01-15T20:00:00',
          title: 'Midday Shift'
        }
      ];

      const newShift: TestShift = {
        start_datetime: '2024-01-15T10:00:00',
        end_datetime: '2024-01-15T18:00:00'
      };

      const result = validateShift(newShift, manyShifts);
      expect(result.isValid).toBe(false);
      expect(result.errors.overlap).toBeDefined();
    });

    /**
     * Test: Handle empty shift list
     * 
     * Scenario: Validating shift when no existing shifts
     * Expected: Validation passes (no conflicts possible)
     */
    it('should handle empty shift list', () => {
      const newShift: TestShift = {
        start_datetime: '2024-01-15T09:00:00',
        end_datetime: '2024-01-15T17:00:00'
      };

      const result = validateShift(newShift, []);
      expect(result.isValid).toBe(true);
    });
  });
});
