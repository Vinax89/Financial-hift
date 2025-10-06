/**
 * @fileoverview Entity exports for Financial $hift backend API
 * @description Re-exports all Base44 entity classes for use throughout the application.
 * Each entity provides CRUD operations and query methods.
 */

import { base44 } from './base44Client';

// ============================================================================
// Financial Entities
// ============================================================================

/** @type {import('@base44/sdk').Entity} Transaction entity for income/expense tracking */
export const Transaction = base44.entities.Transaction;

/** @type {import('@base44/sdk').Entity} Budget entity for category-based budgeting */
export const Budget = base44.entities.Budget;

/** @type {import('@base44/sdk').Entity} Goal entity for savings goals and milestones */
export const Goal = base44.entities.Goal;

/** @type {import('@base44/sdk').Entity} BNPLPlan entity for Buy Now Pay Later plans */
export const BNPLPlan = base44.entities.BNPLPlan;

/** @type {import('@base44/sdk').Entity} Bill entity for recurring bills and obligations */
export const Bill = base44.entities.Bill;

/** @type {import('@base44/sdk').Entity} DebtAccount entity for debt tracking (credit cards, loans) */
export const DebtAccount = base44.entities.DebtAccount;

/** @type {import('@base44/sdk').Entity} Investment entity for investment tracking */
export const Investment = base44.entities.Investment;

// ============================================================================
// Shift Worker Entities
// ============================================================================

/** @type {import('@base44/sdk').Entity} PaycheckSettings entity for income configuration */
export const PaycheckSettings = base44.entities.PaycheckSettings;

/** @type {import('@base44/sdk').Entity} ShiftRule entity for recurring shift templates */
export const ShiftRule = base44.entities.ShiftRule;

/** @type {import('@base44/sdk').Entity} Shift entity for individual work shifts */
export const Shift = base44.entities.Shift;

/** @type {import('@base44/sdk').Entity} ForecastSnapshot entity for cashflow predictions */
export const ForecastSnapshot = base44.entities.ForecastSnapshot;

// ============================================================================
// Gamification & AI Entities
// ============================================================================

/** @type {import('@base44/sdk').Entity} Gamification entity for achievements and progress */
export const Gamification = base44.entities.Gamification;

/** @type {import('@base44/sdk').Entity} AgentTask entity for AI assistant tasks */
export const AgentTask = base44.entities.AgentTask;

/** @type {import('@base44/sdk').Entity} Notification entity for user notifications */
export const Notification = base44.entities.Notification;

/** @type {import('@base44/sdk').Entity} AutomationRule entity for automated actions */
export const AutomationRule = base44.entities.AutomationRule;

// ============================================================================
// Tax & Location Entities
// ============================================================================

/** @type {import('@base44/sdk').Entity} FederalTaxConfig entity for federal tax rates */
export const FederalTaxConfig = base44.entities.FederalTaxConfig;

/** @type {import('@base44/sdk').Entity} StateTaxConfig entity for state tax rates */
export const StateTaxConfig = base44.entities.StateTaxConfig;

/** @type {import('@base44/sdk').Entity} ZipJurisdiction entity for local tax jurisdictions */
export const ZipJurisdiction = base44.entities.ZipJurisdiction;

/** @type {import('@base44/sdk').Entity} CostOfLiving entity for location-based costs */
export const CostOfLiving = base44.entities.CostOfLiving;

// ============================================================================
// Subscription Entities
// ============================================================================

/** @type {import('@base44/sdk').Entity} Plan entity for subscription plans */
export const Plan = base44.entities.Plan;

/** @type {import('@base44/sdk').Entity} Subscription entity for user subscriptions */
export const Subscription = base44.entities.Subscription;

// ============================================================================
// Authentication
// ============================================================================

/** @type {import('@base44/sdk').Auth} User authentication methods */
export const User = base44.auth;