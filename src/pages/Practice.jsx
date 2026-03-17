import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import QuestionPlayer from '../components/QuestionPlayer'

export default function Practice({ modo }) {
  const { area, subtema } = useParams()
  const areaDecoded = area ? decodeURIComponent(area) : null
  const subtemaDecoded = subtema ? decodeURIComponent(subtema) : null

  const [preguntas, setPreguntas] = useState([])
  const [actual, setActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState({ correctas: 0, incorrectas: 0 })
  const [finalizado, setFinalizado] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    cargarPreguntas()
  }, [area, subtema])

  const cargarPreguntas = async () => {
    setLoading(true)
    setError('')

    let query = supabase
      .from('questions')
      .select('*')
      .eq('estado', 'activo')

    if (areaDecoded) query = query.eq('area', areaDecoded)
    if (subtemaDecoded) query = query.eq('subtema', subtemaDecoded)

    query = query.limit(1000)

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      setError('No hay preguntas disponibles para este filtro.')
    } else {
      const mezcladas = data.sort(() => Math.random() - 0.5)
      setPreguntas(mezcladas)
    }
    setLoading(false)
  }

  const handleResponder = async (esCorrecta) => {
    const { data: { user } } = await supabase.auth.getUser()
    const preguntaActual = preguntas[actual]

    await supabase.from('attempts').insert({
      user_id: user.id,
      question_id: preguntaActual.id,
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

  const volverAtras = () => {
    if (areaDecoded) {
      navigate(`/practice/area/${area}`)
    } else {
      navigate('/practice')
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
          <button onClick={volverAtras} className="text-sm text-black underline underline-offset-4">
            Volver
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
              onClick={volverAtras}
              className="w-full text-sm text-gray-400 underline underline-offset-4 hover:text-black transition-colors"
            >
              Volver
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
          <button onClick={volverAtras} className="text-xs text-gray-400 hover:text-black transition-colors underline underline-offset-4">
            Salir
          </button>
          <span className="text-xs text-gray-400">
            {subtemaDecoded || areaDecoded || 'Práctica libre'}
          </span>
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