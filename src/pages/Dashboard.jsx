import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'
import { useTheme } from '../hooks/useTheme'
import DarkModeToggle from '../components/DarkModeToggle'

export default function Dashboard() {
  const { d, isDark } = useTheme()
  const [perfil, setPerfil] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
    const { data: intentos } = await supabase.from('attempts').select('question_id, es_correcta, modo, timestamp').eq('user_id', user.id).order('timestamp', { ascending: false }).limit(5000)
    const { data: preguntas } = await supabase.from('questions').select('id, area, especialidad').eq('estado', 'activo').limit(2000)
    setPerfil(userData)

    if (intentos && preguntas) {
      const meta = userData?.meta_aciertos || 80
      const espPorId = {}
      preguntas.forEach(({ id, especialidad, area }) => { espPorId[id] = especialidad || area })

      const total = intentos.length
      const correctasTotal = intentos.filter(i => i.es_correcta).length
      const pctGlobal = total > 0 ? Math.round((correctasTotal / total) * 100) : null

      const porEsp = {}
      intentos.forEach(({ question_id, es_correcta }) => {
        const esp = espPorId[question_id]; if (!esp) return
        if (!porEsp[esp]) porEsp[esp] = { correctas: 0, total: 0 }
        porEsp[esp].total++; if (es_correcta) porEsp[esp].correctas++
      })

      const espOrdenadas = Object.entries(porEsp)
        .map(([esp, { correctas, total }]) => ({ esp, pct: Math.round((correctas / total) * 100), total, correctas }))
        .sort((a, b) => b.pct - a.pct)

      const enMeta = espOrdenadas.filter(e => e.pct >= meta)
      const aNecesitanRepaso = espOrdenadas.filter(e => e.pct < meta).sort((a, b) => a.pct - b.pct)

      // Semanas
      const hoy = new Date()
      const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7)
      const hace14 = new Date(hoy); hace14.setDate(hoy.getDate() - 14)
      const semana = intentos.filter(i => new Date(i.timestamp) >= hace7)
      const semanaAnt = intentos.filter(i => { const t = new Date(i.timestamp); return t >= hace14 && t < hace7 })
      const pctSemana = semana.length > 0 ? Math.round((semana.filter(i => i.es_correcta).length / semana.length) * 100) : null
      const pctSemanaAnt = semanaAnt.length > 0 ? Math.round((semanaAnt.filter(i => i.es_correcta).length / semanaAnt.length) * 100) : null
      const comparativa = pctSemana !== null && pctSemanaAnt !== null ? pctSemana - pctSemanaAnt : null

      // Racha
      const diasSet = [...new Set(intentos.map(i => i.timestamp.split('T')[0]))].sort().reverse()
      let racha = 0
      const todayStr = new Date().toISOString().split('T')[0]
      const ayerStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      if (diasSet[0] === todayStr || diasSet[0] === ayerStr) {
        racha = 1
        for (let i = 1; i < diasSet.length; i++) {
          const diff = (new Date(diasSet[i - 1]) - new Date(diasSet[i])) / 86400000
          if (diff === 1) racha++; else break
        }
      }

      // Últimos 7 días
      const ultimos7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })
      const diasConActividad = new Set(intentos.map(i => i.timestamp.split('T')[0]))

      // Evolución diaria (para línea histórica)
      const porDia = {}
      intentos.forEach(({ timestamp, es_correcta }) => {
        const dia = timestamp.split('T')[0]
        if (!porDia[dia]) porDia[dia] = { correctas: 0, total: 0 }
        porDia[dia].total++; if (es_correcta) porDia[dia].correctas++
      })
      const evolucion = Object.entries(porDia)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([dia, { correctas, total }]) => ({ dia, pct: Math.round((correctas / total) * 100) }))

      // Sesiones
      const grupos = {}
      intentos.forEach(({ timestamp, es_correcta, modo }) => {
        const key = `${timestamp.split('T')[0]}_${modo}`
        if (!grupos[key]) grupos[key] = { fecha: timestamp, modo, correctas: 0, total: 0 }
        grupos[key].total++; if (es_correcta) grupos[key].correctas++
      })
      const todasSesiones = Object.values(grupos).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      const sesionesSimulacro = todasSesiones.filter(s => s.modo === 'simulacro').slice(0, 5)
      const sesionesPractica = todasSesiones.filter(s => s.modo === 'practica').slice(0, 3)

      setStats({ pctGlobal, total, correctasTotal, espOrdenadas, enMeta, aNecesitanRepaso, comparativa, racha, ultimos7, diasConActividad, evolucion, sesionesSimulacro, sesionesPractica, meta })
    }
    setLoading(false)
  }

  const getColor = (pct, meta) => pct >= meta ? '#22c55e' : pct >= meta * 0.75 ? '#eab308' : '#ef4444'

  const formatFecha = (fechaStr) => {
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const dia = fechaStr.split('T')[0]
    if (dia === hoy) return `Hoy, ${fechaStr.split('T')[1]?.slice(0, 5)}`
    if (dia === ayer) return `Ayer, ${fechaStr.split('T')[1]?.slice(0, 5)}`
    return dia.split('-').reverse().join('/')
  }

  const diasExamen = () => {
    if (!perfil?.fecha_examen) return null
    const diff = Math.ceil((new Date(perfil.fecha_examen) - new Date()) / 86400000)
    return diff > 0 ? diff : null
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const dias = diasExamen()
  const meta = stats?.meta || 80

  // Línea histórica SVG
  const LineaHistorica = () => {
    if (!stats?.evolucion || stats.evolucion.length < 2) return null
    const datos = stats.evolucion
    const W = 520, H = 80
    const minPct = 0, maxPct = 100
    const xStep = W / (datos.length - 1)
    const toY = (pct) => H - ((pct - minPct) / (maxPct - minPct)) * H
    const metaY = toY(meta)
    const points = datos.map((p, i) => `${i * xStep},${toY(p.pct)}`).join(' ')
    const areaPoints = `0,${H} ${points} ${(datos.length - 1) * xStep},${H}`
    const lastPct = datos[datos.length - 1].pct
    const lastX = (datos.length - 1) * xStep
    const lastY = toY(lastPct)
    const lineColor = getColor(lastPct, meta)

    return (
      <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: 0 }}>Evolución de efectividad</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 2, background: '#ef4444', opacity: 0.5 }} />
              <span style={{ fontSize: 10, color: d.text3 }}>meta {meta}%</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: lineColor }}>{lastPct}% hoy</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80, overflow: 'visible' }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1={metaY} x2={W} y2={metaY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
          <polygon points={areaPoints} fill="url(#areaGrad)" />
          <polyline points={points} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastX} cy={lastY} r="3.5" fill={lineColor} />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: d.text3 }}>{datos[0]?.dia?.split('-').reverse().slice(0, 2).join('/')}</span>
          <span style={{ fontSize: 10, color: d.text3 }}>Hoy</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: d.text1, margin: '0 0 4px' }}>Mi progreso.</h1>
            {dias && <p style={{ fontSize: 12, color: d.text3, margin: 0 }}>Examen en {dias} días</p>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DarkModeToggle />
            <button onClick={() => navigate('/')} style={{ fontSize: 12, color: d.text3, border: `1px solid ${d.border2}`, borderRadius: 10, padding: '6px 14px', background: 'transparent', cursor: 'pointer' }}>Inicio</button>
          </div>
        </div>

        {!stats?.total ? (
          <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: d.text3, marginBottom: 12 }}>Todavía no respondiste ninguna pregunta.</p>
            <button onClick={() => navigate('/practice')} style={{ fontSize: 13, color: d.text1, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Empezar a practicar</button>
          </div>
        ) : (
          <>
            {/* Score global */}
            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: d.text3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Efectividad global</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 52, fontWeight: 500, color: getColor(stats.pctGlobal, meta), margin: '0 0 4px', lineHeight: 1 }}>{stats.pctGlobal}%</p>
                  <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>meta: {meta}% · {stats.total} preguntas respondidas</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {stats.pctGlobal < meta ? (
                    <>
                      <p style={{ fontSize: 12, color: d.text2, margin: '0 0 6px' }}>Faltan {meta - stats.pctGlobal} puntos para la meta</p>
                      <div style={{ width: 110, height: 5, background: d.track, borderRadius: 99, overflow: 'hidden', marginLeft: 'auto' }}>
                        <div style={{ height: '100%', width: `${(stats.pctGlobal / meta) * 100}%`, background: getColor(stats.pctGlobal, meta), borderRadius: 99 }} />
                      </div>
                      <p style={{ fontSize: 10, color: d.text3, margin: '3px 0 0' }}>{meta}% meta</p>
                    </>
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#22c55e' }}>Meta alcanzada</p>
                  )}
                </div>
              </div>

              {/* Especialidades en meta */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, background: isDark ? 'rgba(34,197,94,0.08)' : '#f0fdf4', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 22, fontWeight: 500, color: '#22c55e', margin: '0 0 2px' }}>{stats.enMeta.length}</p>
                  <p style={{ fontSize: 11, color: isDark ? '#4ade80' : '#166534', margin: 0 }}>superan el {meta}% de efectividad</p>
                </div>
                <div style={{ flex: 1, background: isDark ? 'rgba(239,68,68,0.08)' : '#fff5f5', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 22, fontWeight: 500, color: '#ef4444', margin: '0 0 2px' }}>{stats.aNecesitanRepaso.length}</p>
                  <p style={{ fontSize: 11, color: isDark ? '#fca5a5' : '#991b1b', margin: 0 }}>por debajo del {meta}% de meta</p>
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'respondidas', value: stats.total, color: d.text1 },
                { label: 'días racha', value: stats.racha || 0, color: stats.racha > 0 ? '#22c55e' : d.text1 },
                { label: 'vs sem. ant.', value: stats.comparativa == null ? '—' : stats.comparativa > 0 ? `+${stats.comparativa}%` : stats.comparativa === 0 ? '=' : `${stats.comparativa}%`, color: stats.comparativa > 0 ? '#22c55e' : stats.comparativa < 0 ? '#ef4444' : d.text1 }
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 500, color, margin: '0 0 4px' }}>{value}</p>
                  <p style={{ fontSize: 10, color: d.text3, margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Actividad 7 días */}
            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: '16px 20px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: '0 0 14px' }}>Actividad — últimos 7 días</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 48, marginBottom: 8 }}>
                {stats.ultimos7.map(dia => {
                  const activo = stats.diasConActividad.has(dia)
                  const esHoy = dia === new Date().toISOString().split('T')[0]
                  const intentosDia = activo ? [...stats.diasConActividad].filter(d => d === dia).length : 0
                  return (
                    <div key={dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '13%' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: activo ? '#22c55e' : d.card2,
                        border: esHoy ? `2px solid ${d.text2}` : `1px solid ${d.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}>
                        {activo && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {stats.ultimos7.map((dia, i) => {
                  const esHoy = dia === new Date().toISOString().split('T')[0]
                  const label = new Date(dia + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short' }).slice(0, 2)
                  return (
                    <div key={dia} style={{ width: '13%', textAlign: 'center', fontSize: 10, color: esHoy ? d.text1 : d.text3, fontWeight: esHoy ? 500 : 400, textTransform: 'capitalize' }}>
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Línea histórica */}
            <LineaHistorica />

            {/* Especialidades en meta */}
            {stats.enMeta.length > 0 && (
              <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#15803d', margin: '0 0 14px' }}>Especialidades en meta</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.enMeta.map(({ esp, pct, total }) => (
                    <div key={esp}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: d.text2 }}>{formatArea(esp)}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontSize: 10, color: d.text3 }}>{total} resp.</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#22c55e' }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 4, background: d.track, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#22c55e', borderRadius: 99 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Especialidades a reforzar */}
            {stats.aNecesitanRepaso.length > 0 && (
              <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#fca5a5' : '#991b1b', margin: '0 0 14px' }}>A reforzar</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.aNecesitanRepaso.map(({ esp, pct, total }) => (
                    <div key={esp}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: d.text2 }}>{formatArea(esp)}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontSize: 10, color: d.text3 }}>{total} resp.</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: getColor(pct, meta) }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 4, background: d.track, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: getColor(pct, meta), borderRadius: 99 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simulacros */}
            {stats.sesionesSimulacro.length > 0 && (
              <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: '0 0 14px' }}>Simulacros</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {stats.sesionesSimulacro.map(({ fecha, porcentaje, total }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < stats.sesionesSimulacro.length - 1 ? `1px solid ${d.border}` : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${getColor(porcentaje, meta)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: getColor(porcentaje, meta) }}>{porcentaje}%</span>
                        </div>
                        <span style={{ fontSize: 9, color: d.text3, marginTop: 2 }}>efectividad</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: d.text1 }}>{total} preguntas</span>
                          <span style={{ fontSize: 11, color: d.text3 }}>{formatFecha(fecha)}</span>
                        </div>
                        <div style={{ height: 4, background: d.track, borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${porcentaje}%`, background: getColor(porcentaje, meta), borderRadius: 99 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prácticas recientes */}
            {stats.sesionesPractica.length > 0 && (
              <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: '0 0 12px' }}>Últimas prácticas</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {stats.sesionesPractica.map(({ fecha, porcentaje, total }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < stats.sesionesPractica.length - 1 ? `1px solid ${d.border}` : 'none' }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>Práctica · {total} preguntas</p>
                        <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>{formatFecha(fecha)}</p>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: getColor(porcentaje, meta) }}>{porcentaje}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <button onClick={() => navigate('/')} style={{ width: '100%', fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '16px 0', paddingBottom: 32 }}>Volver al inicio</button>
      </div>
    </div>
  )
}