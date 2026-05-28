import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabase';
import LandingPage from "./pages/LandingPage";
import rytmoLogo from "./assets/rytmo-logo.png";
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BarChart3, CalendarDays, Check, CheckCircle2, ChevronRight,
  Crown, Flame, Home, LayoutDashboard, Lock, Mail, Menu, Plus, Settings,
  Sparkles, Target, Trash2, User, X
} from 'lucide-react';
import './styles.css';

const formatKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const todayKey = () => formatKey(new Date());

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatKey(d);
};

const parseKeyToDate = (key) =>{
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}


const getWeekDates = () => {
  const today = new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + 1 + index);

    return {
      key: formatKey(d),
      day: d.getDate(),
      label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase()
    };
  });
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

{
 id:crypto.randomUUID(),

 title:'Beber água',

 category:'Saúde',

 goal:'8 copos',

 days:{},

 history:{},

 links:[],

 files:[]
},

{
 id:crypto.randomUUID(),

 title:'Estudar programação',

 category:'Carreira',

 goal:'1 hora',

 days:{},

 history:{},

 links:[],

 files:[]
},

{
 id:crypto.randomUUID(),

 title:'Treino',

 category:'Corpo',

 goal:'30 min',

 days:{},

 history:{},

 links:[],

 files:[]
}

];

function App() {
  const [route, setRoute] = useState(() => load('planner:route', 'landing'));
  const [user, setUser] = useState(() => load('planner:user', null));
 const [habits,setHabits] =
useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

useEffect(() => {
  if (user) {
    loadHabits();
  }
}, [user]);


  async function loadHabits() {

  const session =
    await supabase.auth.getUser();

  const currentUser =
    session.data.user;

  if (!currentUser) return;

  const { data: habitsData, error: habitsError } =
    await supabase
      .from("habits")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

  if (habitsError) {
    console.log(habitsError);
    return;
  }

  const { data: historyData, error: historyError } =
    await supabase
      .from("habit_history")
      .select("*")
      .eq("user_id", currentUser.id);

  if (historyError) {
    console.log(historyError);
    return;
  }

  const { data: linksData, error: linksError } =
    await supabase
      .from("habit_links")
      .select("*")
      .eq("user_id", currentUser.id);

  if (linksError) {
    console.log(linksError);
    return;
  }

  const { data: filesData, error: filesError } =
    await supabase
      .from("habit_files")
      .select("*")
      .eq("user_id", currentUser.id);

  if (filesError) {
    console.log(filesError);
    return;
  }

  const habitsWithHistory = (habitsData || []).map((habit) => {

    const habitHistory =
      (historyData || []).filter(
        item => item.habit_id === habit.id
      );

    const history = {};

    habitHistory.forEach((item) => {
      history[item.completed_date] = item.completed;
    });

    const links =
      (linksData || []).filter(
        item => item.habit_id === habit.id
      );

    const files =
      (filesData || []).filter(
        item => item.habit_id === habit.id
      );

    return {
      ...habit,
      history,
      links,
      files
    };

  });

  setHabits(habitsWithHistory);

}
  function navigate(next) {
    setRoute(next);
    save('planner:route', next);
    setSidebarOpen(false);
  }

 async function login(payload) {
  let result;

  if (route === "register") {
    result = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password
    });

    if (result.error) {
      alert(result.error.message);
      return;
    }

    result = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });
  } else {
    result = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });
  }

  const { data, error } = result;

  if (error) {
    alert(error.message);
    return;
  }

  const currentUser = {
    id: data.user.id,
    name: payload.name || data.user.email,
    email: data.user.email,
    plan: "free"
  };

  setUser(currentUser);
  save("planner:user", currentUser);
  navigate("dashboard");
}
  async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem('planner:user');
  setUser(null);
  navigate('landing');
}

  function updateHabits(next) {
    setHabits(next);
    save('planner:habits', next);
  }

  if (route === 'landing') return <LandingPage navigate={navigate} user={user} />;
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
        <div className="nav-brand"><Target size={22}/> Rytmo </div>
        <div>
          {user ? <button className="ghost" onClick={() => navigate('dashboard')}>Abrir painel</button> : <button className="ghost" onClick={() => navigate('login')}>Entrar</button>}
        </div>
      </header>

      <section className="landing-hero">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <span className="eyebrow"><Sparkles size={16}/> Mantenha sua rotina em dia </span>
          <h1>Construa sua rotina,
  acompanhe progresso
  e mantenha consistência.</h1>
          <p>Crie rotinas, acompanhe a evolução e visualize seu progresso.</p>
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
          <h1>Rytmo</h1>
          <p>Monte sua rotina e mantenha ela com consistência.</p>
        </motion.div>
        <div className="feature-grid">
          <Feature icon={<Check/>} title="Rotinas diárias" text="Marque seu progresso sem distrações." />
          <Feature icon={<Flame/>} title="Sequência" text="Acompanhe sua consistência e evolução." />
          <Feature icon={<Lock/>} title="Segurança" text="Não se perca em seus compromissos." />
        </div>
      </section>

      <motion.form
  initial={{ opacity: 0, scale: .97 }}
  animate={{ opacity: 1, scale: 1 }}
  className="auth-card"

  onSubmit={async (e) => {

    e.preventDefault();

    await onSubmit({

      name,

      email,

      password

    });

  }}

