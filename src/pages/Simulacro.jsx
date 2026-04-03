import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../hooks/useTheme'
import SimulacroSetup from '../components/SimulacroSetup'
import SimulacroResult from '../components/SimulacroResult'
import QuestionPlayer from '../components/QuestionPlayer'
import { seleccionarPreguntas } from '../hooks/useSimulacro'

const STORAGE_KEY = 'simulacro_sesion'

function guardarSesion(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

function leerSesion() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}

function borrarSesion() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

export default function Simulacro() {
  const { d } = useTheme()
  const [estado, setEstado] = useState('setup')
  const [config, setConfig] = useState(null)
  const [preguntas, setPreguntas] = useState([])
  const [actual, setActual] = useState(0)
  const [respuestas, setRespuestas] = useState([])
  const [segundosRestantes, setSegundosRestantes] = useState(null)
  const [timerInterval, setTimerInterval] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sesionGuardada, setSesionGuardada] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const s = leerSesion()
    if (s?.preguntas?.length > 0 && s?.estado === 'jugando') {
      setSesionGuardada(s)
    }
  }, [])

  const restaurarSesion = () => {
    const s = sesionGuardada
    setPreguntas(s.preguntas)
    setActual(s.actual)
    setRespuestas(s.respuestas)
    setConfig(s.config)
    setEstado('jugando')
    setSesionGuardada(null)
    if (s.config?.timerActivo) iniciarTimer(s.config)
  }

  const descartarSesion = () => {
    borrarSesion()
    setSesionGuardada(null)
  }

  const handleIniciar = async (cfg) => {
    setLoading(true)
    setConfig(cfg)
    const seleccionadas = await seleccionarPreguntas({ areas: cfg.areas, totalPreguntas: cfg.cantidad })
    if (seleccionadas.length === 0) { setLoading(false); return }
    setPreguntas(seleccionadas)
    setActual(0)
    setRespuestas([])
    iniciarTimer(cfg)
    setEstado('jugando')
    guardarSesion({ preguntas: seleccionadas, actual: 0, respuestas: [], config: cfg, estado: 'jugando' })
    setLoading(false)
  }

  const iniciarTimer = (cfg) => {
    if (!cfg.timerActivo) return
    setSegundosRestantes(cfg.segundosPorPregunta)
    const interval = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    setTimerInterval(interval)
  }

  const handleResponder = async (esCorrecta, respuestaDada) => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('attempts').insert({
      user_id: user.id,
      question_id: preguntas[actual].id,
      es_correcta: esCorrecta,
      modo: 'simulacro'
    })
    const nuevasRespuestas = [...respuestas, { esCorrecta, respuestaDada }]
    setRespuestas(nuevasRespuestas)
    guardarSesion({ preguntas, actual, respuestas: nuevasRespuestas, config, estado: 'jugando' })
  }

  const handleSiguiente = () => {
    if (timerInterval) clearInterval(timerInterval)
    const nuevoActual = actual + 1
    if (nuevoActual >= preguntas.length) {
      borrarSesion()
      setEstado('result')
      return
    }
    setActual(nuevoActual)
    guardarSesion({ preguntas, actual: nuevoActual, respuestas, config, estado: 'jugando' })
    if (config?.timerActivo) iniciarTimer(config)
  }

  const handleNuevoSimulacro = () => {
    if (timerInterval) clearInterval(timerInterval)
    borrarSesion()
    setEstado('setup'); setPreguntas([]); setRespuestas([]); setActual(0); setSegundosRestantes(null)
  }

  const handleRevisarErrores = (preguntasErradas) => {
    if (timerInterval) clearInterval(timerInterval)
    borrarSesion()
    setPreguntas(preguntasErradas); setActual(0); setRespuestas([])
    setConfig(prev => ({ ...prev, timerActivo: false }))
    setEstado('jugando')
  }

  const handleAbandonar = () => {
    if (timerInterval) clearInterval(timerInterval)
    borrarSesion()
    setEstado('setup')
  }

  const formatTimer = (seg) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // Banner de sesión guardada
  if (estado === 'setup' && sesionGuardada) {
    return (
      <div style={{ minHeight: '100dvh', background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 400, background: d.card, border: `1px solid ${d.border}`, borderRadius: 20, padding: 28, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: d.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={d.text2} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, color: d.text1, margin: '0 0 8px' }}>Tenés un simulacro en curso</p>
          <p style={{ fontSize: 13, color: d.text3, margin: '0 0 24px', lineHeight: 1.5 }}>
            Pregunta {sesionGuardada.actual + 1} de {sesionGuardada.preguntas.length} · {sesionGuardada.respuestas.length} respondidas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={restaurarSesion}
              style={{ width: '100%', background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Continuar simulacro
            </button>
            <button
              onClick={descartarSesion}
              style={{ width: '100%', background: 'transparent', color: d.text3, border: `1px solid ${d.border2}`, borderRadius: 12, padding: '13px 0', fontSize: 13, cursor: 'pointer' }}
            >
              Empezar uno nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (estado === 'setup') return <SimulacroSetup onIniciar={handleIniciar} onVolver={() => navigate('/')} />
  if (estado === 'result') return (
    <SimulacroResult
      preguntas={preguntas}
      respuestas={respuestas}
      onNuevoSimulacro={handleNuevoSimulacro}
      onRevisarErrores={handleRevisarErrores}
    />
  )

  const timerUrgente = segundosRestantes !== null && segundosRestantes <= 15

  return (
    <div style={{ minHeight: '100dvh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button
            onClick={handleAbandonar}
            style={{ fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Abandonar
          </button>
          {config?.timerActivo && segundosRestantes !== null && (
            <div style={{
              fontSize: 14, fontWeight: 500, padding: '5px 14px', borderRadius: 10,
              fontVariantNumeric: 'tabular-nums',
              background: timerUrgente ? (d.isDark ? 'rgba(239,68,68,0.15)' : '#fff5f5') : d.card2,
              color: timerUrgente ? '#ef4444' : d.text2,
              border: `1px solid ${timerUrgente ? 'rgba(239,68,68,0.3)' : d.border}`
            }}>
              {formatTimer(segundosRestantes)}
            </div>
          )}
          <span style={{ fontSize: 12, color: d.text3 }}>Simulacro · {actual + 1}/{preguntas.length}</span>
        </div>

        <QuestionPlayer
          pregunta={preguntas[actual]}
          total={preguntas.length}
          actual={actual + 1}
          onResponder={handleResponder}
          onSiguiente={handleSiguiente}
          mostrarArea={false}
          modoExamen={true}
        />
      </div>
    </div>
  )
}