/**
 * @fileoverview Backend function exports for Financial $hift
 * @description Re-exports all Base44 backend functions (serverless functions)
 * for tax calculations, reports, reminders, and data updates
 */

import { base44 } from './base44Client';

// ============================================================================
// Tax & Location Functions
// ============================================================================

/**
 * Get tax rates and cost of living data for a location
 * @type {Function}
 * @param {string} zipCode - ZIP code to lookup
 * @returns {Promise<Object>} Tax and cost of living information
 */
export const getTaxAndCostOfLiving = base44?.functions?.getTaxAndCostOfLiving;

/**
 * Compute total tax burden for given income and location
 * @type {Function}
 * @param {number} income - Annual income
 * @param {string} zipCode - ZIP code for local taxes
 * @returns {Promise<Object>} Tax breakdown (federal, state, local)
 */
export const computeTaxBurden = base44?.functions?.computeTaxBurden;

/**
 * Refresh tax database with latest rates
 * @type {Function}
 * @returns {Promise<void>}
 */
export const refreshTaxDatabase = base44?.functions?.refreshTaxDatabase;

/**
 * Update cost of living data
 * @type {Function}
 * @returns {Promise<void>}
 */
export const updateCostOfLiving = base44?.functions?.updateCostOfLiving;

// ============================================================================
// Report & Notification Functions
// ============================================================================

/**
 * Generate comprehensive financial report
 * @type {Function}
 * @param {Object} params - Report parameters
 * @returns {Promise<Object>} Financial report data
 */
export const generateFinancialReport = base44?.functions?.generateFinancialReport;

/**
 * Generate smart reminders for bills and goals
 * @type {Function}
 * @returns {Promise<Array>} Array of reminder objects
 */
export const generateReminders = base44?.functions?.generateReminders;

/**
 * Send email notifications for upcoming bills
 * @type {Function}
 * @returns {Promise<void>}
 */
export const emailUpcomingBills = base44?.functions?.emailUpcomingBills;

