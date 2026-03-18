import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthLayout from '../components/AuthLayout'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('estado_cuenta')
      .eq('id', data.user.id)
      .single()

    if (userData?.estado_cuenta === 'bloqueado') {
      await supabase.auth.signOut()
      setError('Tu cuenta fue bloqueada. Contactá al administrador.')
      setLoading(false)
      return
    }

    // login exitoso — App.jsx maneja la redirección via onAuthStateChange
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-medium text-black mb-1">Bienvenido de nuevo.</h1>
      <p className="text-sm text-gray-400 mb-8">Ingresá para seguir practicando.</p>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">Email</label>
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
          <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
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
          <div className="flex justify-end">
            <span className="text-xs text-gray-400 hover:text-black cursor-pointer transition-colors">
              ¿Olvidaste tu contraseña?
            </span>
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
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

      </form>
    </AuthLayout>
  )
}