import "./LandingPage.css";

import {
  ArrowRight,
  Check,
  Sparkles,
  CalendarDays,
  BarChart3,
  Target,
  ShieldCheck
} from "lucide-react";

export default function LandingPage({ navigate, user}) {
  return (
    <main className="landing-page">

        <nav className="landing-navbar">

  <div className="landing-logo">

    <div className="logo-orb"/>

    <div>
      <strong>RYTMO</strong>
      <small>Daily OS</small>
    </div>

  </div>

  <div className="landing-nav-actions">

    <button
      className="nav-ghost"
      onClick={() => navigate(user ? "dashboard" : "login")}
    >
      Entrar
    </button>

    <button
      className="nav-primary"
      onClick={() => navigate(user ? "dashboard" : "register")}
    >
      Começar grátis
    </button>

  </div>

</nav>

      <section className="hero-section">

        <div className="hero-content">

          <div className="hero-badge">
            <Sparkles size={14}/>
            Daily OS Platform
          </div>

          <h1>
            Organize sua rotina.
            <br/>
            Construa consistência.
            <br/>
            Evolua todos os dias.
          </h1>

          <p>
            O Rytmo ajuda você a transformar disciplina em progresso
            com uma experiência premium de produtividade.
          </p>

          <div className="hero-actions">

            <button
  className="hero-primary"
  onClick={() => navigate(user ? "dashboard" : "register")}
>
              Começar grátis
              <ArrowRight size={18}/>
            </button>

            <button
  className="hero-secondary"
  onClick={() => navigate(user ? "dashboard" : "login")}
>
              Ver demonstração
            </button>

          </div>

        </div>

        <div className="hero-preview">

          <div className="preview-window">

            <div className="preview-top">
              <span/>
              <span/>
              <span/>
            </div>

            <div className="preview-card-large">

              <div className="preview-stat">
                <strong>87%</strong>
                <small>consistência semanal</small>
              </div>

              <div className="preview-list">

                <div>
                  <Check size={16}/>
                  Treinar
                </div>

                <div>
                  <Check size={16}/>
                  Estudar React
                </div>

                <div>
                  <Check size={16}/>
                  Ler 10 páginas
                </div>

                <div>
                  <Check size={16}/>
                  Planejamento semanal
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="features-section">

        <div className="feature-card">
          <CalendarDays/>
          <h3>Calendário Inteligente</h3>
          <p>Organize hábitos e tarefas por data.</p>
        </div>

        <div className="feature-card">
          <BarChart3/>
          <h3>Analytics</h3>
          <p>Acompanhe sua evolução diariamente.</p>
        </div>

        <div className="feature-card">
          <Target/>
          <h3>Consistência</h3>
          <p>Construa hábitos sólidos com progresso visual.</p>
        </div>

        <div className="feature-card">
          <ShieldCheck/>
          <h3>Cloud Sync</h3>
          <p>Seus dados protegidos na nuvem.</p>
        </div>

      </section>

     <section className="how-section">

  <div className="how-header">
    <span>COMO FUNCIONA</span>
    <h2>Do planejamento à consistência em poucos minutos.</h2>
  </div>

  <div className="how-grid">

    <div className="how-card">
      <strong>01</strong>
      <h3>Crie sua rotina</h3>
      <p>Adicione hábitos, metas, links e arquivos importantes.</p>
    </div>

    <div className="how-card">
      <strong>02</strong>
      <h3>Acompanhe por data</h3>
      <p>Use calendário, progresso diário e histórico de conclusão.</p>
    </div>

    <div className="how-card">
      <strong>03</strong>
      <h3>Evolua com dados</h3>
      <p>Veja consistência, heatmap e evolução semanal.</p>
    </div>

  </div>

</section>    

      <section className="pricing-section">

        <div className="pricing-header">
          <span>PRICING</span>
          <h2>Escolha seu plano</h2>
        </div>

        <div className="pricing-grid">

          <div className="pricing-card">

            <h3>Free</h3>

            <strong>R$0</strong>

            <ul>
              <li>Até 5 hábitos</li>
              <li>Dashboard básico</li>
              <li>Calendário semanal</li>
            </ul>

            <button>
              Começar
            </button>

          </div>

          <div className="pricing-card featured">

            <div className="featured-badge">
              MAIS POPULAR
            </div>

            <h3>Pro</h3>

            <strong>R$14,90</strong>

            <ul>
              <li>Hábitos ilimitados</li>
              <li>Analytics avançado</li>
              <li>Arquivos e links</li>
              <li>Cloud Backup</li>
            </ul>

            <button onClick={() => navigate(user ? "billing" : "register")}>
  Assinar Pro
</button>

          </div>

        </div>

      </section>

    </main>
  );
}