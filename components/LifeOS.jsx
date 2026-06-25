'use client';
import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { integrations } from '../lib/integrations';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Home, Wallet, CheckSquare, Cpu, Plus, ArrowUpRight, ArrowDownRight, Lightbulb, Lock, Thermometer, Check, Circle, Zap, Newspaper, RefreshCw, Activity, Heart, Footprints } from 'lucide-react';

const C = {
  bg: '#050608',
  panel: '#0D1014',
  border: '#23282F',
  text: '#F5F7FA',
  dim: '#7A8390',
  faint: '#454C56',
  cyan: '#AEB6BF',
  green: '#3CE89A',
  red: '#FF5C6C',
  amber: '#FFB454',
};

function Panel({ children, style = {}, pad = 24 }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: pad, ...style }}>
      {children}
    </div>
  );
}

function Eyebrow({ children, color = C.dim }) {
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color, marginBottom: 10 }}>
      {children}
    </div>
  );
}

export default function LifeOS() {
  const [tab, setTab] = useState('dashboard');
  const [clock, setClock] = useState(new Date());
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Marcar consulta dentista', done: false, area: 'PESSOAL', due: '2026-06-26' },
    { id: 2, text: 'Rever orçamento mensal', done: false, area: 'PESSOAL', due: '2026-06-30' },
    { id: 3, text: 'Configurar Health Auto Export', done: false, area: 'PESSOAL', due: '2026-06-27' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [newTaskArea, setNewTaskArea] = useState('PESSOAL');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [taskFilter, setTaskFilter] = useState('TODAS');
  const [tasksLoaded, setTasksLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await storage.get('tasks');
        if (t) setTasks(JSON.parse(t.value));
      } catch (e) {}
      setTasksLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!tasksLoaded) return;
    storage.set('tasks', JSON.stringify(tasks)).catch(() => {});
  }, [tasks, tasksLoaded]);

  // --- Objetivos financeiros (genérico: APY automático ou manual), persistidos ---
  const [goals, setGoals] = useState([
    { id: 1, title: 'Entrada da casa', mode: 'apy', principal: 12450, rate: 3.5, startDate: '2026-06-01', target: 30000, primary: true },
    { id: 2, title: 'Custos da casa', mode: 'manual', current: 0, target: 5000, primary: false },
    { id: 3, title: 'Veículo', mode: 'manual', current: 0, target: 8000, primary: false },
  ]);
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalDraft, setGoalDraft] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const g = await storage.get('goals');
        if (g) setGoals(JSON.parse(g.value));
      } catch (e) {}
      setGoalsLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!goalsLoaded) return;
    storage.set('goals', JSON.stringify(goals)).catch(() => {});
  }, [goals, goalsLoaded]);

  const goalCurrentValue = (g) => {
    if (g.mode === 'apy') {
      const start = new Date(g.startDate);
      const now = new Date();
      const days = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
      const dailyRate = (g.rate || 0) / 100 / 365;
      return (g.principal || 0) * Math.pow(1 + dailyRate, days);
    }
    return g.current || 0;
  };

  const startEditingGoal = (g) => { setGoalDraft({ ...g }); setEditingGoalId(g.id); };

  const saveGoal = () => {
    setGoals(goals.map(g => g.id === editingGoalId ? {
      ...goalDraft,
      target: parseFloat(goalDraft.target) || 0,
      principal: goalDraft.mode === 'apy' ? (parseFloat(goalDraft.principal) || 0) : undefined,
      rate: goalDraft.mode === 'apy' ? (parseFloat(goalDraft.rate) || 0) : undefined,
      current: goalDraft.mode === 'manual' ? (parseFloat(goalDraft.current) || 0) : undefined,
    } : g));
    setEditingGoalId(null);
    setGoalDraft(null);
  };

  const setPrimaryGoal = (id) => setGoals(goals.map(g => ({ ...g, primary: g.id === id })));

  const removeGoal = (id) => setGoals(goals.filter(g => g.id !== id));

  const addGoal = () => {
    const id = Date.now();
    setGoals([...goals, { id, title: 'Novo objetivo', mode: 'manual', current: 0, target: 1000, primary: false }]);
    startEditingGoal({ id, title: 'Novo objetivo', mode: 'manual', current: 0, target: 1000, primary: false });
  };

  const primaryGoal = goals.find(g => g.primary) || goals[0];

  // --- Carteira de ações (entradas manuais, persistidas) ---
  const [portfolio, setPortfolio] = useState([
    { date: '2026-06-24', value: 1368.93 },
  ]);
  const [newEntry, setNewEntry] = useState({ date: '', value: '' });
  const [range, setRange] = useState('mes'); // 'dia' | 'mes'
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await storage.get('portfolio');
        if (p) setPortfolio(JSON.parse(p.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    storage.set('portfolio', JSON.stringify(portfolio)).catch(() => {});
  }, [portfolio, loaded]);

  const addPortfolioEntry = () => {
    if (!newEntry.date || !newEntry.value) return;
    setPortfolio([...portfolio.filter(p => p.date !== newEntry.date), { date: newEntry.date, value: parseFloat(newEntry.value) }].sort((a, b) => a.date.localeCompare(b.date)));
    setNewEntry({ date: '', value: '' });
  };

  const chartData = (() => {
    const sorted = [...portfolio].sort((a, b) => a.date.localeCompare(b.date));
    if (range === 'dia') return sorted.slice(-7).map(p => ({ ...p, label: p.date.slice(8, 10) }));
    return sorted.map(p => ({ ...p, label: p.date.slice(5) }));
  })();

  const latestValue = portfolio.length ? [...portfolio].sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0].value : 0;
  const firstValue = portfolio.length ? [...portfolio].sort((a, b) => a.date.localeCompare(b.date))[0].value : 0;
  const portfolioDelta = latestValue - firstValue;

  // --- Carteira automática (Trading212) ---
  const [autoPortfolio, setAutoPortfolio] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [t212Data, setT212Data] = useState(null);
  const [t212Loading, setT212Loading] = useState(false);
  const [t212Error, setT212Error] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const a = await storage.get('auto-portfolio');
        if (a) setAutoPortfolio(JSON.parse(a.value));
      } catch (e) {}
      setAutoLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!autoLoaded) return;
    storage.set('auto-portfolio', JSON.stringify(autoPortfolio)).catch(() => {});
  }, [autoPortfolio, autoLoaded]);

  const fetchT212 = async () => {
    setT212Loading(true);
    setT212Error('');
    try {
      const data = await integrations.fetchTrading212();
      if (data.error) throw new Error(data.detail || data.error);
      setT212Data(data);
      const today = new Date().toISOString().slice(0, 10);
      setPortfolio(prev => [...prev.filter(p => p.date !== today), { date: today, value: data.total }].sort((a, b) => a.date.localeCompare(b.date)));
    } catch (e) {
      setT212Error('Não foi possível ligar ao Trading212. Confirma a TRADING212_API_KEY no Netlify.');
    }
    setT212Loading(false);
  };

  useEffect(() => {
    if (autoLoaded && autoPortfolio) fetchT212();
  }, [autoLoaded, autoPortfolio]);

  // --- Despesas mensais ---
  const [expenses, setExpenses] = useState([
    { id: 1, desc: 'Renda', value: 650, recurring: true },
  ]);
  const [newExpense, setNewExpense] = useState({ desc: '', value: '' });
  const [expensesLoaded, setExpensesLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const e = await storage.get('expenses');
        if (e) setExpenses(JSON.parse(e.value));
      } catch (err) {}
      setExpensesLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!expensesLoaded) return;
    storage.set('expenses', JSON.stringify(expenses)).catch(() => {});
  }, [expenses, expensesLoaded]);

  const addExpense = () => {
    if (!newExpense.desc.trim() || !newExpense.value) return;
    setExpenses([...expenses, { id: Date.now(), desc: newExpense.desc, value: parseFloat(newExpense.value), recurring: true }]);
    setNewExpense({ desc: '', value: '' });
  };
  const removeExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));
  const totalExpenses = expenses.reduce((s, e) => s + e.value, 0);
  const [income, setIncome] = useState(1296);
  const [incomeLoaded, setIncomeLoaded] = useState(false);
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeDraft, setIncomeDraft] = useState(1296);

  useEffect(() => {
    (async () => {
      try {
        const i = await storage.get('income');
        if (i) { setIncome(JSON.parse(i.value)); setIncomeDraft(JSON.parse(i.value)); }
      } catch (e) {}
      setIncomeLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!incomeLoaded) return;
    storage.set('income', JSON.stringify(income)).catch(() => {});
  }, [income, incomeLoaded]);

  // --- Check-in semanal ---
  const [checkins, setCheckins] = useState([]);
  const [checkinDraft, setCheckinDraft] = useState('');
  const [checkinsLoaded, setCheckinsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await storage.get('checkins');
        if (c) setCheckins(JSON.parse(c.value));
      } catch (e) {}
      setCheckinsLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!checkinsLoaded) return;
    storage.set('checkins', JSON.stringify(checkins)).catch(() => {});
  }, [checkins, checkinsLoaded]);

  const isoWeek = (d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return date.getFullYear() + '-W' + (1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7));
  };
  const currentWeek = isoWeek(clock);
  const hasCheckedInThisWeek = checkins.some(c => c.week === currentWeek);
  const isFriday = clock.getDay() === 5;
  const showCheckinPrompt = isFriday && !hasCheckedInThisWeek;

  const saveCheckin = () => {
    if (!checkinDraft.trim()) return;
    setCheckins([{ week: currentWeek, date: todayStr, text: checkinDraft, doneTasks: tasks.filter(t => t.done).length, totalTasks: tasks.length }, ...checkins.filter(c => c.week !== currentWeek)]);
    setCheckinDraft('');
  };

  // --- Notícias (pesquisa real via API Anthropic + web search) ---
  const [newsTopic, setNewsTopic] = useState('');
  const [news, setNews] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');

  const fetchNews = async () => {
    setNewsLoading(true);
    setNewsError('');
    setNews(null);
    try {
      const parsed = await integrations.fetchNews(newsTopic);
      setNews(parsed.items || []);
    } catch (e) {
      setNewsError('Não foi possível obter notícias agora. Tenta de novo.');
    }
    setNewsLoading(false);
  };

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const nav = [
    { id: 'dashboard', label: 'Painel', icon: Home },
    { id: 'financas', label: 'Finanças', icon: Wallet },
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
    { id: 'noticias', label: 'Notícias', icon: Newspaper },
    { id: 'saude', label: 'Saúde', icon: Activity },
    { id: 'casa', label: 'Casa', icon: Cpu },
  ];

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now(), text: newTask, done: false, area: newTaskArea, due: newTaskDue || null }, ...tasks]);
    setNewTask('');
    setNewTaskDue('');
  };
  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const hour = clock.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 20 ? 'Boa tarde' : 'Boa noite';
  const todayStr = clock.toISOString().slice(0, 10);
  const pending = tasks.filter(t => !t.done);
  const overdue = pending.filter(t => t.due && t.due < todayStr);
  const visibleTasks = taskFilter === 'TODAS' ? tasks : tasks.filter(t => t.area === taskFilter);

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: C.bg, color: C.text, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        html, body { overflow-x: hidden; }
        .disp { font-family: 'Space Grotesk', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        input::placeholder { color: ${C.faint}; }
      `}</style>

      {/* Top nav */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 4, borderBottom: `1px solid ${C.border}`, padding: '0 14px', height: 52, flexShrink: 0, overflowX: 'auto' }}>
        <Zap size={16} color={C.cyan} style={{ filter: `drop-shadow(0 0 6px ${C.cyan}90)`, marginRight: 14, flexShrink: 0 }} />
        <nav style={{ display: 'flex', gap: 2 }}>
          {nav.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
                  background: active ? `${C.cyan}14` : 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: active ? `2px solid ${C.cyan}` : '2px solid transparent', whiteSpace: 'nowrap',
                }}
              >
                <Icon size={15} color={active ? C.cyan : C.faint} strokeWidth={2} />
                <span className="mono" style={{ fontSize: 11, letterSpacing: '0.04em', color: active ? C.cyan : C.faint }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main */}
      <main style={{ flex: 1, width: '100%', padding: '20px 16px', overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'dashboard' && (
          <div style={{ maxWidth: 880, width: '100%' }}>
            <Eyebrow color={C.cyan}>{clock.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} · SISTEMA ATIVO</Eyebrow>
            <h1 className="disp" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, margin: '4px 0 18px', color: C.text }}>
              {greeting}, Daniel.
            </h1>

            {showCheckinPrompt && (
              <Panel pad={18} style={{ marginBottom: 12, borderColor: C.cyan }}>
                <Eyebrow color={C.cyan}>Check-in semanal — sexta-feira</Eyebrow>
                <div style={{ fontSize: 13.5, color: '#C5CBD2', marginBottom: 10 }}>Como correu a semana? O que ficou por fazer e porquê?</div>
                <textarea
                  value={checkinDraft}
                  onChange={e => setCheckinDraft(e.target.value)}
                  placeholder="Escreve aqui..."
                  rows={3}
                  style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, padding: '10px 12px', fontSize: 13.5, color: C.text, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
                />
                <button onClick={saveCheckin} style={{ marginTop: 8, padding: '8px 16px', background: C.cyan, border: 'none', color: C.bg, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Guardar check-in</button>
              </Panel>
            )}
            {isFriday && hasCheckedInThisWeek && (
              <Panel pad={14} style={{ marginBottom: 12 }}>
                <Eyebrow color={C.green}>✓ Check-in desta semana feito</Eyebrow>
                <div style={{ fontSize: 13, color: C.dim }}>{checkins.find(c => c.week === currentWeek)?.text}</div>
              </Panel>
            )}

            {primaryGoal && (() => {
              const val = goalCurrentValue(primaryGoal);
              const pctGoal = Math.min(100, (val / primaryGoal.target) * 100);
              const remaining = Math.max(0, primaryGoal.target - val);
              return (
                <Panel pad={18} style={{ marginBottom: 12 }}>
                  <Eyebrow color={C.cyan}>Meta — {primaryGoal.title}</Eyebrow>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span className="disp" style={{ fontSize: 32, fontWeight: 700 }}>€{val.toFixed(2)}</span>
                    <span className="mono" style={{ color: C.dim, fontSize: 12 }}>de €{primaryGoal.target.toLocaleString('pt-PT')} — faltam €{remaining.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 6, background: C.border, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, width: `${pctGoal}%`, background: C.cyan, boxShadow: `0 0 14px ${C.cyan}` }} />
                  </div>
                  <div className="mono" style={{ marginTop: 6, fontSize: 11, color: C.cyan }}>{pctGoal.toFixed(1)}% concluído</div>
                </Panel>
              );
            })()}

            {overdue.length > 0 && (
              <Panel pad={14} style={{ marginBottom: 12, borderColor: C.red }}>
                <Eyebrow color={C.red}>⚠ {overdue.length} tarefa{overdue.length > 1 ? 's' : ''} atrasada{overdue.length > 1 ? 's' : ''}</Eyebrow>
                {overdue.map(t => (
                  <div key={t.id} style={{ fontSize: 13, color: '#F0C0C5', padding: '2px 0' }}>{t.text} <span className="mono" style={{ color: C.faint, fontSize: 10 }}>· era {t.due}</span></div>
                ))}
              </Panel>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10, marginBottom: 12 }}>
              <Panel pad={14}>
                <Eyebrow>Tarefas</Eyebrow>
                <div className="disp" style={{ fontSize: 26, fontWeight: 700 }}>{pending.length}</div>
                <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>de {tasks.length} total</div>
              </Panel>
              <Panel pad={14}>
                <Eyebrow>Clima</Eyebrow>
                <div className="disp" style={{ fontSize: 26, fontWeight: 700 }}>21<span style={{ fontSize: 13, color: C.dim }}>°C</span></div>
                <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>3 dispositivos</div>
              </Panel>
              <Panel pad={14}>
                <Eyebrow>Este mês</Eyebrow>
                <div className="disp" style={{ fontSize: 26, fontWeight: 700, color: C.green }}>+€320</div>
                <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>poupado</div>
              </Panel>
            </div>

            <Panel pad={18}>
              <Eyebrow color={C.cyan}>Próximas tarefas</Eyebrow>
              <div>
                {pending.slice(0, 4).map((t, i) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}`, gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <button onClick={() => toggleTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                        <Circle size={15} color={t.due && t.due < todayStr ? C.red : C.cyan} strokeWidth={2} />
                      </button>
                      <span style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.text}</span>
                    </div>
                    <span className="mono" style={{ fontSize: 9.5, color: C.faint, letterSpacing: '0.06em', flexShrink: 0 }}>{t.area}{t.due ? ` · ${t.due.slice(5)}` : ''}</span>
                  </div>
                ))}
                {pending.length === 0 && <div style={{ color: C.dim, fontSize: 13, padding: '8px 0' }}>Sem tarefas pendentes.</div>}
              </div>
            </Panel>
          </div>
        )}

        {tab === 'financas' && (
          <div style={{ maxWidth: 880, width: '100%' }}>
            <h1 className="disp" style={{ fontSize: 28, fontWeight: 700, marginBottom: 18 }}>Finanças</h1>

            {/* Objetivos financeiros */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <Eyebrow color={C.cyan}>Objetivos</Eyebrow>
              <button onClick={addGoal} className="mono" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: `1px solid ${C.border}`, color: C.cyan, fontSize: 10, padding: '4px 9px', cursor: 'pointer' }}>
                <Plus size={11} /> NOVO OBJETIVO
              </button>
            </div>
            {goals.map((g) => {
              const isEditing = editingGoalId === g.id;
              const val = goalCurrentValue(g);
              const goalPct = Math.min(100, (val / (g.target || 1)) * 100);
              return (
                <Panel key={g.id} pad={18} style={{ marginBottom: 12, borderColor: g.primary ? C.cyan : C.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <Eyebrow color={C.cyan}>{g.title}{g.mode === 'apy' ? ` · conta APY ${g.rate}%` : ''}{g.primary ? ' · NO PAINEL' : ''}</Eyebrow>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {!g.primary && (
                        <button onClick={() => setPrimaryGoal(g.id)} className="mono" style={{ background: 'none', border: `1px solid ${C.border}`, color: C.dim, fontSize: 10, padding: '3px 8px', cursor: 'pointer' }}>
                          MOSTRAR NO PAINEL
                        </button>
                      )}
                      <button onClick={() => isEditing ? setEditingGoalId(null) : startEditingGoal(g)} className="mono" style={{ background: 'none', border: `1px solid ${C.border}`, color: C.dim, fontSize: 10, padding: '3px 8px', cursor: 'pointer' }}>
                        {isEditing ? 'FECHAR' : 'EDITAR'}
                      </button>
                      <button onClick={() => removeGoal(g.id)} className="mono" style={{ background: 'none', border: `1px solid ${C.border}`, color: C.red, fontSize: 10, padding: '3px 8px', cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <input value={goalDraft.title} onChange={e => setGoalDraft({ ...goalDraft, title: e.target.value })} placeholder="Nome do objetivo" className="mono" style={{ flex: 2, minWidth: 140, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, color: C.text, outline: 'none' }} />
                        <select value={goalDraft.mode} onChange={e => setGoalDraft({ ...goalDraft, mode: e.target.value })} className="mono" style={{ flex: 1, minWidth: 100, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, color: C.text, outline: 'none' }}>
                          <option value="manual">MANUAL</option>
                          <option value="apy">APY AUTOMÁTICO</option>
                        </select>
                        <input type="number" value={goalDraft.target} onChange={e => setGoalDraft({ ...goalDraft, target: e.target.value })} placeholder="Meta final (€)" className="mono" style={{ flex: 1, minWidth: 100, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, color: C.text, outline: 'none' }} />
                      </div>
                      {goalDraft.mode === 'apy' ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <input type="number" value={goalDraft.principal ?? ''} onChange={e => setGoalDraft({ ...goalDraft, principal: e.target.value })} placeholder="Capital (€)" className="mono" style={{ flex: 1, minWidth: 100, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, color: C.text, outline: 'none' }} />
                          <input type="number" value={goalDraft.rate ?? ''} onChange={e => setGoalDraft({ ...goalDraft, rate: e.target.value })} placeholder="Taxa APY %" className="mono" style={{ flex: 1, minWidth: 100, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, color: C.text, outline: 'none' }} />
                          <input type="date" value={goalDraft.startDate || ''} onChange={e => setGoalDraft({ ...goalDraft, startDate: e.target.value })} className="mono" style={{ flex: 1, minWidth: 130, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, color: C.text, outline: 'none' }} />
                        </div>
                      ) : (
                        <input type="number" value={goalDraft.current ?? ''} onChange={e => setGoalDraft({ ...goalDraft, current: e.target.value })} placeholder="Valor atual (€)" className="mono" style={{ background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, color: C.text, outline: 'none' }} />
                      )}
                      <button onClick={saveGoal} style={{ alignSelf: 'flex-start', padding: '7px 14px', background: C.cyan, border: 'none', color: C.bg, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                    </div>
                  ) : (
                    <>
                      <div className="disp" style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 12px' }}>
                        €{val.toFixed(2)} <span style={{ color: C.dim, fontSize: 16, fontWeight: 500 }}>/ €{(g.target || 0).toLocaleString('pt-PT')}</span>
                      </div>
                      <div style={{ height: 6, background: C.border, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, width: `${goalPct}%`, background: C.cyan, boxShadow: `0 0 14px ${C.cyan}` }} />
                      </div>
                      <div className="mono" style={{ marginTop: 6, fontSize: 11, color: C.cyan }}>
                        {goalPct.toFixed(1)}% {g.mode === 'apy' ? '· cresce automaticamente todos os dias' : '· atualizado manualmente'}
                      </div>
                    </>
                  )}
                </Panel>
              );
            })}

            {/* Carteira de ações */}
            <Panel pad={18} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                <Eyebrow color={C.cyan}>Carteira{autoPortfolio ? ' — Trading212' : ''}</Eyebrow>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {autoPortfolio && (
                    <button onClick={fetchT212} disabled={t212Loading} className="mono" style={{ fontSize: 10, padding: '4px 9px', background: 'transparent', border: `1px solid ${C.border}`, color: C.cyan, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: t212Loading ? 0.6 : 1 }}>
                      <RefreshCw size={10} style={{ animation: t212Loading ? 'spin 1s linear infinite' : 'none' }} /> ATUALIZAR
                    </button>
                  )}
                  <button onClick={() => setAutoPortfolio(!autoPortfolio)} className="mono" style={{ fontSize: 10, padding: '4px 9px', background: autoPortfolio ? `${C.cyan}14` : 'transparent', border: `1px solid ${autoPortfolio ? C.cyan : C.border}`, color: autoPortfolio ? C.cyan : C.faint, cursor: 'pointer' }}>
                    {autoPortfolio ? 'AUTOMÁTICA' : 'MANUAL'}
                  </button>
                  {!autoPortfolio && ['dia', 'mes'].map(r => (
                    <button key={r} onClick={() => setRange(r)} className="mono" style={{ fontSize: 10, padding: '4px 9px', background: range === r ? `${C.cyan}14` : 'transparent', border: `1px solid ${range === r ? C.cyan : C.border}`, color: range === r ? C.cyan : C.faint, cursor: 'pointer' }}>
                      {r === 'dia' ? '7 DIAS' : 'MÊS'}
                    </button>
                  ))}
                </div>
              </div>

              {autoPortfolio && t212Error && (
                <div className="mono" style={{ fontSize: 11.5, color: C.red, marginTop: 8 }}>{t212Error}</div>
              )}

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '10px 0' }}>
                <span className="disp" style={{ fontSize: 28, fontWeight: 700 }}>€{latestValue.toFixed(2)}</span>
                <span className="mono" style={{ fontSize: 12, color: portfolioDelta >= 0 ? C.green : C.red }}>
                  {portfolioDelta >= 0 ? '+' : ''}{portfolioDelta.toFixed(2)}€
                </span>
              </div>
              <div style={{ width: '100%', height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="label" stroke={C.faint} fontSize={10} tickLine={false} axisLine={{ stroke: C.border }} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontSize: 12 }} labelStyle={{ color: C.dim }} formatter={(v) => [`€${v}`, 'Valor']} />
                    <Line type="monotone" dataKey="value" stroke={C.cyan} strokeWidth={2} dot={{ r: 3, fill: C.cyan }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {autoPortfolio && t212Data?.positions?.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                  {t212Data.positions.map((p, i) => (
                    <div key={p.ticker || i} className="mono" style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11.5 }}>
                      <span style={{ color: C.dim }}>{p.ticker} <span style={{ color: C.faint }}>· {p.quantity}x</span></span>
                      <span style={{ color: C.text }}>€{(p.currentPrice * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mono" style={{ fontSize: 10, color: C.faint, marginTop: 4 }}>
                    atualizado {new Date(t212Data.fetchedAt).toLocaleTimeString('pt-PT')}
                  </div>
                </div>
              )}

              {!autoPortfolio && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input type="date" value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} className="mono" style={{ flex: 1, minWidth: 0, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 12.5, color: C.text, outline: 'none' }} />
                  <input type="number" value={newEntry.value} onChange={e => setNewEntry({ ...newEntry, value: e.target.value })} placeholder="Valor €" className="mono" style={{ flex: 1, minWidth: 0, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 12.5, color: C.text, outline: 'none' }} />
                  <button onClick={addPortfolioEntry} style={{ padding: '0 14px', background: C.cyan, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Plus size={15} color={C.bg} />
                  </button>
                </div>
              )}
            </Panel>

            {/* Ordenado base */}
            <Panel pad={18} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <Eyebrow color={C.green}>Ordenado mensal</Eyebrow>
                <button onClick={() => { setIncomeDraft(income); setEditingIncome(!editingIncome); }} className="mono" style={{ background: 'none', border: `1px solid ${C.border}`, color: C.dim, fontSize: 10, padding: '3px 8px', cursor: 'pointer' }}>
                  {editingIncome ? 'FECHAR' : 'EDITAR'}
                </button>
              </div>
              {editingIncome ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input type="number" value={incomeDraft} onChange={e => setIncomeDraft(e.target.value)} className="mono" style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, color: C.text, outline: 'none' }} />
                  <button onClick={() => { setIncome(parseFloat(incomeDraft) || 0); setEditingIncome(false); }} style={{ padding: '0 14px', background: C.green, border: 'none', color: C.bg, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                </div>
              ) : (
                <div className="disp" style={{ fontSize: 26, fontWeight: 700, color: C.green, marginTop: 6 }}>€{income.toFixed(2)}</div>
              )}
            </Panel>

            {/* Despesas mensais recorrentes */}
            <Panel pad={18} style={{ marginBottom: 12 }}>
              <Eyebrow color={C.amber}>Despesas fixas mensais</Eyebrow>
              <div className="disp" style={{ fontSize: 26, fontWeight: 700, color: C.amber, margin: '6px 0 12px' }}>€{totalExpenses.toFixed(2)}</div>
              {expenses.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13.5, color: '#C5CBD2' }}>{e.desc}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="mono" style={{ fontSize: 13, color: C.amber }}>€{e.value.toFixed(2)}</span>
                    <button onClick={() => removeExpense(e.id)} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 12 }}>✕</button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input value={newExpense.desc} onChange={e => setNewExpense({ ...newExpense, desc: e.target.value })} placeholder="Descrição" className="mono" style={{ flex: 2, minWidth: 0, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 12.5, color: C.text, outline: 'none' }} />
                <input type="number" value={newExpense.value} onChange={e => setNewExpense({ ...newExpense, value: e.target.value })} placeholder="€" className="mono" style={{ flex: 1, minWidth: 0, background: C.bg, border: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 12.5, color: C.text, outline: 'none' }} />
                <button onClick={addExpense} style={{ padding: '0 14px', background: C.amber, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <Plus size={15} color={C.bg} />
                </button>
              </div>
              <div className="mono" style={{ fontSize: 12, color: C.dim, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                Net mensal estimado: <span style={{ color: income - totalExpenses >= 0 ? C.green : C.red, fontWeight: 600 }}>€{(income - totalExpenses).toFixed(2)}</span>
                <span style={{ color: C.faint }}> ({income.toFixed(0)} ordenado − {totalExpenses.toFixed(0)} despesas, carteira não incluída)</span>
              </div>
            </Panel>


            <Panel>
              <Eyebrow color={C.cyan}>Movimentos recentes</Eyebrow>
              {[
                { d: '22 JUN', desc: 'Transferência poupança', v: '+320.00', up: true },
                { d: '18 JUN', desc: 'Renda', v: '-650.00', up: false },
                { d: '15 JUN', desc: 'Transferência salário', v: '+480.00', up: true },
              ].map((m, i) => (
                <div key={i} className="mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}`, fontSize: 13.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {m.up ? <ArrowUpRight size={14} color={C.green} /> : <ArrowDownRight size={14} color={C.red} />}
                    <span style={{ color: '#C5CBD2', fontFamily: 'Inter, sans-serif' }}>{m.desc}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: C.faint, fontSize: 11 }}>{m.d}</span>
                    <span style={{ color: m.up ? C.green : C.red }}>{m.v}€</span>
                  </div>
                </div>
              ))}
            </Panel>
          </div>
        )}

        {tab === 'tarefas' && (
          <div style={{ maxWidth: 640, width: '100%' }}>
            <h1 className="disp" style={{ fontSize: 28, fontWeight: 700, marginBottom: 18 }}>Tarefas</h1>
            <Panel pad={16} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <input
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Nova tarefa..."
                  className="mono"
                  style={{ flex: '1 1 160px', background: C.bg, border: `1px solid ${C.border}`, padding: '10px 12px', fontSize: 13.5, color: C.text, outline: 'none' }}
                />
                <button onClick={addTask} style={{ padding: '0 16px', background: C.cyan, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Plus size={16} color={C.bg} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select value={newTaskArea} onChange={e => setNewTaskArea(e.target.value)} className="mono" style={{ background: C.bg, border: `1px solid ${C.border}`, padding: '7px 10px', fontSize: 12, color: C.text, outline: 'none' }}>
                  <option value="PESSOAL">PESSOAL</option>
                  <option value="FINANÇAS">FINANÇAS</option>
                </select>
                <input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} className="mono" style={{ background: C.bg, border: `1px solid ${C.border}`, padding: '7px 10px', fontSize: 12, color: C.text, outline: 'none' }} />
              </div>
            </Panel>

            <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
              {['TODAS', 'PESSOAL', 'FINANÇAS'].map(f => (
                <button key={f} onClick={() => setTaskFilter(f)} className="mono" style={{ fontSize: 10.5, padding: '5px 10px', background: taskFilter === f ? `${C.cyan}14` : 'transparent', border: `1px solid ${taskFilter === f ? C.cyan : C.border}`, color: taskFilter === f ? C.cyan : C.faint, cursor: 'pointer' }}>
                  {f}
                </button>
              ))}
            </div>

            <Panel>
              {visibleTasks.map((t, i) => {
                const isOverdue = !t.done && t.due && t.due < todayStr;
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}`, gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <button onClick={() => toggleTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                        {t.done ? <Check size={16} color={C.green} /> : <Circle size={16} color={isOverdue ? C.red : C.cyan} strokeWidth={2} />}
                      </button>
                      <span style={{ fontSize: 14, color: t.done ? C.faint : C.text, textDecoration: t.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.text}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {t.due && <span className="mono" style={{ fontSize: 9.5, color: isOverdue ? C.red : C.faint }}>{t.due.slice(5)}</span>}
                      <span className="mono" style={{ fontSize: 10, color: C.faint, letterSpacing: '0.06em' }}>{t.area}</span>
                    </div>
                  </div>
                );
              })}
              {visibleTasks.length === 0 && <div style={{ color: C.dim, fontSize: 13, padding: '8px 0' }}>Sem tarefas nesta categoria.</div>}
            </Panel>
          </div>
        )}

        {tab === 'noticias' && (
          <div style={{ maxWidth: 760, width: '100%' }}>
            <h1 className="disp" style={{ fontSize: 28, fontWeight: 700, marginBottom: 18 }}>Notícias</h1>
            <Panel pad={18} style={{ marginBottom: 12 }}>
              <Eyebrow color={C.cyan}>Pesquisa — Google News</Eyebrow>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  value={newsTopic}
                  onChange={e => setNewsTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchNews()}
                  placeholder="Tópico (ex: imobiliário Portugal, mercados...) ou deixa vazio"
                  className="mono"
                  style={{ flex: 1, minWidth: 0, background: C.bg, border: `1px solid ${C.border}`, padding: '9px 12px', fontSize: 13, color: C.text, outline: 'none' }}
                />
                <button onClick={fetchNews} disabled={newsLoading} style={{ padding: '0 14px', background: C.cyan, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, opacity: newsLoading ? 0.6 : 1 }}>
                  <RefreshCw size={14} color={C.bg} style={{ animation: newsLoading ? 'spin 1s linear infinite' : 'none' }} />
                  <span className="mono" style={{ fontSize: 11, color: C.bg, fontWeight: 600 }}>{newsLoading ? 'A procurar...' : 'Procurar'}</span>
                </button>
              </div>
            </Panel>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            {newsError && <Panel pad={16} style={{ marginBottom: 12, borderColor: C.red }}><span style={{ color: C.red, fontSize: 13 }}>{newsError}</span></Panel>}

            {news && news.map((n, i) => (
              <Panel key={i} pad={18} style={{ marginBottom: 10 }}>
                <Eyebrow color={C.cyan}>{`0${i + 1} · ${n.fonte || 'FONTE'}`}</Eyebrow>
                {n.link ? (
                  <a href={n.link} target="_blank" rel="noopener noreferrer" className="disp" style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: C.text, textDecoration: 'none', display: 'block' }}>{n.titulo}</a>
                ) : (
                  <div className="disp" style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{n.titulo}</div>
                )}
                <div className="mono" style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>{n.resumo}</div>
              </Panel>
            ))}

            {!news && !newsLoading && !newsError && (
              <Panel pad={18}><span style={{ color: C.dim, fontSize: 13 }}>Escreve um tópico (ou deixa em branco para notícias gerais) e carrega em Procurar.</span></Panel>
            )}
          </div>
        )}

        {tab === 'saude' && (
          <div style={{ maxWidth: 760, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
              <h1 className="disp" style={{ fontSize: 28, fontWeight: 700 }}>Saúde</h1>
              <span className="mono" style={{ fontSize: 11, color: C.green, letterSpacing: '0.05em' }}>SYNC ATIVO — HEALTH AUTO EXPORT</span>
            </div>
            <Panel pad={14} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5 }}>
                Estes números vêm do teu Google Drive (pasta Health Auto Export). O artefacto não pode ligar-se à Drive
                automaticamente — pede-me "atualiza a saúde" sempre que quiseres números frescos, e eu leio o ficheiro mais recente.
              </div>
            </Panel>

            <Eyebrow color={C.cyan}>Hoje — 24 jun (parcial)</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
              <Panel>
                <Footprints size={18} color={C.cyan} style={{ marginBottom: 10 }} />
                <Eyebrow>Passos</Eyebrow>
                <div className="disp" style={{ fontSize: 24, fontWeight: 700 }}>1.542</div>
              </Panel>
              <Panel>
                <Heart size={18} color={C.cyan} style={{ marginBottom: 10 }} />
                <Eyebrow>Ritmo cardíaco</Eyebrow>
                <div className="disp" style={{ fontSize: 24, fontWeight: 700 }}>84<span style={{ fontSize: 13, color: C.dim }}> bpm</span></div>
                <div style={{ color: C.dim, fontSize: 10.5, marginTop: 2 }}>min 71 · máx 109</div>
              </Panel>
              <Panel>
                <Activity size={18} color={C.cyan} style={{ marginBottom: 10 }} />
                <Eyebrow>Calorias ativas</Eyebrow>
                <div className="disp" style={{ fontSize: 24, fontWeight: 700 }}>171<span style={{ fontSize: 13, color: C.dim }}> kcal</span></div>
              </Panel>
            </div>

            <Eyebrow color={C.cyan}>Ontem — 23 jun</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 10 }}>
              <Panel>
                <Footprints size={18} color={C.faint} style={{ marginBottom: 10 }} />
                <Eyebrow>Passos</Eyebrow>
                <div className="disp" style={{ fontSize: 24, fontWeight: 700 }}>7.184</div>
                <div style={{ color: C.dim, fontSize: 10.5, marginTop: 2 }}>5,24 km</div>
              </Panel>
              <Panel>
                <Heart size={18} color={C.faint} style={{ marginBottom: 10 }} />
                <Eyebrow>Ritmo cardíaco</Eyebrow>
                <div className="disp" style={{ fontSize: 24, fontWeight: 700 }}>96<span style={{ fontSize: 13, color: C.dim }}> bpm</span></div>
                <div style={{ color: C.dim, fontSize: 10.5, marginTop: 2 }}>min 72 · máx 154 · repouso 74</div>
              </Panel>
              <Panel>
                <Activity size={18} color={C.faint} style={{ marginBottom: 10 }} />
                <Eyebrow>Exercício</Eyebrow>
                <div className="disp" style={{ fontSize: 24, fontWeight: 700 }}>9<span style={{ fontSize: 13, color: C.dim }}> min</span></div>
                <div style={{ color: C.dim, fontSize: 10.5, marginTop: 2 }}>SpO2 99% · HRV 32ms</div>
              </Panel>
            </div>
          </div>
        )}

        {tab === 'casa' && (
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h1 className="disp" style={{ fontSize: 32, fontWeight: 700 }}>Casa</h1>
              <span className="mono" style={{ fontSize: 11, color: C.amber, letterSpacing: '0.06em' }}>ALEXA — INTEGRAÇÃO LIMITADA</span>
            </div>
            <Panel style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#C5CBD2', lineHeight: 1.6 }}>
                A Alexa não expõe API aberta para controlo direto. Esta secção fica pronta para
                ligação total quando migrares para <span className="mono" style={{ color: C.cyan }}>Home Assistant</span>.
              </div>
            </Panel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 10, opacity: 0.45 }}>
              <Panel>
                <Lightbulb size={18} color={C.cyan} style={{ marginBottom: 10 }} />
                <Eyebrow>Luzes</Eyebrow>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Sala — 60%</div>
              </Panel>
              <Panel>
                <Lock size={18} color={C.cyan} style={{ marginBottom: 10 }} />
                <Eyebrow>Fechaduras</Eyebrow>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Porta principal — fechada</div>
              </Panel>
              <Panel>
                <Thermometer size={18} color={C.cyan} style={{ marginBottom: 10 }} />
                <Eyebrow>Clima</Eyebrow>
                <div style={{ fontSize: 14, fontWeight: 500 }}>21°C — automático</div>
              </Panel>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
