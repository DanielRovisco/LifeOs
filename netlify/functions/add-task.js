// netlify/functions/add-task.js
// Endpoint: POST /.netlify/functions/add-task
// Permite a um agente externo (ex: uma sessão Cowork que leu o email) adicionar
// uma tarefa à lista do site sem precisar de credenciais da base de dados.
//
// Configuração necessária (Netlify → Site settings → Environment variables):
//   TASKS_API_SECRET = uma chave secreta à tua escolha (gera uma string aleatória)
//
// Chamada:
//   POST /.netlify/functions/add-task
//   Header: Authorization: Bearer <TASKS_API_SECRET>
//   Body JSON: { "text": "Responder ao email do banco", "area": "PESSOAL", "due": "2026-07-01" }
//   (area é opcional, default "PESSOAL"; due é opcional, formato YYYY-MM-DD)

import { createClient } from '@supabase/supabase-js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido, usa POST.' }) };
  }

  const secret = process.env.TASKS_API_SECRET;
  if (!secret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'TASKS_API_SECRET não configurada nas variáveis de ambiente do Netlify.' }) };
  }

  const auth = event.headers.authorization || event.headers.Authorization || '';
  if (auth !== `Bearer ${secret}`) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Não autorizado.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body inválido, esperado JSON.' }) };
  }

  const text = (body.text || '').trim();
  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Campo "text" é obrigatório.' }) };
  }
  const area = body.area === 'FINANÇAS' ? 'FINANÇAS' : 'PESSOAL';
  const due = body.due || null;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  try {
    const { data: row, error: readError } = await supabase.from('kv_store').select('value').eq('key', 'tasks').maybeSingle();
    if (readError) throw readError;

    const tasks = Array.isArray(row?.value) ? row.value : [];
    const newTask = { id: Date.now(), text, done: false, area, due };
    const updated = [newTask, ...tasks];

    const { error: writeError } = await supabase.from('kv_store').upsert({ key: 'tasks', value: updated, updated_at: new Date().toISOString() });
    if (writeError) throw writeError;

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: newTask }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
