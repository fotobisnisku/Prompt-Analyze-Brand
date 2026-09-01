import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_MODEL = 'gemini-2.5-flash';

function json(
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
  // 1. METHOD CHECK
  // --------------------------------------------------

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return json(res, 405, {
      error: 'Method tidak diizinkan. Gunakan POST /api/generate.'
    });
  }

  // --------------------------------------------------
  // 2. API KEY
  // --------------------------------------------------

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured.');

    return json(res, 500, {
      error:
        'GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables.'
    });
  }

  // --------------------------------------------------
  // 3. READ REQUEST
  // --------------------------------------------------

  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return json(res, 400, {
        error: 'Request body harus berupa JSON object.'
      });
    }

    const contents = body.contents;
    const systemInstruction = body.systemInstruction;

    if (!Array.isArray(contents) || contents.length === 0) {
      return json(res, 400, {
        error: 'Field "contents" wajib berupa array dan tidak boleh kosong.'
      });
    }

    // --------------------------------------------------
    // 4. BASIC PAYLOAD SIZE PROTECTION
    // --------------------------------------------------

    const serializedBody = JSON.stringify(body);
    const payloadBytes = Buffer.byteLength(serializedBody, 'utf8');

    // Safety limit for the serverless request.
    // Images are sent as Base64, so the JSON can become large quickly.
    const MAX_PAYLOAD_BYTES = 18 * 1024 * 1024;

    if (payloadBytes > MAX_PAYLOAD_BYTES) {
      return json(res, 413, {
        error:
          'Payload terlalu besar. Resize/compress gambar lalu coba lagi.'
      });
    }

    // --------------------------------------------------
    // 5. VALIDATE IMAGE DATA
    // --------------------------------------------------

    for (const content of contents) {
      if (!content || !Array.isArray(content.parts)) {
        continue;
      }

      for (const part of content.parts) {
        if (!part?.inlineData) {
          continue;
        }

        const mimeType = part.inlineData.mimeType;
        const base64 = part.inlineData.data;

        if (
          typeof mimeType !== 'string' ||
          !mimeType.startsWith('image/')
        ) {
          return json(res, 400, {
            error: 'Format MIME gambar tidak valid.'
          });
        }

        if (typeof base64 !== 'string' || base64.length === 0) {
          return json(res, 400, {
            error: 'Data gambar kosong atau tidak valid.'
          });
        }

        // ~7.5 MB raw image equivalent.
        const MAX_BASE64_CHARS = 10_000_000;

        if (base64.length > MAX_BASE64_CHARS) {
          return json(res, 413, {
            error:
              'Ukuran gambar terlalu besar. Gunakan gambar yang lebih kecil.'
          });
        }
      }
    }

    // --------------------------------------------------
    // 6. MODEL
    // --------------------------------------------------

    const model =
      process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

    // --------------------------------------------------
    // 7. GEMINI REQUEST
    // --------------------------------------------------

    const geminiPayload = {
      contents,
      ...(systemInstruction
        ? {
            systemInstruction
          }
        : {}),
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    };

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 55_000);

    let geminiResponse: Response;

    try {
      geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },

          body: JSON.stringify(geminiPayload),

          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    // --------------------------------------------------
    // 8. READ GEMINI RESPONSE
    // --------------------------------------------------

    const responseText = await geminiResponse.text();

    let data: any;

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      console.error(
        'Gemini returned invalid JSON:',
        responseText.slice(0, 500)
      );

      return json(res, 502, {
        error:
          'Gemini mengembalikan response yang tidak valid.'
      });
    }

    // --------------------------------------------------
    // 9. GEMINI ERROR
    // --------------------------------------------------

    if (!geminiResponse.ok) {
      console.error(
        'Gemini API error:',
        geminiResponse.status,
        data
      );

      const message =
        data?.error?.message ||
        data?.error?.status ||
        'Gemini gagal memproses request.';

      if (geminiResponse.status === 429) {
        return json(res, 429, {
          error: `Gemini rate limit: ${message}`
        });
      }

      if (geminiResponse.status >= 500) {
        return json(res, 502, {
          error: `Gemini server error: ${message}`
        });
      }

      if (
        geminiResponse.status === 401 ||
        geminiResponse.status === 403
      ) {
        return json(res, 502, {
          error:
            'Gemini API Key ditolak. Periksa GEMINI_API_KEY di Vercel.'
        });
      }

      return json(res, 400, {
        error: `Gemini: ${message}`
      });
    }

    // --------------------------------------------------
    // 10. CHECK GENERATED TEXT
    // --------------------------------------------------

    const generatedText =
      data?.candidates?.[0]?.content?.parts
        ?.filter(
          (part: any) =>
            typeof part?.text === 'string'
        )
        ?.map(
          (part: any) => part.text
        )
        ?.join('\n')
        ?.trim();

    if (!generatedText) {
      const finishReason =
        data?.candidates?.[0]?.finishReason;

      const blockReason =
        data?.promptFeedback?.blockReason;

      console.error(
        'Gemini returned no text:',
        {
          finishReason,
          blockReason,
          response: data
        }
      );

      if (blockReason) {
        return json(res, 502, {
          error:
            `Gemini memblokir request: ${blockReason}.`
        });
      }

      return json(res, 502, {
        error:
          finishReason
            ? `Gemini tidak menghasilkan teks. Finish reason: ${finishReason}.`
            : 'Gemini tidak memberikan output teks.'
      });
    }

    // --------------------------------------------------
    // 11. RETURN ORIGINAL GEMINI RESPONSE
    // --------------------------------------------------
    //
    // Dashboard.tsx membaca:
    //
    // data.candidates[0].content.parts[0].text
    //
    // Jadi kita kembalikan response Gemini apa adanya.
    // --------------------------------------------------

    return json(res, 200, data);

  } catch (error: unknown) {
    console.error(
      'Unexpected /api/generate error:',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown server error';

    if (/abort|timeout/i.test(message)) {
      return json(res, 504, {
        error:
          'Request ke Gemini timeout. Coba Generate lagi.'
      });
    }

    return json(res, 500, {
      error:
        `Server error: ${message}`
    });
  }
}