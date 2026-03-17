import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'
import { useDarkMode } from '../hooks/useDarkMode'

function getSaludo() {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'Buenos días'
  if (h >= 12 && h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function Home({ session }) {
  const navigate = useNavigate()
  const { isDark, toggle } = useDarkMode()
  const [perfil, setPerfil] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: userData } = await supabase
      .from('users')
      .select('nombre, meta_aciertos, fecha_examen, temas_activos, role')
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
      const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7)
      const hace14 = new Date(hoy); hace14.setDate(hoy.getDate() - 14)

      const semana = intentos.filter(i => new Date(i.timestamp) >= hace7)
      const semanaAnt = intentos.filter(i => {
        const t = new Date(i.timestamp)
        return t >= hace14 && t < hace7
      })

      const pctSemana = semana.length > 0 ? Math.round((semana.filter(i => i.es_correcta).length / semana.length) * 100) : null
      const pctSemanaAnt = semanaAnt.length > 0 ? Math.round((semanaAnt.filter(i => i.es_correcta).length / semanaAnt.length) * 100) : null
      const comparativa = pctSemana !== null && pctSemanaAnt !== null ? pctSemana - pctSemanaAnt : null

      const dias = [...new Set(intentos.map(i => i.timestamp.split('T')[0]))].sort().reverse()
      let racha = 0
      const todayStr = new Date().toISOString().split('T')[0]
      const ayerStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      if (dias[0] === todayStr || dias[0] === ayerStr) {
        racha = 1
        for (let i = 1; i < dias.length; i++) {
          const diff = (new Date(dias[i-1]) - new Date(dias[i])) / 86400000
          if (diff === 1) racha++
          else break
        }
      }

      const sesiones = agruparSesiones(intentos).slice(0, 3)

      setStats({ pctGlobal, total, correctasTotal, porArea, comparativa, racha, sesiones, meta: userData?.meta_aciertos || 80 })
    }

    setLoading(false)
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
    const diff = Math.ceil((new Date(perfil.fecha_examen) - new Date()) / 86400000)
    return diff > 0 ? diff : null
  }

  const formatFechaSesion = (fechaStr) => {
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const dia = fechaStr.split('T')[0]
    const hora = fechaStr.split('T')[1]?.slice(0, 5)
    if (dia === hoy) return `Hoy, ${hora}`
    if (dia === ayer) return `Ayer, ${hora}`
    return dia.split('-').reverse().join('/')
  }

  const getColorPct = (pct, meta) => {
    if (pct >= meta) return 'text-green-600 dark:text-green-400'
    if (pct >= meta * 0.75) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-500 dark:text-red-400'
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

  const dias = diasParaExamen()
  const nombre = perfil?.nombre?.split(' ')[0] || null
  const saludo = `${getSaludo()}${nombre ? `, ${nombre}` : ''}.`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-6 h-6 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white">{saludo}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {dias ? `Examen en ${dias} días · ` : ''}Meta: {perfil?.meta_aciertos || 80}%
            </p>
          </div>
          <div className="flex items-center gap-3">
            {perfil?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="text-xs border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-lg px-3 py-1.5 hover:border-gray-400 transition-colors"
              >
                Admin
              </button>
            )}
            <button
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 transition-colors"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center"
            >
              <span className="text-xs font-medium text-white dark:text-gray-900">{iniciales(perfil?.nombre)}</span>
            </button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: 'Aciertos globales',
              value: stats?.pctGlobal !== null ? `${stats.pctGlobal}%` : '—',
              sub: `meta: ${stats?.meta || 80}%`,
              color: stats?.pctGlobal !== null ? getColorPct(stats.pctGlobal, stats?.meta) : 'text-gray-900 dark:text-white'
            },
            {
              label: 'Respondidas',
              value: stats?.total || 0,
              sub: 'preguntas',
              color: 'text-gray-900 dark:text-white'
            },
            {
              label: 'Racha',
              value: `${stats?.racha || 0} días`,
              sub: stats?.racha > 0 ? 'seguí así' : 'empezá hoy',
              color: stats?.racha > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
            },
            {
              label: 'vs semana ant.',
              value: stats?.comparativa === null ? '—' : stats?.comparativa > 0 ? `+${stats.comparativa}%` : stats?.comparativa === 0 ? '=' : `${stats.comparativa}%`,
              sub: stats?.comparativa > 0 ? 'mejorando' : stats?.comparativa < 0 ? 'a reforzar' : '',
              color: stats?.comparativa > 0 ? 'text-green-600 dark:text-green-400' : stats?.comparativa < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'
            }
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-medium mb-0.5 ${color}`}>{value}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* Acciones + Especialidades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Acciones rápidas */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Acciones rápidas</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/practice')}
                className="w-full bg-gray-900 dark:bg-white rounded-xl px-4 py-3.5 flex items-center justify-between hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-white dark:text-gray-900">Practicar por tema</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Elegís área y subtema</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/simulacro')}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Simulacro personalizado</p>
                  <p className="text-xs text-gray-400 mt-0.5">Modo examen con timer</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Ver mi progreso completo</p>
                  <p className="text-xs text-gray-400 mt-0.5">Dashboard detallado</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Por especialidad */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Por especialidad</p>
            {stats?.porArea && Object.keys(stats.porArea).length > 0 ? (
              <>
                <div className="flex flex-col gap-3">
                  {Object.entries(stats.porArea)
                    .map(([area, { correctas, total }]) => ({
                      area,
                      pct: Math.round((correctas / total) * 100),
                      total
                    }))
                    .sort((a, b) => b.pct - a.pct)
                    .slice(0, 5)
                    .map(({ area, pct }) => (
                      <div key={area}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{formatArea(area)}</span>
                          <span className={`text-xs font-medium ${getColorPct(pct, stats.meta)}`}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getBarColor(pct, stats.meta)}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mt-4 underline underline-offset-4"
                >
                  Ver todas las especialidades →
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-gray-400 mb-3">Todavía no respondiste ninguna pregunta.</p>
                <button
                  onClick={() => navigate('/practice')}
                  className="text-sm text-gray-900 dark:text-white font-medium underline underline-offset-4"
                >
                  Empezar a practicar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Últimas sesiones */}
        {stats?.sesiones?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Últimas sesiones</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats.sesiones.map(({ fecha, modo, porcentaje, total }, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white capitalize">
                      {modo === 'simulacro' ? 'Simulacro' : 'Práctica'} · {total} preguntas
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatFechaSesion(fecha)}</p>
                  </div>
                  <span className={`text-sm font-medium ${getColorPct(porcentaje, stats.meta)}`}>
                    {porcentaje}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-center mt-8">
          <button
            onClick={async () => await supabase.auth.signOut()}
            className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline underline-offset-4 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  )
}