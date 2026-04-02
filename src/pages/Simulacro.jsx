import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../hooks/useTheme'
import SimulacroSetup from '../components/SimulacroSetup'
import SimulacroResult from '../components/SimulacroResult'
import QuestionPlayer from '../components/QuestionPlayer'
import { seleccionarPreguntas } from '../hooks/useSimulacro'

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
  const navigate = useNavigate()

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
    setRespuestas(prev => [...prev, { esCorrecta, respuestaDada }])
  }

  const handleSiguiente = () => {
    if (timerInterval) clearInterval(timerInterval)
    if (actual + 1 >= preguntas.length) { setEstado('result'); return }
    setActual(prev => prev + 1)
    if (config?.timerActivo) iniciarTimer(config)
  }

  const handleNuevoSimulacro = () => {
    if (timerInterval) clearInterval(timerInterval)
    setEstado('setup'); setPreguntas([]); setRespuestas([]); setActual(0); setSegundosRestantes(null)
  }

  const handleRevisarErrores = (preguntasErradas) => {
    if (timerInterval) clearInterval(timerInterval)
    setPreguntas(preguntasErradas); setActual(0); setRespuestas([])
    setConfig(prev => ({ ...prev, timerActivo: false }))
    setEstado('jugando')
  }

  const formatTimer = (seg) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

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
            onClick={() => { if (timerInterval) clearInterval(timerInterval); setEstado('setup') }}
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

          <span style={{ fontSize: 12, color: d.text3 }}>Simulacro</span>
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