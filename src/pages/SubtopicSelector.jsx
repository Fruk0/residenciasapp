import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea, formatSubtema } from '../lib/formatArea'

export default function SubtopicSelector() {
  const { area } = useParams()
  const areaDecoded = decodeURIComponent(area)
  const [subtemas, setSubtemas] = useState([])
  const [stats, setStats] = useState({})
  const [totalArea, setTotalArea] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    cargarSubtemas()
  }, [area])

const cargarSubtemas = async () => {
  setLoading(true)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: preguntas } = await supabase
    .from('questions')
    .select('subtema, id')
    .eq('area', areaDecoded)
    .eq('estado', 'activo')
    .limit(1000)

  const { data: intentos } = await supabase
    .from('attempts')
    .select('question_id, es_correcta')
    .eq('user_id', user.id)
    .limit(5000)

  if (!preguntas) return setLoading(false)

  setTotalArea(preguntas.length)

  const conteo = {}
  preguntas.forEach(({ subtema, id }) => {
    const key = subtema || 'Sin subtema'
    if (!conteo[key]) conteo[key] = { total: 0, ids: [] }
    conteo[key].total++
    conteo[key].ids.push(id)
  })

  const statsMap = {}
  if (intentos) {
    const intentosPorPregunta = {}
    intentos.forEach(({ question_id, es_correcta }) => {
      if (!intentosPorPregunta[question_id]) {
        intentosPorPregunta[question_id] = es_correcta
      }
    })
    Object.entries(conteo).forEach(([subtema, { ids }]) => {
      const respondidas = ids.filter(id => intentosPorPregunta[id] !== undefined)
      const correctas = ids.filter(id => intentosPorPregunta[id] === true)
      statsMap[subtema] = {
        respondidas: respondidas.length,
        porcentaje: respondidas.length > 0
          ? Math.round((correctas.length / respondidas.length) * 100)
          : null
      }
    })
  }

  setSubtemas(
    Object.entries(conteo)
      .map(([subtema, { total }]) => ({ subtema, total }))
      .sort((a, b) => a.subtema.localeCompare(b.subtema))
  )
  setStats(statsMap)
  setLoading(false)
}

  const getColor = (pct) => {
    if (pct === null) return 'bg-gray-200'
    if (pct >= 80) return 'bg-green-500'
    if (pct >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const statArea = (() => {
    if (!Object.keys(stats).length) return null
    const todas = Object.values(stats)
    const totalRespondidas = todas.reduce((s, v) => s + v.respondidas, 0)
    if (totalRespondidas === 0) return null
    const pcts = todas.filter(v => v.porcentaje !== null).map(v => v.porcentaje)
    return pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null
  })()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">

        <button
          onClick={() => navigate('/practice')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors mb-5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
          </svg>
          Todas las áreas
        </button>

        <h1 className="text-2xl font-medium text-gray-900 mb-1">{formatArea(areaDecoded)}</h1>
        <p className="text-sm text-gray-400 mb-5">{totalArea} preguntas en total</p>

        <div className="flex flex-col gap-2">

          <button
            onClick={() => navigate(`/practice/area/${area}/all`)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-gray-400 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Todos los subtemas</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalArea} preguntas · {statArea !== null ? `${statArea}% aciertos` : 'sin intentos'}
              </p>
            </div>
            <div className="bg-black rounded-lg px-3 py-1.5">
              <span className="text-xs text-white font-medium">Practicar</span>
            </div>
          </button>

          <div className="h-px bg-gray-100 my-1" />

          {subtemas.map(({ subtema, total }) => {
            const stat = stats[subtema] || {}
            const pct = stat.porcentaje ?? null
            return (
              <button
                key={subtema}
                onClick={() => navigate(`/practice/area/${area}/subtema/${encodeURIComponent(subtema)}`)}
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-gray-300 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatSubtema(subtema)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {total} preguntas · {pct !== null ? `${pct}% (${stat.respondidas} respondidas)` : 'sin intentos'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-1 bg-gray-100 rounded-full overflow-hidden">
                    {pct !== null && (
                      <div
                        className={`h-full rounded-full ${getColor(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}