/**
 * KIE AI Provider
 *
 * Provider-specific KIE code lives here.
 * generate.ts should not contain KIE endpoint/auth details.
 */

import {
  AI_MODEL,
  KIE_API_ENDPOINT,
  KIE_API_KEY,
} from './config';

export type KieMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
};

export type KieGenerateOptions = {
  messages: KieMessage[];
  model?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  signal?: AbortSignal;
};

export async function generateWithKie(
  options: KieGenerateOptions
): Promise<{
  data: any;
  response: Response;
}> {
  if (!KIE_API_KEY) {
    throw new Error(
      'KIE_API_KEY belum dikonfigurasi di Vercel Environment Variables.'
    );
  }

  const model = options.model || AI_MODEL;

  // Endpoint is configurable separately from the model so a future
  // KIE model with a different route can be switched without touching
  // generate.ts or Dashboard.tsx.
  const endpoint = KIE_API_ENDPOINT;

  const payload = {
    model,
    messages: options.messages,
    stream: false,
    temperature: options.temperature ?? 0.7,
    top_p: options.top_p ?? 0.95,
    max_tokens: options.max_tokens ?? 8192,
  };

  console.log(`[KIE] Sending model: ${model}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  const responseText = await response.text();

  let data: any = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    console.error(
      '[KIE] Invalid JSON response:',
      responseText.slice(0, 500)
    );

    throw new Error(
      'KIE mengembalikan response yang tidak valid.'
    );
  }

  return {
    data,
    response,
  };
}
