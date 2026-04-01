import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../hooks/useTheme'
import QuestionPlayer from '../components/QuestionPlayer'
import DarkModeToggle from '../components/DarkModeToggle'
import confetti from 'canvas-confetti'
import { seleccionarPreguntas } from '../lib/spacedRepetition'
import { formatArea, formatSubtema } from '../lib/formatArea'


const OPCIONES = ['opcion_a','opcion_b','opcion_c','opcion_d']
const LETRAS = ['A','B','C','D']

function PreguntasQueFallaste({ incorrectas, d }) {
  const [expandida, setExpandida] = useState(null)

  return (
    <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: d.text3, margin: '0 0 12px' }}>
        Preguntas que fallaste
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {incorrectas.map((r, i) => {
          const abierta = expandida === i
          const p = r.preguntaObj
          const correctaIdx = LETRAS.indexOf(r.respuestaCorrecta)
          const dadaIdx = LETRAS.indexOf(r.respuestaDada)

          return (
            <div
              key={i}
              onClick={() => setExpandida(abierta ? null : i)}
              style={{
                background: d.card2, borderRadius: 10,
                border: `1px solid ${abierta ? d.border2 : 'transparent'}`,
                cursor: 'pointer', transition: 'border-color 0.15s', overflow: 'hidden'
              }}
            >
              <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: d.text1, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: abierta ? 'normal' : 'nowrap' }}>
                    {r.pregunta}
                  </p>
                  <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>
                    {formatSubtema(r.subtema)} · Tu resp: {r.respuestaDada} · Correcta: {r.respuestaCorrecta}
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={d.text3} strokeWidth="2" style={{ flexShrink: 0, transform: abierta ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/>
                </svg>
              </div>

              {abierta && p && (
                <div style={{ padding: '0 12px 14px', borderTop: `1px solid ${d.border}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                    {OPCIONES.map((key, idx) => {
                      const esCorrecta = idx === correctaIdx
                      const esDada = idx === dadaIdx
                      const bg = esCorrecta
                        ? 'rgba(34,197,94,0.12)'
                        : esDada ? 'rgba(239,68,68,0.10)' : 'transparent'
                      const border = esCorrecta
                        ? 'rgba(34,197,94,0.4)'
                        : esDada ? 'rgba(239,68,68,0.35)' : d.border
                      const colorLetra = esCorrecta ? '#22c55e' : esDada ? '#ef4444' : d.text3
                      const colorTexto = esCorrecta ? '#15803d' : esDada ? '#b91c1c' : d.text2
                      const opacity = (!esCorrecta && !esDada) ? 0.4 : 1

                      return (
                        <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 8, background: bg, border: `1px solid ${border}`, opacity }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: colorLetra, flexShrink: 0, marginTop: 1 }}>{LETRAS[idx]}</span>
                          <span style={{ fontSize: 12, color: colorTexto, lineHeight: 1.5 }}>{p[key]}</span>
                        </div>
                      )
                    })}
                  </div>
                  {p.explicacion_a && (
                    <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                      <p style={{ fontSize: 11, color: '#15803d', margin: 0, lineHeight: 1.5 }}>
                        {p[`explicacion_${r.respuestaCorrecta.toLowerCase()}`]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Practice() {
  const { modo, especialidad } = useParams()
  const [searchParams] = useSearchParams()
  const { d, meta } = useTheme()
  const especialidadDecoded = especialidad ? decodeURIComponent(especialidad) : null
  const listaSubtemas = searchParams.get('lista')?.split(',').map(decodeURIComponent) || null
  const idsDirectos = searchParams.get('ids')?.split(',') || null
  const cantidad = parseInt(searchParams.get('cantidad') || '10')

  const [preguntas, setPreguntas] = useState([])
  const [actual, setActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [respuestas, setRespuestas] = useState([])
  const [finalizado, setFinalizado] = useState(false)
  const [pctAnterior, setPctAnterior] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()

    let todasPreguntas = []
    if (idsDirectos) {
      const { data } = await supabase.from('questions').select('*').in('id', idsDirectos).eq('estado', 'activo')
      todasPreguntas = data || []
    } else {
      let query = supabase.from('questions').select('*').eq('estado', 'activo')
      if (especialidadDecoded && especialidadDecoded !== 'mixto') query = query.eq('especialidad', especialidadDecoded)
      if (listaSubtemas) query = query.in('subtema', listaSubtemas)
      const { data } = await query.limit(1000)
      todasPreguntas = data || []
    }
    if (!todasPreguntas?.length) { setError('No hay preguntas disponibles.'); setLoading(false); return }

    const { data: intentos } = await supabase
      .from('attempts')
      .select('question_id, es_correcta, timestamp')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(5000)

    // calcular pct sesión anterior para comparativa
    if (intentos?.length) {
      const sesionesAnteriores = agruparSesiones(intentos)
      if (sesionesAnteriores.length > 0) setPctAnterior(sesionesAnteriores[0].pct)
    }

    let pool = todasPreguntas
    if (modo === 'errores') {
      const idsConError = new Set(intentos?.filter(i => !i.es_correcta).map(i => i.question_id))
      pool = todasPreguntas.filter(p => idsConError.has(p.id))
      if (!pool.length) { setError('¡No tenés errores en esta área!'); setLoading(false); return }
    }

    setPreguntas(seleccionarPreguntas(pool, intentos || [], cantidad))
    setRespuestas([])
    setLoading(false)
  }

  const agruparSesiones = (intentos) => {
    const grupos = {}
    intentos.forEach(({ timestamp, es_correcta, modo: m }) => {
      if (m !== 'practica') return
      const key = timestamp.split('T')[0]
      if (!grupos[key]) grupos[key] = { correctas: 0, total: 0 }
      grupos[key].total++
      if (es_correcta) grupos[key].correctas++
    })
    return Object.values(grupos)
      .map(({ correctas, total }) => ({ pct: Math.round((correctas / total) * 100) }))
      .slice(0, 5)
  }

  const handleResponder = async (esCorrecta, indexSeleccionado) => {
    const { data: { user } } = await supabase.auth.getUser()
    const pregunta = preguntas[actual]
    await supabase.from('attempts').insert({
      user_id: user.id,
      question_id: pregunta.id,
      es_correcta: esCorrecta,
      modo: modo === 'rapido' ? 'practica' : 'practica'
    })
    setRespuestas(prev => [...prev, {
      preguntaObj: pregunta, 
      pregunta: pregunta.pregunta,
      subtema: pregunta.subtema || 'General',
      area: pregunta.area,
      esCorrecta,
      respuestaDada: ['A','B','C','D'][indexSeleccionado],
      respuestaCorrecta: pregunta.respuesta_correcta.toUpperCase()
    }])
  }

  const handleSiguiente = () => {
    if (actual + 1 >= preguntas.length) setFinalizado(true)
    else setActual(p => p + 1)
  }

  const volverAtras = () => navigate(`/practice/modo/${modo}`)

  const getColor = (pct) => pct >= meta ? '#22c55e' : pct >= meta * 0.75 ? '#eab308' : '#ef4444'

  const getMensaje = (pct) => {
    if (pct >= meta) return `¡Excelente! Superaste tu meta del ${meta}%.`
    if (pct >= meta * 0.75) return `Vas bien, pero todavía hay margen para mejorar.`
    return `Hay áreas para trabajar. ¡El repaso te va a ayudar!`
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg, padding: '0 16px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: d.text2, marginBottom: 16 }}>{error}</p>
        <button onClick={volverAtras} style={{ fontSize: 13, color: d.text1, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Volver</button>
      </div>
    </div>
  )

  if (finalizado) {
    const total = respuestas.length
    const correctasTotal = respuestas.filter(r => r.esCorrecta).length
    const pct = Math.round((correctasTotal / total) * 100)
    const incorrectas = respuestas.filter(r => !r.esCorrecta)
    const comparativa = pctAnterior !== null ? pct - pctAnterior : null

    // por subtema
    const porSubtema = {}
    respuestas.forEach(({ subtema, esCorrecta }) => {
      if (!porSubtema[subtema]) porSubtema[subtema] = { correctas: 0, total: 0 }
      porSubtema[subtema].total++
      if (esCorrecta) porSubtema[subtema].correctas++
    })
    const subtemaStats = Object.entries(porSubtema)
      .map(([s, { correctas, total }]) => ({ subtema: s, pct: Math.round((correctas / total) * 100) }))
      .sort((a, b) => b.pct - a.pct)

    if (pct >= meta) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#22c55e','#86efac','#ffffff'] })

    return (
      <div style={{ minHeight: '100vh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
            <p style={{ fontSize: 56, fontWeight: 500, color: getColor(pct), margin: '0 0 8px' }}>{pct}%</p>
            <p style={{ fontSize: 13, color: d.text2, margin: '0 0 4px' }}>
              {correctasTotal} correctas de {total} preguntas{especialidadDecoded && especialidadDecoded !== 'mixto' ? ` · ${formatArea(especialidadDecoded)}` : ''}
            </p>
            <p style={{ fontSize: 12, color: d.text3, margin: 0 }}>{getMensaje(pct)}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'correctas', value: correctasTotal, color: '#22c55e' },
              { label: 'incorrectas', value: total - correctasTotal, color: '#ef4444' },
              {
                label: 'vs anterior',
                value: comparativa === null ? '—' : comparativa > 0 ? `+${comparativa}%` : comparativa === 0 ? '=' : `${comparativa}%`,
                color: comparativa > 0 ? '#22c55e' : comparativa < 0 ? '#ef4444' : d.text1
              }
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: d.text3, margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 500, color, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {subtemaStats.length > 1 && (
            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: d.text3, margin: '0 0 14px' }}>Por subtema</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {subtemaStats.map(({ subtema, pct: p }) => (
                  <div key={subtema}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: d.text2 }}>{formatSubtema(subtema)}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: getColor(p) }}>{p}%</span>
                    </div>
                    <div style={{ height: 4, background: d.track, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${p}%`, height: '100%', background: getColor(p), borderRadius: 99, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {incorrectas.length > 0 && (
            <PreguntasQueFallaste incorrectas={incorrectas} d={d} />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => { setActual(0); setRespuestas([]); setFinalizado(false); cargar() }}
              style={{ width: '100%', background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Otra ronda
            </button>
            {incorrectas.length > 0 && (
              <button
                onClick={() => navigate(`/practice/modo/errores`)}
                style={{ width: '100%', background: 'transparent', color: d.text2, border: `1px solid ${d.border2}`, borderRadius: 12, padding: '13px 0', fontSize: 13, cursor: 'pointer' }}
              >
                Repasar solo los errores
              </button>
            )}
            <button
              onClick={volverAtras}
              style={{ fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '8px 0' }}
            >
              Volver
            </button>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={volverAtras} style={{ fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Salir</button>
          <DarkModeToggle />
          <span style={{ fontSize: 12, color: d.text3 }}>{modo === 'errores' ? 'Repaso' : 'Práctica'}</span>
        </div>
        <QuestionPlayer
          pregunta={preguntas[actual]}
          total={preguntas.length}
          actual={actual + 1}
          onResponder={handleResponder}
          onSiguiente={handleSiguiente}
          mostrarArea={true}
        />
      </div>
    </div>
  )
}