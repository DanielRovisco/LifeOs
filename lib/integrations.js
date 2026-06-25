// lib/integrations.js
// Chamadas às Netlify Functions (integrações externas: notícias, Trading212, saúde).
export const integrations = {
  async fetchNews(topic) {
    const resp = await fetch(`/.netlify/functions/news?topic=${encodeURIComponent(topic || '')}`);
    if (!resp.ok) throw new Error('Falha ao obter notícias');
    return resp.json();
  },
  async fetchTrading212() {
    const resp = await fetch('/.netlify/functions/trading212');
    if (!resp.ok) throw new Error('Falha ao obter dados Trading212');
    return resp.json();
  },
  async fetchHealth() {
    const resp = await fetch('/.netlify/functions/health');
    if (!resp.ok) throw new Error('Falha ao obter dados de saúde');
    return resp.json();
  },
};
