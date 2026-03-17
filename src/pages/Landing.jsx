import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const observerRef = useRef(null)

  useEffect(() => {
    // Intersection Observer para fade-in
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.fade-in').forEach((el) => {
      observerRef.current.observe(el)
    })

    // Contador animado
    const counter = document.getElementById('counter')
    if (counter) {
      let count = 0
      const target = 491
      const duration = 1500
      const step = target / (duration / 16)
      const interval = setInterval(() => {
        count = Math.min(count + step, target)
        counter.textContent = Math.floor(count)
        if (count >= target) clearInterval(interval)
      }, 16)
    }

    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg: #fafaf9;
          --white: #ffffff;
          --blue: #1d4ed8;
          --cyan: #0891b2;
          --text: #0c0a09;
          --muted: #78716c;
          --green: #16a34a;
          --red: #dc2626;
          --border: #e7e5e4;
        }

        .landing {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
        }

        /* NAVBAR */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(250, 250, 249, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .nav-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 20px;
          color: var(--text);
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
        }

        .nav-links a {
          font-size: 14px;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-links a:hover { color: var(--text); }

        .nav-cta {
          background: var(--text);
          color: white !important;
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 13px !important;
          font-weight: 500;
          transition: background 0.2s !important;
        }

        .nav-cta:hover { background: #292524 !important; color: white !important; }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 24px 80px;
          position: relative;
          overflow: hidden;
        }

        .hero-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 70% 50%, rgba(29,78,216,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 30% 30%, rgba(8,145,178,0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-grain {
          position: absolute;
          inset: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px;
          pointer-events: none;
        }

        .hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          width: 100%;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(29,78,216,0.08);
          border: 1px solid rgba(29,78,216,0.15);
          color: var(--blue);
          font-size: 12px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 99px;
          margin-bottom: 24px;
        }

        .hero-badge-dot {
          width: 6px;
          height: 6px;
          background: var(--blue);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .hero-headline {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(40px, 5vw, 60px);
          line-height: 1.1;
          color: var(--text);
          margin-bottom: 20px;
        }

        .hero-headline em {
          font-style: italic;
          color: var(--blue);
        }

        .hero-sub {
          font-size: 17px;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 36px;
          max-width: 440px;
        }

        .hero-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: var(--text);
          color: white;
          padding: 13px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .btn-primary:hover {
          background: #292524;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: transparent;
          color: var(--muted);
          padding: 13px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
          border: 1px solid var(--border);
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }

        .btn-secondary:hover {
          border-color: #a8a29e;
          color: var(--text);
        }

        /* MOCKUP */
        .hero-mockup {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .phone-frame {
          width: 260px;
          height: 520px;
          background: white;
          border-radius: 32px;
          box-shadow:
            0 0 0 8px #e7e5e4,
            0 40px 80px rgba(0,0,0,0.12),
            0 8px 16px rgba(0,0,0,0.06);
          overflow: hidden;
          position: relative;
          transform: rotate(2deg);
        }

        .phone-screen {
          padding: 16px 14px;
          height: 100%;
          background: #f5f5f4;
        }

        .phone-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .phone-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 13px;
          color: var(--text);
        }

        .phone-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .phone-avatar span {
          font-size: 9px;
          color: white;
          font-weight: 600;
        }

        .phone-card {
          background: white;
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .phone-card-label {
          font-size: 9px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }

        .phone-score {
          font-size: 32px;
          font-weight: 600;
          color: var(--green);
          line-height: 1;
          margin-bottom: 4px;
        }

        .phone-score-sub {
          font-size: 10px;
          color: var(--muted);
        }

        .phone-bar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .phone-bar-label {
          font-size: 10px;
          color: var(--text);
        }

        .phone-bar-pct {
          font-size: 10px;
          font-weight: 600;
          color: var(--text);
        }

        .phone-bar-track {
          height: 4px;
          background: #f5f5f4;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .phone-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: var(--green);
        }

        .phone-bar-fill.yellow { background: #ca8a04; }
        .phone-bar-fill.red { background: var(--red); }

        .phone-question {
          background: white;
          border-radius: 14px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .phone-q-area {
          font-size: 9px;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .phone-q-text {
          font-size: 10px;
          color: var(--text);
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .phone-option {
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          padding: 6px 8px;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .phone-option.correct {
          border-color: #86efac;
          background: #f0fdf4;
        }

        .phone-option-letter {
          font-size: 9px;
          font-weight: 700;
          color: var(--muted);
          min-width: 12px;
        }

        .phone-option.correct .phone-option-letter { color: var(--green); }

        .phone-option-text {
          font-size: 9px;
          color: var(--muted);
        }

        .phone-option.correct .phone-option-text { color: var(--green); }

        /* SOCIAL PROOF */
        .social-proof {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 20px 24px;
          background: white;
        }

        .social-proof-inner {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .proof-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--muted);
        }

        .proof-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--blue);
          opacity: 0.5;
        }

        .proof-number {
          font-weight: 600;
          color: var(--text);
        }

        /* SECTIONS */
        .section {
          padding: 96px 24px;
        }

        .section-inner {
          max-width: 1000px;
          margin: 0 auto;
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--blue);
          margin-bottom: 16px;
        }

        .section-headline {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.15;
          color: var(--text);
          margin-bottom: 16px;
        }

        .section-sub {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.7;
          max-width: 540px;
          margin-bottom: 56px;
        }

        /* PROBLEMA */
        .problema { background: #f5f4f0; }

        .problema-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 48px;
        }

        .problema-card {
          background: white;
          border-radius: 16px;
          padding: 28px;
          border: 1px solid var(--border);
          transition: all 0.3s;
        }

        .problema-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
        }

        .problema-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(29,78,216,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          font-size: 18px;
        }

        .problema-q {
          font-family: 'Instrument Serif', serif;
          font-size: 20px;
          line-height: 1.3;
          color: var(--text);
          margin-bottom: 10px;
        }

        .problema-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* FEATURES */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid var(--border);
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
          border-color: rgba(29,78,216,0.2);
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 20px;
        }

        .feature-icon.blue { background: rgba(29,78,216,0.08); }
        .feature-icon.green { background: rgba(22,163,74,0.08); }
        .feature-icon.cyan { background: rgba(8,145,178,0.08); }
        .feature-icon.amber { background: rgba(217,119,6,0.08); }

        .feature-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 10px;
        }

        .feature-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.65;
        }

        .progress-demo {
          margin-top: 16px;
          padding: 14px;
          background: #f5f5f4;
          border-radius: 10px;
        }

        .progress-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .progress-label { font-size: 11px; color: var(--muted); }
        .progress-pct { font-size: 11px; font-weight: 600; color: var(--text); }

        .progress-track {
          height: 5px;
          background: #e7e5e4;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 1.5s cubic-bezier(0.4,0,0.2,1);
        }

        .progress-fill.green { background: var(--green); width: 0; }
        .progress-fill.yellow { background: #ca8a04; width: 0; }
        .progress-fill.red { background: var(--red); width: 0; }

        .progress-fill.animated.green { width: 82%; }
        .progress-fill.animated.yellow { width: 65%; }
        .progress-fill.animated.red { width: 48%; }

        /* CÓMO FUNCIONA */
        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          position: relative;
        }

        .steps::before {
          content: '';
          position: absolute;
          top: 28px;
          left: calc(16.67% + 28px);
          right: calc(16.67% + 28px);
          height: 1px;
          background: linear-gradient(90deg, var(--blue), var(--cyan));
          opacity: 0.3;
        }

        .step {
          text-align: center;
        }

        .step-number {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: white;
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: var(--blue);
          position: relative;
          z-index: 1;
          transition: all 0.3s;
        }

        .step:hover .step-number {
          border-color: var(--blue);
          background: rgba(29,78,216,0.05);
        }

        .step-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }

        .step-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* COMPLEMENTO */
        .complemento {
          background: #0c0a09;
          color: white;
          padding: 96px 24px;
        }

        .complemento .section-label { color: rgba(255,255,255,0.4); }

        .complemento .section-headline { color: white; }

        .complemento .section-sub {
          color: rgba(255,255,255,0.55);
          margin-bottom: 40px;
        }

        .btn-primary-white {
          background: white;
          color: var(--text);
          padding: 13px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .btn-primary-white:hover {
          background: #f5f5f4;
          transform: translateY(-1px);
        }

        /* FOOTER */
        .footer {
          padding: 48px 24px;
          border-top: 1px solid var(--border);
          background: white;
        }

        .footer-inner {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: gap;
        }

        .footer-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 18px;
          color: var(--text);
        }

        .footer-tagline {
          font-size: 13px;
          color: var(--muted);
          margin-top: 4px;
        }

        .footer-right {
          font-size: 13px;
          color: var(--muted);
        }

        /* FADE IN */
        .fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-in.delay-1 { transition-delay: 0.1s; }
        .fade-in.delay-2 { transition-delay: 0.2s; }
        .fade-in.delay-3 { transition-delay: 0.3s; }
        .fade-in.delay-4 { transition-delay: 0.4s; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .navbar { padding: 14px 16px; }
          .nav-links { display: none; }
          .hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .hero-mockup { display: none; }
          .hero { padding: 100px 16px 64px; }
          .social-proof-inner { gap: 20px; }
          .problema-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .steps { grid-template-columns: 1fr; gap: 24px; }
          .steps::before { display: none; }
          .footer-inner { flex-direction: column; gap: 16px; text-align: center; }
          .section { padding: 64px 16px; }
        }
      `}</style>

      <div className="landing">

        {/* NAVBAR */}
        <nav className="navbar">
          <a href="#" className="nav-logo">ResidenciasApp</a>
          <ul className="nav-links">
            <li><a href="#features">Características</a></li>
            <li><a href="#como-funciona">Cómo funciona</a></li>
            <li>
              <a href="/login" className="nav-cta">Ingresar</a>
            </li>
          </ul>
        </nav>

        {/* HERO */}
        <section className="hero" id="hero">
          <div className="hero-mesh" />
          <div className="hero-grain" />
          <div className="hero-inner">
            <div>
              <div className="hero-badge">
                <div className="hero-badge-dot" />
                Complemento para el Examen Único
              </div>
              <h1 className="hero-headline">
                Estudiaste el tema.<br />
                <em>Ahora practicalo.</em>
              </h1>
              <p className="hero-sub">
                Dashboard de progreso, práctica por tema y simulacros personalizados. Todo lo que tu curso no tiene.
              </p>
              <div className="hero-ctas">
                <button className="btn-primary" onClick={() => navigate('/login')}>
                  Empezar →
                </button>
                <a href="#como-funciona" className="btn-secondary">
                  Ver cómo funciona ↓
                </a>
              </div>
            </div>

            <div className="hero-mockup">
              <div className="phone-frame">
                <div className="phone-screen">
                  <div className="phone-header">
                    <span className="phone-logo">ResidenciasApp</span>
                    <div className="phone-avatar"><span>M</span></div>
                  </div>

                  <div className="phone-card">
                    <div className="phone-card-label">Aciertos globales</div>
                    <div className="phone-score">78%</div>
                    <div className="phone-score-sub">meta: 80% · 243 respondidas</div>
                  </div>

                  <div className="phone-card">
                    <div className="phone-card-label">Por especialidad</div>
                    <div className="phone-bar-row">
                      <span className="phone-bar-label">Ginecología</span>
                      <span className="phone-bar-pct">82%</span>
                    </div>
                    <div className="phone-bar-track">
                      <div className="phone-bar-fill" style={{width:'82%'}} />
                    </div>
                    <div className="phone-bar-row">
                      <span className="phone-bar-label">Pediatría</span>
                      <span className="phone-bar-pct">71%</span>
                    </div>
                    <div className="phone-bar-track">
                      <div className="phone-bar-fill yellow" style={{width:'71%'}} />
                    </div>
                    <div className="phone-bar-row">
                      <span className="phone-bar-label">Infectología</span>
                      <span className="phone-bar-pct">58%</span>
                    </div>
                    <div className="phone-bar-track">
                      <div className="phone-bar-fill red" style={{width:'58%'}} />
                    </div>
                  </div>

                  <div className="phone-question">
                    <div className="phone-q-area">Ginecología · CCU</div>
                    <div className="phone-q-text">¿A qué edad inicia el rastreo de CCU según la guía argentina?</div>
                    <div className="phone-option"><span className="phone-option-letter">A</span><span className="phone-option-text">21 años</span></div>
                    <div className="phone-option correct"><span className="phone-option-letter">B</span><span className="phone-option-text">25 años</span></div>
                    <div className="phone-option"><span className="phone-option-letter">C</span><span className="phone-option-text">30 años</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <div className="social-proof">
          <div className="social-proof-inner">
            <div className="proof-item">
              <div className="proof-dot" />
              <span><span className="proof-number" id="counter">491</span> preguntas</span>
            </div>
            <div className="proof-item">
              <div className="proof-dot" />
              <span><span className="proof-number">8</span> especialidades</span>
            </div>
            <div className="proof-item">
              <div className="proof-dot" />
              <span>Bibliografía oficial</span>
            </div>
            <div className="proof-item">
              <div className="proof-dot" />
              <span>Simulacros personalizados</span>
            </div>
          </div>
        </div>

        {/* PROBLEMA */}
        <section className="section problema" id="problema">
          <div className="section-inner">
            <div className="fade-in">
              <div className="section-label">El problema</div>
              <h2 className="section-headline">Tu curso te enseña.<br />Pero no sabe si vas bien.</h2>
            </div>
            <div className="problema-grid">
              <div className="problema-card fade-in delay-1">
                <div className="problema-icon">📊</div>
                <div className="problema-q">¿Cuánto sabés de Infectología realmente?</div>
                <div className="problema-desc">Sin dashboard de progreso, es imposible saber en qué temas estás bien y en cuáles necesitás reforzar.</div>
              </div>
              <div className="problema-card fade-in delay-2">
                <div className="problema-icon">📅</div>
                <div className="problema-q">¿Cuándo fue la última vez que practicaste Medicina Legal?</div>
                <div className="problema-desc">Sin sistema de reintroducción, los temas que estudiaste hace semanas se olvidan antes del examen.</div>
              </div>
              <div className="problema-card fade-in delay-3">
                <div className="problema-icon">🎯</div>
                <div className="problema-q">¿Tus simulacros incluyen solo lo que estudiaste?</div>
                <div className="problema-desc">Practicar temas que no estudiaste todavía solo genera frustración, no aprendizaje real.</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section" id="features">
          <div className="section-inner">
            <div className="fade-in">
              <div className="section-label">Características</div>
              <h2 className="section-headline">Practicá como si fuera el examen real</h2>
              <p className="section-sub">Cada feature está diseñado para complementar tu método de estudio, no reemplazarlo.</p>
            </div>
            <div className="features-grid">
              <div className="feature-card fade-in delay-1">
                <div className="feature-icon blue">📚</div>
                <div className="feature-title">Práctica por tema</div>
                <div className="feature-desc">Elegís el tema que estudiaste hoy y practicás solo eso. Área → Subtema → Preguntas. Con explicación completa de cada opción.</div>
              </div>
              <div className="feature-card fade-in delay-2">
                <div className="feature-icon green">📈</div>
                <div className="feature-title">Dashboard de progreso</div>
                <div className="feature-desc">Sabés exactamente en qué temas estás en 80% y en cuáles necesitás reforzar.</div>
                <div className="progress-demo">
                  <div className="progress-row">
                    <span className="progress-label">Ginecología</span>
                    <span className="progress-pct">82%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill green fade-in" />
                  </div>
                  <div className="progress-row">
                    <span className="progress-label">Pediatría</span>
                    <span className="progress-pct">65%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill yellow fade-in" />
                  </div>
                </div>
              </div>
              <div className="feature-card fade-in delay-3">
                <div className="feature-icon cyan">⚡</div>
                <div className="feature-title">Simulacros inteligentes</div>
                <div className="feature-desc">Solo con los temas que ya estudiaste. Distribuidos proporcionalmente. Con timer opcional. Feedback completo al finalizar.</div>
              </div>
              <div className="feature-card fade-in delay-4">
                <div className="feature-icon amber">💡</div>
                <div className="feature-title">Explicaciones completas</div>
                <div className="feature-desc">No solo la respuesta correcta. Cada opción explicada con bibliografía oficial. Entendés por qué las otras son incorrectas.</div>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="section" id="como-funciona" style={{background:'white'}}>
          <div className="section-inner">
            <div className="fade-in">
              <div className="section-label">Cómo funciona</div>
              <h2 className="section-headline">De cero a practicar en 3 pasos</h2>
              <p className="section-sub">Sin configuraciones complicadas. En dos minutos ya estás practicando.</p>
            </div>
            <div className="steps">
              <div className="step fade-in delay-1">
                <div className="step-number">1</div>
                <div className="step-title">Activás tus temas</div>
                <div className="step-desc">Tildás las especialidades que ya estudiaste. La app trabaja solo con esos temas.</div>
              </div>
              <div className="step fade-in delay-2">
                <div className="step-number">2</div>
                <div className="step-title">Practicás o simulás</div>
                <div className="step-desc">Práctica libre por tema o simulacro cronometrado. Vos elegís el modo según el momento.</div>
              </div>
              <div className="step fade-in delay-3">
                <div className="step-number">3</div>
                <div className="step-title">El dashboard te guía</div>
                <div className="step-desc">Ves exactamente dónde estás bien y dónde reforzar. El sistema prioriza las preguntas que más necesitás ver.</div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPLEMENTO */}
        <section className="complemento">
          <div className="section-inner fade-in">
            <div className="section-label">Para médicos argentinos</div>
            <h2 className="section-headline" style={{maxWidth:'520px'}}>No reemplaza tu curso.<br /><em style={{fontStyle:'italic', color:'rgba(255,255,255,0.6)'}}>Lo potencia.</em></h2>
            <p className="section-sub">ResidenciasApp funciona junto a cualquier curso o método de estudio. Vos estudiás el contenido, nosotros medimos tu progreso.</p>
            <button className="btn-primary-white" onClick={() => navigate('/login')}>
              Empezar →
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-inner">
            <div>
              <div className="footer-logo">ResidenciasApp</div>
              <div className="footer-tagline">Hecho para médicos argentinos 🇦🇷</div>
            </div>
            <div className="footer-right">
              <a href="/login" style={{color:'#78716c', textDecoration:'none'}}>Ingresar</a>
              {' · '}
              <span>© 2025</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