> 
<h2>{isRegister ? 'Criar conta' : 'Entrar'}</h2>
        <p>{isRegister ? 'Comece a organizar sua rotina hoje.' : 'Acesse seu painel.'}</p>
        {isRegister && <label><User size={18}/><input required placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} /></label>}
        <label><Mail size={18}/><input required type="email" placeholder="seuemail@email.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
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
    <h2>Recuperar senha</h2><p>Informe seu e-mail.</p>
    <label><Mail size={18}/><input type="email" placeholder="seuemail@email.com" /></label>
    <button className="primary">Enviar instruções</button>
    <div className="auth-links"><button type="button" onClick={() => navigate('login')}>Voltar ao login</button></div>
  </form></main>;
}

function Shell({ user, route, navigate, logout, sidebarOpen, setSidebarOpen, children }) {
  const items = [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['habits', CheckCircle2, 'Rotina'],
    ['analytics', BarChart3, 'Progresso'],
    ['billing', Crown, 'Assinatura'],
    ['settings', Settings, 'Configurações']
  ];

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="side-head">

<div className="rytmo-brand">

<img
  src={rytmoLogo}
  alt="Rytmo"
  className="rytmo-logo-img"
/>

<div>

<strong>

RYTMO

</strong>

<small>

Daily OS

</small>

</div>

</div>

<button
 className="icon-btn mobile-only"
 onClick={() => setSidebarOpen(false)}
>

<X size={18}/>

</button>

</div>
        <div className="side-menu">
          {items.map(([key, Icon, label]) => <button key={key} className={route === key ? 'active' : ''} onClick={() => navigate(key)}><Icon size={18}/>{label}<ChevronRight size={16}/></button>)}
        </div>
        <div className="side-user"><small>Plano atual</small><strong>{user.plan === 'pro' ? 'Pro' : 'Free'}</strong><button className="ghost" onClick={logout}>Sair</button></div>
      </aside>
      <section className="main-area">
        <nav className="topbar"><button className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button><div><strong>{user.name}</strong></div></nav>
        {children}
      </section>
    </main>
  );
}

function Dashboard({ user, habits, setHabits }) {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const weekDates = getWeekDates();
const filteredHabits = habits.filter(habit => {

  const habitDate =
    habit.task_date || todayKey();

  return habitDate === selectedDate;

});

  const stats = useStats(filteredHabits);

  return (
    <section>
      <div className="welcome premium-hero">
  <div>
    <span className="hero-kicker">RYTMO • Daily OS</span>

    <h1>
      Bem-vindo, {user?.name?.split(" ")[0]}
    </h1>

    <p>
      Construa consistência, acompanhe sua evolução e transforme rotina em progresso.
    </p>
  </div>

  <div className="dashboard-actions">

  <button
    className="date-pill premium-date date-button"
    onClick={() => setCalendarOpen(!calendarOpen)}
  >
    <CalendarDays size={18}/>

    {parseKeyToDate(selectedDate).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    })}
  </button>

