import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../hooks/useTheme'

const PASOS = 2

export default function Onboarding() {
  const { d } = useTheme()
  const [paso, setPaso] = useState(1)
  const [fechaExamen, setFechaExamen] = useState('')
  const [meta, setMeta] = useState(80)
  const [guardando, setGuardando] = useState(false)
  const navigate = useNavigate()

  const handleFinalizar = async () => {
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('users').update({
      meta_aciertos: meta,
      ...(fechaExamen ? { fecha_examen: fechaExamen } : {})
    }).eq('id', user.id)
    setGuardando(false)
    navigate('/')
  }

  const diasParaExamen = () => {
    if (!fechaExamen) return null
    const diff = Math.ceil((new Date(fechaExamen) - new Date()) / 86400000)
    return diff > 0 ? diff : null
  }

  const dias = diasParaExamen()

  return (
    <div style={{ minHeight: '100dvh', background: d.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', transition: 'background 0.2s' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Progreso */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40, justifyContent: 'center' }}>
          {Array.from({ length: PASOS }).map((_, i) => (
            <div key={i} style={{ height: 3, width: 32, borderRadius: 99, background: i < paso ? d.text1 : d.border, transition: 'background 0.3s' }} />
          ))}
        </div>

        {paso === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: 40, marginBottom: 20, textAlign: 'center' }}>📅</div>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: d.text1, margin: '0 0 8px', textAlign: 'center' }}>¿Cuándo es tu examen?</h1>
            <p style={{ fontSize: 14, color: d.text3, margin: '0 0 32px', textAlign: 'center', lineHeight: 1.6 }}>
              Usamos la fecha para mostrarte cuánto tiempo te queda y ayudarte a priorizar.
            </p>

            <input
              type="date"
              value={fechaExamen}
              onChange={e => setFechaExamen(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%', background: d.card, border: `1px solid ${d.border2}`,
                borderRadius: 12, padding: '14px 16px', fontSize: 15, color: d.text1,
                outline: 'none', boxSizing: 'border-box', marginBottom: 12,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            />

            {dias && (
              <p style={{ fontSize: 13, color: d.text3, textAlign: 'center', marginBottom: 24 }}>
                Faltan <strong style={{ color: d.text1 }}>{dias} días</strong> para tu examen
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: dias ? 0 : 24 }}>
              <button
                onClick={() => setPaso(2)}
                style={{ width: '100%', background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
              >
                Continuar
              </button>
              <button
                onClick={() => setPaso(2)}
                style={{ width: '100%', background: 'transparent', color: d.text3, border: 'none', borderRadius: 12, padding: '10px 0', fontSize: 13, cursor: 'pointer' }}
              >
                Aún no sé la fecha
              </button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: 40, marginBottom: 20, textAlign: 'center' }}>🎯</div>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: d.text1, margin: '0 0 8px', textAlign: 'center' }}>¿Cuál es tu meta?</h1>
            <p style={{ fontSize: 14, color: d.text3, margin: '0 0 32px', textAlign: 'center', lineHeight: 1.6 }}>
              El examen de residencias requiere aprox. 60-70% para aprobar. Te recomendamos apuntar al 80%.
            </p>

            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: '24px 20px', marginBottom: 24 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 52, fontWeight: 500, color: meta >= 80 ? '#22c55e' : meta >= 65 ? '#eab308' : '#ef4444', margin: 0, lineHeight: 1, transition: 'color 0.2s' }}>{meta}%</p>
                <p style={{ fontSize: 12, color: d.text3, marginTop: 6 }}>
                  {meta >= 80 ? 'Meta exigente — excelente' : meta >= 65 ? 'Meta razonable' : 'Meta mínima — considerá subir un poco'}
                </p>
              </div>

              <input
                type="range"
                min={50} max={95} step={5}
                value={meta}
                onChange={e => setMeta(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: meta >= 80 ? '#22c55e' : meta >= 65 ? '#eab308' : '#ef4444' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: d.text3 }}>50%</span>
                <span style={{ fontSize: 10, color: d.text3 }}>95%</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setPaso(1)}
                style={{ flex: 1, background: 'transparent', color: d.text3, border: `1px solid ${d.border2}`, borderRadius: 12, padding: '14px 0', fontSize: 14, cursor: 'pointer' }}
              >
                Volver
              </button>
              <button
                onClick={handleFinalizar}
                disabled={guardando}
                style={{ flex: 2, background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: guardando ? 0.6 : 1 }}
              >
                {guardando ? 'Guardando...' : 'Empezar'}
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}