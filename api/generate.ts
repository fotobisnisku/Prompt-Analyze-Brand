import type { VercelRequest, VercelResponse } from '@vercel/node';

const KIE_BASE_URL =
  'https://api.kie.ai/gemini-2.5-flash/v1/chat/completions';

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
  // --------------------------------------------------
  // METHOD
  // --------------------------------------------------

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return sendJson(res, 405, {
      error: 'Method tidak diizinkan.'
    });
  }

  // --------------------------------------------------
  // KIE API KEY
  // --------------------------------------------------

  const apiKey = process.env.KIE_API_KEY;

  if (!apiKey) {
    console.error('KIE_API_KEY is missing.');

    return sendJson(res, 500, {
      error:
        'KIE_API_KEY belum dikonfigurasi di Vercel Environment Variables.'
    });
  }

  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return sendJson(res, 400, {
        error: 'Request body tidak valid.'
      });
    }

    const contents = body.contents;
    const systemInstruction = body.systemInstruction;

    if (!Array.isArray(contents) || contents.length === 0) {
      return sendJson(res, 400, {
        error: 'contents tidak ditemukan.'
      });
    }

    // --------------------------------------------------
    // CONVERT GEMINI FORMAT → KIE OPENAI FORMAT
    // --------------------------------------------------

    const messages: Array<{
      role: string;
      content: any[];
    }> = [];

    // System instruction menjadi system message
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
          content: [
            {
              type: 'text',
              text: systemText
            }
          ]
        });
      }
    }

    // --------------------------------------------------
    // CONVERT USER CONTENT
    // --------------------------------------------------

    for (const content of contents) {
      const role =
        content?.role === 'assistant'
          ? 'assistant'
          : 'user';

      const parts = Array.isArray(content?.parts)
        ? content.parts
        : [];

      const convertedParts: any[] = [];

      for (const part of parts) {
        // Text
        if (typeof part?.text === 'string') {
          convertedParts.push({
            type: 'text',
            text: part.text
          });
        }

        // Image
        if (part?.inlineData) {
          const mimeType =
            part.inlineData.mimeType || 'image/jpeg';

          const base64 =
            part.inlineData.data;

          if (
            typeof base64 === 'string' &&
            base64.length > 0
          ) {
            convertedParts.push({
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            });
          }
        }
      }

      if (convertedParts.length > 0) {
        messages.push({
          role,
          content: convertedParts
        });
      }
    }

    if (messages.length === 0) {
      return sendJson(res, 400, {
        error:
          'Tidak ada pesan yang dapat dikirim ke KIE.'
      });
    }

    // --------------------------------------------------
    // KIE REQUEST
    // --------------------------------------------------

    const kiePayload = {
      model: 'gemini-2.5-flash',

      messages,

      stream: false,

      temperature: 0.7,

      top_p: 0.95,

      max_tokens: 8192
    };

    console.log(
      '[KIE] Sending Gemini 2.5 Flash request'
    );

    const controller =
      new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 55_000);

    let kieResponse: Response;

    try {
      kieResponse = await fetch(
        KIE_BASE_URL,
        {
          method: 'POST',

          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(kiePayload),

          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    // --------------------------------------------------
    // READ RESPONSE
    // --------------------------------------------------

    const responseText =
      await kieResponse.text();

    let data: any = {};

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      console.error(
        '[KIE] Invalid JSON response:',
        responseText.slice(0, 500)
      );

      return sendJson(res, 502, {
        error:
          'KIE mengembalikan response yang tidak valid.'
      });
    }

    // --------------------------------------------------
    // KIE ERROR
    // --------------------------------------------------

    if (!kieResponse.ok) {
      console.error(
        '[KIE ERROR]',
        kieResponse.status,
        data
      );

      const message =
        data?.msg ||
        data?.error?.message ||
        'KIE gagal memproses request.';

      if (kieResponse.status === 401) {
        return sendJson(res, 401, {
          error:
            'KIE API token tidak valid atau tidak memiliki akses.'
        });
      }

      if (kieResponse.status === 429) {
        return sendJson(res, 429, {
          error:
            `KIE rate limit: ${message}`
        });
      }

      if (kieResponse.status >= 500) {
        return sendJson(res, 502, {
          error:
            `KIE server error: ${message}`
        });
      }

      return sendJson(res, 400, {
        error:
          `KIE: ${message}`
      });
    }

    // --------------------------------------------------
    // NORMALIZE RESPONSE
    //
    // Dashboard.tsx sekarang mencari:
    //
    // candidates[0]
    //   .content
    //   .parts[0]
    //   .text
    //
    // KIE menggunakan:
    //
    // choices[0]
    //   .message
    //   .content
    //
    // Jadi kita convert response KIE ke format yang
    // Dashboard.tsx sudah pahami.
    // --------------------------------------------------

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
        error:
          'KIE tidak memberikan output teks.'
      });
    }

    // --------------------------------------------------
    // RETURN GEMINI-COMPATIBLE RESPONSE
    // --------------------------------------------------

    return sendJson(res, 200, {
      candidates: [
        {
          content: {
            parts: [
              {
                text: generatedText
              }
            ]
          }
        }
      ],

      usageMetadata: {
        promptTokenCount:
          data?.usage?.prompt_tokens || 0,

        candidatesTokenCount:
          data?.usage?.completion_tokens || 0,

        totalTokenCount:
          data?.usage?.total_tokens || 0
      },

      provider: 'kie.ai',

      model: 'gemini-2.5-flash'
    });

  } catch (error: unknown) {
    console.error(
      '[KIE] Unexpected server error:',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown server error';

    if (
      /abort|timeout/i.test(message)
    ) {
      return sendJson(res, 504, {
        error:
          'Request ke KIE timeout. Coba Generate lagi.'
      });
    }

    return sendJson(res, 500, {
      error:
        `Server error: ${message}`
    });
  }
}
