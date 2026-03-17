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
  const navigate = useNavigate()

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)

    const { data: users } = await supabase
      .from('users')
      .select('id, email, nombre, role, estado_cuenta, created_at')
      .order('created_at', { ascending: false })

    const { data: invites } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false })

    setUsuarios(users || [])
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
    await supabase
      .from('invitations')
      .update({ activo: false })
      .eq('id', id)
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

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return ''
    return new Date(fechaStr).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit'
    })
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
      <div className="max-w-lg mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Admin.</h1>
            <p className="text-xs text-gray-400 mt-0.5">{usuarios.length} usuarios registrados</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 hover:text-black hover:border-gray-400 transition-colors"
          >
            Salir
          </button>
        </div>

        {/* Generar invitación */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Invitaciones</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {invitacionesActivas.length} activas · {invitacionesUsadas.length} usadas
              </p>
            </div>
            <button
              onClick={generarInvitacion}
              disabled={generando}
              className="bg-black text-white text-xs rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {generando ? '...' : '+ Generar link'}
            </button>
          </div>

          {invitacionesActivas.length > 0 && (
            <div className="flex flex-col gap-2">
              {invitacionesActivas.map(inv => (
                <div key={inv.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3.5 py-3">
                  <div>
                    <p className="text-xs font-mono font-medium text-gray-900">{inv.codigo}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Creado {formatFecha(inv.created_at)}</p>
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
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {invitacionesActivas.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">
              No hay invitaciones activas. Generá una para invitar usuarios.
            </p>
          )}
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-sm font-medium text-gray-900 mb-4">Usuarios</p>
          <div className="flex flex-col gap-2">
            {usuarios.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {user.nombre || 'Sin nombre'}
                    </p>
                    {user.role === 'admin' && (
                      <span className="text-[10px] bg-black text-white rounded px-1.5 py-0.5 shrink-0">
                        admin
                      </span>
                    )}
                    {user.estado_cuenta === 'bloqueado' && (
                      <span className="text-[10px] bg-red-100 text-red-600 rounded px-1.5 py-0.5 shrink-0">
                        bloqueado
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  <p className="text-[10px] text-gray-300">{formatFecha(user.created_at)}</p>
                </div>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => toggleBloqueo(user.id, user.estado_cuenta)}
                    className={`text-xs ml-3 px-3 py-1.5 rounded-lg border transition-colors shrink-0 ${
                      user.estado_cuenta === 'bloqueado'
                        ? 'border-green-200 text-green-700 hover:bg-green-50'
                        : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                    }`}
                  >
                    {user.estado_cuenta === 'bloqueado' ? 'Activar' : 'Bloquear'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}