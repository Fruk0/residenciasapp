import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'

export default function Dashboard() {
  const [perfil, setPerfil] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: intentos } = await supabase
      .from('attempts')
      .select('question_id, es_correcta, modo, timestamp')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(5000)

    const { data: preguntas } = await supabase
      .from('questions')
      .select('id, area')
      .eq('estado', 'activo')
      .limit(1000)

    setPerfil(userData)

    if (intentos && preguntas) {
      const areasPorId = {}
      preguntas.forEach(({ id, area }) => { areasPorId[id] = area })

      const total = intentos.length
      const correctasTotal = intentos.filter(i => i.es_correcta).length
      const pctGlobal = total > 0 ? Math.round((correctasTotal / total) * 100) : null

      const porArea = {}
      intentos.forEach(({ question_id, es_correcta }) => {
        const area = areasPorId[question_id]
        if (!area) return
        if (!porArea[area]) porArea[area] = { correctas: 0, total: 0 }
        porArea[area].total++
        if (es_correcta) porArea[area].correctas++
      })

      const hoy = new Date()
      const hace7dias = new Date(hoy)
      hace7dias.setDate(hoy.getDate() - 7)
      const hace14dias = new Date(hoy)
      hace14dias.setDate(hoy.getDate() - 14)

      const intentosSemana = intentos.filter(i => new Date(i.timestamp) >= hace7dias)
      const intentosSemanaAnterior = intentos.filter(i => {
        const t = new Date(i.timestamp)
        return t >= hace14dias && t < hace7dias
      })

      const pctSemana = intentosSemana.length > 0
        ? Math.round((intentosSemana.filter(i => i.es_correcta).length / intentosSemana.length) * 100)
        : null
      const pctSemanaAnterior = intentosSemanaAnterior.length > 0
        ? Math.round((intentosSemanaAnterior.filter(i => i.es_correcta).length / intentosSemanaAnterior.length) * 100)
        : null

      const comparativa = pctSemana !== null && pctSemanaAnterior !== null
        ? pctSemana - pctSemanaAnterior
        : null

      const racha = calcularRacha(intentos)

      const sesiones = agruparSesiones(intentos).slice(0, 5)

      setStats({
        pctGlobal,
        total,
        correctasTotal,
        porArea,
        comparativa,
        racha,
        sesiones,
        meta: userData?.meta_aciertos || 80
      })
    }

    setLoading(false)
  }

  const calcularRacha = (intentos) => {
    if (!intentos.length) return 0
    const dias = [...new Set(intentos.map(i => i.timestamp.split('T')[0]))].sort().reverse()
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (dias[0] !== hoy && dias[0] !== ayer) return 0
    let racha = 1
    for (let i = 1; i < dias.length; i++) {
      const prev = new Date(dias[i - 1])
      const curr = new Date(dias[i])
      const diff = (prev - curr) / (1000 * 60 * 60 * 24)
      if (diff === 1) racha++
      else break
    }
    return racha
  }

  const agruparSesiones = (intentos) => {
    const grupos = {}
    intentos.forEach(({ timestamp, es_correcta, modo }) => {
      const key = `${timestamp.split('T')[0]}_${modo}`
      if (!grupos[key]) grupos[key] = { fecha: timestamp, modo, correctas: 0, total: 0 }
      grupos[key].total++
      if (es_correcta) grupos[key].correctas++
    })
    return Object.values(grupos)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .map(({ fecha, modo, correctas, total }) => ({
        fecha,
        modo,
        porcentaje: Math.round((correctas / total) * 100),
        total
      }))
  }

  const diasParaExamen = () => {
    if (!perfil?.fecha_examen) return null
    const diff = Math.ceil((new Date(perfil.fecha_examen) - new Date()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : null
  }

  const formatFechaSesion = (fechaStr) => {
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const dia = fechaStr.split('T')[0]
    if (dia === hoy) return `Hoy, ${fechaStr.split('T')[1]?.slice(0, 5)}`
    if (dia === ayer) return `Ayer, ${fechaStr.split('T')[1]?.slice(0, 5)}`
    return dia.split('-').reverse().join('/')
  }

  const getColorPct = (pct, meta) => {
    if (pct >= meta) return 'text-green-600'
    if (pct >= meta * 0.75) return 'text-yellow-600'
    return 'text-red-500'
  }

  const getBarColor = (pct, meta) => {
    if (pct >= meta) return 'bg-green-500'
    if (pct >= meta * 0.75) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const iniciales = (nombre) => {
    if (!nombre) return '?'
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const dias = diasParaExamen()

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">
              Hola, {perfil?.nombre?.split(' ')[0] || 'ahí'}.
            </h1>
            {dias && (
              <p className="text-xs text-gray-400 mt-0.5">Examen en {dias} días</p>
            )}
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <span className="text-sm font-medium text-gray-600">{iniciales(perfil?.nombre)}</span>
          </button>
        </div>

        {/* Score global */}
        {stats?.pctGlobal !== null ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Aciertos globales</p>
                <p className={`text-5xl font-medium ${getColorPct(stats.pctGlobal, stats.meta)}`}>
                  {stats.pctGlobal}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  meta: {stats.meta}% · {stats.total} respondidas
                </p>
              </div>
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke={stats.pctGlobal >= stats.meta ? '#16a34a' : stats.pctGlobal >= stats.meta * 0.75 ? '#ca8a04' : '#ef4444'}
                    strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - stats.pctGlobal / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">{stats.pctGlobal}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 text-center">
            <p className="text-sm text-gray-400">Todavía no respondiste ninguna pregunta.</p>
            <button
              onClick={() => navigate('/practice')}
              className="text-sm text-black font-medium underline underline-offset-4 mt-2"
            >
              Empezar a practicar
            </button>
          </div>
        )}

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white border border-gray-100 rounded-xl p-3.5 text-center">
            <p className="text-xl font-medium text-gray-900">{stats?.total || 0}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">respondidas</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3.5 text-center">
            <p className={`text-xl font-medium ${stats?.racha > 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {stats?.racha || 0}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">días racha</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3.5 text-center">
            <p className={`text-xl font-medium ${
              stats?.comparativa === null ? 'text-gray-900' :
              stats.comparativa > 0 ? 'text-green-600' :
              stats.comparativa < 0 ? 'text-red-500' : 'text-gray-900'
            }`}>
              {stats?.comparativa === null ? '—' :
               stats.comparativa > 0 ? `+${stats.comparativa}%` :
               stats.comparativa === 0 ? '=' : `${stats.comparativa}%`}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">vs sem. ant.</p>
          </div>
        </div>

        {/* Por especialidad */}
        {stats?.porArea && Object.keys(stats.porArea).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Por especialidad</p>
            <div className="flex flex-col gap-3">
              {Object.entries(stats.porArea)
                .map(([area, { correctas, total }]) => ({
                  area,
                  pct: Math.round((correctas / total) * 100),
                  total
                }))
                .sort((a, b) => b.pct - a.pct)
                .map(({ area, pct, total }) => (
                  <div key={area}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-700">{formatArea(area)}</span>
                      <span className="text-xs font-medium text-gray-900">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBarColor(pct, stats.meta)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Últimas sesiones */}
        {stats?.sesiones?.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Últimas sesiones</p>
            <div className="flex flex-col gap-2">
              {stats.sesiones.map(({ fecha, modo, porcentaje, total }, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-gray-900 capitalize">
                      {modo === 'simulacro' ? 'Simulacro' : 'Práctica'} · {total} preguntas
                    </p>
                    <p className="text-xs text-gray-400">{formatFechaSesion(fecha)}</p>
                  </div>
                  <span className={`text-sm font-medium ${getColorPct(porcentaje, stats.meta)}`}>
                    {porcentaje}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón volver */}
        <button
          onClick={() => navigate('/')}
          className="w-full text-sm text-gray-400 underline underline-offset-4 hover:text-black transition-colors py-4"
        >
          Volver al inicio
        </button>

      </div>
    </div>
  )
}