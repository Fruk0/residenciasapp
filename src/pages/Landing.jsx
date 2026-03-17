import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    const nav = document.getElementById('nav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 20)
    window.addEventListener('scroll', onScroll)

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        e.target.classList.add('on')
        e.target.querySelectorAll('.prog-fill[data-w]').forEach(f => {
          setTimeout(() => f.style.width = f.dataset.w + '%', 350)
        })
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' })
    document.querySelectorAll('.fu').forEach(el => io.observe(el))

    const wrap = document.getElementById('rotator')
    let rotatorInterval = null
    if (wrap) {
      const words = wrap.querySelectorAll('.rotator-word')
      let cur = 0
      const rotate = () => {
        const prev = words[cur]
        cur = (cur + 1) % words.length
        const next = words[cur]
        prev.classList.remove('is-active')
        prev.classList.add('is-exit')
        next.classList.add('is-enter')
        requestAnimationFrame(() => requestAnimationFrame(() => {
          next.classList.add('is-active')
        }))
        setTimeout(() => {
          prev.classList.remove('is-exit')
          next.classList.remove('is-enter')
        }, 480)
      }
      rotatorInterval = setTimeout(() => setInterval(rotate, 2400), 2000)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
      if (rotatorInterval) clearTimeout(rotatorInterval)
      try { document.head.removeChild(link) } catch(e) {}
    }
  }, [])

  const handleEmpezar = (e) => {
    e.preventDefault()
    navigate('/login')
  }

  return (
    <div className="lw">
<nav id="nav">
  <a href="#" className="logo">
    <div className="logo-mark">
      <svg viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5"/><path d="M4 6.5h5M6.5 4v5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </div>
    <span className="logo-name">ResidenciasApp</span>
  </a>
  <div className="nav-r">
    <a href="#features" className="nav-link">Características</a>
    <a href="#como-funciona" className="nav-link">Cómo funciona</a>
    <a onClick={handleEmpezar} href="#" className="nav-btn">Empezar gratis</a>
  </div>
</nav>

<section className="hero">
  <div className="hero-circles">
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1050" cy="120" r="80"  fill="none" stroke="#1B3FA0" strokeWidth="1" strokeOpacity=".12"/>
      <circle cx="1050" cy="120" r="150" fill="none" stroke="#1B3FA0" strokeWidth=".7" strokeOpacity=".09"/>
      <circle cx="1050" cy="120" r="240" fill="none" stroke="#1B3FA0" strokeWidth=".5" strokeOpacity=".06"/>
      <circle cx="1050" cy="120" r="350" fill="none" stroke="#0D7EA6" strokeWidth=".4" strokeOpacity=".045"/>
      <circle cx="150"  cy="620" r="70"  fill="none" stroke="#0D7EA6" strokeWidth="1" strokeOpacity=".12"/>
      <circle cx="150"  cy="620" r="140" fill="none" stroke="#0D7EA6" strokeWidth=".7" strokeOpacity=".09"/>
      <circle cx="150"  cy="620" r="230" fill="none" stroke="#1B3FA0" strokeWidth=".5" strokeOpacity=".06"/>
      <circle cx="150"  cy="620" r="340" fill="none" stroke="#1B3FA0" strokeWidth=".4" strokeOpacity=".04"/>
    </svg>
  </div>

  <div className="hero-inner">
    <div>
      <div className="badge fu">
        <div className="badge-pulse"></div>
        Complemento para el Examen Único de Residencias
      </div>

      <h1 className="hero-h1 fu">
        <span className="line">Estudiaste <span className="rotator" id="rotator"><span className="rotator-spacer">Infectología</span><span className="rotator-word is-active">Ginecología</span><span className="rotator-word">Infectología</span><span className="rotator-word">Pediatría</span><span className="rotator-word">Cardiología</span><span className="rotator-word">Legal</span><span className="rotator-word">Obstetricia</span></span></span>
        <span className="line">Ahora <span className="h1-accent">demostrálo</span></span>
      </h1>

      <p className="hero-sub fu">
        Practicá, medí tu avance y llegá al examen <strong>listo.</strong>
      </p>

      <div className="hero-ctas fu">
        <a onClick={handleEmpezar} href="#" className="btn-p">
          Empezar gratis
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <a href="#features" className="btn-s">Ver cómo funciona</a>
      </div>

      <div className="hero-pills fu">
        <div className="pill"><div className="pill-dot" style={{background:'var(--green)'}}></div>Bibliografía oficial argentina</div>
        <div className="pill"><div className="pill-dot" style={{background:'var(--blue)'}}></div>Dashboard de seguimiento</div>
        <div className="pill"><div className="pill-dot" style={{background:'var(--amber)'}}></div>Simulacros personalizados</div>
        <div className="pill"><div className="pill-dot" style={{background:'var(--gold)'}}></div>Gratis para empezar</div>
      </div>
    </div>

    <div className="hero-visual">
      <div className="mockup-float">
        <div className="phone">
          <div className="phone-top">
            <div className="phone-top-l">
              <div className="phone-top-dot"></div>
              <span>ResidenciasApp</span>
            </div>
            <div className="phone-pill">Ginecología</div>
          </div>
          <div className="phone-body">
            <div className="phone-meta">
              <div className="phone-tag">PRÁCTICA POR TEMA</div>
              <div className="phone-prog">
                <div className="phone-prog-bar"><div className="phone-prog-fill"></div></div>
                <span className="phone-prog-n">3/12</span>
              </div>
            </div>
            <div className="phone-q">Paciente de 28 años, inicio de relaciones sexuales a los 16, sin PAP previo. Consulta por control ginecológico. ¿Cuál es la conducta correcta?</div>
            <div className="phone-opt no"><span className="phone-opt-l">A</span>No realizar PAP — comienza a los 21 años</div>
            <div className="phone-opt ok"><span className="phone-opt-l">B</span>Realizar PAP — inicia a los 25 años en Argentina</div>
            <div className="phone-opt"><span className="phone-opt-l">C</span>Realizar PAP + colposcopía directa</div>
            <div className="phone-opt"><span className="phone-opt-l">D</span>Test de HPV — más sensible en menores de 30</div>
            <div className="phone-exp">
              <div className="phone-exp-lbl">Por qué B es correcta</div>
              <div className="phone-exp-txt">Guía CCU MSalud Argentina 2023: rastreo con PAP inicia a los 25 años, independientemente del inicio de relaciones sexuales.</div>
            </div>
          </div>
        </div>
        <div className="chip chip1">
          <div className="chip-dot g"></div>
          <div><div className="chip-name">Ginecología · 84%</div><div className="chip-sub">↑ 12% esta semana</div></div>
        </div>
        <div className="chip chip2">
          <div className="chip-dot b"></div>
          <div><div className="chip-name">Simulacro listo</div><div className="chip-sub">20 preguntas · 5 temas</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<div className="strip">
  <div className="strip-in">
    <div className="strip-item"><strong>Bibliografía</strong>&nbsp;oficial argentina</div>
    <div className="strip-div"></div>
    <div className="strip-item"><strong>Dashboard</strong>&nbsp;de seguimiento real</div>
    <div className="strip-div"></div>
    <div className="strip-item"><strong>Simulacros</strong>&nbsp;personalizados por avance</div>
    <div className="strip-div"></div>
    <div className="strip-item"><strong>Explicaciones</strong>&nbsp;completas por opción</div>
  </div>
</div>

<section className="s-problema" id="problema">
  <div className="si">
    <div className="s-eyebrow fu">El problema</div>
    <h2 className="s-title fu">Estudiás horas.<br/>Pero no sabés si vas bien.</h2>
    <p className="s-sub fu">Los cursos te dan contenido. Ninguno te dice en qué temas estás fuerte, en cuáles necesitás reforzar, ni si lo que aprendiste hace semanas todavía está.</p>
    <div className="prob-grid">
      <div className="prob-card fu">
        <div className="prob-ico" style={{background:'#fef2f2'}}>
          <svg viewBox="0 0 15 15" fill="none" stroke="#C42B2B" strokeWidth="1.5" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="5.5"/><path d="M7.5 4.5v3M7.5 10v.5"/></svg>
        </div>
        <h3>¿Cuánto retenés de lo que estudiaste?</h3>
        <p>Pasaste Infectología hace un mes. Sin práctica activa, el conocimiento se erosiona antes del examen sin que te des cuenta.</p>
      </div>
      <div className="prob-card fu">
        <div className="prob-ico" style={{background:'#fffbeb'}}>
          <svg viewBox="0 0 15 15" fill="none" stroke="#A8590A" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2.5" width="11" height="10" rx="1.5"/><path d="M5 2.5V1.5M10 2.5V1.5M2 6.5h11"/></svg>
        </div>
        <h3>¿Cuándo practicaste Medicina Legal por última vez?</h3>
        <p>Sin repaso activo, los temas que estudiaste hace meses tienen baches que no ves venir hasta el examen real.</p>
      </div>
      <div className="prob-card fu">
        <div className="prob-ico" style={{background:'#f0fdf4'}}>
          <svg viewBox="0 0 15 15" fill="none" stroke="#0C7A3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 11L5 8l3 2 4.5-6"/></svg>
        </div>
        <h3>¿Tus simulacros respetan lo que ya estudiaste?</h3>
        <p>No tiene sentido practicar con temas que todavía no viste. Un simulacro útil se adapta a tu avance real.</p>
      </div>
    </div>
  </div>
</section>

<section id="features">
  <div className="si">
    <div className="s-eyebrow fu">La solución</div>
    <h2 className="s-title fu">Todo lo que necesitás<br/>para llegar preparado</h2>
    <p className="s-sub fu">Cuatro herramientas diseñadas para medir tu progreso con precisión y prepararte con el mismo nivel del examen real.</p>
    <div className="feat-grid">

      <div className="feat-card fu">
        <div className="feat-ico" style={{background:'#eef2ff'}}>
          <svg viewBox="0 0 16 16" fill="none" stroke="#1B3FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12V6l5-4 5 4v6"/><path d="M6 12V9h4v3"/></svg>
        </div>
        <h3>Práctica por especialidad</h3>
        <p>Estudiaste Ginecología hoy. Entrás, elegís la especialidad y el subtema, y practicás exactamente eso — con casos clínicos del mismo nivel que el examen real.</p>
      </div>

      <div className="feat-card fu">
        <div className="feat-ico" style={{background:'#f0fdf4'}}>
          <svg viewBox="0 0 16 16" fill="none" stroke="#0C7A3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l2.5-2.5 3 2 4-5.5"/><circle cx="13" cy="3.5" r="1.5"/></svg>
        </div>
        <h3>Dashboard de progreso real</h3>
        <p>Tu porcentaje de aciertos por especialidad, en tiempo real. Sabés exactamente dónde estás bien y dónde necesitás reforzar.</p>
        <div className="prog">
          <div className="prog-row">
            <div className="prog-meta"><span className="prog-lbl">Ginecología</span><span className="prog-val" style={{color:'var(--green)'}}>84%</span></div>
            <div className="prog-track"><div className="prog-fill pf-g" data-w="84"></div></div>
          </div>
          <div className="prog-row">
            <div className="prog-meta"><span className="prog-lbl">Pediatría</span><span className="prog-val" style={{color:'var(--amber)'}}>67%</span></div>
            <div className="prog-track"><div className="prog-fill pf-a" data-w="67"></div></div>
          </div>
          <div className="prog-row">
            <div className="prog-meta"><span className="prog-lbl">Infectología</span><span className="prog-val" style={{color:'var(--red)'}}>41%</span></div>
            <div className="prog-track"><div className="prog-fill pf-r" data-w="41"></div></div>
          </div>
        </div>
      </div>

      <div className="feat-card fu">
        <div className="feat-ico" style={{background:'#fff7ed'}}>
          <svg viewBox="0 0 16 16" fill="none" stroke="#A8590A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>
        </div>
        <h3>Simulacros que se adaptan a vos</h3>
        <p>Elegís los temas que ya estudiaste, la cantidad de preguntas y si querés timer. El sistema distribuye proporcionalmente y no repite preguntas recientes.</p>
      </div>

      <div className="feat-card fu">
        <div className="feat-ico" style={{background:'#fdf4ff'}}>
          <svg viewBox="0 0 16 16" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h9M3 5h5M3 11h7"/><circle cx="13" cy="5" r="1.5"/></svg>
        </div>
        <h3>Explicaciones que enseñan</h3>
        <p>No solo la respuesta correcta. Cada opción explicada con bibliografía oficial argentina — entendés por qué cada distractor es incorrecto.</p>
      </div>

    </div>
  </div>
</section>

<section className="s-steps" id="como-funciona">
  <div className="si">
    <div className="s-eyebrow fu">El proceso</div>
    <h2 className="s-title fu">De cero a practicar<br/>en tres pasos</h2>
    <p className="s-sub fu">Sin configuraciones complejas. Empezás a practicar en minutos.</p>
    <div className="steps-grid">
      <div className="step fu">
        <div className="step-num">1</div>
        <h3>Activás los temas que ya estudiaste</h3>
        <p>Tildás las especialidades que ya viste. ResidenciasApp solo te pregunta sobre lo que sabés.</p>
      </div>
      <div className="step fu">
        <div className="step-num">2</div>
        <h3>Practicás y el sistema aprende</h3>
        <p>Práctica libre por tema o simulacro cronometrado. Tu dashboard se actualiza en tiempo real.</p>
      </div>
      <div className="step fu">
        <div className="step-num">3</div>
        <h3>Reforzás donde más importa</h3>
        <p>Tu dashboard te muestra exactamente qué especialidades necesitan trabajo. Datos reales, no intuición.</p>
      </div>
    </div>
  </div>
</section>

<section className="s-cta">
  <div className="cta-in">
    <div className="cta-eyebrow">Empezá hoy</div>
    <h2 className="cta-title">No reemplaza tu curso.<br/><em>Lo hace más efectivo.</em></h2>
    <p className="cta-sub">ResidenciasApp funciona con cualquier curso o método de estudio. Vos ponés el contenido — nosotros medimos si quedó.</p>
    <a onClick={handleEmpezar} href="#" className="btn-w">
      Empezar gratis
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="#1B3FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </a>
  </div>
</section>

<footer>
  <div className="footer-in">
    <a href="#" className="foot-logo">
      <div className="foot-logo-mark">
        <svg viewBox="0 0 10 10" fill="none"><rect x=".75" y=".75" width="8.5" height="8.5" rx="1.5" stroke="white" strokeWidth="1.25"/><path d="M3 5h4M5 3v4" stroke="white" strokeWidth="1.25" strokeLinecap="round"/></svg>
      </div>
      <span className="foot-logo-name">ResidenciasApp</span>
    </a>
    <ul className="foot-links">
      <li><a href="#features">Características</a></li>
      <li><a href="#como-funciona">Cómo funciona</a></li>
      <li><a onClick={handleEmpezar} href="#">Entrar a la app</a></li>
    </ul>
    <div className="foot-copy">Hecho para médicos argentinos 🇦🇷</div>
  </div>
</footer>
    </div>
  )
}
