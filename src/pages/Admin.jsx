import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function generarCodigo() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default function Admin() {
  const [usuarios, setUsuarios] = useState([])
  const [invitaciones, setInvitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [copiado, setCopiado] = useState(null)
  const [tab, setTab] = useState('usuarios')
  const navigate = useNavigate()

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)

    const { data: users } = await supabase
      .from('users')
      .select('id, email, nombre, role, estado_cuenta, created_at, temas_activos, meta_aciertos, fecha_examen')
      .order('created_at', { ascending: false })

    const { data: invites } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: attempts } = await supabase
      .from('attempts')
      .select('user_id, es_correcta')

    const statsPorUsuario = {}
    attempts?.forEach(({ user_id, es_correcta }) => {
      if (!statsPorUsuario[user_id]) statsPorUsuario[user_id] = { total: 0, correctas: 0 }
      statsPorUsuario[user_id].total++
      if (es_correcta) statsPorUsuario[user_id].correctas++
    })

    const usersConStats = (users || []).map(u => ({
      ...u,
      stats: statsPorUsuario[u.id] || { total: 0, correctas: 0 }
    }))

    setUsuarios(usersConStats)
    setInvitaciones(invites || [])
    setLoading(false)
  }

  const generarInvitacion = async () => {
    setGenerando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const codigo = generarCodigo()
    await supabase.from('invitations').insert({
      codigo,
      creado_por: user.id,
      activo: true
    })
    await cargar()
    setGenerando(false)
  }

  const copiarLink = (codigo) => {
    const url = `${window.location.origin}/register?invite=${codigo}`
    navigator.clipboard.writeText(url)
    setCopiado(codigo)
    setTimeout(() => setCopiado(null), 2000)
  }

  const desactivarInvitacion = async (id) => {
    await supabase.from('invitations').update({ activo: false }).eq('id', id)
    await cargar()
  }

  const toggleBloqueo = async (userId, estadoActual) => {
  const nuevoEstado = estadoActual === 'activo' ? 'bloqueado' : 'activo'
  await supabase
    .from('users')
    .update({ estado_cuenta: nuevoEstado })
    .eq('id', userId)
  await cargar()
}

const eliminarUsuario = async (userId, email) => {
  const confirmar = window.confirm(`¿Eliminar a ${email}? Esta acción no se puede deshacer.`)
  if (!confirmar) return
  await supabase.from('users').delete().eq('id', userId)
  await cargar()
}

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '—'
    return new Date(fechaStr).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit'
    })
  }

  const getPct = (stats) => {
    if (!stats.total) return null
    return Math.round((stats.correctas / stats.total) * 100)
  }

  const getColorPct = (pct) => {
    if (pct === null) return 'text-gray-300'
    if (pct >= 80) return 'text-green-600'
    if (pct >= 60) return 'text-yellow-600'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const invitacionesActivas = invitaciones.filter(i => i.activo && !i.usado_por)
  const invitacionesUsadas = invitaciones.filter(i => i.usado_por)

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Panel admin.</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {usuarios.length} usuarios · {invitacionesActivas.length} invitaciones activas
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 hover:text-black hover:border-gray-400 transition-colors"
          >
            Salir
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab('usuarios')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'usuarios' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Usuarios ({usuarios.length})
          </button>
          <button
            onClick={() => setTab('invitaciones')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'invitaciones' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Invitaciones ({invitacionesActivas.length} activas)
          </button>
        </div>

        {/* Tab: Usuarios */}
        {tab === 'usuarios' && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Usuario</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Registro</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Preguntas</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Aciertos</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(user => {
                    const pct = getPct(user.stats)
                    return (
                      <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-gray-500">
                                {(user.nombre || user.email || '?')[0].toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.nombre || 'Sin nombre'}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{formatFecha(user.created_at)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{user.stats.total}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className={`text-sm font-medium ${getColorPct(pct)}`}>
                            {pct !== null ? `${pct}%` : '—'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {user.role === 'admin' && (
                              <span className="text-[10px] bg-black text-white rounded px-1.5 py-0.5">admin</span>
                            )}
                            <span className={`text-[10px] rounded px-1.5 py-0.5 ${
                              user.estado_cuenta === 'bloqueado'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {user.estado_cuenta || 'activo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
  {user.role !== 'admin' && (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggleBloqueo(user.id, user.estado_cuenta)}
        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
          user.estado_cuenta === 'bloqueado'
            ? 'border-green-200 text-green-700 hover:bg-green-50'
            : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
        }`}
      >
        {user.estado_cuenta === 'bloqueado' ? 'Activar' : 'Bloquear'}
      </button>
      <button
        onClick={() => eliminarUsuario(user.id, user.email)}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 transition-colors"
      >
        Eliminar
      </button>
    </div>
  )}
</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Invitaciones */}
        {tab === 'invitaciones' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <button
                onClick={generarInvitacion}
                disabled={generando}
                className="bg-black text-white text-sm rounded-xl px-4 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {generando ? '...' : '+ Generar link de invitación'}
              </button>
            </div>

            {invitacionesActivas.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Activas ({invitacionesActivas.length})
                </p>
                <div className="flex flex-col gap-2">
                  {invitacionesActivas.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-mono font-medium text-gray-900">{inv.codigo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Creado {formatFecha(inv.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copiarLink(inv.codigo)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-colors border ${
                            copiado === inv.codigo
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {copiado === inv.codigo ? '✓ Copiado' : 'Copiar link'}
                        </button>
                        <button
                          onClick={() => desactivarInvitacion(inv.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invitacionesUsadas.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Usadas ({invitacionesUsadas.length})
                </p>
                <div className="flex flex-col gap-2">
                  {invitacionesUsadas.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-mono text-gray-400 line-through">{inv.codigo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Usado {formatFecha(inv.usado_at)}</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-1">usado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invitacionesActivas.length === 0 && invitacionesUsadas.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                <p className="text-sm text-gray-400">No hay invitaciones todavía.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}