</div>
</div>
{calendarOpen && (

  <div className="calendar-panel">

    <label>

      Escolha uma data

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setCalendarOpen(false);
        }}
      />

    </label>

  </div>

)}

      <div className="week-selector">
        {weekDates.map(day => (
          <button
            key={day.key}
            className={selectedDate === day.key ? "active" : ""}
            onClick={() => setSelectedDate(day.key)}
          >
            <span>{day.label}</span>
            <strong>{day.day}</strong>
          </button>
        ))}
      </div>

      <StatsGrid stats={stats} />
      <HeatmapCard habits={habits} />

      <div className="content-grid">
        <NewHabit
          habits={habits}
          setHabits={setHabits}
          selectedDate={selectedDate}
        />

        <HabitList
          habits={filteredHabits}
          allHabits={habits}
          setHabits={setHabits}
          limit={5}
        />
      </div>
    </section>
  );
}

function HabitsPage({ habits, setHabits }) {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const weekDates = getWeekDates();
  const parseKeyToDate = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};
  const filteredHabits = habits.filter(habit => {
    return !habit.task_date || habit.task_date === selectedDate;
  });

  return (
    <section>
      <PageHeader
        title="Rotina"
        text="Escolha uma data e veja as tarefas daquele dia."
      />

      <div className="dashboard-actions page-actions">

  <button
  className="calendar-toggle"
  onClick={() => setCalendarOpen(!calendarOpen)}
>

  <CalendarDays size={18}/>

 
</button>


</div>

{calendarOpen && (

  <div className="calendar-panel">

    <label>

      Escolha uma data

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setCalendarOpen(false);
        }}
      />

    </label>

  </div>

)}

      <div className="week-selector">
        {weekDates.map(day => (
          <button
            key={day.key}
            className={selectedDate === day.key ? "active" : ""}
            onClick={() => setSelectedDate(day.key)}
          >
            <span>{day.label}</span>
            <strong>{day.day}</strong>
          </button>
        ))}
      </div>

      <h2 className="section-title">
        Rotina de {parseKeyToDate(selectedDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long'
        })}
      </h2>

      <div className="content-grid">
        <NewHabit
          habits={habits}
          setHabits={setHabits}
          selectedDate={selectedDate}
        />

        <HabitList
  habits={filteredHabits}
  allHabits={habits}
  setHabits={setHabits}
/>
      </div>
    </section>
  );
}

function HeatmapCard({ habits }) {
  const days = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = formatKey(d);

    const completed = habits.some(
      habit => habit.history?.[key]
    );

    days.push({
      key,
      completed,
      label: d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit"
      })
    });
  }

  const completedDays = days.filter(day => day.completed).length;

  const consistency = Math.round(
    (completedDays / days.length) * 100
  );

  return (
    <div className="heatmap-card">
      <div className="heatmap-head">
        <div>
          <span>Consistency</span>
          <h3>Seu ritmo dos últimos 28 dias</h3>
        </div>

        <strong>{consistency}%</strong>
      </div>

      <div className="heatmap-grid">
        {days.map(day => (
          <div
            key={day.key}
            className={`heatmap-cell ${day.completed ? "done" : ""}`}
            title={`${day.label} • ${day.completed ? "Concluído" : "Sem rotina"}`}
          />
        ))}
      </div>

      <p>
        Cada ponto representa um dia com pelo menos uma rotina concluída.
      </p>
    </div>
  );
}

