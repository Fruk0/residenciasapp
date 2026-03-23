import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../hooks/useTheme'
import DarkModeToggle from '../components/DarkModeToggle'

function generarCodigo() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

function UserCard({ user, reportesCount, d, onToggleBloqueo, onEliminar, onToggleAdmin }) {
  const [expandido, setExpandido] = useState(false)
  const pct = user.stats.total ? Math.round((user.stats.correctas / user.stats.total) * 100) : null
  const getColor = (p) => p === null ? d.text3 : p >= 80 ? '#22c55e' : p >= 60 ? '#eab308' : '#ef4444'
  const formatFecha = (s) => s ? new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'

  return (
    <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, overflow: 'hidden' }}>
      <button
        onClick={() => setExpandido(p => !p)}
        style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: d.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: d.text2 }}>{(user.nombre || user.email || '?')[0].toUpperCase()}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.nombre || user.email?.split('@')[0] || 'Sin nombre'}
            </p>
            <p style={{ fontSize: 11, color: d.text3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
          {user.role === 'admin' && <span style={{ fontSize: 10, background: d.btnBg, color: d.btnText, borderRadius: 4, padding: '2px 6px' }}>admin</span>}
          <span style={{ fontSize: 10, background: user.estado_cuenta === 'bloqueado' ? '#fee2e2' : '#dcfce7', color: user.estado_cuenta === 'bloqueado' ? '#dc2626' : '#15803d', borderRadius: 4, padding: '2px 6px' }}>{user.estado_cuenta || 'activo'}</span>
          {pct !== null && <span style={{ fontSize: 12, fontWeight: 500, color: getColor(pct) }}>{pct}%</span>}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={d.text3} strokeWidth="2" style={{ transform: expandido ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </button>

      {expandido && (
        <div style={{ borderTop: `1px solid ${d.border}`, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Meta', value: `${user.meta_aciertos || 80}%`, color: d.text1 },
              { label: 'Preguntas', value: user.stats.total, color: d.text1 },
              { label: 'Aciertos', value: pct !== null ? `${pct}%` : '—', color: getColor(pct) },
              { label: 'Reportes', value: reportesCount, color: reportesCount > 0 ? '#7c3aed' : d.text1 },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: d.card2, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: d.text3, margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontSize: 18, fontWeight: 500, color, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: d.text3, margin: '0 0 14px' }}>Registro: {formatFecha(user.created_at)} · Correctas: {user.stats.correctas}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => onToggleAdmin(user.id, user.role)}
              style={{ fontSize: 12, padding: '7px 14px', borderRadius: 9, border: `1px solid ${user.role === 'admin' ? '#fca5a5' : 'rgba(167,139,250,0.4)'}`, background: user.role === 'admin' ? '#fff5f5' : 'rgba(167,139,250,0.08)', color: user.role === 'admin' ? '#dc2626' : '#7c3aed', cursor: 'pointer' }}
            >
              {user.role === 'admin' ? 'Quitar admin' : 'Dar admin'}
            </button>
            <button
              onClick={() => onToggleBloqueo(user.id, user.estado_cuenta)}
              style={{ fontSize: 12, padding: '7px 14px', borderRadius: 9, border: `1px solid ${user.estado_cuenta === 'bloqueado' ? '#86efac' : '#fca5a5'}`, background: user.estado_cuenta === 'bloqueado' ? '#f0fdf4' : '#fff5f5', color: user.estado_cuenta === 'bloqueado' ? '#15803d' : '#dc2626', cursor: 'pointer' }}
            >
              {user.estado_cuenta === 'bloqueado' ? 'Activar' : 'Bloquear'}
            </button>
            <button
              onClick={() => onEliminar(user.id, user.email)}
              style={{ fontSize: 12, padding: '7px 14px', borderRadius: 9, border: `1px solid ${d.border2}`, background: 'transparent', color: d.text3, cursor: 'pointer' }}
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const { d } = useTheme()
  const [usuarios, setUsuarios] = useState([])
  const [invitaciones, setInvitaciones] = useState([])
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [copiado, setCopiado] = useState(null)
  const [tab, setTab] = useState('usuarios')
  const [emailInvite, setEmailInvite] = useState('')
  const [preguntasStats, setPreguntasStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    const [{ data: users }, { data: invites }, { data: attempts }, { data: reps }, { data: preguntas }] = await Promise.all([
      supabase.from('users').select('id, email, nombre, role, estado_cuenta, created_at, meta_aciertos').order('created_at', { ascending: false }),
      supabase.from('invitations').select('*').order('created_at', { ascending: false }),
      supabase.from('attempts').select('user_id, es_correcta'),
      supabase.from('reportes').select('*, users(nombre, email)').order('created_at', { ascending: false }),
      supabase.from('questions').select('especialidad, subtema, estado').eq('estado', 'activo').limit(2000)
    ])
    const statsMap = {}
    attempts?.forEach(({ user_id, es_correcta }) => {
      if (!statsMap[user_id]) statsMap[user_id] = { total: 0, correctas: 0 }
      statsMap[user_id].total++; if (es_correcta) statsMap[user_id].correctas++
    })
    const reportesPorUsuario = {}
    reps?.forEach(r => {
      if (!reportesPorUsuario[r.user_id]) reportesPorUsuario[r.user_id] = 0
      reportesPorUsuario[r.user_id]++
    })
    setUsuarios((users || []).map(u => ({ ...u, stats: statsMap[u.id] || { total: 0, correctas: 0 }, reportesCount: reportesPorUsuario[u.id] || 0 })))
    setInvitaciones(invites || [])
    setReportes(reps || [])

    if (preguntas) {
      const porEspecialidad = {}
      preguntas.forEach(({ especialidad, subtema }) => {
        const esp = especialidad || 'sin_especialidad'
        if (!porEspecialidad[esp]) porEspecialidad[esp] = { total: 0, subtemas: {} }
        porEspecialidad[esp].total++
        const sub = subtema || 'general'
        if (!porEspecialidad[esp].subtemas[sub]) porEspecialidad[esp].subtemas[sub] = 0
        porEspecialidad[esp].subtemas[sub]++
      })
      setPreguntasStats({ total: preguntas.length, porEspecialidad })
    }
    setLoading(false)
  }

  const generarInvitacion = async () => {
    if (!emailInvite.trim()) return
    setGenerando(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('invitations').insert({
      codigo: generarCodigo(),
      creado_por: user.id,
      activo: true,
      email_destinatario: emailInvite.trim().toLowerCase()
    })
    setEmailInvite('')
    await cargar()
    setGenerando(false)
  }

  const copiarLink = (codigo) => {
    navigator.clipboard.writeText(`${window.location.origin}/register?invite=${codigo}`)
    setCopiado(codigo); setTimeout(() => setCopiado(null), 2000)
  }

  const desactivar = async (id) => { await supabase.from('invitations').delete().eq('id', id); await cargar() }
  const toggleBloqueo = async (userId, estado) => { await supabase.from('users').update({ estado_cuenta: estado === 'activo' ? 'bloqueado' : 'activo' }).eq('id', userId); await cargar() }
  const eliminar = async (userId, email) => {
  if (!window.confirm(`¿Eliminar a ${email}?`)) return
  await supabase.rpc('eliminar_usuario', { p_user_id: userId })
  await cargar()
}
  const toggleAdmin = async (userId, role) => {
    if (!window.confirm(role === 'admin' ? '¿Quitar permisos de admin?' : '¿Dar permisos de admin a este usuario?')) return
    await supabase.from('users').update({ role: role === 'admin' ? 'user' : 'admin' }).eq('id', userId)
    await cargar()
  }
  const marcarReporte = async (id, estado) => { await supabase.from('reportes').update({ estado }).eq('id', id); await cargar() }

  const formatFechaHora = (s) => s ? new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

  const invActivas = invitaciones.filter(i => i.activo && !i.usado_por)
  const invUsadas = invitaciones.filter(i => i.usado_por)
  const reportesPendientes = reportes.filter(r => r.estado === 'pendiente')

  const TABS = [
    { id: 'usuarios', label: `Usuarios (${usuarios.length})` },
    { id: 'reportes', label: `Reportes${reportesPendientes.length > 0 ? ` (${reportesPendientes.length})` : ''}` },
    { id: 'invitaciones', label: `Invitaciones (${invActivas.length})` },
    { id: 'banco', label: 'Banco' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.bg }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${d.text1}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: d.bg, padding: '32px 16px', transition: 'background 0.2s' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: d.text1, margin: '0 0 4px' }}>Panel admin.</h1>
            <p style={{ fontSize: 12, color: d.text3, margin: 0 }}>{usuarios.length} usuarios · {invActivas.length} invitaciones · {reportesPendientes.length} reportes pendientes</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DarkModeToggle />
            <button onClick={() => navigate('/')} style={{ fontSize: 12, color: d.text3, border: `1px solid ${d.border2}`, borderRadius: 10, padding: '6px 14px', background: 'transparent', cursor: 'pointer' }}>Salir</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, background: d.card2, borderRadius: 14, padding: 4, marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: tab === t.id ? d.card : 'transparent',
              color: t.id === 'reportes' && reportesPendientes.length > 0 && tab !== 'reportes' ? '#7c3aed' : tab === t.id ? d.text1 : d.text3,
              transition: 'all 0.15s'
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'usuarios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {usuarios.map(user => (
              <UserCard key={user.id} user={user} reportesCount={user.reportesCount} d={d}
                onToggleBloqueo={toggleBloqueo} onEliminar={eliminar} onToggleAdmin={toggleAdmin} />
            ))}
          </div>
        )}

        {tab === 'reportes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reportes.length === 0 ? (
              <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 18, padding: 40, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: d.text3, margin: 0 }}>No hay reportes todavía.</p>
              </div>
            ) : reportes.map(r => (
              <div key={r.id} style={{ background: d.card, border: `1px solid ${r.estado === 'pendiente' ? 'rgba(167,139,250,0.4)' : d.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: r.estado === 'pendiente' ? 'rgba(167,139,250,0.15)' : r.estado === 'resuelto' ? '#dcfce7' : d.card2, color: r.estado === 'pendiente' ? '#7c3aed' : r.estado === 'resuelto' ? '#15803d' : d.text3 }}>{r.estado}</span>
                    {r.codigo_pregunta && <span style={{ fontSize: 10, color: d.text3, fontFamily: 'monospace', background: d.card2, padding: '2px 6px', borderRadius: 6 }}>{r.codigo_pregunta}</span>}
                    <span style={{ fontSize: 10, color: d.text3 }}>{formatFechaHora(r.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: d.text2, margin: '0 0 4px' }}>{r.users?.nombre || r.users?.email || 'Usuario'}</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 8px', lineHeight: 1.5 }}>{r.pregunta}</p>
                  {r.respuesta_sugerida && <p style={{ fontSize: 12, color: d.text2, margin: '0 0 8px' }}>Respuesta sugerida: <strong style={{ color: d.text1 }}>{r.respuesta_sugerida}</strong></p>}
                  <div style={{ background: d.card2, borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, color: d.text2, margin: 0, lineHeight: 1.6 }}>{r.argumento}</p>
                  </div>
                </div>
                {r.estado === 'pendiente' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => marcarReporte(r.id, 'resuelto')} style={{ fontSize: 11, padding: '6px 14px', borderRadius: 8, border: '1px solid #86efac', background: '#f0fdf4', color: '#15803d', cursor: 'pointer' }}>Marcar resuelto</button>
                    <button onClick={() => marcarReporte(r.id, 'descartado')} style={{ fontSize: 11, padding: '6px 14px', borderRadius: 8, border: `1px solid ${d.border2}`, background: 'transparent', color: d.text3, cursor: 'pointer' }}>Descartar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'invitaciones' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: '0 0 12px' }}>Nueva invitación</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={emailInvite}
                  onChange={e => setEmailInvite(e.target.value)}
                  placeholder="email@destinatario.com"
                  onKeyDown={e => e.key === 'Enter' && generarInvitacion()}
                  style={{ flex: 1, background: d.card2, border: `1px solid ${d.border2}`, borderRadius: 10, padding: '9px 12px', fontSize: 13, color: d.text1, outline: 'none', fontFamily: 'inherit' }}
                />
                <button
                  onClick={generarInvitacion}
                  disabled={generando || !emailInvite.trim()}
                  style={{ background: d.btnBg, color: d.btnText, border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, cursor: emailInvite.trim() ? 'pointer' : 'not-allowed', opacity: (!emailInvite.trim() || generando) ? 0.4 : 1, whiteSpace: 'nowrap' }}
                >
                  {generando ? '...' : 'Generar link'}
                </button>
              </div>
            </div>


            {invitaciones.length > 0 && (
              <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: '0 0 12px' }}>
                  Invitaciones ({invitaciones.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...invitaciones].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(inv => (
                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: d.card2, borderRadius: 12, padding: '10px 14px', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 500, color: inv.usado_por ? d.text3 : d.text1, margin: '0 0 2px', textDecoration: inv.usado_por ? 'line-through' : 'none' }}>
                          {inv.codigo}
                        </p>
                        <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>
                          {inv.email_destinatario || 'Sin email asignado'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                        {inv.usado_por ? (
                          <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 500 }}>
                            ✓ Aceptada
                          </span>
                        ) : (
                          <>
                            <button onClick={() => copiarLink(inv.codigo)} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 8, border: `1px solid ${copiado === inv.codigo ? '#22c55e' : d.border2}`, background: copiado === inv.codigo ? '#dcfce7' : 'transparent', color: copiado === inv.codigo ? '#15803d' : d.text2, cursor: 'pointer' }}>
                              {copiado === inv.codigo ? '✓ Copiado' : 'Copiar link'}
                            </button>
                            <button onClick={() => desactivar(inv.id)} style={{ fontSize: 11, color: d.text3, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'banco' && preguntasStats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: d.text3, margin: '0 0 16px' }}>Resumen</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ background: d.card2, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: d.text3, margin: '0 0 4px' }}>Total preguntas</p>
                  <p style={{ fontSize: 24, fontWeight: 500, color: d.text1, margin: 0 }}>{preguntasStats.total}</p>
                </div>
                <div style={{ background: d.card2, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: d.text3, margin: '0 0 4px' }}>Especialidades</p>
                  <p style={{ fontSize: 24, fontWeight: 500, color: d.text1, margin: 0 }}>{Object.keys(preguntasStats.porEspecialidad).length}</p>
                </div>
                <div style={{ background: d.card2, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: d.text3, margin: '0 0 4px' }}>Subtemas</p>
                  <p style={{ fontSize: 24, fontWeight: 500, color: d.text1, margin: 0 }}>{Object.values(preguntasStats.porEspecialidad).reduce((acc, e) => acc + Object.keys(e.subtemas).length, 0)}</p>
                </div>
              </div>
            </div>

            {Object.entries(preguntasStats.porEspecialidad)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([esp, data]) => {
                const pct = Math.round((data.total / preguntasStats.total) * 100)
                return (
                  <div key={esp} style={{ background: d.card, border: `1px solid ${d.border}`, borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>{esp.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p style={{ fontSize: 11, color: d.text3, margin: 0 }}>{Object.keys(data.subtemas).length} subtemas</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 16, fontWeight: 500, color: d.text1, margin: '0 0 2px' }}>{data.total}</p>
                        <p style={{ fontSize: 10, color: d.text3, margin: 0 }}>{pct}%</p>
                      </div>
                    </div>
                    <div style={{ height: 3, background: d.track }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#a78bfa' }} />
                    </div>
                    <div style={{ padding: '10px 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {Object.entries(data.subtemas).sort((a, b) => b[1] - a[1]).map(([sub, count]) => (
                        <span key={sub} style={{ fontSize: 10, background: d.card2, color: d.text2, borderRadius: 6, padding: '3px 8px' }}>
                          {sub.replace(/_/g, ' ')} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        )}

      </div>
    </div>
  )
}