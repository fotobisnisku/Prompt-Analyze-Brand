/**
 * KIE AI Provider
 *
 * Provider-specific code only.
 * The main API route (api/generate.ts) should call generateWithKie()
 * and should not need to know KIE's endpoint/auth details.
 */

const KIE_BASE_URL =
  'https://api.kie.ai/gemini-2.5-flash/v1/chat/completions';

export type KieMessage = {
  role: 'system' | 'user' | 'assistant';
  content: Array<{
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
  const apiKey = process.env.KIE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'KIE_API_KEY belum dikonfigurasi di Vercel Environment Variables.'
    );
  }

  const payload = {
    model: options.model || 'gemini-2.5-flash',
    messages: options.messages,
    stream: false,
    temperature: options.temperature ?? 0.7,
    top_p: options.top_p ?? 0.95,
    max_tokens: options.max_tokens ?? 8192,
  };

  console.log(`[KIE] Sending ${payload.model} request`);

  const response = await fetch(KIE_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
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

    throw new Error('KIE mengembalikan response yang tidak valid.');
  }

  return {
    data,
    response,
  };
}
