import { useState } from 'react'
import DetailModal from './DetailModal'
import ReporteModal from './ReporteModal'
import { formatArea } from '../lib/formatArea'
import { useTheme } from '../hooks/useTheme'

const LETRA = ['A', 'B', 'C', 'D']
const OPCION_KEY = ['opcion_a', 'opcion_b', 'opcion_c', 'opcion_d']
const EXPLICACION_KEY = ['explicacion_a', 'explicacion_b', 'explicacion_c', 'explicacion_d']

const formatPregunta = (texto) => {
  if (!texto) return { caso: null, pregunta: texto }
  const idx = texto.lastIndexOf('?')
  if (idx === -1) return { caso: null, pregunta: texto }
  const inicio = texto.lastIndexOf('.', idx)
  if (inicio === -1 || inicio < texto.length * 0.5) return { caso: null, pregunta: texto }
  return {
    caso: texto.substring(0, inicio + 1).trim(),
    pregunta: texto.substring(inicio + 1).trim()
  }
}

export default function QuestionPlayer({
  pregunta, total, actual, onResponder, onSiguiente,
  mostrarArea = true, modoExamen = false
}) {
  const { d, isDark } = useTheme()
  const [seleccionada, setSeleccionada] = useState(null)
  const [respondida, setRespondida] = useState(false)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [mostrarReporte, setMostrarReporte] = useState(false)

  const correctaIndex = LETRA.indexOf(pregunta.respuesta_correcta.toUpperCase())
  const progreso = Math.round((actual / total) * 100)
  const esCorrecta = seleccionada === correctaIndex
  const { caso, pregunta: pText } = formatPregunta(pregunta.pregunta)

  const handleSeleccionar = (index) => {
    if (respondida) return
    setSeleccionada(index)
    setRespondida(true)
    onResponder(index === correctaIndex, index)
  }

  const handleSiguiente = () => {
    setSeleccionada(null)
    setRespondida(false)
    setMostrarDetalle(false)
    setMostrarReporte(false)
    onSiguiente()
  }

  const progresoColor = progreso >= 80 ? '#22c55e' : progreso >= 50 ? '#eab308' : '#ef4444'

  const getOpcionBg = (index) => {
    if (!respondida) return d.card
    if (modoExamen) return index === seleccionada ? d.card2 : d.card
    if (index === correctaIndex) return isDark ? 'rgba(34,197,94,0.12)' : '#f0fdf4'
    if (index === seleccionada && index !== correctaIndex) return isDark ? 'rgba(239,68,68,0.12)' : '#fff5f5'
    return d.card
  }

  const getOpcionBorder = (index) => {
    if (!respondida) return d.border2
    if (modoExamen) return index === seleccionada ? d.border2 : d.border
    if (index === correctaIndex) return isDark ? 'rgba(34,197,94,0.4)' : '#86efac'
    if (index === seleccionada && index !== correctaIndex) return isDark ? 'rgba(239,68,68,0.4)' : '#fca5a5'
    return d.border
  }

  const getOpcionOpacity = (index) => {
    if (!respondida) return 1
    if (modoExamen) return index === seleccionada ? 1 : 0.4
    if (index === correctaIndex || index === seleccionada) return 1
    return 0.35
  }

  const getLetraColor = (index) => {
    if (!respondida) return d.text3
    if (modoExamen) return index === seleccionada ? d.text2 : d.text3
    if (index === correctaIndex) return isDark ? '#4ade80' : '#16a34a'
    if (index === seleccionada && index !== correctaIndex) return isDark ? '#f87171' : '#dc2626'
    return d.text3
  }

  const getTextoColor = (index) => {
    if (!respondida) return d.text1
    if (modoExamen) return index === seleccionada ? d.text1 : d.text2
    if (index === correctaIndex) return isDark ? '#86efac' : '#15803d'
    if (index === seleccionada && index !== correctaIndex) return isDark ? '#fca5a5' : '#b91c1c'
    return d.text2
  }

  return (
    <>
      <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, overflow: 'hidden' }}>

        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${d.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {mostrarArea && (
            <span style={{ fontSize: 12, color: d.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formatArea(pregunta.area)}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: mostrarArea ? 0 : 'auto' }}>
            <span style={{ fontSize: 12, color: d.text3 }}>{actual} / {total}</span>
            <div style={{ width: 64, height: 4, background: d.track, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progreso}%`, background: progresoColor, borderRadius: 99, transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {caso && (
            <p style={{ fontSize: 13, color: d.text2, lineHeight: 1.7, marginBottom: 12, fontWeight: 400 }}>{caso}</p>
          )}
          <p style={{ fontSize: 14, fontWeight: 500, color: d.text1, lineHeight: 1.7, marginBottom: 20 }}>{pText}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {OPCION_KEY.map((key, index) => (
              <button
                key={index}
                onClick={() => handleSeleccionar(index)}
                style={{
                  width: '100%', textAlign: 'left', borderRadius: 12, padding: '12px 14px',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  background: getOpcionBg(index), border: `1px solid ${getOpcionBorder(index)}`,
                  opacity: getOpcionOpacity(index), cursor: respondida ? 'default' : 'pointer', transition: 'all 0.15s'
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: getLetraColor(index), minWidth: 16, marginTop: 1, flexShrink: 0 }}>{LETRA[index]}</span>
                <span style={{ fontSize: 13, lineHeight: 1.6, color: getTextoColor(index) }}>{pregunta[key]}</span>
              </button>
            ))}
          </div>

          {respondida && !modoExamen && (
            <div style={{
              borderRadius: 12, overflow: 'hidden', marginBottom: 12,
              border: `1px solid ${esCorrecta ? (isDark ? 'rgba(34,197,94,0.3)' : '#86efac') : (isDark ? 'rgba(239,68,68,0.3)' : '#fca5a5')}`,
              background: esCorrecta ? (isDark ? 'rgba(34,197,94,0.08)' : '#f0fdf4') : (isDark ? 'rgba(239,68,68,0.08)' : '#fff5f5')
            }}>
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: esCorrecta ? (isDark ? '#4ade80' : '#15803d') : (isDark ? '#f87171' : '#b91c1c') }}>
                  {esCorrecta
                    ? `✓ ${LETRA[correctaIndex]} — ${pregunta[OPCION_KEY[correctaIndex]]}`
                    : `✗ ${LETRA[seleccionada]} — ${pregunta[OPCION_KEY[seleccionada]]}`}
                </p>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: esCorrecta ? (isDark ? '#86efac' : '#166534') : (isDark ? '#fca5a5' : '#991b1b') }}>
                  {esCorrecta ? pregunta[EXPLICACION_KEY[correctaIndex]] : pregunta[EXPLICACION_KEY[seleccionada]]}
                </p>
              </div>
            </div>
          )}

          {respondida && !modoExamen && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              {pregunta.detalle_extendido ? (
                <button
                  onClick={() => setMostrarDetalle(true)}
                  style={{ fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0 }}
                >
                  Ver detalle extendido
                </button>
              ) : <span />}
              <button
                onClick={() => setMostrarReporte(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
                Reportar
              </button>
            </div>
          )}

          {respondida && (
            <button
              onClick={handleSiguiente}
              style={{ width: '100%', background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 13, letterSpacing: '0.02em', cursor: 'pointer' }}
            >
              {modoExamen ? 'Siguiente' : 'Continuar'}
            </button>
          )}
        </div>
      </div>

      {mostrarDetalle && <DetailModal pregunta={pregunta} onCerrar={() => setMostrarDetalle(false)} />}
      {mostrarReporte && <ReporteModal pregunta={pregunta} onCerrar={() => setMostrarReporte(false)} />}
    </>
  )
}