function AnalyticsPage({ habits }) {

  const stats = useStats(habits);

  return (

    <section>

      <PageHeader

        title="Analytics"

        text="Métricas simples para acompanhar sua evolução."

      />

      <StatsGrid stats={stats} />
      <HeatmapCard habits={habits} />

      <div className="analytics-card">

        <h3>Resumo semanal</h3>

        <div className="bars">

          {stats.weekly.map((item,i)=>(

            <div key={i}>

              <span
                style={{
                  height:
                  `${Math.max(item.completed*20,8)}%`
                }}
              />

              <small>

                {
                  item.label
                }

              </small>

            </div>

          ))}

        </div>

      </div>

    </section>

  );

}

function BillingPage({ user, setUser }) {
  function setPlan(plan) {
    const next = { ...user, plan };
    setUser(next);
    save("planner:user", next);
    save("planner:plan", plan);
  }

  async function handleUpgrade() {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email
      })
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erro ao iniciar assinatura.");
    }
  }

  return (
    <section>
      <PageHeader
        title="Planos"
        text="Escolha o plano ideal para sua rotina."
      />

      <div className="pricing-grid">
        <Plan
          title="Free"
          price="R$0"
          perks={[
            "Até 5 rotinas",
            "Dashboard básico",
            "Calendário semanal"
          ]}
          current={user.plan === "free"}
          onClick={() => setPlan("free")}
        />

        <Plan
          title="Pro"
          price="R$14,90/mês"
          featured
          perks={[
            "Rotinas ilimitadas",
            "Analytics avançado",
            "Links e arquivos",
            "Backup em nuvem",
            "Calendário completo",
            "Experiência premium"
          ]}
          current={user.plan === "pro"}
          onClick={handleUpgrade}
        />
      </div>
    </section>
  );
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

    const doneToday =
      habits.filter(h => h.history?.[today]).length;

    const week = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const key = formatKey(d);

      const label = d
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", "");

      week.push({ key, label });
    }

    const weekly = week.map(day => ({
      label: day.label,
      completed: habits.filter(
        h => h.history?.[day.key]
      ).length
    }));

    const percent =
      habits.length
        ? Math.round((doneToday / habits.length) * 100)
        : 0;

    const streak =
      habits.reduce((total, habit) => {
        return total + Object.values(habit.history || {}).filter(Boolean).length;
      }, 0);

    return {
      total: habits.length,
      doneToday,
      percent,
      weekly,
      streak
    };
  }, [habits]);
}

function StatsGrid({ stats }) {
  return (
    <div className="stats">
      <Stat icon={<Target/>} label="Rotinas" value={stats.total} />
      <Stat icon={<Check/>} label="Concluídas hoje" value={stats.doneToday} />
      <Stat icon={<BarChart3/>} label="Progresso" value={`${stats.percent}%`} />
      <Stat icon={<Flame/>} label="Consistência" value={stats.streak || 0} />
    </div>
  );
}

