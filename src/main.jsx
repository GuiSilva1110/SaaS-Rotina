import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BarChart3, CalendarDays, Check, CheckCircle2, ChevronRight,
  Crown, Flame, Home, LayoutDashboard, Lock, Mail, Menu, Plus, Settings,
  Sparkles, Target, Trash2, User, X
} from 'lucide-react';
import './styles.css';

const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const starterHabits = [
  { id: crypto.randomUUID(), title: 'Beber água', category: 'Saúde', goal: '8 copos', days: {} },
  { id: crypto.randomUUID(), title: 'Estudar programação', category: 'Carreira', goal: '1 hora', days: {} },
  { id: crypto.randomUUID(), title: 'Treino', category: 'Corpo', goal: '30 min', days: {} }
];

function App() {
  const [route, setRoute] = useState(() => load('planner:route', 'landing'));
  const [user, setUser] = useState(() => load('planner:user', null));
  const [habits, setHabits] = useState(() => load('planner:habits', starterHabits));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function navigate(next) {
    setRoute(next);
    save('planner:route', next);
    setSidebarOpen(false);
  }

  function login(payload) {
    const fakeUser = {
      name: payload.name || 'Guilherme',
      email: payload.email,
      plan: load('planner:plan', 'free')
    };
    setUser(fakeUser);
    save('planner:user', fakeUser);
    navigate('dashboard');
  }

  function logout() {
    localStorage.removeItem('planner:user');
    setUser(null);
    navigate('landing');
  }

  function updateHabits(next) {
    setHabits(next);
    save('planner:habits', next);
  }

  if (route === 'landing') return <Landing navigate={navigate} user={user} />;
  if (!user && route === 'register') return <Auth mode="register" onSubmit={login} navigate={navigate} />;
  if (!user && route === 'forgot') return <Forgot navigate={navigate} />;
  if (!user) return <Auth mode="login" onSubmit={login} navigate={navigate} />;

  return (
    <Shell
      user={user}
      route={route}
      navigate={navigate}
      logout={logout}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {route === 'dashboard' && <Dashboard user={user} habits={habits} setHabits={updateHabits} />}
      {route === 'habits' && <HabitsPage habits={habits} setHabits={updateHabits} />}
      {route === 'analytics' && <AnalyticsPage habits={habits} />}
      {route === 'billing' && <BillingPage user={user} setUser={setUser} />}
      {route === 'settings' && <SettingsPage user={user} setUser={setUser} />}
    </Shell>
  );
}

function Landing({ navigate, user }) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <div className="nav-brand"><Target size={22}/> Planner Minimalista</div>
        <div>
          {user ? <button className="ghost" onClick={() => navigate('dashboard')}>Abrir painel</button> : <button className="ghost" onClick={() => navigate('login')}>Entrar</button>}
        </div>
      </header>

      <section className="landing-hero">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <span className="eyebrow"><Sparkles size={16}/> SaaS de hábitos minimalista</span>
          <h1>Organize hábitos, acompanhe progresso e venda como assinatura.</h1>
          <p>Uma base própria fora do Base44, com visual premium, dashboard, planos e estrutura preparada para Supabase, Vercel e cobrança recorrente.</p>
          <div className="hero-actions">
            <button className="primary inline" onClick={() => navigate(user ? 'dashboard' : 'register')}>Começar agora <ArrowRight size={18}/></button>
            <button className="secondary" onClick={() => navigate('login')}>Ver demo</button>
          </div>
        </motion.div>
        <motion.div className="preview-card" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="preview-top"><span></span><span></span><span></span></div>
          <div className="preview-kpi"><strong>78%</strong><small>progresso semanal</small></div>
          <div className="preview-list">
            {['Beber água', 'Estudar React', 'Treinar', 'Ler 10 páginas'].map((item, i) => <div key={item}><CheckCircle2 size={18}/><span>{item}</span><b>{i === 1 ? 'Hoje' : 'OK'}</b></div>)}
          </div>
        </motion.div>
      </section>

      <section className="features-row">
        <Feature icon={<Target/>} title="Metas diárias" text="Crie hábitos com categorias, objetivos e marcações por dia." />
        <Feature icon={<BarChart3/>} title="Analytics" text="Veja evolução, taxa de conclusão e consistência." />
        <Feature icon={<Crown/>} title="Planos pagos" text="Estrutura para Free, Pro e Business." />
      </section>
    </main>
  );
}

