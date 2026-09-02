import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateWithKie, type KieMessage } from './providers/kie.js';

// Allow image JSON payloads larger than the default body-parser limit.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// TAMBAHKAN BARIS INI (Set maksimal durasi eksekusi ke 60 detik)
export const maxDuration = 60;

function sendJson(
  res: VercelResponse,
  status: number,
  data: Record<string, unknown>
) {
  return res
    .status(status)
    .setHeader('Content-Type', 'application/json')
    .json(data);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS/preflight safety. Same-origin requests normally do not need this,
  // but accepting OPTIONS prevents a proxy/browser preflight from becoming 405.
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  // Health check: opening /api/generate in the browser must NOT produce 405.
  // This also proves that Vercel is actually routing /api/generate to this file.
  if (req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      service: 'fonce-ai-generate',
      provider: 'kie',
      message: 'API route aktif. Gunakan POST untuk Generate.',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return sendJson(res, 405, {
      error: `Method ${req.method || 'UNKNOWN'} tidak diizinkan. Gunakan POST.`,
    });
  }

  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return sendJson(res, 400, {
        error: 'Request body tidak valid.',
      });
    }

    const contents = body.contents;
    const systemInstruction = body.systemInstruction;

    if (!Array.isArray(contents) || contents.length === 0) {
      return sendJson(res, 400, {
        error: 'contents tidak ditemukan.',
      });
    }

    const messages: KieMessage[] = [];

    if (
      systemInstruction?.parts &&
      Array.isArray(systemInstruction.parts)
    ) {
      const systemText = systemInstruction.parts
        .map((part: any) => part?.text || '')
        .filter(Boolean)
        .join('\n');

      if (systemText) {
        messages.push({
          role: 'system',
          content: systemText,
        });
      }
    }

    for (const content of contents) {
      const role: KieMessage['role'] =
        content?.role === 'assistant' ? 'assistant' : 'user';

      const parts = Array.isArray(content?.parts)
        ? content.parts
        : [];

      const convertedParts: KieMessage['content'] = [];

      for (const part of parts) {
        if (typeof part?.text === 'string') {
          convertedParts.push({
            type: 'text',
            text: part.text,
          });
        }

        if (part?.inlineData) {
          const mimeType =
            part.inlineData.mimeType || 'image/jpeg';
          const base64 = part.inlineData.data;

          if (
            typeof base64 === 'string' &&
            base64.length > 0
          ) {
            convertedParts.push({
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            });
          }
        }
      }

      if (convertedParts.length > 0) {
        messages.push({
          role,
          content: convertedParts,
        });
      }
    }

    if (messages.length === 0) {
      return sendJson(res, 400, {
        error: 'Tidak ada pesan yang dapat dikirim ke AI.',
      });
    }

    const model =
      typeof body.model === 'string' && body.model.trim()
        ? body.model
        : 'gemini-2.5-flash';

    const temperature =
      typeof body.temperature === 'number'
        ? body.temperature
        : 0.7;

    const topP =
      typeof body.topP === 'number'
        ? body.topP
        : 0.95;

    const maxTokens =
      typeof body.maxTokens === 'number'
        ? body.maxTokens
        : 8192;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      55_000
    );

    let providerResult: {
      data: any;
      response: Response;
    };

    try {
      providerResult = await generateWithKie({
        messages,
        model,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const { data, response } = providerResult;

    if (!response.ok) {
      console.error(
        '[KIE ERROR]',
        response.status,
        data
      );

      const message =
        data?.msg ||
        data?.error?.message ||
        data?.message ||
        'KIE gagal memproses request.';

      if (response.status === 401) {
        return sendJson(res, 401, {
          error:
            'KIE API token tidak valid atau tidak memiliki akses.',
        });
      }

      if (response.status === 429) {
        return sendJson(res, 429, {
          error: `KIE rate limit: ${message}`,
        });
      }

      if (response.status >= 500) {
        return sendJson(res, 502, {
          error: `KIE server error: ${message}`,
        });
      }

      return sendJson(res, 400, {
        error: `KIE: ${message}`,
      });
    }

    const generatedText =
      data?.choices?.[0]?.message?.content;

    if (
      typeof generatedText !== 'string' ||
      !generatedText.trim()
    ) {
      console.error(
        '[KIE] No generated text:',
        data
      );

      return sendJson(res, 502, {
        error: 'KIE tidak memberikan output teks.',
      });
    }

    return sendJson(res, 200, {
      candidates: [
        {
          content: {
            parts: [
              {
                text: generatedText,
              },
            ],
          },
        },
      ],
      usageMetadata: {
        promptTokenCount:
          data?.usage?.prompt_tokens || 0,
        candidatesTokenCount:
          data?.usage?.completion_tokens || 0,
        totalTokenCount:
          data?.usage?.total_tokens || 0,
      },
      provider: 'kie.ai',
      model,
    });
  } catch (error: unknown) {
    console.error(
      '[AI PROVIDER] Unexpected server error:',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown server error';

    if (/abort|timeout/i.test(message)) {
      return sendJson(res, 504, {
        error:
          'Request ke KIE timeout. Coba Generate lagi.',
      });
    }

    if (
      /KIE_API_KEY belum dikonfigurasi/i.test(
        message
      )
    ) {
      return sendJson(res, 500, {
        error: message,
      });
    }

    if (
      /KIE mengembalikan response yang tidak valid/i.test(
        message
      )
    ) {
      return sendJson(res, 502, {
        error: message,
      });
    }

    return sendJson(res, 500, {
      error: `Server error: ${message}`,
    });
  }
}
