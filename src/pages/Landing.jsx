import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

const IconScale = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1v14M3 4l2.5 5h-5L3 4zM13 4l2.5 5h-5L13 4z"/><path d="M1 14h14"/>
  </svg>
)
const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 8a5.5 5.5 0 1 1-1.1-3.3"/><path d="M13.5 2.5V5H11"/>
  </svg>
)
const IconTimer = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="9" r="5.5"/><path d="M8 6v3l2 1.5"/><path d="M6 1h4"/>
  </svg>
)
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12l4-4 3 2.5 4.5-6"/><path d="M2 14h12"/>
  </svg>
)
const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16"/><path d="M4 19h12"/><path d="M4 15h12"/><path d="M8 6h4M8 9h4"/>
  </svg>
)

const ESPECIALIDADES = [
  'Cardiología','Clínica Médica','Ginecología','Infectología',
  'Pediatría','Medicina Legal','Endocrinología','Nefrología',
  'Hematología','Medio Interno','Vacunas',
]

export default function Landing() {
  const navigate = useNavigate()
  const tickerRef = useRef(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    const items = tickerRef.current?.querySelectorAll('.esp-ticker-item')
    if (!items?.length) return () => { try { document.head.removeChild(link) } catch(e) {} }

    let idx = 0
    items[0].classList.add('esp-active')
    const interval = setInterval(() => {
      items[idx].classList.remove('esp-active')
      idx = (idx + 1) % items.length
      items[idx].classList.add('esp-active')
    }, 1800)

    return () => {
      clearInterval(interval)
      try { document.head.removeChild(link) } catch (e) {}
    }
  }, [])

  const go = (e) => { e.preventDefault(); navigate('/register?invite=RESIDENCIAS2026') }
  const goLogin = (e) => { e.preventDefault(); navigate('/login') }

  return (
    <div className="lw">

      <div className="ann">
        Preguntas basadas en exámenes reales y bibliografía oficial argentina.
        <a href="#" onClick={go}>Empezar gratis →</a>
      </div>

      <nav className="l-nav">
        <div className="nav-in">
          <a href="#" className="logo">Residencias<span>App</span></a>
          <div className="nav-links">
            <a href="#features">Características</a>
            <a href="#especialidades">Especialidades</a>
            <a href="#como">Cómo funciona</a>
          </div>
          <div className="nav-r">
            <a href="#" onClick={goLogin} className="btn-ghost">Entrar</a>
            <a href="#" onClick={go} className="btn-dark">Empezar gratis ›</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-pattern"></div>
        <div className="hero-fade"></div>
        <div className="hero-inner">
          <div className="hero-badge">
            <div className="hero-dot"></div>
            Preparación para el Examen Único de Residencias — Argentina
          </div>
          <h1 className="display">
            Estudiaste meses.<br />
            <span className="dim">¿Estás listo?</span>
          </h1>
          <p className="hero-sub">
            Practicá con preguntas del nivel real del examen, medí tu avance por especialidad y llegá sabiendo con precisión dónde estás fuerte — y dónde todavía no.
          </p>
          <div className="hero-ctas">
            <a href="#" onClick={go} className="cta-blue">Empezar gratis →</a>
            <a href="#features" className="cta-outline">Ver cómo funciona</a>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stats-in">
          <div className="stat-item">
            <div className="stat-num">100%</div>
            <div className="stat-label">Fuentes oficiales y auditadas</div>
          </div>
          <div className="stat-div"></div>
          <div className="stat-item">
            <div className="stat-num stat-num--sm">Sabés</div>
            <div className="stat-label">exactamente dónde estás parado</div>
          </div>
          <div className="stat-div"></div>
          <div className="stat-item">
            <div className="stat-num stat-num--sm">No olvidás</div>
            <div className="stat-label">lo que ya estudiaste</div>
          </div>
          <div className="stat-div"></div>
          <div className="stat-item">
            <div className="stat-num">80%</div>
            <div className="stat-label">Meta de aciertos configurable</div>
          </div>
        </div>
      </div>

      {/* ESPECIALIDADES */}
      <section className="esp-sec" id="especialidades">
        <div className="esp-in">
          <div className="esp-header">
            <div className="esp-header-left">
              <div className="eyebrow">Contenido cubierto</div>
              <h2>Creciendo con<br />cada especialidad.</h2>
            </div>
            <p>El banco de preguntas se amplía continuamente. Todo basado en fuentes oficiales y auditadas, al nivel del examen real.</p>
          </div>

          {/* Ticker animado */}
          <div className="esp-ticker-wrap">
            <div className="esp-ticker-stage" ref={tickerRef}>
              {ESPECIALIDADES.map((esp) => (
                <div className="esp-ticker-item" key={esp}>
                  <span className="esp-ticker-name">{esp}</span>
                  <span className="esp-ticker-check">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5"/>
                    </svg>
                    Fuente oficial
                  </span>
                </div>
              ))}
            </div>
            <div className="esp-pill-list">
              {ESPECIALIDADES.map((esp) => (
                <div className="esp-pill" key={esp}>{esp}</div>
              ))}
            </div>
          </div>

          <div className="biblio-banner">
            <div className="bb-left">
              <div className="bb-icon-svg"><IconBook /></div>
              <div>
                <div className="bb-title">Fuentes oficiales y auditadas en cada pregunta</div>
                <div className="bb-desc">Cada explicación cita su fuente. No memorizás respuestas — entendés el razonamiento detrás de cada opción.</div>
              </div>
            </div>
            <div className="bb-books">
              {['Guías nacionales','Bibliografía de referencia internacional','Consensos de sociedades médicas','Normativa Ministerio de Salud AR'].map(b => (
                <div className="bb-book" key={b}>{b}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BENTO */}
      <section className="sec" id="features">
        <div className="sec-in">
          <div className="sec-header">
            <div className="eyebrow">Qué hace ResidenciasApp</div>
            <h2>Practicá.<br />Medí. Mejorá.</h2>
            <p className="sec-desc">Cada herramienta tiene un objetivo concreto: que llegues al examen sabiendo exactamente en qué estás parado.</p>
          </div>
          <div className="bento">
            <div className="bento-fade"></div>

            <div className="b-card span2">
              <h3>Práctica por especialidad</h3>
              <p>Elegís la especialidad y el subtema. Casos clínicos del nivel real del examen, con feedback inmediato y fuente en cada explicación.</p>
              <div className="mini-q">
                <div className="mini-q-text">
                  Mujer 45 años, HTA refractaria a 3 fármacos. Hipokalemia espontánea, aldosterona elevada, renina suprimida.<br /><br />
                  <strong>¿Cuál es el diagnóstico más probable?</strong>
                </div>
                <div className="mini-opt mo-bad"><span className="mini-opt-l">A</span><span>Hiperaldosteronismo secundario por tiazidas</span></div>
                <div className="mini-opt mo-ok"><span className="mini-opt-l">B</span><span>Síndrome de Conn — prueba de supresión con carga salina IV</span></div>
                <div className="mini-opt mo-dim"><span className="mini-opt-l">C</span><span>HTA renovascular — eco-doppler renal</span></div>
                <div className="mini-opt mo-dim"><span className="mini-opt-l">D</span><span>Síndrome de Cushing — cortisol urinario</span></div>
              </div>
            </div>

            <div className="b-card dark">
              <h3>Seguimiento real por especialidad</h3>
              <p>Tu porcentaje de aciertos actualizado después de cada sesión. Sin estimaciones — datos concretos.</p>
              <div className="bar-list">
                {[
                  { name: 'Ginecología', pct: 84, color: '#4ade80' },
                  { name: 'Pediatría', pct: 67, color: '#fbbf24' },
                  { name: 'Infectología', pct: 41, color: '#f87171' },
                  { name: 'Cardiología', pct: 58, color: '#fbbf24' },
                ].map(b => (
                  <div key={b.name}>
                    <div className="bar-meta">
                      <span className="bar-name">{b.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.pct}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${b.pct}%`, background: b.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="b-card dark">
              <h3>El hábito hace la diferencia</h3>
              <p>Pocos minutos diarios rinden más que una maratón semanal.</p>
              <div className="streak-big">7</div>
              <div className="streak-lbl">días seguidos</div>
              <div className="streak-dots">
                {['L','M','Mi','J','V','S','D'].map(d => (
                  <div className="s-day on" key={d}>{d}</div>
                ))}
              </div>
            </div>

            <div className="b-card span2">
              <h3>Explicaciones que enseñan, no que confirman</h3>
              <p>No solo la correcta. Cada opción tiene su propia explicación con fuente oficial — entendés por qué cada distractor es incorrecto.</p>
              <div className="explain-box">
                <div className="ex-line">
                  <div className="ex-dot" style={{ background: '#EDFAF3', border: '1.5px solid #16A34A' }}></div>
                  <div className="ex-txt">
                    <strong style={{ color: '#16A34A' }}>B — Correcta</strong>
                    Hipokalemia espontánea sin diuréticos + aldosterona alta + renina suprimida = Hiperaldosteronismo primario (Conn). Confirmación: supresión con carga salina IV.
                  </div>
                </div>
                <div className="ex-line">
                  <div className="ex-dot" style={{ background: '#FEF2F2', border: '1.5px solid #DC2626' }}></div>
                  <div className="ex-txt">
                    <strong style={{ color: '#DC2626' }}>A — Incorrecta</strong>
                    El hiperaldosteronismo secundario cursa con renina ALTA por activación del SRAA. La renina suprimida lo descarta.
                  </div>
                </div>
              </div>
            </div>

            <div className="b-card">
              <h3>Repasá antes de olvidar</h3>
              <p>El sistema detecta qué temas no tocás hace tiempo y te arma una sesión de repaso rápido.</p>
              <div className="repaso-list">
                <div className="r-row">
                  <span className="r-name">Infectología</span>
                  <span style={{ color: '#DC2626', fontWeight: 600, fontSize: 12 }}>21 días sin repasar</span>
                </div>
                <div className="r-row">
                  <span className="r-name">Nefrología</span>
                  <span style={{ color: '#D97706', fontWeight: 600, fontSize: 12 }}>14 días sin repasar</span>
                </div>
                <div className="r-row">
                  <span className="r-name">Ginecología</span>
                  <span style={{ color: '#16A34A', fontWeight: 500, fontSize: 12 }}>Al día</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="dark-sec" id="como">
        <div className="sec-in">
          <div className="sec-header">
            <div className="eyebrow eyebrow-dark">El proceso</div>
            <h2 className="h2-white">Empezás en minutos.<br />Los resultados se ven en días.</h2>
            <p className="sec-desc-dark">Sin configuraciones complejas. Sin curva de aprendizaje.</p>
          </div>
          <div className="steps-grid">
            <div className="step-cell">
              <div className="step-num-label">Paso 01</div>
              <h3>Marcás lo que ya estudiaste</h3>
              <p>Tildás las especialidades que ya viste. ResidenciasApp solo te pregunta sobre lo que sabés. No tiene sentido practicar lo que todavía no estudiaste.</p>
            </div>
            <div className="step-cell">
              <div className="step-num-label">Paso 02</div>
              <h3>Practicás o simulás a tu ritmo</h3>
              <p>Práctica libre por especialidad y subtema, o simulacro cronometrado. Tu seguimiento se actualiza automáticamente después de cada sesión.</p>
            </div>
            <div className="step-cell">
              <div className="step-num-label">Paso 03</div>
              <h3>Reforzás donde más importa</h3>
              <p>Ves qué especialidades están por debajo de tu meta y cuáles no repasás hace tiempo. Datos precisos para decidir dónde dedicar la próxima hora de estudio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULACRO */}
      <section className="sim-sec">
        <div className="sim-grid">
          <div className="sim-text">
            <div className="eyebrow">El simulacro inteligente</div>
            <h2>Configurás una vez.<br />Funciona solo.</h2>
            <p>Seleccionás los temas que ya estudiaste y el sistema arma un examen proporcional. Con o sin timer. Sin preguntas vistas recientemente.</p>
            {[
              { Icon: IconScale,   title: 'Distribución proporcional',  desc: 'Las preguntas se reparten según el peso real de cada especialidad en el examen.' },
              { Icon: IconRefresh, title: 'Sin repeticiones recientes',  desc: 'No ves la misma pregunta hasta que pasen al menos 5 días.' },
              { Icon: IconTimer,   title: 'Timer configurable',          desc: '1.5 minutos por pregunta, el mismo ritmo que el examen real.' },
              { Icon: IconChart,   title: 'Resultado por especialidad',  desc: 'Al terminar sabés exactamente dónde estuviste bien y dónde no.' },
            ].map(({ Icon, title, desc }) => (
              <div className="feat-item" key={title}>
                <div className="fi-icon-svg"><Icon /></div>
                <div className="fi-txt">
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="sim-card">
              <div className="sc-top">
                <div className="sc-title">Simulacro.</div>
                <div className="sc-sub">Configurá tu examen personalizado</div>
              </div>
              <div className="sc-body">
                <div className="chips">
                  {['Cardiología','Infectología','Pediatría','Ginecología'].map(c => (
                    <div className="chip cd" key={c}>{c}</div>
                  ))}
                  <div className="chip co">+ 3 más</div>
                </div>
                <div className="sc-row"><span className="sc-lbl">Preguntas</span><span className="sc-val">20</span></div>
                <div className="sc-row">
                  <span className="sc-lbl">Timer</span>
                  <div className="tgl-wrap"><span className="sc-val">Activado</span><div className="tgl"></div></div>
                </div>
                <div className="sc-row"><span className="sc-lbl">Distribución</span><span className="sc-val">Proporcional</span></div>
                <div className="sc-row" style={{ border: 0 }}>
                  <span className="sc-lbl" style={{ fontSize: 12 }}>7 especialidades · 20 preguntas</span>
                </div>
                <button className="sc-btn" onClick={go}>Iniciar simulacro →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-sec">
        <div className="cta-inner">
          <h2>No reemplaza tu curso.<br /><em>Lo hace más efectivo.</em></h2>
          <div className="cta-r">
            <a href="#" onClick={go} className="cta-btn">Empezar gratis →</a>
          </div>
        </div>
      </section>

      <footer className="l-footer">
        <div className="foot-in">
          <a href="#" className="logo">Residencias<span>App</span></a>
          <span className="foot-copy">© 2025 ResidenciasApp · Hecho para residentes argentinos</span>
        </div>
      </footer>

    </div>
  )
}