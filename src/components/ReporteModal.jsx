import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { formatArea, formatSubtema } from '../lib/formatArea'
import { supabase } from '../lib/supabase'

const LETRAS = ['A', 'B', 'C', 'D']

export default function ReporteModal({ pregunta, onCerrar }) {
  const { d } = useTheme()
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onCerrar} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 560,
        background: d.card, borderRadius: '20px 20px 0 0',
        maxHeight: '88vh', overflowY: 'auto', zIndex: 10
      }}>

        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${d.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: '#7c3aed', margin: 0 }}>Reportar pregunta</p>
          </div>
          <button onClick={onCerrar} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${d.border2}`, background: 'transparent', cursor: 'pointer', color: d.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          {enviado ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: d.text1, margin: '0 0 8px' }}>Reporte enviado</p>
              <p style={{ fontSize: 13, color: d.text3, margin: '0 0 24px' }}>Lo revisaremos a la brevedad. Gracias por ayudar a mejorar el contenido.</p>
              <button onClick={onCerrar} style={{ width: '100%', background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 13, cursor: 'pointer' }}>Cerrar</button>
            </div>
          ) : (
            <>
              <div style={{ background: d.card2, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: d.text3, margin: '0 0 4px' }}>{formatArea(pregunta.area)}{pregunta.subtema ? ` · ${formatSubtema(pregunta.subtema)}` : ''}{pregunta.codigo ? ` · ${pregunta.codigo}` : ''}</p>
                <p style={{ fontSize: 13, color: d.text1, margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {pregunta.pregunta}
                </p>
              </div>

              <p style={{ fontSize: 12, fontWeight: 500, color: d.text2, margin: '0 0 8px' }}>¿Cuál creés que es la respuesta correcta?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
                {LETRAS.map(l => (
                  <button
                    key={l}
                    onClick={() => setRespuestaSugerida(l)}
                    style={{
                      padding: '10px 0', fontSize: 13, fontWeight: 500, borderRadius: 10,
                      border: `1px solid ${respuestaSugerida === l ? '#7c3aed' : d.border2}`,
                      background: respuestaSugerida === l ? 'rgba(167,139,250,0.15)' : 'transparent',
                      color: respuestaSugerida === l ? '#7c3aed' : d.text2,
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 12, fontWeight: 500, color: d.text2, margin: '0 0 8px' }}>Argumento <span style={{ color: d.text3, fontWeight: 400 }}>(requerido)</span></p>
              <textarea
                value={argumento}
                onChange={e => setArgumento(e.target.value)}
                placeholder="Explicá por qué creés que la respuesta es incorrecta o hay un error en la pregunta..."
                rows={4}
                style={{
                  width: '100%', background: d.card2, border: `1px solid ${d.border2}`,
                  borderRadius: 10, padding: '10px 12px', fontSize: 12, color: d.text1,
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  lineHeight: 1.6, fontFamily: 'inherit', marginBottom: 16
                }}
              />

              <button
                onClick={handleEnviar}
                disabled={enviando || !argumento.trim()}
                style={{
                  width: '100%', padding: '13px 0', fontSize: 13, fontWeight: 500,
                  background: argumento.trim() ? '#7c3aed' : d.card2,
                  color: argumento.trim() ? '#ffffff' : d.text3,
                  border: 'none', borderRadius: 12,
                  cursor: argumento.trim() ? 'pointer' : 'not-allowed',
                  opacity: enviando ? 0.6 : 1, transition: 'all 0.2s'
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}