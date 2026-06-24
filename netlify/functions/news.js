// netlify/functions/news.js
// Endpoint: /.netlify/functions/news?topic=...
//
// Configuração necessária (Netlify → Environment variables):
//   ANTHROPIC_API_KEY = chave gerada em console.anthropic.com

export async function handler(event) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const topic = event.queryStringParameters?.topic || '';

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada.' }) };
  }

  const topicLine = topic.trim() ? `sobre "${topic.trim()}"` : 'gerais (Portugal e mundo)';

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Pesquisa notícias ${topicLine} dos últimos 3 dias. Devolve APENAS um JSON válido, sem texto antes ou depois, sem markdown, no formato:
{"items":[{"titulo":"...","resumo":"resumo em 2 frases em português de Portugal","fonte":"nome da fonte"}]} com exatamente as 3 notícias mais importantes.`,
        }],
      }),
    });

    const data = await resp.json();
    const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    const clean = textBlocks.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
