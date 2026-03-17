import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTemasActivos() {
  const [temasActivos, setTemasActivos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('users')
      .select('temas_activos')
      .eq('id', user.id)
      .single()
    setTemasActivos(data?.temas_activos || [])
    setLoading(false)
  }

  const guardar = async (temas) => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('users')
      .update({ temas_activos: temas })
      .eq('id', user.id)
    setTemasActivos(temas)
  }

  const toggle = async (tema) => {
    const nuevos = temasActivos.includes(tema)
      ? temasActivos.filter(t => t !== tema)
      : [...temasActivos, tema]
    await guardar(nuevos)
  }

  return { temasActivos, loading, toggle, guardar, cargar }
}