/**
 * Server-side AI configuration.
 *
 * IMPORTANT:
 * - Do NOT add VITE_ prefix to secret API keys.
 * - These values are read only on the Vercel/server side.
 *
 * To switch provider/model later, change the Vercel Environment Variables:
 *
 *   AI_PROVIDER=kie
 *   AI_MODEL=gemini-2.5-flash
 *
 * KIE-specific settings:
 *
 *   KIE_API_KEY=your-secret-token
 *   KIE_API_BASE_URL=https://api.kie.ai
 *
 * KIE_API_BASE_URL is optional and has a safe default.
 */

export type AIProvider = 'kie';

export const AI_PROVIDER: AIProvider =
  (process.env.AI_PROVIDER || 'kie') as AIProvider;

export const AI_MODEL =
  process.env.AI_MODEL || 'gemini-2.5-flash';

export const KIE_API_KEY =
  process.env.KIE_API_KEY || '';

export const KIE_API_BASE_URL =
  process.env.KIE_API_BASE_URL || 'https://api.kie.ai';

// Full KIE endpoint. Keep this configurable because KIE may use
// different endpoint paths for different models.
export const KIE_API_ENDPOINT =
  process.env.KIE_API_ENDPOINT ||
  `${KIE_API_BASE_URL}/gemini-2.5-flash/v1/chat/completions`;
