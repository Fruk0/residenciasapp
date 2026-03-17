import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import QuestionPlayer from '../components/QuestionPlayer'

export default function Practice() {
  const [preguntas, setPreguntas] = useState([])
  const [actual, setActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState({ correctas: 0, incorrectas: 0 })
  const [finalizado, setFinalizado] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    cargarPreguntas()
  }, [])

  const cargarPreguntas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('estado', 'activo')
      .limit(10)

    if (error) {
      setError('No se pudieron cargar las preguntas.')
    } else if (!data || data.length === 0) {
      setError('No hay preguntas disponibles todavía.')
    } else {
      setPreguntas(data)
    }
    setLoading(false)
  }

  const handleResponder = async (esCorrecta) => {
    const { data: { user } } = await supabase.auth.getUser()
    const preguntaActual = preguntas[actual]

    await supabase.from('attempts').insert({
      user_id: user.id,
      question_id: preguntaActual.id,
      respuesta_dada: null,
      es_correcta: esCorrecta,
      modo: 'practica'
    })

    setResultado(prev => ({
      correctas: prev.correctas + (esCorrecta ? 1 : 0),
      incorrectas: prev.incorrectas + (esCorrecta ? 0 : 1)
    }))
  }

  const handleSiguiente = () => {
    if (actual + 1 >= preguntas.length) {
      setFinalizado(true)
    } else {
      setActual(prev => prev + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-black underline underline-offset-4"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (finalizado) {
    const total = resultado.correctas + resultado.incorrectas
    const porcentaje = Math.round((resultado.correctas / total) * 100)

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-xl font-medium">{porcentaje}%</span>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Práctica terminada</h2>
          <p className="text-sm text-gray-400 mb-1">{resultado.correctas} correctas de {total} preguntas</p>
          <p className="text-xs text-gray-300 mb-8">
            {porcentaje >= 80 ? '¡Excelente! Estás por encima del 80%.' : 'Seguí practicando, vas a llegar.'}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setActual(0); setResultado({ correctas: 0, incorrectas: 0 }); setFinalizado(false); cargarPreguntas() }}
              className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Otra ronda
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full text-sm text-gray-400 underline underline-offset-4 hover:text-black transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 hover:text-black transition-colors underline underline-offset-4"
          >
            Salir
          </button>
          <span className="text-xs text-gray-400">Modo práctica</span>
        </div>

        <QuestionPlayer
          pregunta={preguntas[actual]}
          total={preguntas.length}
          actual={actual + 1}
          onResponder={handleResponder}
          onSiguiente={handleSiguiente}
        />
      </div>
    </div>
  )
}