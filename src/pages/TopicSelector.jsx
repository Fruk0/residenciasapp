import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import DarkModeToggle from '../components/DarkModeToggle'

const MODOS = [
  { id: 'practica', titulo: 'Práctica', desc: 'Elegís área, subtemas y cantidad. Feedback inmediato.' },
  { id: 'errores', titulo: 'Repasar errores', desc: 'Solo las preguntas que respondiste mal. Sin configuración.' }
]

export default function TopicSelector() {
  const { d } = useTheme()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: d.text1, margin: '0 0 4px' }}>Practicar.</h1>
            <p style={{ fontSize: 13, color: d.text3, margin: 0 }}>¿Cómo querés practicar hoy?</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DarkModeToggle />
            <button
              onClick={() => navigate('/')}
              style={{ fontSize: 12, color: d.text2, border: `1px solid ${d.border2}`, borderRadius: 10, padding: '6px 14px', background: d.card, cursor: 'pointer' }}
            >
              Inicio
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MODOS.map(({ id, titulo, desc }) => (
            <button
              key={id}
              onClick={() => navigate(`/practice/modo/${id}`)}
              style={{
                width: '100%', textAlign: 'left', background: d.card,
                border: `1px solid ${d.border}`, borderRadius: 16,
                padding: '20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'border-color 0.15s'
              }}
            >
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: d.text1, margin: '0 0 4px' }}>{titulo}</p>
                <p style={{ fontSize: 12, color: d.text3, margin: 0 }}>{desc}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={d.text3} strokeWidth="2" style={{ flexShrink: 0, marginLeft: 12 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}