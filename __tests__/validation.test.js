import { describe, it, expect } from 'vitest';
import { validateShift } from '../utils/validation';

describe('validation utilities', () => {
  describe('validateShift', () => {
    const existingShifts = [
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

    it('should detect overlapping shifts', () => {
      const newShift = {
        start_datetime: '2024-01-15T10:00:00',
        end_datetime: '2024-01-15T18:00:00'
      };

      const result = validateShift(newShift, existingShifts);
      expect(result.isValid).toBe(false);
      expect(result.errors.overlap).toBeDefined();
      expect(result.errors.overlap).toContain('Morning Shift');
    });

    it('should allow non-overlapping shifts', () => {
      const newShift = {
        start_datetime: '2024-01-17T09:00:00',
        end_datetime: '2024-01-17T17:00:00'
      };

      const result = validateShift(newShift, existingShifts);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should allow editing existing shift', () => {
      const editedShift = {
        id: 1,
        start_datetime: '2024-01-15T10:00:00',
        end_datetime: '2024-01-15T18:00:00'
      };

      const result = validateShift(editedShift, existingShifts);
      expect(result.isValid).toBe(true);
    });

    it('should validate required fields', () => {
      const invalidShift = {};
      const result = validateShift(invalidShift, existingShifts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should detect back-to-back shifts as valid', () => {
      const newShift = {
        start_datetime: '2024-01-15T17:00:00',
        end_datetime: '2024-01-15T21:00:00'
      };

      const result = validateShift(newShift, existingShifts);
      expect(result.isValid).toBe(true);
    });

    it('should validate end time is after start time', () => {
      const invalidShift = {
        start_datetime: '2024-01-15T17:00:00',
        end_datetime: '2024-01-15T09:00:00'
      };

      const result = validateShift(invalidShift, existingShifts);
      expect(result.isValid).toBe(false);
    });

    it('should handle multiple overlaps', () => {
      const manyShifts = [
        ...existingShifts,
        {
          id: 3,
          start_datetime: '2024-01-15T12:00:00',
          end_datetime: '2024-01-15T20:00:00',
          title: 'Midday Shift'
        }
      ];

      const newShift = {
        start_datetime: '2024-01-15T10:00:00',
        end_datetime: '2024-01-15T18:00:00'
      };

      const result = validateShift(newShift, manyShifts);
      expect(result.isValid).toBe(false);
      expect(result.errors.overlap).toBeDefined();
    });

    it('should handle empty shift list', () => {
      const newShift = {
        start_datetime: '2024-01-15T09:00:00',
        end_datetime: '2024-01-15T17:00:00'
      };

      const result = validateShift(newShift, []);
      expect(result.isValid).toBe(true);
    });
  });
});
