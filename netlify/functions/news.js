// netlify/functions/news.js
// Endpoint: /.netlify/functions/news?topic=...
// Usa o RSS do Google News — gratuito, sem chave API necessária.

function decodeEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!match) return '';
  return decodeEntities(match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')).trim();
}

function formatDate(pubDate) {
  const d = new Date(pubDate);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export async function handler(event) {
  const topic = (event.queryStringParameters?.topic || '').trim();

  const url = topic
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=pt-PT&gl=PT&ceid=PT:pt`
    : `https://news.google.com/rss?hl=pt-PT&gl=PT&ceid=PT:pt`;

  try {
    const resp = await fetch(url);
    const xml = await resp.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 6)
      .map(([, itemXml]) => {
        const rawTitle = extractTag(itemXml, 'title');
        const source = extractTag(itemXml, 'source');
        const link = extractTag(itemXml, 'link');
        const pubDate = extractTag(itemXml, 'pubDate');
        const titulo = source && rawTitle.endsWith(source) ? rawTitle.slice(0, -source.length).replace(/\s*-\s*$/, '').trim() : rawTitle;
        return {
          titulo: titulo || rawTitle,
          fonte: source || 'Google News',
          resumo: formatDate(pubDate),
          link,
        };
      });

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
