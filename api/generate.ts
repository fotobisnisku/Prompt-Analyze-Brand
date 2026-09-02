const { data, response } = providerResult;

    // Tangkap error meskipun KIE mengembalikan status HTTP 200 OK
    if (!response.ok || data?.error) {
      console.error('[KIE ERROR]', response.status, data);

      let message =
        data?.msg ||
        data?.error?.message ||
        data?.error ||
        data?.message ||
        'KIE gagal memproses request.';

      // FIX: Jika pesan error berupa object, ubah jadi teks JSON supaya bisa dibaca UI
      if (typeof message === 'object') {
        try {
          message = JSON.stringify(message);
        } catch {
          message = 'Format error tidak terbaca';
        }
      }

      return sendJson(res, response.status >= 400 ? response.status : 400, {
        error: `KIE: ${message}`,
      });
    }

    const choice = data?.choices?.[0];

    // Cek apakah AI memblokir prompt karena alasan keamanan (Safety Filter)
    if (
      choice?.finish_reason === 'content_filter' || 
      choice?.finish_reason === 'SAFETY' ||
      choice?.finish_reason === 'recitation'
    ) {
      return sendJson(res, 400, {
        error: 'Diblokir oleh sistem keamanan AI (Safety Filter). Coba ganti gambar atau hindari kata sensitif.',
      });
    }

    const generatedText = choice?.message?.content;

    if (
      typeof generatedText !== 'string' ||
      !generatedText.trim()
    ) {
      console.error('[KIE LOG] Isi data yang diterima:', JSON.stringify(data, null, 2));

      return sendJson(res, 502, {
        error: `KIE tidak memberikan output teks. Cek logs Vercel untuk detailnya.`,
      });
    }
