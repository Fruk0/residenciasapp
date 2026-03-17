import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SimulacroSetup from '../components/SimulacroSetup'
import SimulacroResult from '../components/SimulacroResult'
import QuestionPlayer from '../components/QuestionPlayer'
import { seleccionarPreguntas } from '../hooks/useSimulacro'

export default function Simulacro() {
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
    const seleccionadas = await seleccionarPreguntas({
      areas: cfg.areas,
      totalPreguntas: cfg.cantidad
    })

    if (seleccionadas.length === 0) {
      setLoading(false)
      return
    }

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
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setTimerInterval(interval)
  }

  const handleResponder = async (esCorrecta, respuestaDada) => {
    const { data: { user } } = await supabase.auth.getUser()
    const preguntaActual = preguntas[actual]

    await supabase.from('attempts').insert({
      user_id: user.id,
      question_id: preguntaActual.id,
      es_correcta: esCorrecta,
      modo: 'simulacro'
    })

    setRespuestas(prev => [...prev, { esCorrecta, respuestaDada }])
  }

  const handleSiguiente = () => {
    if (timerInterval) clearInterval(timerInterval)

    if (actual + 1 >= preguntas.length) {
      setEstado('result')
      return
    }

    setActual(prev => prev + 1)
    if (config?.timerActivo) iniciarTimer(config)
  }

  const handleNuevoSimulacro = () => {
    if (timerInterval) clearInterval(timerInterval)
    setEstado('setup')
    setPreguntas([])
    setRespuestas([])
    setActual(0)
    setSegundosRestantes(null)
  }

  const handleRevisarErrores = (preguntasErradas) => {
    if (timerInterval) clearInterval(timerInterval)
    setPreguntas(preguntasErradas)
    setActual(0)
    setRespuestas([])
    setConfig(prev => ({ ...prev, timerActivo: false }))
    setEstado('jugando')
  }

  const formatTimer = (seg) => {
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (estado === 'setup') {
    return <SimulacroSetup onIniciar={handleIniciar} onVolver={() => navigate('/')} />
  }

  if (estado === 'result') {
    return (
      <SimulacroResult
        preguntas={preguntas}
        respuestas={respuestas}
        onNuevoSimulacro={handleNuevoSimulacro}
        onRevisarErrores={handleRevisarErrores}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => { if (timerInterval) clearInterval(timerInterval); setEstado('setup') }}
            className="text-xs text-gray-400 hover:text-black transition-colors underline underline-offset-4"
          >
            Abandonar
          </button>
          {config?.timerActivo && segundosRestantes !== null && (
            <div className={`text-sm font-medium tabular-nums px-3 py-1 rounded-lg ${
              segundosRestantes <= 15
                ? 'text-red-500 bg-red-50'
                : 'text-gray-500 bg-gray-100'
            }`}>
              {formatTimer(segundosRestantes)}
            </div>
          )}
          <span className="text-xs text-gray-400">Simulacro</span>
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