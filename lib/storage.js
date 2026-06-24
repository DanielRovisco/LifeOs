// lib/storage.js
// Imita a API window.storage do protótipo em artefacto (get/set/delete/list),
// mas guarda os dados a sério no Supabase em vez de memória de sessão.
import { supabase } from './supabase';

export const storage = {
  async get(key) {
    const { data, error } = await supabase.from('kv_store').select('value').eq('key', key).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { key, value: JSON.stringify(data.value) };
  },
  async set(key, value) {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    const { error } = await supabase.from('kv_store').upsert({ key, value: parsed, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { key, value };
  },
  async delete(key) {
    const { error } = await supabase.from('kv_store').delete().eq('key', key);
    if (error) throw error;
    return { key, deleted: true };
  },
  async list(prefix = '') {
    const { data, error } = await supabase.from('kv_store').select('key').like('key', `${prefix}%`);
    if (error) throw error;
    return { keys: data.map(d => d.key) };
  },
};
