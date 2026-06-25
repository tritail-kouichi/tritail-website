/**
 * TriTail合同会社 — Cloudflare Worker
 * 静的アセットの配信 + お問い合わせAPI (Web3Forms経由)
 *
 * 必要な環境変数:
 *   TURNSTILE_SECRET_KEY : Cloudflare Turnstile シークレットキー
 *   WEB3FORMS_KEY        : Web3Forms アクセスキー
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  };

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: corsHeaders,
    });
  }

  // ── Turnstile 検証 ──────────────────────────────────────
  const turnstileToken = data['cf-turnstile-response'];
  if (!turnstileToken) {
    return new Response(JSON.stringify({ error: 'Turnstile token missing' }), {
      status: 400, headers: corsHeaders,
    });
  }

  const verifyRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret:   env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    }
  );
  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    return new Response(JSON.stringify({ error: 'Turnstile failed', detail: verifyData }), {
      status: 400, headers: corsHeaders,
    });
  }

  // ── Web3Forms でメール送信 ───────────────────────────────
  const subject = data.subject
    ? `[tritail.co.jp] ${data.subject}`
    : '[tritail.co.jp] お問い合わせ';

  const fields = Object.fromEntries(
    Object.entries(data).filter(([k]) =>
      k !== 'cf-turnstile-response' && k !== 'subject'
    )
  );

  const web3Payload = {
    access_key: env.WEB3FORMS_KEY,
    subject:    subject,
    from_name:  data.name ?? 'tritail.co.jp フォーム',
    ...fields,
  };

  const emailRes = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(web3Payload),
  });

  const emailData = await emailRes.json();

  if (!emailRes.ok || !emailData.success) {
    return new Response(JSON.stringify({ error: 'Failed to send email', detail: emailData }), {
      status: 500, headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: corsHeaders,
  });
}