function Auth({ mode, onSubmit, navigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isRegister = mode === 'register';

  return (
    <main className="auth-page">
      <section className="hero-card">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="brand">
          <div className="logo"><Target size={30}/></div>
          <h1>Planner Minimalista</h1>
          <p>Um rastreador de hábitos simples, elegante e pronto para evoluir para SaaS com login real, pagamentos e dashboard profissional.</p>
        </motion.div>
        <div className="feature-grid">
          <Feature icon={<Check/>} title="Hábitos diários" text="Marque seu progresso sem distrações." />
          <Feature icon={<Flame/>} title="Sequência" text="Acompanhe consistência e evolução." />
          <Feature icon={<Lock/>} title="Privacidade" text="Dados locais nesta versão MVP." />
        </div>
      </section>

      <motion.form initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} className="auth-card" onSubmit={(e) => { e.preventDefault(); onSubmit({ name, email, password }); }}>
        <h2>{isRegister ? 'Criar conta' : 'Entrar'}</h2>
        <p>{isRegister ? 'Comece a organizar seus hábitos hoje.' : 'Acesse seu painel minimalista.'}</p>
        {isRegister && <label><User size={18}/><input required placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} /></label>}
        <label><Mail size={18}/><input required type="email" placeholder="seuemail@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label><Lock size={18}/><input required type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button className="primary">{isRegister ? 'Criar minha conta' : 'Entrar no painel'}</button>
        <div className="auth-links">
          {isRegister ? <button type="button" onClick={() => navigate('login')}>Já tenho conta</button> : <><button type="button" onClick={() => navigate('register')}>Criar conta</button><button type="button" onClick={() => navigate('forgot')}>Esqueci a senha</button></>}
        </div>
      </motion.form>
    </main>
  );
}

function Forgot({ navigate }) {
  return <main className="auth-page single"><form className="auth-card" onSubmit={(e) => e.preventDefault()}>
    <h2>Recuperar senha</h2><p>Informe seu e-mail. Na versão com Supabase, enviaremos o link de recuperação automaticamente.</p>
    <label><Mail size={18}/><input type="email" placeholder="seuemail@exemplo.com" /></label>
    <button className="primary">Enviar instruções</button>
    <div className="auth-links"><button type="button" onClick={() => navigate('login')}>Voltar ao login</button></div>
  </form></main>;
}

function Shell({ user, route, navigate, logout, sidebarOpen, setSidebarOpen, children }) {
  const items = [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['habits', CheckCircle2, 'Hábitos'],
    ['analytics', BarChart3, 'Analytics'],
    ['billing', Crown, 'Planos'],
    ['settings', Settings, 'Configurações']
  ];

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="side-head"><div className="nav-brand"><Target size={22}/> Planner</div><button className="icon-btn mobile-only" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
        <div className="side-menu">
          {items.map(([key, Icon, label]) => <button key={key} className={route === key ? 'active' : ''} onClick={() => navigate(key)}><Icon size={18}/>{label}<ChevronRight size={16}/></button>)}
        </div>
        <div className="side-user"><small>Plano atual</small><strong>{user.plan === 'pro' ? 'Pro' : 'Free'}</strong><button className="ghost" onClick={logout}>Sair</button></div>
      </aside>
      <section className="main-area">
        <nav className="topbar"><button className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button><div><strong>{user.name}</strong><span>{user.email}</span></div></nav>
        {children}
      </section>
    </main>
  );
}

function Dashboard({ user, habits, setHabits }) {
  const stats = useStats(habits);
  return (
    <section>
      <div className="welcome">
        <div><span>Bem-vindo de volta</span><h1>Seu painel</h1><p>Hoje é um ótimo dia para manter a consistência.</p></div>
        <div className="date-pill"><CalendarDays size={18}/>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
      </div>
      <StatsGrid stats={stats} />
      <div className="content-grid">
        <NewHabit habits={habits} setHabits={setHabits} />
        <HabitList habits={habits} setHabits={setHabits} limit={5} />
      </div>
    </section>
  );
}

function HabitsPage({ habits, setHabits }) {
  return <section><PageHeader title="Hábitos" text="Gerencie todos os seus hábitos e marque o que já foi feito hoje." /><div className="content-grid"><NewHabit habits={habits} setHabits={setHabits} /><HabitList habits={habits} setHabits={setHabits} /></div></section>;
}

function AnalyticsPage({ habits }) {
  const stats = useStats(habits);
  return <section><PageHeader title="Analytics" text="Métricas simples para acompanhar sua evolução." /><StatsGrid stats={stats} /><div className="analytics-card"><h3>Resumo semanal</h3><div className="bars">{[40, 70, 55, 90, 65, 78, stats.percent].map((v, i) => <div key={i}><span style={{ height: `${Math.max(v, 8)}%` }}></span><small>{['S','T','Q','Q','S','S','D'][i]}</small></div>)}</div></div></section>;
}

