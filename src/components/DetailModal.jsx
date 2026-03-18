import { useTheme } from '../hooks/useTheme'
import { formatArea, formatSubtema } from '../lib/formatArea'

export default function DetailModal({ pregunta, onCerrar }) {
  const { d } = useTheme()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onCerrar} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 560,
        background: d.card, borderRadius: '20px 20px 0 0',
        maxHeight: '88vh', overflowY: 'auto', zIndex: 10
      }}>
        <div style={{
          position: 'sticky', top: 0, background: d.card,
          borderBottom: `1px solid ${d.border}`,
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>Detalle extendido</p>
            <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>
              {formatArea(pregunta.area)}{pregunta.subtema ? ` · ${formatSubtema(pregunta.subtema)}` : ''}
              {pregunta.codigo && <span style={{ marginLeft: 8, opacity: 0.5 }}>{pregunta.codigo}</span>}
            </p>
          </div>
          <button onClick={onCerrar} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${d.border2}`, background: 'transparent', cursor: 'pointer', color: d.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ padding: '20px 20px 8px' }}>
          {(() => {
          const texto = pregunta.detalle_extendido || ''
          const parrafos = texto
            .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/)
            .filter(Boolean)
          return parrafos.map((p, i) => (
            <p key={i} style={{ fontSize: 13, color: d.text1, lineHeight: 1.75, margin: '0 0 8px' }}>
              {p}
            </p>
          ))
        })()}
        </div>

        {pregunta.bibliografia && (
          <div style={{ margin: '0 20px', padding: '14px', background: d.card2, borderRadius: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: '0 0 6px' }}>Bibliografía</p>
            <p style={{ fontSize: 12, color: d.text2, lineHeight: 1.6, margin: 0 }}>{pregunta.bibliografia}</p>
          </div>
        )}

        {(pregunta.anio_examen || pregunta.fuente) && (
          <div style={{ margin: '0 20px 12px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {pregunta.anio_examen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3 }}>Año examen</span>
                <span style={{ fontSize: 12, color: d.text2, background: d.card2, borderRadius: 6, padding: '2px 8px' }}>{pregunta.anio_examen}</span>
              </div>
            )}
            {pregunta.fuente && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3 }}>Fuente</span>
                <span style={{ fontSize: 12, color: d.text2, background: d.card2, borderRadius: 6, padding: '2px 8px' }}>{pregunta.fuente}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
  <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3 }}>ID</span>
  <span style={{ fontSize: 11, color: d.text3, background: d.card2, borderRadius: 6, padding: '2px 8px', fontFamily: 'monospace' }}>{pregunta.codigo}</span>
          </div>
          </div>
        )}

        <div style={{ padding: '8px 20px 28px' }}>
          <button onClick={onCerrar} style={{ width: '100%', background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}