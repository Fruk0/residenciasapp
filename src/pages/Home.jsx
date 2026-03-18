import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'
import { useTheme } from '../hooks/useTheme'

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
  const { isDark, toggle, d } = useTheme()
  const [perfil, setPerfil] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargar() }, [])

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
      const semanaAnt = intentos.filter(i => { const t = new Date(i.timestamp); return t >= hace14 && t < hace7 })

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
          const diff = (new Date(dias[i - 1]) - new Date(dias[i])) / 86400000
          if (diff === 1) racha++
          else break
        }
      }

      const grupos = {}
      intentos.forEach(({ timestamp, es_correcta, modo }) => {
        const key = `${timestamp.split('T')[0]}_${modo}`
        if (!grupos[key]) grupos[key] = { fecha: timestamp, modo, correctas: 0, total: 0 }
        grupos[key].total++
        if (es_correcta) grupos[key].correctas++
      })
      const sesiones = Object.values(grupos)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .map(({ fecha, modo, correctas, total }) => ({
          fecha, modo,
          porcentaje: Math.round((correctas / total) * 100),
          total
        }))
        .slice(0, 3)

      setStats({ pctGlobal, total, correctasTotal, porArea, comparativa, racha, sesiones, meta: userData?.meta_aciertos || 80 })
    }

    setLoading(false)
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

  const getColor = (pct, meta) => {
    if (pct >= meta) return '#22c55e'
    if (pct >= meta * 0.75) return '#eab308'
    return '#ef4444'
  }

  const iniciales = (nombre) => {
    if (!nombre) return '?'
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const dias = diasParaExamen()
  const nombre = perfil?.nombre?.split(' ')[0] || null
  const saludo = `Hola${nombre ? `, ${nombre}` : ''}.`

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
        <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: d.bg, transition: 'background 0.2s' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: d.text1, margin: 0 }}>{saludo}</h1>
            {dias && <p style={{ fontSize: 13, color: d.text3, marginTop: 4, marginBottom: 0 }}>Examen en {dias} días</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {perfil?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                style={{ fontSize: 12, color: d.text2, border: `1px solid ${d.border2}`, borderRadius: 8, padding: '6px 12px', background: 'transparent', cursor: 'pointer' }}
              >
                Admin
              </button>
            )}
            <button
              onClick={toggle}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: `1px solid ${d.border2}`, background: 'transparent', cursor: 'pointer', color: d.text2 }}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => navigate('/profile')}
              style={{ width: 36, height: 36, borderRadius: '50%', background: d.btnBg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 12, fontWeight: 500, color: d.btnText }}>{iniciales(perfil?.nombre)}</span>
            </button>
          </div>
        </div>

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            {
              label: 'Aciertos globales',
              value: stats?.pctGlobal != null ? `${stats.pctGlobal}%` : '—',
              sub: `meta: ${stats?.meta || 80}%`,
              color: stats?.pctGlobal != null ? getColor(stats.pctGlobal, stats.meta) : d.text1
            },
            { label: 'Respondidas', value: stats?.total || 0, sub: 'preguntas', color: d.text1 },
            {
              label: 'Racha',
              value: `${stats?.racha || 0} días`,
              sub: stats?.racha > 0 ? 'seguí así' : 'empezá hoy',
              color: stats?.racha > 0 ? '#22c55e' : d.text1
            },
            {
              label: 'vs semana ant.',
              value: stats?.comparativa == null ? '—' : stats.comparativa > 0 ? `+${stats.comparativa}%` : stats.comparativa === 0 ? '=' : `${stats.comparativa}%`,
              sub: stats?.comparativa > 0 ? 'mejorando' : stats?.comparativa < 0 ? 'a reforzar' : '',
              color: stats?.comparativa > 0 ? '#22c55e' : stats?.comparativa < 0 ? '#ef4444' : d.text1
            }
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 11, color: d.text3, margin: '0 0 6px' }}>{label}</p>
              <p style={{ fontSize: 26, fontWeight: 500, color, margin: '0 0 4px' }}>{value}</p>
              <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Acciones + Especialidades */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 16px' }}>Acciones rápidas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              <button
                onClick={() => navigate('/practice')}
                style={{ background: d.btnBg, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: d.btnText, margin: '0 0 2px' }}>Practicar por tema</p>
                  <p style={{ fontSize: 11, color: d.btnSubText, margin: 0 }}>Elegís área y subtema</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={d.btnSubText} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/simulacro')}
                style={{ background: 'transparent', border: `1px solid ${d.border2}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>Simulacro personalizado</p>
                  <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>Modo examen con timer</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={d.text3} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                style={{ background: 'transparent', border: `1px solid ${d.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>Ver mi progreso completo</p>
                  <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>Dashboard detallado</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={d.text3} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </button>

            </div>
          </div>

          <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 16px' }}>Por especialidad</p>
            {stats?.porArea && Object.keys(stats.porArea).length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(stats.porArea)
                    .map(([area, { correctas, total }]) => ({ area, pct: Math.round((correctas / total) * 100) }))
                    .sort((a, b) => b.pct - a.pct)
                    .slice(0, 5)
                    .map(({ area, pct }) => (
                      <div key={area}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: d.text2 }}>{formatArea(area)}</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: getColor(pct, stats.meta) }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, background: d.track, borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: getColor(pct, stats.meta), borderRadius: 99, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{ width: '100%', marginTop: 14, fontSize: 11, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  Ver todas las especialidades →
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: d.text3, marginBottom: 12 }}>Todavía no respondiste ninguna pregunta.</p>
                <button
                  onClick={() => navigate('/practice')}
                  style={{ fontSize: 13, color: d.text1, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  Empezar a practicar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Últimas sesiones */}
        {stats?.sesiones?.length > 0 && (
          <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 14px' }}>Últimas sesiones</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {stats.sesiones.map(({ fecha, modo, porcentaje, total }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: d.card2, border: `1px solid ${d.border}`, borderRadius: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>
                      {modo === 'simulacro' ? 'Simulacro' : 'Práctica'} · {total} preguntas
                    </p>
                    <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>{formatFechaSesion(fecha)}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: getColor(porcentaje, stats.meta) }}>{porcentaje}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <button
            onClick={async () => await supabase.auth.signOut()}
            style={{ fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  )
}