function BillingPage({ user, setUser }) {
  function setPlan(plan) {
    const next = { ...user, plan };
    setUser(next); save('planner:user', next); save('planner:plan', plan);
  }
  return <section><PageHeader title="Planos" text="Modelo pronto para conectar com Mercado Pago ou Stripe." /><div className="pricing-grid"><Plan title="Free" price="R$0" perks={['Até 5 hábitos', 'Dados locais', 'Dashboard básico']} current={user.plan === 'free'} onClick={() => setPlan('free')} /><Plan title="Pro" price="R$9,90/mês" featured perks={['Hábitos ilimitados', 'Analytics avançado', 'Backup em nuvem futuro']} current={user.plan === 'pro'} onClick={() => setPlan('pro')} /></div></section>;
}

function SettingsPage({ user, setUser }) {
  const [name, setName] = useState(user.name);
  function saveProfile(e) {
    e.preventDefault();
    const next = { ...user, name };
    setUser(next); save('planner:user', next);
  }
  return <section><PageHeader title="Configurações" text="Preferências da conta e do produto." /><form className="settings-card" onSubmit={saveProfile}><label>Nome<input value={name} onChange={e => setName(e.target.value)} /></label><label>Email<input value={user.email} disabled /></label><button className="primary inline">Salvar alterações</button></form></section>;
}

function useStats(habits) {
  return useMemo(() => {
    const today = todayKey();
    const yesterday = yesterdayKey();
    const doneToday = habits.filter(h => h.days?.[today]).length;
    const doneYesterday = habits.filter(h => h.days?.[yesterday]).length;
    const percent = habits.length ? Math.round((doneToday / habits.length) * 100) : 0;
    return { total: habits.length, doneToday, percent, streak: doneToday > 0 && doneYesterday > 0 ? 2 : doneToday > 0 ? 1 : 0 };
  }, [habits]);
}

function StatsGrid({ stats }) {
  return <div className="stats"><Stat icon={<Target/>} label="Hábitos" value={stats.total} /><Stat icon={<Check/>} label="Concluídos hoje" value={stats.doneToday} /><Stat icon={<BarChart3/>} label="Progresso" value={`${stats.percent}%`} /></div>;
}

function NewHabit({ habits, setHabits }) {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('Rotina');
  function addHabit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setHabits([{ id: crypto.randomUUID(), title, goal: goal || 'Diário', category, days: {} }, ...habits]);
    setTitle(''); setGoal(''); setCategory('Rotina');
  }
  return <form className="new-habit" onSubmit={addHabit}><h3>Novo hábito</h3><input placeholder="Ex: Ler 10 páginas" value={title} onChange={e => setTitle(e.target.value)} /><input placeholder="Meta: 20 min, 1h, 8 copos..." value={goal} onChange={e => setGoal(e.target.value)} /><input placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} /><button className="primary"><Plus size={18}/>Adicionar</button></form>;
}

function HabitList({ habits, setHabits, limit }) {
  const today = todayKey();
  const visible = limit ? habits.slice(0, limit) : habits;
  function toggle(id) { setHabits(habits.map(h => h.id === id ? { ...h, days: { ...h.days, [today]: !h.days?.[today] } } : h)); }
  function remove(id) { setHabits(habits.filter(h => h.id !== id)); }
  if (!visible.length) return <div className="empty-card">Nenhum hábito criado ainda.</div>;
  return <div className="habits-list"><AnimatePresence>{visible.map(h => <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} key={h.id} className={`habit ${h.days?.[today] ? 'active' : ''}`}><button className="check" onClick={() => toggle(h.id)}>{h.days?.[today] && <Check size={20}/>}</button><div><strong>{h.title}</strong><p>{h.category} • {h.goal}</p></div><button className="delete" onClick={() => remove(h.id)}><Trash2 size={18}/></button></motion.article>)}</AnimatePresence></div>;
}

function Feature({ icon, title, text }) { return <div className="feature"><span>{icon}</span><strong>{title}</strong><p>{text}</p></div>; }
function Stat({ icon, label, value }) { return <div className="stat"><span>{icon}</span><p>{label}</p><strong>{value}</strong></div>; }
function PageHeader({ title, text }) { return <div className="page-header"><h1>{title}</h1><p>{text}</p></div>; }
function Plan({ title, price, perks, featured, current, onClick }) { return <article className={`plan ${featured ? 'featured' : ''}`}><h3>{title}</h3><strong>{price}</strong>{perks.map(p => <p key={p}><Check size={16}/>{p}</p>)}<button className="primary" onClick={onClick}>{current ? 'Plano atual' : 'Selecionar'}</button></article>; }

createRoot(document.getElementById('root')).render(<App />);
