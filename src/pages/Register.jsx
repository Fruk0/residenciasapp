import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthLayout from '../components/AuthLayout'

export default function Register() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    })

    if (error) {
      setError('Hubo un error al crear tu cuenta. Intentá de nuevo.')
      setLoading(false)
    } else {
      setSuccess(true)
    }
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
          <p className="text-sm text-gray-400 mb-8">
            Te enviamos un email de confirmación a <span className="text-black">{email}</span>. Revisá tu bandeja de entrada.
          </p>
          <Link
            to="/login"
            className="text-sm text-black font-medium underline underline-offset-4 hover:text-gray-600 transition-colors"
          >
            Ir al login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-medium text-black mb-1">Empezá a prepararte.</h1>
      <p className="text-sm text-gray-400 mb-8">Creá tu cuenta gratis en segundos.</p>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300">o</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <p className="text-center text-xs text-gray-400">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-black font-medium hover:underline underline-offset-4">
            Ingresar
          </Link>
        </p>

      </form>
    </AuthLayout>
  )
}