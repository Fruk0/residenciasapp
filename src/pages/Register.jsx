import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthLayout from '../components/AuthLayout'

export default function Register() {
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite')

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validandoInvite, setValidandoInvite] = useState(true)
  const [inviteValido, setInviteValido] = useState(false)
  const [inviteData, setInviteData] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => { validarInvite() }, [inviteCode])

  const validarInvite = async () => {
    if (!inviteCode) { setInviteValido(false); setValidandoInvite(false); return }
    const { data } = await supabase
      .from('invitations')
      .select('id, activo, usado_por, email_destinatario')
      .eq('codigo', inviteCode)
      .single()
    setInviteValido(!!data && data.activo && !data.usado_por)
    setInviteData(data)
    setValidandoInvite(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      setLoading(false)
      return
    }

    if (inviteData?.email_destinatario &&
      email.toLowerCase() !== inviteData.email_destinatario.toLowerCase()) {
      setError('Invitación inválida.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })

    if (signUpError) {
      setError('Hubo un error al crear tu cuenta. Intentá de nuevo.')
      setLoading(false)
      return
    }

    const userId = data.user.id

    await supabase.from('users').update({ nombre }).eq('id', userId)

    await supabase.rpc('marcar_invitacion_usada', {
      p_invite_id: inviteData.id,
      p_user_id: userId
    })

    setSuccess(true)
    setLoading(false)
  }

  if (validandoInvite) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthLayout>
    )
  }

  if (!inviteValido) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Acceso por invitación.</h2>
          <p className="text-sm text-gray-400 mb-8">
            Esta app está en beta cerrada. Necesitás un link de invitación válido para registrarte.
          </p>
          <Link to="/login" className="text-sm text-black font-medium underline underline-offset-4 hover:text-gray-600 transition-colors">
            Ir al login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-black mb-2">Cuenta creada.</h2>
          <p className="text-sm text-gray-400 mb-8">Ya podés ingresar con tu email y contraseña.</p>
          <Link to="/login" className="text-sm text-black font-medium underline underline-offset-4 hover:text-gray-600 transition-colors">
            Ir al login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-medium text-black mb-1">Empezá a prepararte.</h1>
      <p className="text-sm text-gray-400 mb-8">Creá tu cuenta con tu invitación.</p>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-black transition-colors"
            >
              {showPassword ? 'ocultar' : 'ver'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-center text-xs text-gray-400">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-black font-medium hover:underline underline-offset-4">Ingresar</Link>
        </p>

      </form>
    </AuthLayout>
  )
}