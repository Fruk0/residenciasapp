import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'
import { useTheme } from '../hooks/useTheme'
import DarkModeToggle from '../components/DarkModeToggle'

export default function AreaSelector() {
  const { modo } = useParams()
  const { d, meta } = useTheme()
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const [{ data: preguntas }, { data: intentos }] = await Promise.all([
      supabase.from('questions').select('especialidad, id').eq('estado', 'activo').limit(1000),
      supabase.from('attempts').select('question_id, es_correcta').eq('user_id', user.id).limit(5000)
    ])

    if (!preguntas) return setLoading(false)

    const conteo = {}
    preguntas.forEach(({ especialidad, id }) => {
      const key = especialidad || 'general'
      if (!conteo[key]) conteo[key] = { ids: [] }
      conteo[key].ids.push(id)
    })

    const intentosPorPregunta = {}
    intentos?.forEach(({ question_id, es_correcta }) => {
      if (!intentosPorPregunta[question_id]) intentosPorPregunta[question_id] = es_correcta
    })

    const resultado = Object.entries(conteo).map(([especialidad, { ids }]) => {
      const respondidas = ids.filter(id => intentosPorPregunta[id] !== undefined)
      const correctas = ids.filter(id => intentosPorPregunta[id] === true)
      const incorrectas = ids.filter(id => intentosPorPregunta[id] === false)
      const pct = respondidas.length > 0 ? Math.round((correctas.length / respondidas.length) * 100) : null
      return { especialidad, pct, tieneErrores: incorrectas.length > 0 }
    }).sort((a, b) => formatArea(a.especialidad).localeCompare(formatArea(b.especialidad)))

    setEspecialidades(modo === 'errores' ? resultado.filter(e => e.tieneErrores) : resultado)
    setLoading(false)
  }

  const getBadge = (pct) => {
    if (pct === null) return null
    if (pct >= meta) return { bg: '#dcfce7', color: '#15803d' }
    if (pct >= meta * 0.75) return { bg: '#fef9c3', color: '#a16207' }
    return { bg: '#fee2e2', color: '#dc2626' }
  }

  const getCardBorder = (pct) => {
    if (pct === null) return d.border
    if (pct >= meta) return 'rgba(34,197,94,0.25)'
    if (pct >= meta * 0.75) return 'rgba(234,179,8,0.25)'
    return d.border
  }

  const getCardShadow = (pct) => {
    if (pct === null) return 'none'
    if (pct >= meta) return '0 0 14px rgba(34,197,94,0.07)'
    if (pct >= meta * 0.75) return '0 0 14px rgba(234,179,8,0.07)'
    return 'none'
  }

  const leyenda = [
    { bg: '#dcfce7', color: '#15803d', label: `≥ ${meta}%` },
    { bg: '#fef9c3', color: '#a16207', label: `${Math.round(meta * 0.75)}–${meta - 1}%` },
    { bg: '#fee2e2', color: '#dc2626', label: `< ${Math.round(meta * 0.75)}%` },
  ]

  const filtradas = especialidades.filter(({ especialidad }) =>
    formatArea(especialidad).toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={() => navigate('/practice')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg>
            Modos
          </button>
          <DarkModeToggle />
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: d.text1, margin: '0 0 4px' }}>
            {modo === 'errores' ? 'Repasar errores.' : 'Practicar.'}
          </h1>
          <p style={{ fontSize: 13, color: d.text3, margin: 0 }}>
            {modo === 'errores' ? 'Especialidades donde tuviste errores.' : 'Elegí una especialidad para empezar.'}
          </p>
        </div>

        {modo === 'practica' && (
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: d.text3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar especialidad..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ width: '100%', background: d.card, border: `1px solid ${d.border2}`, borderRadius: 12, paddingLeft: 42, paddingRight: 16, paddingTop: 10, paddingBottom: 10, fontSize: 14, color: d.text1, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtradas.map(({ especialidad, pct }, index) => {
            const badge = getBadge(pct)
            return (
              <button
                key={especialidad}
                onClick={() => navigate(`/practice/modo/${modo}/especialidad/${encodeURIComponent(especialidad)}`)}
                className="area-item"
                style={{
                  animationDelay: `${index * 40}ms`,
                  width: '100%', background: d.card,
                  border: `1px solid ${getCardBorder(pct)}`,
                  boxShadow: getCardShadow(pct),
                  borderRadius: 14, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', textAlign: 'left'
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500, color: d.text1 }}>{formatArea(especialidad)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 12 }}>
                  {badge && (
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: badge.bg, color: badge.color }}>
                      {pct}%
                    </span>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={d.text3} strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            )
          })}
          {filtradas.length === 0 && (
            <p style={{ textAlign: 'center', fontSize: 13, color: d.text3, padding: '32px 0' }}>
              {modo === 'errores' ? 'No tenés errores registrados todavía.' : 'No hay especialidades que coincidan.'}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: d.text3 }}>Efectividad:</span>
          {leyenda.map(({ bg, color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 10, background: bg, color, padding: '1px 7px', borderRadius: 99, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}