/**
 * @fileoverview Third-party integration exports for Financial $hift
 * @description Re-exports all Base44 integration functions for AI, email,
 * file storage, and other external services
 */

import { base44 } from './base44Client';

// ============================================================================
// Core Integrations
// ============================================================================

/**
 * Core integration namespace
 * @type {Object}
 */
export const Core = base44.integrations.Core;

// ============================================================================
// AI Integrations
// ============================================================================

/**
 * Invoke Large Language Model (OpenAI, Claude, etc.)
 * @type {Function}
 * @param {Object} params - LLM parameters
 * @param {string} params.prompt - The prompt to send
 * @param {string} [params.model] - Model to use (e.g., 'gpt-4')
 * @param {number} [params.temperature] - Creativity level (0-1)
 * @returns {Promise<string>} LLM response
 */
export const InvokeLLM = base44.integrations.Core.InvokeLLM;

/**
 * Generate AI images
 * @type {Function}
 * @param {Object} params - Image generation parameters
 * @returns {Promise<string>} Image URL
 */
export const GenerateImage = base44.integrations.Core.GenerateImage;

// ============================================================================
// Communication Integrations
// ============================================================================

/**
 * Send email via integration
 * @type {Function}
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.body - Email body (HTML or plain text)
 * @returns {Promise<void>}
 */
export const SendEmail = base44.integrations.Core.SendEmail;

// ============================================================================
// File Storage Integrations
// ============================================================================

/**
 * Upload public file to storage
 * @type {Function}
 * @param {File} file - File to upload
 * @returns {Promise<string>} Public file URL
 */
export const UploadFile = base44.integrations.Core.UploadFile;

/**
 * Upload private file to secure storage
 * @type {Function}
 * @param {File} file - File to upload
 * @returns {Promise<string>} Private file ID
 */
export const UploadPrivateFile = base44.integrations.Core.UploadPrivateFile;

/**
 * Create signed URL for temporary file access
 * @type {Function}
 * @param {string} fileId - Private file ID
 * @param {number} [expiresIn] - Expiration time in seconds
 * @returns {Promise<string>} Signed URL
 */
export const CreateFileSignedUrl = base44.integrations.Core.CreateFileSignedUrl;

/**
 * Extract structured data from uploaded file (OCR, parsing)
 * @type {Function}
 * @param {string} fileUrl - URL of uploaded file
 * @returns {Promise<Object>} Extracted data
 */
export const ExtractDataFromUploadedFile = base44.integrations.Core.ExtractDataFromUploadedFile;






