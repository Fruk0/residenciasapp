import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    // Google Fonts
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Nav scroll
    const nav = document.getElementById('nav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 20)
    window.addEventListener('scroll', onScroll)

    // Fade up
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

    // Word rotator
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
      document.head.removeChild(link)
    }
  }, [])

  const handleEmpezar = (e) => {
    e.preventDefault()
    navigate('/login')
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#f8f7f4;--surface:#ffffff;--blue:#1B3FA0;
          --blue-soft:rgba(27,63,160,0.07);--blue-border:rgba(27,63,160,0.14);
          --cyan:#0D7EA6;--text:#0E0D0B;--muted:#6E6760;--hint:#A09890;
          --green:#0C7A3A;--red:#C42B2B;--amber:#A8590A;--gold:#C49A1A;
          --border:#E6E2DC;--border-light:#F0EDE8;
          --display:'Plus Jakarta Sans',system-ui,sans-serif;
          --body:'Plus Jakarta Sans',system-ui,sans-serif;
        }
        html{scroll-behavior:smooth}
        body{font-family:var(--body);background:var(--bg);color:var(--text);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
        nav{position:fixed;top:0;left:0;right:0;z-index:100;height:58px;padding:0 clamp(1.25rem,4vw,2.5rem);display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);background:rgba(248,247,244,0.88);border-bottom:1px solid rgba(0,0,0,0.055);transition:box-shadow .3s}
        nav.scrolled{box-shadow:0 1px 20px rgba(0,0,0,0.07)}
        .logo{display:flex;align-items:center;gap:9px;text-decoration:none}
        .logo-mark{width:30px;height:30px;background:var(--blue);border-radius:8px;display:flex;align-items:center;justify-content:center}
        .logo-mark svg{width:13px;height:13px}
        .logo-name{font-size:14px;font-weight:500;color:var(--text);letter-spacing:-.01em}
        .nav-r{display:flex;align-items:center;gap:1.75rem}
        .nav-link{font-size:13px;color:var(--muted);text-decoration:none;font-weight:400;transition:color .2s}
        .nav-link:hover{color:var(--text)}
        .nav-btn{background:var(--blue);color:#fff;padding:7px 16px;border-radius:7px;font-size:13px;font-weight:500;text-decoration:none;font-family:var(--body);transition:background .2s,transform .15s;cursor:pointer;border:none}
        .nav-btn:hover{background:#2650CC;transform:translateY(-1px)}
        .hero{min-height:100vh;padding:clamp(90px,12vw,120px) clamp(1.25rem,4vw,2.5rem) clamp(60px,8vw,80px);display:flex;align-items:center;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 55% 55% at 82% 20%, rgba(27,63,160,.06) 0%, transparent 65%),radial-gradient(ellipse 45% 45% at 10% 85%, rgba(13,126,166,.05) 0%, transparent 60%),radial-gradient(ellipse 30% 30% at 60% 90%, rgba(27,63,160,.03) 0%, transparent 60%)}
        .hero-circles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
        .hero-circles svg{position:absolute;width:100%;height:100%}
        .hero-inner{max-width:1140px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,5rem);align-items:center}
        .badge{display:inline-flex;align-items:center;gap:7px;background:var(--blue-soft);border:1px solid var(--blue-border);color:var(--blue);font-size:11px;font-weight:500;padding:5px 12px;border-radius:100px;margin-bottom:clamp(1.25rem,3vw,1.75rem);letter-spacing:.03em}
        .badge-pulse{width:5px;height:5px;background:var(--blue);border-radius:50%;animation:pulse 2.2s ease infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
        .hero-h1{font-family:var(--display);font-size:clamp(1.9rem,3.5vw,3rem);font-weight:500;letter-spacing:-.025em;line-height:1.15;margin-bottom:clamp(1rem,2.5vw,1.4rem);color:var(--text)}
        .hero-h1 .line{display:block}
        .rotator{position:relative;display:inline-block;vertical-align:baseline}
        .rotator-spacer{visibility:hidden;white-space:nowrap}
        .rotator-word{position:absolute;top:0;left:0;color:var(--blue);font-style:italic;font-weight:400;white-space:nowrap;opacity:0;transform:translateY(110%);transition:none}
        .rotator-word.is-active{opacity:1;transform:translateY(0)}
        .rotator-word.is-exit{opacity:0;transform:translateY(-110%);transition:opacity .32s ease,transform .32s ease}
        .rotator-word.is-enter{opacity:0;transform:translateY(65%);transition:opacity .32s ease .06s,transform .32s ease .06s}
        .rotator-word.is-enter.is-active{opacity:1;transform:translateY(0)}
        .h1-accent{color:var(--gold);font-weight:600}
        .hero-sub{font-size:clamp(15px,1.6vw,17px);color:var(--muted);line-height:1.7;margin-bottom:clamp(1.5rem,3vw,2.2rem);max-width:420px;font-weight:300}
        .hero-sub strong{color:var(--text);font-weight:500}
        .hero-ctas{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:clamp(1.5rem,3vw,2rem)}
        .btn-p{background:var(--blue);color:#fff;padding:12px 22px;border-radius:9px;font-size:14px;font-weight:500;text-decoration:none;font-family:var(--body);display:inline-flex;align-items:center;gap:7px;transition:background .2s,transform .15s;cursor:pointer;border:none}
        .btn-p:hover{background:#2650CC;transform:translateY(-1px)}
        .btn-s{color:var(--muted);padding:12px 22px;border-radius:9px;font-size:14px;text-decoration:none;border:1px solid var(--border);background:var(--surface);display:inline-flex;align-items:center;gap:7px;font-family:var(--body);font-weight:400;transition:border-color .2s,color .2s,transform .15s}
        .btn-s:hover{border-color:#b8b0a5;color:var(--text);transform:translateY(-1px)}
        .hero-pills{display:flex;align-items:center;flex-wrap:wrap;gap:.6rem .9rem;padding-top:1.25rem;border-top:1px solid var(--border-light)}
        .pill{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)}
        .pill-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
        .hero-visual{display:flex;justify-content:center;align-items:center;position:relative;padding:1rem}
        .mockup-float{animation:floatY 6s ease-in-out infinite}
        @keyframes floatY{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-14px) rotate(1deg)}}
        .mockup-float:hover{animation:none;transform:translateY(-7px) rotate(0deg);transition:transform .4s ease}
        .phone{width:clamp(220px,22vw,255px);background:var(--surface);border-radius:28px;border:1px solid var(--border);box-shadow:0 40px 80px rgba(0,0,0,.12),0 12px 30px rgba(0,0,0,.07),0 2px 6px rgba(0,0,0,.04);overflow:hidden}
        .phone-top{background:var(--blue);padding:11px 16px 9px;display:flex;align-items:center;justify-content:space-between}
        .phone-top-l{display:flex;align-items:center;gap:5px}
        .phone-top-l span{color:#fff;font-size:11px;font-weight:500}
        .phone-top-dot{width:6px;height:6px;background:rgba(255,255,255,.4);border-radius:50%}
        .phone-pill{background:rgba(255,255,255,.15);border-radius:100px;padding:2px 9px;font-size:9px;color:#fff}
        .phone-body{padding:13px}
        .phone-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
        .phone-tag{font-size:7.5px;font-weight:500;letter-spacing:.04em;background:var(--blue-soft);color:var(--blue);padding:2px 7px;border-radius:100px}
        .phone-prog{display:flex;align-items:center;gap:5px}
        .phone-prog-bar{width:38px;height:2px;background:var(--border);border-radius:99px;overflow:hidden}
        .phone-prog-fill{height:100%;background:var(--blue);border-radius:99px;width:30%}
        .phone-prog-n{font-size:8px;color:var(--muted)}
        .phone-q{font-size:9px;line-height:1.55;color:var(--text);margin-bottom:9px;padding-bottom:9px;border-bottom:1px solid var(--border-light)}
        .phone-opt{display:flex;gap:7px;align-items:flex-start;padding:6px 9px;border-radius:7px;margin-bottom:4px;border:1px solid var(--border);font-size:8px;color:var(--muted);font-weight:300}
        .phone-opt.ok{background:#f0fdf4;border-color:#86efac;color:#166534}
        .phone-opt.no{background:#fef2f2;border-color:#fca5a5;color:#991b1b}
        .phone-opt-l{font-weight:600;font-size:8px;min-width:9px;flex-shrink:0}
        .phone-exp{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:7px;margin-top:7px}
        .phone-exp-lbl{font-size:6.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#15803d;margin-bottom:2px}
        .phone-exp-txt{font-size:7px;color:#166534;line-height:1.5}
        .chip{position:absolute;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 12px;box-shadow:0 8px 20px rgba(0,0,0,.08);display:flex;align-items:center;gap:7px;white-space:nowrap}
        .chip1{top:6%;right:-6%;animation:fc1 7s ease-in-out infinite}
        .chip2{bottom:8%;left:-6%;animation:fc2 8s ease-in-out infinite}
        @keyframes fc1{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes fc2{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
        .chip-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .chip-dot.g{background:var(--green)}
        .chip-dot.b{background:var(--blue)}
        .chip-name{font-size:11px;font-weight:500;color:var(--text)}
        .chip-sub{font-size:10px;color:var(--muted)}
        .strip{background:var(--text);padding:15px clamp(1.25rem,4vw,2.5rem)}
        .strip-in{max-width:1140px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:clamp(1.5rem,3vw,3rem);flex-wrap:wrap}
        .strip-item{display:flex;align-items:center;gap:7px;color:rgba(255,255,255,.6);font-size:12.5px}
        .strip-item strong{color:#fff;font-weight:500}
        .strip-div{width:1px;height:13px;background:rgba(255,255,255,.1)}
        section{padding:clamp(64px,8vw,100px) clamp(1.25rem,4vw,2.5rem)}
        .si{max-width:1140px;margin:0 auto}
        .s-eyebrow{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);margin-bottom:.9rem}
        .s-title{font-family:var(--display);font-size:clamp(1.85rem,3.5vw,2.75rem);font-weight:400;line-height:1.1;letter-spacing:-.02em;margin-bottom:.9rem}
        .s-sub{font-size:clamp(14px,1.5vw,16px);color:var(--muted);max-width:500px;line-height:1.7;font-weight:300}
        .s-problema{background:#f3f1ed}
        .prob-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem;margin-top:2.75rem}
        .prob-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:1.75rem;transition:transform .25s,box-shadow .25s}
        .prob-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.07)}
        .prob-ico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}
        .prob-ico svg{width:15px;height:15px}
        .prob-card h3{font-size:1rem;font-weight:500;margin-bottom:.4rem;line-height:1.3;letter-spacing:-.01em}
        .prob-card p{font-size:13px;color:var(--muted);line-height:1.65}
        .feat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.1rem;margin-top:2.75rem}
        .feat-card{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:2rem;position:relative;overflow:hidden;transition:transform .25s,box-shadow .25s,border-color .25s}
        .feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--blue),var(--cyan));opacity:0;transition:opacity .25s}
        .feat-card:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(0,0,0,.07);border-color:rgba(27,63,160,.14)}
        .feat-card:hover::before{opacity:1}
        .feat-ico{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:1.1rem}
        .feat-ico svg{width:16px;height:16px}
        .feat-card h3{font-size:1.1rem;font-weight:500;margin-bottom:.5rem;line-height:1.2;letter-spacing:-.015em}
        .feat-card p{font-size:13.5px;color:var(--muted);line-height:1.65;margin-bottom:.9rem}
        .prog{margin-top:.4rem}
        .prog-row{margin-bottom:7px}
        .prog-meta{display:flex;justify-content:space-between;margin-bottom:3px}
        .prog-lbl{font-size:11.5px;color:var(--muted)}
        .prog-val{font-size:11.5px;font-weight:500}
        .prog-track{height:4px;background:#f0ede8;border-radius:99px;overflow:hidden}
        .prog-fill{height:100%;border-radius:99px;width:0;transition:width 1.2s cubic-bezier(.4,0,.2,1)}
        .pf-g{background:var(--green)}
        .pf-a{background:var(--amber)}
        .pf-r{background:var(--red)}
        .s-steps{background:#f3f1ed}
        .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:2.75rem;position:relative}
        .steps-grid::before{content:'';position:absolute;top:25px;left:calc(16.66% + 10px);right:calc(16.66% + 10px);height:1px;background:var(--border)}
        .step-num{width:50px;height:50px;border-radius:50%;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:1.2rem;color:var(--blue);margin-bottom:1.25rem;position:relative;z-index:1}
        .step h3{font-size:14.5px;font-weight:500;margin-bottom:.45rem;line-height:1.35;letter-spacing:-.01em}
        .step p{font-size:13px;color:var(--muted);line-height:1.65}
        .s-cta{background:var(--blue);padding:clamp(64px,8vw,96px) clamp(1.25rem,4vw,2.5rem);position:relative;overflow:hidden;text-align:center}
        .s-cta::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 50% 60% at 85% 50%,rgba(255,255,255,.07) 0%,transparent 60%),radial-gradient(ellipse 35% 40% at 15% 30%,rgba(255,255,255,.05) 0%,transparent 60%)}
        .cta-in{max-width:580px;margin:0 auto;position:relative}
        .cta-eyebrow{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:1.25rem}
        .cta-title{font-family:var(--display);font-size:clamp(1.9rem,4vw,3rem);font-weight:400;line-height:1.08;color:#fff;margin-bottom:.9rem;letter-spacing:-.02em}
        .cta-title em{font-style:italic;color:rgba(255,255,255,.65)}
        .cta-sub{font-size:15px;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:2.5rem;font-weight:300}
        .btn-w{background:#fff;color:var(--blue);padding:13px 26px;border-radius:9px;font-size:14px;font-weight:500;text-decoration:none;font-family:var(--body);display:inline-flex;align-items:center;gap:7px;transition:transform .15s,box-shadow .15s;cursor:pointer;border:none}
        .btn-w:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.16)}
        footer{padding:1.75rem clamp(1.25rem,4vw,2.5rem);border-top:1px solid var(--border);background:var(--bg)}
        .footer-in{max-width:1140px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
        .foot-logo{display:flex;align-items:center;gap:8px;text-decoration:none}
        .foot-logo-mark{width:24px;height:24px;background:var(--blue);border-radius:6px;display:flex;align-items:center;justify-content:center}
        .foot-logo-mark svg{width:10px;height:10px}
        .foot-logo-name{font-size:13px;font-weight:500;color:var(--text)}
        .foot-links{display:flex;gap:1.5rem;list-style:none}
        .foot-links a{font-size:12.5px;color:var(--muted);text-decoration:none;transition:color .2s}
        .foot-links a:hover{color:var(--text)}
        .foot-copy{font-size:12px;color:var(--hint)}
        .fu{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s ease}
        .fu.on{opacity:1;transform:translateY(0)}
        .fu:nth-child(2){transition-delay:.08s}
        .fu:nth-child(3){transition-delay:.16s}
        .fu:nth-child(4){transition-delay:.24s}
        @media(max-width:860px){
          .hero-inner{grid-template-columns:1fr}
          .hero-visual{order:-1}
          .phone{width:clamp(200px,55vw,230px)}
          .chip1,.chip2{display:none}
          .prob-grid{grid-template-columns:1fr}
          .feat-grid{grid-template-columns:1fr}
          .steps-grid{grid-template-columns:1fr;gap:1.75rem}
          .steps-grid::before{display:none}
          .nav-r .nav-link{display:none}
          .footer-in{flex-direction:column;align-items:flex-start}
        }
        @media(max-width:480px){
          .hero-h1{font-size:clamp(2rem,8vw,2.6rem)}
          .strip-in{gap:1rem}
          .strip-div{display:none}
          .hero-pills{gap:.5rem .7rem}
        }
      `}</style>

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
          <button onClick={handleEmpezar} className="nav-btn">Empezar gratis</button>
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
            <p className="hero-sub fu">Practicá, medí tu avance y llegá al examen <strong>listo.</strong></p>
            <div className="hero-ctas fu">
              <button onClick={handleEmpezar} className="btn-p">
                Empezar gratis
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
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
          <button onClick={handleEmpezar} className="btn-w">
            Empezar gratis
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="#1B3FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
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
            <li><button onClick={handleEmpezar} style={{background:'none',border:'none',cursor:'pointer',fontSize:'12.5px',color:'var(--muted)',fontFamily:'var(--body)'}}>Entrar a la app</button></li>
          </ul>
          <div className="foot-copy">Hecho para médicos argentinos 🇦🇷</div>
        </div>
      </footer>
    </>
  )
}