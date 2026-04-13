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

      {/* ── TOP BAR ──
          Original: "Preguntas basadas en exámenes reales y bibliografía oficial argentina."
          Problema: genérico, no especifica qué hace esa bibliografía por el usuario.
          Mejora: concreto, orientado a resultado. */}
      <div className="ann">
        Preguntas del nivel real del Examen Único, con fuente oficial en cada respuesta.
        <a href="#" onClick={go}>Registrarse →</a>
      </div>

      <nav className="l-nav">
        <div className="nav-in">
          <a href="#" className="logo">Residencias<span>App</span></a>
          <div className="nav-links">
            <a href="#features">Qué incluye</a>
            <a href="#especialidades">Especialidades</a>
            <a href="#como">Cómo funciona</a>
          </div>
          <div className="nav-r">
            <a href="#" onClick={goLogin} className="btn-ghost">Entrar</a>
            <a href="#" onClick={go} className="btn-dark">Registrarse ›</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ──
          Original H1: "Estudiaste meses. ¿Estás listo?" → Conservar, es el punto fuerte.
          Original sub: muy largo, listaba demasiado. Reescrito más directo y escaneable. */}
      <section className="hero">
        <div className="hero-pattern"></div>
        <div className="hero-fade"></div>
        <div className="hero-inner">
          <div className="hero-badge">
            <div className="hero-dot"></div>
            Examen Único de Residencias Médicas — Argentina
          </div>
          <h1 className="display">
            Estudiaste meses.<br />
            <span className="dim">¿Estás listo?</span>
          </h1>
          <p className="hero-sub">
            Practicá con preguntas del nivel real, detectá en qué especialidades estás por debajo
            y llegá al examen sabiendo exactamente qué reforzar.
          </p>
          <div className="hero-ctas">
            <a href="#" onClick={go} className="cta-blue">Empezar ahora →</a>
            <a href="#features" className="cta-outline">Ver qué incluye</a>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──
          Original: mezcla inconsistente de números y verbos sueltos ("Sabés", "No olvidás").
          Mejora: coherencia visual y semántica; cada ítem comunica un beneficio completo. */}
      <div className="stats-strip">
        <div className="stats-in">
          <div className="stat-item">
            <div className="stat-num">100%</div>
            <div className="stat-label">Fuentes oficiales y auditadas</div>
          </div>
          <div className="stat-div"></div>
          <div className="stat-item">
            <div className="stat-num stat-num--sm">Rendimiento</div>
            <div className="stat-label">real por especialidad</div>
          </div>
          <div className="stat-div"></div>
          <div className="stat-item">
            <div className="stat-num stat-num--sm">Repaso</div>
            <div className="stat-label">automático antes de que se olvide</div>
          </div>
          <div className="stat-div"></div>
          <div className="stat-item">
            <div className="stat-num">80%</div>
            <div className="stat-label">Meta de aciertos configurable</div>
          </div>
        </div>
      </div>

      {/* ── ESPECIALIDADES ──
          Original título: "Creciendo con cada especialidad." → orientado al producto, no al usuario.
          Mejora: más orientado a qué cubre, qué sirve, qué crece. */}
      <section className="esp-sec" id="especialidades">
        <div className="esp-in">
          <div className="esp-header">
            <div className="esp-header-left">
              <div className="eyebrow">Especialidades disponibles</div>
              <h2>El contenido que<br />el examen toma.</h2>
            </div>
            <p>El banco de preguntas crece continuamente. Cada pregunta refleja el nivel y el formato del examen real, con fuente oficial en la explicación.</p>
          </div>

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

          </div>

          {/* ── BIBLIO BANNER ──
              Original: repetía "fuentes oficiales y auditadas" (ya estaba en el título).
              Mejora: foco en el beneficio concreto para el usuario que está estudiando. */}
          <div className="biblio-banner">
            <div className="bb-left">
              <div className="bb-icon-svg"><IconBook /></div>
              <div>
                <div className="bb-title">Cada respuesta cita su fuente</div>
                <div className="bb-desc">No memorizás opciones — entendés por qué cada una es correcta o incorrecta. Eso es lo que pide el examen real.</div>
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

      {/* ── BENTO FEATURES ── */}
      <section className="sec" id="features">
        <div className="sec-in">
          {/* Original eyebrow: "Qué hace ResidenciasApp" → descriptivo de producto.
              Original h2: "Practicá. Medí. Mejorá." → bueno pero abstracto para subtítulo.
              Mejora: eyebrow más funcional, h2 conservado, subtítulo más concreto. */}
          <div className="sec-header">
            <div className="eyebrow">Herramientas</div>
            <h2>Practicá. Medí. Mejorá.</h2>
            <p className="sec-desc">Cuatro funciones diseñadas para darte claridad sobre tu preparación, no solo práctica.</p>
          </div>
          <div className="bento">
            <div className="bento-fade"></div>

            {/* Card Práctica:
                Original: bien orientado a feature. Mejora: agrega el beneficio del feedback. */}
            <div className="b-card span2">
              <h3>Práctica por especialidad y subtema</h3>
              <p>Elegís especialidad y subtema, respondés casos clínicos del nivel real y recibís explicación con fuente en cada opción — correcta e incorrecta.</p>
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

            {/* Card Dashboard:
                Original: "Sin estimaciones — datos concretos." → vago. Qué datos, para qué.
                Mejora: especifica qué información y qué decisión habilita. */}
            <div className="b-card dark">
              <h3>Tu porcentaje real por especialidad</h3>
              <p>Actualizado en cada sesión. Ves de un vistazo qué especialidades superan tu meta y cuáles necesitan trabajo.</p>
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

            {/* Card Racha:
                Original: "El hábito hace la diferencia / Pocos minutos diarios..." → motivacional genérico.
                Mejora: más concreto, orientado a lo que registra el sistema. */}
            <div className="b-card dark">
              <h3>Constancia que se mide</h3>
              <p>El sistema registra tu actividad diaria. Sesiones cortas y regulares consolidan más que un estudio intensivo esporádico.</p>
              <div className="streak-big">7</div>
              <div className="streak-lbl">días seguidos</div>
              <div className="streak-dots">
                {['L','M','Mi','J','V','S','D'].map(d => (
                  <div className="s-day on" key={d}>{d}</div>
                ))}
              </div>
            </div>

            {/* Card Explicaciones: el copy actual es excelente, se conserva. */}
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

            {/* Card Repaso:
                Original: "El sistema detecta..." → pasivo y vago sobre cuándo actúa.
                Mejora: concreto en el criterio (2 semanas) y en la acción. */}
            <div className="b-card">
              <h3>Repasá antes de olvidar</h3>
              <p>Si no tocás una especialidad en más de 2 semanas, el sistema lo detecta y te propone una sesión corta de repaso.</p>
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

      {/* ── CÓMO FUNCIONA ──
          Original: muy bien estructurado. Ajustes menores de concisión y especificidad. */}
      <section className="dark-sec" id="como">
        <div className="sec-in">
          <div className="sec-header">
            <div className="eyebrow eyebrow-dark">Cómo funciona</div>
            <h2 className="h2-white">Empezás en minutos.<br />Los resultados se ven en días.</h2>
            <p className="sec-desc-dark">Sin configuraciones complejas. Sin curva de aprendizaje.</p>
          </div>
          <div className="steps-grid">

            {/* Paso 1: muy bueno en el original. Ajuste mínimo. */}
            <div className="step-cell">
              <div className="step-num-label">Paso 01</div>
              <h3>Marcás lo que ya estudiaste</h3>
              <p>Tildás las especialidades que ya viste. El sistema solo te pregunta sobre lo que estudiaste — no tiene sentido practicar lo que todavía no viste.</p>
            </div>

            {/* Paso 2: "a tu ritmo" era vago. Reemplazado por acción concreta. */}
            <div className="step-cell">
              <div className="step-num-label">Paso 02</div>
              <h3>Practicás por tema o hacés un simulacro</h3>
              <p>Práctica libre por especialidad y subtema, o simulacro con timer y distribución proporcional. El seguimiento se actualiza solo al terminar.</p>
            </div>

            {/* Paso 3: excelente en el original. Ajuste mínimo de fluidez. */}
            <div className="step-cell">
              <div className="step-num-label">Paso 03</div>
              <h3>Sabés exactamente dónde reforzar</h3>
              <p>Ves qué especialidades están debajo de tu meta y cuáles no repasás hace tiempo. Así sabés dónde invertir las próximas horas de estudio.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── SIMULACRO ──
          Original párrafo intro: bien pero repetía ideas del título.
          Mejora: más específico en el mecanismo, sin repetir "proporcional" dos veces. */}
      <section className="sim-sec">
        <div className="sim-grid">
          <div className="sim-text">
            <div className="eyebrow">Modo simulacro</div>
            <h2>Un examen que<br />se adapta a vos.</h2>
            <p>Seleccionás tus temas activos y el sistema arma un examen con el formato real: distribución por peso de especialidad, timer de 1.5 min por pregunta y sin repetir lo que ya respondiste en los últimos 5 días.</p>
            {[
              { Icon: IconScale,   title: 'Distribución según el examen real',  desc: 'Las preguntas se reparten en la misma proporción que en el Examen Único.' },
              { Icon: IconRefresh, title: 'Sin repeticiones recientes',          desc: 'No ves la misma pregunta hasta que pasen al menos 5 días.' },
              { Icon: IconTimer,   title: 'Timer de 1.5 minutos por pregunta',  desc: 'El mismo ritmo que el examen real. Practicás la velocidad, no solo el contenido.' },
              { Icon: IconChart,   title: 'Resultado desglosado por especialidad', desc: 'Al terminar sabés exactamente dónde estuviste bien y dónde no.' },
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

      {/* ── CTA FINAL ──
          Original: excelente. Se conserva intacto — es el mejor copy de la landing. */}
      <section className="cta-sec">
        <div className="cta-inner">
          <h2>No reemplaza tu curso.<br /><em>Lo hace más efectivo.</em></h2>
          <div className="cta-r">
            <a href="#" onClick={go} className="cta-btn">Empezar ahora →</a>
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