import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'
import DarkModeToggle from './DarkModeToggle'

const LETRA = ['A', 'B', 'C', 'D']
const OPCION_KEY = ['opcion_a', 'opcion_b', 'opcion_c', 'opcion_d']
const EXPLICACION_KEY = ['explicacion_a', 'explicacion_b', 'explicacion_c', 'explicacion_d']

function formatPregunta(texto) {
  const partes = texto.split('?')
  if (partes.length < 2) return { caso: null, pregunta: texto }
  const pregunta = partes[partes.length - 1].trim() === ''
    ? partes[partes.length - 2].trim() + '?'
    : partes[partes.length - 1].trim() + '?'
  const caso = texto.replace(pregunta, '').trim()
  return { caso: caso || null, pregunta }
}

function ReporteInline({ pregunta, d }) {
  const [abierto, setAbierto] = useState(false)
  const [respuestaSugerida, setRespuestaSugerida] = useState('')
  const [argumento, setArgumento] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleEnviar = async () => {
    if (!argumento.trim()) return
    setEnviando(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('reportes').insert({
      user_id: user.id,
      question_id: pregunta.id,
      codigo_pregunta: pregunta.codigo || null,
      pregunta: pregunta.pregunta,
      respuesta_sugerida: respuestaSugerida,
      argumento: argumento.trim()
    })
    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) return (
    <div style={{ padding: '8px 12px', background: 'rgba(167,139,250,0.08)', borderRadius: 8, marginTop: 8 }}>
      <p style={{ fontSize: 11, color: '#7c3aed', margin: 0 }}>✓ Reporte enviado</p>
    </div>
  )

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setAbierto(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
        Reportar pregunta
      </button>
      {abierto && (
        <div style={{ marginTop: 8, padding: 12, background: 'rgba(167,139,250,0.06)', borderRadius: 10, border: `1px solid rgba(167,139,250,0.2)` }}>
          <p style={{ fontSize: 11, color: d.text3, margin: '0 0 8px' }}>¿Cuál creés que es la respuesta correcta?</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {LETRA.map(l => (
              <button key={l} onClick={() => setRespuestaSugerida(l)} style={{
                flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 500, borderRadius: 8,
                border: `1px solid ${respuestaSugerida === l ? '#7c3aed' : d.border2}`,
                background: respuestaSugerida === l ? 'rgba(167,139,250,0.15)' : 'transparent',
                color: respuestaSugerida === l ? '#7c3aed' : d.text2, cursor: 'pointer'
              }}>{l}</button>
            ))}
          </div>
          <textarea
            value={argumento}
            onChange={e => setArgumento(e.target.value)}
            placeholder="Explicá por qué..."
            rows={2}
            style={{ width: '100%', background: d.card, border: `1px solid ${d.border2}`, borderRadius: 8, padding: '8px 10px', fontSize: 11, color: d.text1, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 8 }}
          />
          <button
            onClick={handleEnviar}
            disabled={enviando || !argumento.trim()}
            style={{
              width: '100%', padding: '8px 0', fontSize: 12, fontWeight: 500,
              background: argumento.trim() ? '#7c3aed' : d.card2,
              color: argumento.trim() ? '#fff' : d.text3,
              border: 'none', borderRadius: 8,
              cursor: argumento.trim() ? 'pointer' : 'not-allowed',
              opacity: enviando ? 0.6 : 1
            }}
          >
            {enviando ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </div>
      )}
    </div>
  )
}

function PreguntaCorrecta({ pregunta, respuesta, d, isDark }) {
  const [expandida, setExpandida] = useState(false)
  const ci = ['a','b','c','d'].indexOf(pregunta.respuesta_correcta.toLowerCase())
  const { caso, pregunta: pText } = formatPregunta(pregunta.pregunta)

  return (
    <div style={{ border: `1px solid ${d.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setExpandida(p => !p)}
        style={{ width: '100%', textAlign: 'left', padding: '11px 14px', background: d.card, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', minWidth: 0 }}>
          <span style={{ fontSize: 12, color: '#22c55e', flexShrink: 0, marginTop: 1 }}>✓</span>
          <p style={{ fontSize: 12, color: d.text2, lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: expandida ? 'none' : 2, WebkitBoxOrient: 'vertical' }}>
            {pText}
          </p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={d.text3} strokeWidth="2" style={{ transform: expandida ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0, marginTop: 2 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {expandida && (
        <div style={{ background: isDark ? 'rgba(34,197,94,0.08)' : '#f0fdf4', borderTop: `1px solid ${isDark ? 'rgba(34,197,94,0.2)' : '#86efac'}`, padding: '10px 14px' }}>
          {caso && <p style={{ fontSize: 11, color: d.text3, lineHeight: 1.5, marginBottom: 6 }}>{caso}</p>}
          <p style={{ fontSize: 10, fontWeight: 500, color: isDark ? '#4ade80' : '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Respuesta correcta</p>
          <p style={{ fontSize: 11, fontWeight: 500, color: isDark ? '#86efac' : '#15803d', margin: '0 0 3px' }}>{LETRA[ci]} — {pregunta[OPCION_KEY[ci]]}</p>
          <p style={{ fontSize: 11, color: isDark ? '#86efac' : '#166534', lineHeight: 1.5, margin: 0 }}>{pregunta[EXPLICACION_KEY[ci]]}</p>
        </div>
      )}
    </div>
  )
}

function PreguntaFallada({ pregunta, respuesta, d, isDark }) {
  const ci = ['a','b','c','d'].indexOf(pregunta.respuesta_correcta.toLowerCase())
  const ei = respuesta?.respuestaDada != null ? respuesta.respuestaDada : null
  const { caso, pregunta: pText } = formatPregunta(pregunta.pregunta)

  return (
    <div style={{ border: `1px solid ${d.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', background: d.card }}>
        {caso && <p style={{ fontSize: 11, color: d.text3, lineHeight: 1.6, marginBottom: 6 }}>{caso}</p>}
        <p style={{ fontSize: 12, fontWeight: 500, color: d.text1, lineHeight: 1.6, margin: 0 }}>{pText}</p>
      </div>
      {ei !== null && (
        <div style={{ background: isDark ? 'rgba(239,68,68,0.08)' : '#fff5f5', borderTop: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : '#fecaca'}`, padding: '10px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 500, color: isDark ? '#f87171' : '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Tu respuesta</p>
          <p style={{ fontSize: 11, fontWeight: 500, color: isDark ? '#fca5a5' : '#b91c1c', margin: '0 0 3px' }}>{LETRA[ei]} — {pregunta[OPCION_KEY[ei]]}</p>
          <p style={{ fontSize: 11, color: isDark ? '#fca5a5' : '#991b1b', lineHeight: 1.5, margin: 0 }}>{pregunta[EXPLICACION_KEY[ei]]}</p>
        </div>
      )}
      <div style={{ background: isDark ? 'rgba(34,197,94,0.08)' : '#f0fdf4', borderTop: `1px solid ${isDark ? 'rgba(34,197,94,0.2)' : '#86efac'}`, padding: '10px 14px' }}>
        <p style={{ fontSize: 10, fontWeight: 500, color: isDark ? '#4ade80' : '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Respuesta correcta</p>
        <p style={{ fontSize: 11, fontWeight: 500, color: isDark ? '#86efac' : '#15803d', margin: '0 0 3px' }}>{LETRA[ci]} — {pregunta[OPCION_KEY[ci]]}</p>
        <p style={{ fontSize: 11, color: isDark ? '#86efac' : '#166534', lineHeight: 1.5, margin: 0 }}>{pregunta[EXPLICACION_KEY[ci]]}</p>
      </div>
      <div style={{ padding: '8px 14px 12px', background: d.card, borderTop: `1px solid ${d.border}` }}>
        <ReporteInline pregunta={pregunta} d={d} />
      </div>
    </div>
  )
}

export default function SimulacroResult({ preguntas, respuestas, onNuevoSimulacro, onRevisarErrores }) {
  const { d, meta, isDark } = useTheme()
  const navigate = useNavigate()
  const [verTodas, setVerTodas] = useState(false)
  const total = preguntas.length
  const correctas = respuestas.filter(r => r.esCorrecta).length
  const porcentaje = Math.round((correctas / total) * 100)

  const getColor = (pct) => pct >= meta ? '#22c55e' : pct >= meta * 0.75 ? '#eab308' : '#ef4444'
  const getMensaje = (pct) => {
    if (pct >= meta) return '¡Excelente! Estás por encima de la meta.'
    if (pct >= meta * 0.75) return 'Buen intento. Seguí practicando.'
    return 'Hay que repasar. Vas a llegar.'
  }

  const porEspecialidad = {}
  preguntas.forEach((p, i) => {
    const key = p.especialidad || p.area || 'General'
    if (!porEspecialidad[key]) porEspecialidad[key] = { correctas: 0, total: 0 }
    porEspecialidad[key].total++
    if (respuestas[i]?.esCorrecta) porEspecialidad[key].correctas++
  })

  const errores = preguntas.map((p, i) => ({ pregunta: p, respuesta: respuestas[i] })).filter(({ respuesta }) => !respuesta?.esCorrecta)
  const aciertos = preguntas.map((p, i) => ({ pregunta: p, respuesta: respuestas[i] })).filter(({ respuesta }) => respuesta?.esCorrecta)

  const porSubtema = {}
  preguntas.forEach((p, i) => {
    const key = p.subtema || 'general'
    if (!porSubtema[key]) porSubtema[key] = { correctas: 0, total: 0 }
    porSubtema[key].total++
    if (respuestas[i]?.esCorrecta) porSubtema[key].correctas++
  })
  const subtemasARepasar = Object.entries(porSubtema)
    .filter(([, v]) => v.correctas < v.total)
    .sort((a, b) => (a[1].correctas / a[1].total) - (b[1].correctas / b[1].total))

  return (
    <div style={{ minHeight: '100vh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <DarkModeToggle />
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
          <p style={{ fontSize: 56, fontWeight: 500, color: getColor(porcentaje), margin: '0 0 8px' }}>{porcentaje}%</p>
          <p style={{ fontSize: 13, color: d.text2, margin: '0 0 4px' }}>{correctas} correctas de {total} preguntas</p>
          <p style={{ fontSize: 12, color: d.text3, margin: 0 }}>{getMensaje(porcentaje)}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'correctas', value: correctas, color: '#22c55e' },
            { label: 'incorrectas', value: total - correctas, color: '#ef4444' },
            { label: 'total', value: total, color: d.text1 },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: d.text3, margin: '0 0 4px' }}>{label}</p>
              <p style={{ fontSize: 20, fontWeight: 500, color, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Subtemas a repasar */}
        {subtemasARepasar.length > 0 && (
          <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 12px' }}>Subtemas a repasar</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {subtemasARepasar.map(([sub, { correctas: c, total: t }]) => {
                const pct = Math.round((c / t) * 100)
                const bg = pct === 0
                  ? (isDark ? 'rgba(239,68,68,0.12)' : '#fff5f5')
                  : (isDark ? 'rgba(234,179,8,0.12)' : '#fefce8')
                const color = pct === 0
                  ? (isDark ? '#f87171' : '#dc2626')
                  : (isDark ? '#fbbf24' : '#a16207')
                const border = pct === 0
                  ? (isDark ? 'rgba(239,68,68,0.3)' : '#fecaca')
                  : (isDark ? 'rgba(234,179,8,0.3)' : '#fde68a')
                return (
                  <div key={sub} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 10px' }}>
                    <p style={{ fontSize: 11, fontWeight: 500, color, margin: '0 0 1px' }}>
                      {sub.replace(/_/g, ' ').replace(/\w/g, l => l.toUpperCase())}
                    </p>
                    <p style={{ fontSize: 10, color, opacity: 0.8, margin: 0 }}>{c}/{t} correctas</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Por especialidad */}
        <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 16px' }}>Por especialidad</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(porEspecialidad).map(([esp, { correctas: c, total: t }]) => {
              const pct = Math.round((c / t) * 100)
              return (
                <div key={esp}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: d.text2 }}>{formatArea(esp)}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: getColor(pct) }}>{pct}% — {c}/{t}</span>
                  </div>
                  <div style={{ height: 4, background: d.track, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: getColor(pct), borderRadius: 99 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Toggle ver todas / solo errores */}
        {preguntas.length > 0 && (
          <div style={{ background: d.card2, borderRadius: 12, padding: 4, display: 'flex', gap: 4, marginBottom: 12 }}>
            {[
              { val: false, label: `Solo errores (${errores.length})` },
              { val: true, label: `Todas (${total})` },
            ].map(({ val, label }) => (
              <button key={String(val)} onClick={() => setVerTodas(val)} style={{
                flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 500, borderRadius: 9,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: verTodas === val ? d.card : 'transparent',
                color: verTodas === val ? d.text1 : d.text3
              }}>{label}</button>
            ))}
          </div>
        )}

        {/* Lista preguntas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {verTodas ? (
            preguntas.map((p, i) => {
              const r = respuestas[i]
              return r?.esCorrecta
                ? <PreguntaCorrecta key={p.id} pregunta={p} respuesta={r} d={d} isDark={isDark} />
                : <PreguntaFallada key={p.id} pregunta={p} respuesta={r} d={d} isDark={isDark} />
            })
          ) : (
            errores.length === 0
              ? <div style={{ textAlign: 'center', padding: '24px 0' }}><p style={{ fontSize: 13, color: d.text3 }}>¡Sin errores! Perfecto.</p></div>
              : errores.map(({ pregunta, respuesta }) => (
                  <PreguntaFallada key={pregunta.id} pregunta={pregunta} respuesta={respuesta} d={d} isDark={isDark} />
                ))
          )}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32 }}>
          {errores.length > 0 && (
            <button
              onClick={() => onRevisarErrores(errores.map(e => e.pregunta))}
              style={{ width: '100%', border: `1px solid ${d.border2}`, background: 'transparent', color: d.text1, borderRadius: 12, padding: '12px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Repasar errores ({errores.length})
            </button>
          )}
          <button
            onClick={onNuevoSimulacro}
            style={{ width: '100%', background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Nuevo simulacro
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ width: '100%', border: `1px solid ${d.border}`, background: 'transparent', color: d.text3, borderRadius: 12, padding: '12px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Ir al inicio
          </button>
        </div>

      </div>
    </div>
  )
}