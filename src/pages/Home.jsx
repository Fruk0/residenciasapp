import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'
import { useTheme } from '../hooks/useTheme'
import DarkModeToggle from '../components/DarkModeToggle'

const MoonIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
const SunIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
const ChevronRight = ({ color }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6"/></svg>

export default function Home({ session }) {
  const { d, isDark, toggle } = useTheme()
  const [perfil, setPerfil] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('nombre, meta_aciertos, fecha_examen, temas_activos, role').eq('id', user.id).single()
    const { data: intentos } = await supabase.from('attempts').select('question_id, es_correcta, modo, timestamp').eq('user_id', user.id).order('timestamp', { ascending: false }).limit(5000)
    const { data: preguntas } = await supabase.from('questions').select('id, especialidad, area').eq('estado', 'activo').limit(2000)
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

      const hoy = new Date()
      const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7)
      const hace14 = new Date(hoy); hace14.setDate(hoy.getDate() - 14)
      const semana = intentos.filter(i => new Date(i.timestamp) >= hace7)
      const semanaAnt = intentos.filter(i => { const t = new Date(i.timestamp); return t >= hace14 && t < hace7 })
      const pctSemana = semana.length > 0 ? Math.round((semana.filter(i => i.es_correcta).length / semana.length) * 100) : null
      const pctSemanaAnt = semanaAnt.length > 0 ? Math.round((semanaAnt.filter(i => i.es_correcta).length / semanaAnt.length) * 100) : null
      const comparativa = pctSemana !== null && pctSemanaAnt !== null ? pctSemana - pctSemanaAnt : null

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

      // Subtema más fallado esta semana
      const subtemasSemana = {}
      const preguntasPorId = {}
      preguntas.forEach(p => { preguntasPorId[p.id] = p })
      semana.forEach(({ question_id, es_correcta }) => {
        if (es_correcta) return
        const p = preguntasPorId[question_id]; if (!p) return
        const sub = p.subtema || p.especialidad || p.area; if (!sub) return
        subtemasSemana[sub] = (subtemasSemana[sub] || 0) + 1
      })
      const subtemasOrdenados = Object.entries(subtemasSemana).sort((a, b) => b[1] - a[1])
      const peorSubtema = subtemasOrdenados.length > 0 ? { nombre: subtemasOrdenados[0][0], count: subtemasOrdenados[0][1] } : null
      const peorEsp = peorSubtema ? (preguntas.find(p => (p.subtema || p.especialidad || p.area) === peorSubtema.nombre)?.especialidad || null) : null

      const grupos = {}
      intentos.forEach(({ timestamp, es_correcta, modo }) => {
        const key = `${timestamp.split('T')[0]}_${modo}`
        if (!grupos[key]) grupos[key] = { fecha: timestamp, modo, correctas: 0, total: 0 }
        grupos[key].total++; if (es_correcta) grupos[key].correctas++
      })
      const sesiones = Object.values(grupos).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .map(({ fecha, modo, correctas, total }) => ({ fecha, modo, porcentaje: Math.round((correctas / total) * 100), total }))
        .slice(0, 3)

      const espOrdenadas = Object.entries(porEsp)
        .map(([esp, { correctas, total }]) => ({ esp, pct: Math.round((correctas / total) * 100), total }))
        .sort((a, b) => b.pct - a.pct)

      setStats({ pctGlobal, total, correctasTotal, porEsp, espOrdenadas, comparativa, racha, sesiones, meta, peorSubtema, peorEsp })
    }
    setLoading(false)
  }

  const getColor = (pct, meta) => pct >= meta ? '#22c55e' : pct >= meta * 0.75 ? '#eab308' : '#ef4444'

  const formatFechaSesion = (fechaStr) => {
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const dia = fechaStr.split('T')[0]
    const hora = fechaStr.split('T')[1]?.slice(0, 5)
    if (dia === hoy) return `Hoy, ${hora}`
    if (dia === ayer) return `Ayer, ${hora}`
    return dia.split('-').reverse().join('/')
  }

  const iniciales = (nombre) => {
    if (!nombre) return '?'
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const diasParaExamen = () => {
    if (!perfil?.fecha_examen) return null
    const diff = Math.ceil((new Date(perfil.fecha_examen) - new Date()) / 86400000)
    return diff > 0 ? diff : null
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const dias = diasParaExamen()
  const nombre = perfil?.nombre?.split(' ')[0] || null
  const meta = stats?.meta || 80

  return (
    <div style={{ minHeight: '100dvh', background: d.bg, transition: 'background 0.2s' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: d.text1, margin: 0 }}>Hola{nombre ? `, ${nombre}` : ''}.</h1>
            <p style={{ fontSize: 12, color: d.text3, marginTop: 3, marginBottom: 0 }}>
              {dias ? `Examen en ${dias} días` : stats?.total > 0 ? `${stats.total} preguntas respondidas` : 'Empezá a practicar hoy'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {perfil?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} style={{ fontSize: 12, color: d.text2, border: `1px solid ${d.border2}`, borderRadius: 8, padding: '6px 12px', background: 'transparent', cursor: 'pointer' }}>Admin</button>
            )}
            <button onClick={toggle} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: `1px solid ${d.border2}`, background: 'transparent', cursor: 'pointer', color: d.text2 }}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button onClick={() => navigate('/profile')} style={{ width: 36, height: 36, borderRadius: '50%', background: d.btnBg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: d.btnText }}>{iniciales(perfil?.nombre)}</span>
            </button>
          </div>
        </div>

        {/* Métricas — fila compacta de 4 */}
        {stats?.total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'efectividad', value: stats.pctGlobal != null ? `${stats.pctGlobal}%` : '—', color: stats.pctGlobal != null ? getColor(stats.pctGlobal, meta) : d.text1 },
              { label: 'respondidas', value: stats.total, color: d.text1 },
              { label: 'racha', value: `${stats.racha}d`, color: stats.racha > 0 ? '#22c55e' : d.text1 },
              { label: 'vs sem. ant.', value: stats.comparativa == null ? '—' : stats.comparativa > 0 ? `+${stats.comparativa}%` : stats.comparativa === 0 ? '=' : `${stats.comparativa}%`, color: stats.comparativa > 0 ? '#22c55e' : stats.comparativa < 0 ? '#ef4444' : d.text1 }
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 500, color, margin: '0 0 3px' }}>{value}</p>
                <p style={{ fontSize: 10, color: d.text3, margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Insight accionable — subtema más fallado esta semana */}
        {stats?.peorSubtema && (
          <div style={{
            background: isDark ? 'rgba(239,68,68,0.06)' : '#fff8f8',
            border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : '#fecaca'}`,
            borderRadius: 14, padding: '14px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: isDark ? '#f87171' : '#dc2626', margin: '0 0 3px', fontWeight: 500 }}>Esta semana fallaste más en</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: d.text1, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatArea(stats.peorSubtema.nombre)}
              </p>
              <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>{stats.peorSubtema.count} {stats.peorSubtema.count === 1 ? 'error' : 'errores'} esta semana</p>
            </div>
            <button
              onClick={() => navigate(`/practice/modo/errores`)}
              style={{
                flexShrink: 0, fontSize: 12, fontWeight: 500,
                background: isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2',
                color: isDark ? '#f87171' : '#dc2626',
                border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              Repasar ahora
            </button>
          </div>
        )}

        {/* Acciones rápidas */}
        <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 14px' }}>Acciones rápidas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* CTA principal destacado */}
            <button
              onClick={() => navigate('/practice')}
              style={{ background: d.btnBg, border: 'none', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: d.btnText, margin: '0 0 2px' }}>Practicar por tema</p>
                <p style={{ fontSize: 11, color: d.btnText, opacity: 0.6, margin: 0 }}>Elegís especialidad y subtema</p>
              </div>
              <ChevronRight color={d.btnText} />
            </button>

            <button
              onClick={() => navigate('/simulacro')}
              style={{ background: 'transparent', border: `1px solid ${d.border2}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>Simulacro personalizado</p>
                <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>Modo examen con timer</p>
              </div>
              <ChevronRight color={d.text3} />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: 'transparent', border: `1px solid ${d.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>Ver mi progreso completo</p>
                <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>Dashboard detallado</p>
              </div>
              <ChevronRight color={d.text3} />
            </button>
          </div>
        </div>

        {/* Por especialidad */}
        <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 16px' }}>Por especialidad</p>
          {stats?.espOrdenadas?.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.espOrdenadas.slice(0, 5).map(({ esp, pct, total }) => (
                  <div key={esp}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: d.text2 }}>{formatArea(esp)}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: d.text3 }}>{total} resp.</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: getColor(pct, meta) }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: d.track, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: getColor(pct, meta), borderRadius: 99, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/dashboard')} style={{ width: '100%', marginTop: 14, fontSize: 11, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Ver todas las especialidades →
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontSize: 13, color: d.text3, marginBottom: 12 }}>Todavía no respondiste ninguna pregunta.</p>
              <button onClick={() => navigate('/practice')} style={{ fontSize: 13, color: d.text1, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Empezar a practicar</button>
            </div>
          )}
        </div>

        {/* Últimas sesiones */}
        {stats?.sesiones?.length > 0 && (
          <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 14px' }}>Últimas sesiones</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {stats.sesiones.map(({ fecha, modo, porcentaje, total }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < stats.sesiones.length - 1 ? `1px solid ${d.border}` : 'none' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>{modo === 'simulacro' ? 'Simulacro' : 'Práctica'} · {total} preguntas</p>
                    <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>{formatFechaSesion(fecha)}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: getColor(porcentaje, meta) }}>{porcentaje}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, paddingBottom: 32 }}>
          <button onClick={async () => await supabase.auth.signOut()} style={{ fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  )
}