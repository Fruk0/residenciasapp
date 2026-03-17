import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'


export default function TopicSelector() {
  const [areas, setAreas] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    cargarAreas()
  }, [])

 const cargarAreas = async () => {
  setLoading(true)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: preguntas } = await supabase
    .from('questions')
    .select('area, id')
    .eq('estado', 'activo')
    .limit(1000)

  const { data: intentos } = await supabase
    .from('attempts')
    .select('question_id, es_correcta')
    .eq('user_id', user.id)
    .limit(5000)

  if (!preguntas) return setLoading(false)

  const conteo = {}
  preguntas.forEach(({ area, id }) => {
    if (!conteo[area]) conteo[area] = { total: 0, ids: [] }
    conteo[area].total++
    conteo[area].ids.push(id)
  })

  const statsMap = {}
  if (intentos) {
    const intentosPorPregunta = {}
    intentos.forEach(({ question_id, es_correcta }) => {
      if (!intentosPorPregunta[question_id]) {
        intentosPorPregunta[question_id] = es_correcta
      }
    })
    Object.entries(conteo).forEach(([area, { ids }]) => {
      const respondidas = ids.filter(id => intentosPorPregunta[id] !== undefined)
      const correctas = ids.filter(id => intentosPorPregunta[id] === true)
      statsMap[area] = {
        respondidas: respondidas.length,
        porcentaje: respondidas.length > 0
          ? Math.round((correctas.length / respondidas.length) * 100)
          : null
      }
    })
  }

  setAreas(
    Object.entries(conteo)
      .map(([area, { total }]) => ({ area, total }))
      .sort((a, b) => a.area.localeCompare(b.area))
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

  const areasFiltradas = areas.filter(({ area }) =>
    area.toLowerCase().includes(busqueda.toLowerCase())
  )

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

        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Practicar.</h1>
            <p className="text-sm text-gray-400 mt-1">Elegí un área para empezar.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 hover:text-black hover:border-gray-400 transition-colors"
          >
            Salir
          </button>
        </div>

        <div className="relative mt-5 mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar área..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          {areasFiltradas.map(({ area, total }) => {
            const stat = stats[area] || {}
            const pct = stat.porcentaje ?? null
            return (
              <button
                key={area}
                onClick={() => navigate(`/practice/area/${encodeURIComponent(area)}`)}
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-gray-300 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatArea(area)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {total} preguntas · {pct !== null ? `${pct}% (${stat.respondidas} respondidas)` : 'sin intentos'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-1 bg-gray-100 rounded-full overflow-hidden">
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

          {areasFiltradas.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No hay áreas que coincidan.</p>
          )}
        </div>

        <div className="flex gap-4 mt-4 px-1">
          {[['bg-green-500', '≥ 80%'], ['bg-yellow-500', '60–79%'], ['bg-red-500', '< 60%'], ['bg-gray-200', 'sin intentos']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[10px] text-gray-400">{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}