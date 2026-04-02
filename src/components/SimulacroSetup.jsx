import { useState } from 'react'
import { useTemasActivos } from '../hooks/useTemasActivos'
import TemasActivos from './TemasActivos'
import { useTheme } from '../hooks/useTheme'
import { formatArea } from '../lib/formatArea'

const OPCIONES_CANTIDAD = [10, 20, 30, 50]

export default function SimulacroSetup({ onIniciar, onVolver }) {
  const { d } = useTheme()
  const { temasActivos, loading, cargar } = useTemasActivos()
  const [areasSeleccionadas, setAreasSeleccionadas] = useState(null)
  const [cantidad, setCantidad] = useState(20)
  const [timerActivo, setTimerActivo] = useState(false)
  const [mostrarTemasActivos, setMostrarTemasActivos] = useState(false)

  const areas = areasSeleccionadas ?? temasActivos

  const handleCerrarTemas = async () => {
    await cargar()
    setAreasSeleccionadas(null)
    setMostrarTemasActivos(false)
  }

  const toggleArea = (area) => {
    const base = areasSeleccionadas ?? temasActivos
    const nuevas = base.includes(area)
      ? base.filter(a => a !== area)
      : [...base, area]
    setAreasSeleccionadas(nuevas)
  }

  const handleIniciar = () => {
    if (areas.length === 0) return
    onIniciar({ areas, cantidad, timerActivo, segundosPorPregunta: 90 })
  }

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <>
      <div style={{ minHeight: '100dvh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>

          <button
            onClick={onVolver}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6"/>
            </svg>
            Inicio
          </button>

          <h1 style={{ fontSize: 22, fontWeight: 500, color: d.text1, margin: '0 0 4px' }}>Simulacro.</h1>
          <p style={{ fontSize: 13, color: d.text3, margin: '0 0 28px' }}>Configurá tu examen personalizado.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>


            {/* Especialidades */}
            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: 0 }}>Especialidades</p>
                <button
                  onClick={() => setMostrarTemasActivos(true)}
                  style={{ fontSize: 12, color: d.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  Editar mis temas
                </button>
              </div>

              {temasActivos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: 13, color: d.text3, marginBottom: 10 }}>No tenés temas activos todavía.</p>
                  <button onClick={() => setMostrarTemasActivos(true)} style={{ fontSize: 13, color: d.text1, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Activar temas
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {temasActivos.map(area => {
                    const sel = areas.includes(area)
                    return (
                      <button
                        key={area}
                        onClick={() => toggleArea(area)}
                        style={{
                          padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.15s',
                          background: sel ? d.btnBg : 'transparent',
                          color: sel ? d.btnText : d.text3,
                          border: `1px solid ${sel ? d.btnBg : d.border2}`
                        }}
                      >
                        {formatArea(area)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Cantidad */}
            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 14px' }}>Cantidad de preguntas</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {OPCIONES_CANTIDAD.map(n => (
                  <button
                    key={n}
                    onClick={() => setCantidad(n)}
                    style={{
                      padding: '12px 0', fontSize: 13, fontWeight: 500, borderRadius: 12,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: cantidad === n ? d.btnBg : 'transparent',
                      color: cantidad === n ? d.btnText : d.text2,
                      border: `1px solid ${cantidad === n ? d.btnBg : d.border2}`
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 3px' }}>Timer</p>
                  <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>1.5 minutos por pregunta</p>
                </div>
                <button
                  onClick={() => setTimerActivo(!timerActivo)}
                  style={{
                    width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: timerActivo ? d.btnBg : d.track,
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0
                  }}
                >
                  <div style={{
                    width: 20, height: 20, background: '#ffffff', borderRadius: '50%',
                    position: 'absolute', top: 3,
                    left: timerActivo ? 25 : 3,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>
            </div>

            {/* Resumen */}
            <div style={{ background: d.card2, border: `1px solid ${d.border}`, borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: d.text3, margin: 0 }}>
                {areas.length > 0
                  ? `${areas.length} especialidad${areas.length > 1 ? 'es' : ''} · ${cantidad} preguntas${timerActivo ? ` · ${Math.round(cantidad * 1.5)} min máx` : ''}`
                  : 'Seleccioná al menos una especialidad'}
              </p>
            </div>

            <button
              onClick={handleIniciar}
              disabled={areas.length === 0}
              style={{
                width: '100%', background: d.btnBg, color: d.btnText, border: 'none',
                borderRadius: 14, padding: '14px 0', fontSize: 14, fontWeight: 500,
                cursor: areas.length === 0 ? 'not-allowed' : 'pointer',
                opacity: areas.length === 0 ? 0.4 : 1, transition: 'opacity 0.2s'
              }}
            >
              Iniciar simulacro
            </button>

          </div>
        </div>
      </div>

      {mostrarTemasActivos && <TemasActivos onCerrar={handleCerrarTemas} />}
    </>
  )
}