function NewHabit({ habits, setHabits, selectedDate }) {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('Rotina');
  async function addHabit(e) {
    e.preventDefault();

  

    if (!title.trim()) return;
    const isFree =
habits.length >= 5;

if (isFree) {
  alert("Você atingiu o limite do plano Free. Faça upgrade e continue com sua rotina.");
  return;
}
    const session = await supabase.auth.getUser();
    const user = session.data.user;

    if (!user) {
      alert("Você precisa estar logado.");
      return;
    }

    const payload = {
      user_id: user.id,
      title,
      goal: goal || "Diário",
      category,
      task_date: selectedDate || todayKey()
    };

    const { data, error } = await supabase
      .from("habits")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    setHabits([data, ...habits]);

    setTitle("");
    setGoal("");
    setCategory("Rotina");
  }

  return (
    <form className="new-habit" onSubmit={addHabit}>
      <h3>Nova rotina</h3>

      <input
        placeholder="Ex: Ler 10 páginas"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={(e) =>{
          if (e.key === "Enter"){
            e.preventDefault();
            e.currentTarget.form.requestSubmit();
          }
        }}
      />

      <input
        placeholder="Meta: 20 min, 1h, 8 copos..."
        value={goal}
        onChange={e => setGoal(e.target.value)}
      />

      <input
        placeholder="Categoria"
        value={category}
        onChange={e => setCategory(e.target.value)}
      />

      <button type="submit" className="primary">
  <Plus size={18} />
  Adicionar
</button>
    </form>
  );
}
function HabitList({ habits, allHabits, setHabits, limit }) {
  const today = todayKey();
  const visible = limit ? habits.slice(0, limit) : habits;
  const [linkingId, setLinkingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

const [linkUrl, setLinkUrl] = useState("");

const [linkLabel, setLinkLabel] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editCategory, setEditCategory] = useState("");

  function startEdit(habit) {
    setEditingId(habit.id);
    setEditTitle(habit.title || "");
    setEditGoal(habit.goal || "Diário");
    setEditCategory(habit.category || "Rotina");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(habit) {
    if (!editTitle.trim()) return;

    const { data, error } = await supabase
      .from("habits")
      .update({
        title: editTitle.trim(),
        goal: editGoal.trim() || "Diário",
        category: editCategory.trim() || "Rotina"
      })
      .eq("id", habit.id)
      .select()
      .single();

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    const base = allHabits || habits;

    setHabits(
      base.map(h => {
        if (h.id !== habit.id) return h;
        return { ...h, ...data };
      })
    );

    cancelEdit();
  }

  async function uploadFile(habitId, file) {
  if (!file) return;

  const session = await supabase.auth.getUser();
  const user = session.data.user;

  if (!user) {
    alert("Você precisa estar logado.");
    return;
  }

  setUploadingId(habitId);

  const filePath = `${user.id}/${habitId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("habit-files")
    .upload(filePath, file);

  if (uploadError) {
    console.log(uploadError);
    alert(uploadError.message);
    setUploadingId(null);
    return;
  }

  const { data: publicData } = supabase.storage
    .from("habit-files")
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("habit_files")
    .insert({
      habit_id: habitId,
      user_id: user.id,
      file_name: file.name,
      file_url: publicData.publicUrl,
      file_type: file.type
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    alert(error.message);
    setUploadingId(null);
    return;
  }

  const base = allHabits || habits;

  setHabits(
    base.map(h => {
      if (h.id !== habitId) return h;

      return {
        ...h,
        files: [...(h.files || []), data]
      };
    })
  );

  setUploadingId(null);
}

  function startLink(habitId) {

  setLinkingId(habitId);

  setLinkUrl("");

  setLinkLabel("");

}

function cancelLink() {

  setLinkingId(null);

}

async function addLink(habitId) {

  const session =
    await supabase.auth.getUser();

  const user =
    session.data.user;

  if(!user){

    alert("Você precisa estar logado.");

    return;

  }

  if(!linkUrl.trim())
  return;

  const { data,error } =

  await supabase

  .from("habit_links")

  .insert({

    habit_id:habitId,

    user_id:user.id,

    url:linkUrl,

    label:linkLabel || "Link"

  })

  .select()

  .single();

  if(error){

    console.log(error);

    alert(error.message);

    return;

  }

  const base =
    allHabits || habits;

  setHabits(

    base.map(h=>{

      if(h.id !== habitId)
      return h;

      return{

        ...h,

        links:[
          ...(h.links || []),
          data
        ]

      };

    })

  );

  cancelLink();

}

  async function toggle(id) {
    const session = await supabase.auth.getUser();
    const user = session.data.user;

    if (!user) {
      alert("Você precisa estar logado.");
      return;
    }

    const base = allHabits || habits;
    const habit = base.find(h => h.id === id);

    if (!habit) return;

    const day = habit.task_date || today;
    const completed = !habit.history?.[day];

    const { error } = await supabase
      .from("habit_history")
      .upsert({
        habit_id: habit.id,
        user_id: user.id,
        completed_date: day,
        completed
      });

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    setHabits(
      base.map(h => {
        if (h.id !== id) return h;

        return {
          ...h,
          history: {
            ...h.history,
            [day]: completed
          }
        };
      })
    );
  }

  async function remove(id) {
    const shouldDelete = window.confirm("Deseja excluir esta rotina?");

    if (!shouldDelete) return;

    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    const base = allHabits || habits;
    setHabits(base.filter(h => h.id !== id));
  }

  
  if (!visible.length) {
    return <div className="empty-card">Nenhuma rotina criada ainda.</div>;
  }

  return (
  <div className="habits-list">
    <AnimatePresence>
      {visible.map(h => {
        const day = h.task_date || today;
        const completed = h.history?.[day];
        const isEditing = editingId === h.id;
        const isLinking = linkingId === h.id;

        return (
          <motion.article
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: .96 }}
            key={h.id}
            className={`habit ${completed ? "active" : ""}`}
          >
            <button
              type="button"
              className="check"
              onClick={() => toggle(h.id)}
              title="Concluir rotina"
            >
              {completed && <Check size={20} />}
            </button>

            <div className="habit-content">
              {isEditing ? (
                <div className="edit-inline">
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Nome da rotina"
                  />

                  <input
                    value={editGoal}
                    onChange={e => setEditGoal(e.target.value)}
                    placeholder="Meta"
                  />

                  <input
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    placeholder="Categoria"
                  />
                </div>
              ) : (
                <>
                  <strong>{h.title}</strong>

                  <p>
                    {h.category || "Rotina"} • {h.goal || "Diário"}
                  </p>
                </>
              )}

              {h.links?.length > 0 && (
                <div className="habit-links">
                  {h.links.map(link => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      🔗 {link.label || "Abrir link"}
                    </a>
                  ))}
                </div>
              )}

              {h.files?.length > 0 && (
                <div className="habit-files">
                  {h.files.map(file => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📄 {file.file_name}
                    </a>
                  ))}
                </div>
              )}

              {uploadingId === h.id && (
                <small className="uploading-text">
                  Enviando arquivo...
                </small>
              )}

              {isLinking && (
                <div className="link-inline">
                  <input
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                  />

                  <input
                    placeholder="Nome do link"
                    value={linkLabel}
                    onChange={e => setLinkLabel(e.target.value)}
                  />

                  <button
                    type="button"
                    className="save-btn"
                    onClick={() => addLink(h.id)}
                  >
                    Salvar
                  </button>

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={cancelLink}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="habit-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="save-btn"
                    onClick={() => saveEdit(h)}
                  >
                    Salvar
                  </button>

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => startLink(h.id)}
                    title="Adicionar link"
                  >
                    🔗
                  </button>

                  <label
                    className="file-btn"
                    title="Anexar arquivo"
                  >
                    📄

                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,image/*"
                      hidden
                      onChange={(e) => uploadFile(h.id, e.target.files[0])}
                    />
                  </label>

                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => startEdit(h)}
                    title="Editar rotina"
                  >
                    ✏️
                    
                  </button>

                  <button
                    type="button"
                    className="delete"
                    onClick={() => remove(h.id)}
                    title="Excluir rotina"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </motion.article>
        );
      })}
    </AnimatePresence>
  </div>
);
}

function Feature({ icon, title, text }) { return <div className="feature"><span>{icon}</span><strong>{title}</strong><p>{text}</p></div>; }
function Stat({ icon, label, value }) { return <div className="stat"><span>{icon}</span><p>{label}</p><strong>{value}</strong></div>; }
function PageHeader({ title, text }) { return <div className="page-header"><h1>{title}</h1><p>{text}</p></div>; }
function Plan({ title, price, perks, featured, current, onClick }) 
{ return <article className={`plan ${featured ? 'featured' : ''}`}>
  <h3>{title}</h3><strong>{price}</strong>
  {perks.map(p => <p key={p}><Check size={16}/>{p}</p>)}
  <button
  className={`primary ${featured ? "pro-button" : ""}`}
  onClick={onClick}
>

  {current ? "Plano atual" : "Assinar Pro"}
    </button>
    </article>; }

createRoot(document.getElementById('root')).render(<App />);
