import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTemasActivos } from '../hooks/useTemasActivos'
import { formatArea } from '../lib/formatArea'
import { useTheme } from '../hooks/useTheme'

export default function TemasActivos({ onCerrar }) {
  const { d } = useTheme()
  const [todasEspecialidades, setTodasEspecialidades] = useState([])
  const [loadingEsp, setLoadingEsp] = useState(true)
  const { temasActivos, loading, toggle } = useTemasActivos()

  useEffect(() => { cargarEspecialidades() }, [])

  const cargarEspecialidades = async () => {
    const { data } = await supabase
      .from('questions')
      .select('especialidad')
      .eq('estado', 'activo')
      .limit(2000)

    if (data) {
      const unicas = [...new Set(data.map(d => d.especialidad).filter(Boolean))].sort()
      setTodasEspecialidades(unicas)
    }
    setLoadingEsp(false)
  }

  if (loading || loadingEsp) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={onCerrar} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 560, background: d.card, borderRadius: '20px 20px 0 0', padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={onCerrar} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 560,
        background: d.card, borderRadius: '20px 20px 0 0',
        maxHeight: '85vh', overflowY: 'auto', zIndex: 10
      }}>

        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, background: d.card,
          borderBottom: `1px solid ${d.border}`,
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>Mis temas activos</p>
            <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>Tildá los temas que ya estudiaste</p>
          </div>
          <button
            onClick={onCerrar}
            style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${d.border2}`, background: 'transparent', cursor: 'pointer', color: d.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: '16px 20px 28px' }}>
          <p style={{ fontSize: 11, color: d.text3, margin: '0 0 14px' }}>
            {temasActivos.length} de {todasEspecialidades.length} temas activos
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {todasEspecialidades.map(esp => {
              const activo = temasActivos.includes(esp)
              return (
                <button
                  key={esp}
                  onClick={() => toggle(esp)}
                  style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: activo ? d.btnBg : 'transparent',
                    color: activo ? d.btnText : d.text2,
                    border: `1px solid ${activo ? d.btnBg : d.border2}`
                  }}
                >
                  {formatArea(esp)}
                </button>
              )
            })}
          </div>

          <button
            onClick={onCerrar}
            style={{ width: '100%', background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}