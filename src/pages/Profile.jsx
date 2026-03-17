import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'
import TemasActivos from '../components/TemasActivos'

export default function Profile() {
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [editandoMeta, setEditandoMeta] = useState(false)
  const [editandoFecha, setEditandoFecha] = useState(false)
  const [nombre, setNombre] = useState('')
  const [meta, setMeta] = useState(80)
  const [fecha, setFecha] = useState('')
  const [mostrarTemas, setMostrarTemas] = useState(false)
  const [simulacros, setSimulacros] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: intentos } = await supabase
      .from('attempts')
      .select('modo, es_correcta, timestamp')
      .eq('user_id', user.id)
      .eq('modo', 'simulacro')
      .order('timestamp', { ascending: false })
      .limit(50)

    if (userData) {
      setPerfil(userData)
      setNombre(userData.nombre || '')
      setMeta(userData.meta_aciertos || 80)
      setFecha(userData.fecha_examen || '')
    }

    if (intentos) {
      const agrupados = {}
      intentos.forEach(({ timestamp, es_correcta }) => {
        const dia = timestamp.split('T')[0]
        if (!agrupados[dia]) agrupados[dia] = { correctas: 0, total: 0 }
        agrupados[dia].total++
        if (es_correcta) agrupados[dia].correctas++
      })
      setSimulacros(
        Object.entries(agrupados)
          .map(([fecha, { correctas, total }]) => ({
            fecha,
            porcentaje: Math.round((correctas / total) * 100),
            total
          }))
          .slice(0, 5)
      )
    }

    setLoading(false)
  }

  const guardar = async (campos) => {
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('users').update(campos).eq('id', user.id)
    await cargar()
    setGuardando(false)
  }

  const diasParaExamen = () => {
    if (!perfil?.fecha_examen) return null
    const hoy = new Date()
    const examen = new Date(perfil.fecha_examen)
    const diff = Math.ceil((examen - hoy) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : null
  }

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return ''
    const [year, month, day] = fechaStr.split('-')
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    return `${parseInt(day)} de ${meses[parseInt(month) - 1]}, ${year}`
  }

  const getColorPct = (pct) => {
    if (pct >= 80) return 'text-green-600'
    if (pct >= 60) return 'text-yellow-600'
    return 'text-red-500'
  }

  const formatFechaSimulacro = (fechaStr) => {
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (fechaStr === hoy) return 'Hoy'
    if (fechaStr === ayer) return 'Ayer'
    const [year, month, day] = fechaStr.split('-')
    return `${day}/${month}/${year}`
  }

  const iniciales = (nombre) => {
    if (!nombre) return '?'
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const dias = diasParaExamen()

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-lg mx-auto">

          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
              </svg>
              Inicio
            </button>
            <h1 className="text-sm font-medium text-gray-900">Perfil</h1>
            <div className="w-12" />
          </div>

          {/* Avatar + nombre */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                {perfil?.foto_url ? (
                  <img src={perfil.foto_url} alt="foto" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xl font-medium text-gray-500">{iniciales(perfil?.nombre)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editandoNombre ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-black"
                      autoFocus
                    />
                    <button
                      onClick={async () => { await guardar({ nombre }); setEditandoNombre(false) }}
                      disabled={guardando}
                      className="text-xs bg-black text-white rounded-lg px-3 py-1.5 hover:bg-gray-800 transition-colors"
                    >
                      {guardando ? '...' : 'OK'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {perfil?.nombre || 'Sin nombre'}
                    </p>
                    <button
                      onClick={() => setEditandoNombre(true)}
                      className="text-xs text-gray-400 hover:text-black transition-colors underline underline-offset-4 shrink-0"
                    >
                      Editar
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-0.5 truncate">{perfil?.email}</p>
              </div>
            </div>
          </div>

          {/* Fecha examen */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha del examen</p>
              <button
                onClick={() => setEditandoFecha(!editandoFecha)}
                className="text-xs text-gray-400 hover:text-black transition-colors underline underline-offset-4"
              >
                {editandoFecha ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            {editandoFecha ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-black"
                />
                <button
                  onClick={async () => { await guardar({ fecha_examen: fecha }); setEditandoFecha(false) }}
                  disabled={guardando}
                  className="text-xs bg-black text-white rounded-lg px-3 py-1.5 hover:bg-gray-800 transition-colors"
                >
                  {guardando ? '...' : 'OK'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {perfil?.fecha_examen ? formatFecha(perfil.fecha_examen) : 'No configurada'}
                </p>
                {dias && (
                  <span className="text-xs text-gray-500 bg-gray-100 rounded-lg px-2.5 py-1">
                    {dias} días
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Meta aciertos */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meta de aciertos</p>
              <button
                onClick={() => setEditandoMeta(!editandoMeta)}
                className="text-xs text-gray-400 hover:text-black transition-colors underline underline-offset-4"
              >
                {editandoMeta ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            {editandoMeta ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={meta}
                  onChange={e => setMeta(parseInt(e.target.value))}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-black"
                />
                <span className="text-sm text-gray-400">%</span>
                <button
                  onClick={async () => { await guardar({ meta_aciertos: meta }); setEditandoMeta(false) }}
                  disabled={guardando}
                  className="text-xs bg-black text-white rounded-lg px-3 py-1.5 hover:bg-gray-800 transition-colors"
                >
                  {guardando ? '...' : 'OK'}
                </button>
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-900">{perfil?.meta_aciertos || 80}%</p>
            )}
          </div>

          {/* Especialidades activas */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Especialidades activas</p>
              <button
                onClick={() => setMostrarTemas(true)}
                className="text-xs text-gray-400 hover:text-black transition-colors underline underline-offset-4"
              >
                Editar
              </button>
            </div>
            {perfil?.temas_activos?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {perfil.temas_activos.map(tema => (
                  <span
                    key={tema}
                    className="text-xs bg-black text-white rounded-lg px-3 py-1.5"
                  >
                    {formatArea(tema)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No tenés temas activos todavía.</p>
            )}
          </div>

          {/* Simulacros recientes */}
          {simulacros.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Simulacros recientes</p>
              <div className="flex flex-col gap-2">
                {simulacros.map(({ fecha, porcentaje, total }, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{total} preguntas</p>
                      <p className="text-xs text-gray-400">{formatFechaSimulacro(fecha)}</p>
                    </div>
                    <span className={`text-sm font-medium ${getColorPct(porcentaje)}`}>
                      {porcentaje}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cerrar sesión */}
          <button
            onClick={async () => { await supabase.auth.signOut() }}
            className="w-full text-sm text-gray-400 underline underline-offset-4 hover:text-black transition-colors py-4"
          >
            Cerrar sesión
          </button>

        </div>
      </div>

      {mostrarTemas && (
        <TemasActivos onCerrar={async () => { await cargar(); setMostrarTemas(false) }} />
      )}
    </>
  )
}