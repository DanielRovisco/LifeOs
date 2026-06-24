// netlify/functions/trading212.js
// Endpoint: /.netlify/functions/trading212
// Lê a carteira diretamente da API do Trading212. A chave nunca chega ao browser.
//
// Configuração necessária (Netlify → Site settings → Environment variables):
//   TRADING212_API_KEY = a tua chave API gerada em Settings → API (Trading212 app)
//
// A API do Trading212 é só de leitura para contas Invest/ISA (beta pública).

export async function handler(event) {
  const apiKey = process.env.TRADING212_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'TRADING212_API_KEY não configurada nas variáveis de ambiente do Netlify.' }),
    };
  }

  try {
    const resp = await fetch('https://live.trading212.com/api/v0/equity/portfolio', {
      headers: { Authorization: apiKey },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: resp.status, body: JSON.stringify({ error: 'Trading212 API error', detail: text }) };
    }

    const positions = await resp.json();
    const total = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions, total, fetchedAt: new Date().toISOString() }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
