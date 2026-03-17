import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedAdmin({ children }) {
  const [role, setRole] = useState(undefined)

  useEffect(() => {
    verificar()
  }, [])

  const verificar = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setRole(null)
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    setRole(data?.role || 'user')
  }

  if (role === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (role !== 'admin') return <Navigate to="/" />

  return children
}