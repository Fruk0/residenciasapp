import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea, formatSubtema } from '../lib/formatArea'
import { useTheme } from '../hooks/useTheme'
import DarkModeToggle from '../components/DarkModeToggle'

const CANTIDADES = [5, 10, 20, 30]

export default function SubtopicSelector() {
  const { modo, especialidad } = useParams()
  const especialidadDecoded = decodeURIComponent(especialidad)
  const { d, meta } = useTheme()
  const [subtemas, setSubtemas] = useState([])
  const [seleccionados, setSeleccionados] = useState([])
  const [cantidad, setCantidad] = useState(10)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [especialidad])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const [{ data: preguntas }, { data: intentos }] = await Promise.all([
      supabase.from('questions').select('subtema, id').eq('especialidad', especialidadDecoded).eq('estado', 'activo').limit(1000),
      supabase.from('attempts').select('question_id, es_correcta').eq('user_id', user.id).limit(5000)
    ])

    if (!preguntas) return setLoading(false)

    const conteo = {}
    preguntas.forEach(({ subtema, id }) => {
      const key = subtema || 'General'
      if (!conteo[key]) conteo[key] = { ids: [] }
      conteo[key].ids.push(id)
    })

    const intentosPorPregunta = {}
    intentos?.forEach(({ question_id, es_correcta }) => {
      if (!intentosPorPregunta[question_id]) intentosPorPregunta[question_id] = es_correcta
    })

    const resultado = Object.entries(conteo).map(([subtema, { ids }]) => {
      const respondidas = ids.filter(id => intentosPorPregunta[id] !== undefined)
      const correctas = ids.filter(id => intentosPorPregunta[id] === true)
      const incorrectas = ids.filter(id => intentosPorPregunta[id] === false)
      const pct = respondidas.length > 0 ? Math.round((correctas.length / respondidas.length) * 100) : null
      return { subtema, total: ids.length, pct, tieneErrores: incorrectas.length > 0 }
    }).sort((a, b) => a.subtema.localeCompare(b.subtema))

    setSubtemas(modo === 'errores' ? resultado.filter(s => s.tieneErrores) : resultado)
    setLoading(false)
  }

  const toggle = (s) => setSeleccionados(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  )

  const todosSeleccionados = subtemas.length > 0 && subtemas.every(s => seleccionados.includes(s.subtema))

  const toggleTodos = () => {
    if (todosSeleccionados) {
      setSeleccionados([])
    } else {
      setSeleccionados(subtemas.map(s => s.subtema))
    }
  }

  const handleIniciar = () => {
    if (seleccionados.length === 0) return
    const lista = seleccionados.map(encodeURIComponent).join(',')
    navigate(`/practice/modo/${modo}/especialidad/${especialidad}/run?lista=${lista}&cantidad=${cantidad}`)
  }

  const getBadge = (pct) => {
    if (pct === null) return null
    if (pct >= meta) return { bg: '#dcfce7', color: '#15803d' }
    if (pct >= meta * 0.75) return { bg: '#fef9c3', color: '#a16207' }
    return { bg: '#fee2e2', color: '#dc2626' }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => navigate(`/practice/modo/${modo}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg>
            Especialidades
          </button>
          <DarkModeToggle />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 500, color: d.text1, margin: '0 0 4px' }}>{formatArea(especialidadDecoded)}</h1>
        <p style={{ fontSize: 13, color: d.text3, margin: '0 0 24px' }}>
          {modo === 'errores' ? 'Subtemas donde tuviste errores.' : 'Elegí uno o varios subtemas.'}
        </p>

        {subtemas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: 13, color: d.text3 }}>No hay errores registrados en esta especialidad.</p>
          </div>
        ) : (
          <>
            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: 0 }}>Subtemas</p>
                <button
                  onClick={toggleTodos}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: todosSeleccionados ? d.text1 : d.text3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${todosSeleccionados ? d.text2 : d.border2}`,
                    background: todosSeleccionados ? d.text2 : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}>
                    {todosSeleccionados && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={d.bg} strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>
                  {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subtemas.map(({ subtema, pct }) => {
                  const sel = seleccionados.includes(subtema)
                  const badge = getBadge(pct)
                  return (
                    <button
                      key={subtema}
                      onClick={() => toggle(subtema)}
                      style={{
                        width: '100%', textAlign: 'left', borderRadius: 12,
                        padding: '12px 14px', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', cursor: 'pointer',
                        background: sel ? d.card2 : 'transparent',
                        border: `1px solid ${sel ? d.border2 : d.border}`,
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                          border: `1.5px solid ${sel ? d.text2 : d.border2}`,
                          background: sel ? d.text2 : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}>
                          {sel && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={d.bg} strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: sel ? 500 : 400, color: d.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formatSubtema(subtema)}
                        </span>
                      </div>
                      {badge && (
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: badge.bg, color: badge.color, flexShrink: 0, marginLeft: 8 }}>
                          {pct}%
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: '0 0 12px' }}>Cantidad de preguntas</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {CANTIDADES.map(n => (
                  <button key={n} onClick={() => setCantidad(n)} style={{
                    padding: '10px 0', fontSize: 13, fontWeight: 500, borderRadius: 12,
                    border: `1px solid ${cantidad === n ? d.btnBg : d.border2}`,
                    background: cantidad === n ? d.btnBg : 'transparent',
                    color: cantidad === n ? d.btnText : d.text2,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>{n}</button>
                ))}
              </div>
            </div>

            <button
              onClick={handleIniciar}
              disabled={seleccionados.length === 0}
              style={{
                width: '100%', background: d.btnBg, color: d.btnText, border: 'none',
                borderRadius: 14, padding: '14px 0', fontSize: 14, fontWeight: 500,
                cursor: seleccionados.length === 0 ? 'not-allowed' : 'pointer',
                opacity: seleccionados.length === 0 ? 0.4 : 1, transition: 'opacity 0.2s'
              }}
            >
              {seleccionados.length > 0 ? `Iniciar con ${seleccionados.length} subtema${seleccionados.length > 1 ? 's' : ''}` : 'Elegí al menos un subtema'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: d.text3 }}>Efectividad:</span>
              {[
                { bg: '#dcfce7', color: '#15803d', label: `≥ ${meta}%` },
                { bg: '#fef9c3', color: '#a16207', label: `${Math.round(meta * 0.75)}–${meta - 1}%` },
                { bg: '#fee2e2', color: '#dc2626', label: `< ${Math.round(meta * 0.75)}%` },
              ].map(({ bg, color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 10, background: bg, color, padding: '1px 7px', borderRadius: 99, fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}