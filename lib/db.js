// lib/db.js
// Camada de acesso a dados — substitui o window.storage do protótipo em artefacto.
import { supabase } from './supabase';

export const db = {
  async getTasks() {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(t => ({ ...t, due: t.due })); // due já vem como string YYYY-MM-DD
  },
  async addTask(task) {
    const { data, error } = await supabase.from('tasks').insert(task).select().single();
    if (error) throw error;
    return data;
  },
  async toggleTask(id, done) {
    const { error } = await supabase.from('tasks').update({ done }).eq('id', id);
    if (error) throw error;
  },

  async getExpenses() {
    const { data, error } = await supabase.from('expenses').select('*').order('created_at');
    if (error) throw error;
    return data;
  },
  async addExpense(expense) {
    const { data, error } = await supabase.from('expenses').insert(expense).select().single();
    if (error) throw error;
    return data;
  },
  async removeExpense(id) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },

  async getPortfolio() {
    const { data, error } = await supabase.from('portfolio_entries').select('*').order('date');
    if (error) throw error;
    return data;
  },
  async addPortfolioEntry(entry) {
    const { data, error } = await supabase.from('portfolio_entries').upsert(entry, { onConflict: 'date' }).select().single();
    if (error) throw error;
    return data;
  },

  async getCheckins() {
    const { data, error } = await supabase.from('checkins').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async saveCheckin(checkin) {
    const { error } = await supabase.from('checkins').upsert(checkin, { onConflict: 'week' });
    if (error) throw error;
  },

  async getSetting(key, fallback) {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
    if (error || !data) return fallback;
    return data.value;
  },
  async setSetting(key, value) {
    const { error } = await supabase.from('settings').upsert({ key, value });
    if (error) throw error;
  },
};

// Funções que chamam as Netlify Functions (integrações externas)
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
