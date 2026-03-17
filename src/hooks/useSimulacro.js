import { supabase } from '../lib/supabase'

const DIAS_REINTRODUCCION = 5

export async function seleccionarPreguntas({ areas, totalPreguntas }) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data: preguntas } = await supabase
    .from('questions')
    .select('*')
    .eq('estado', 'activo')
    .in('area', areas)
    .limit(1000)

  if (!preguntas || preguntas.length === 0) return []

  const hace5dias = new Date()
  hace5dias.setDate(hace5dias.getDate() - DIAS_REINTRODUCCION)

  const { data: intentos } = await supabase
    .from('attempts')
    .select('question_id, timestamp')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(5000)

  const ultimoIntento = {}
  intentos?.forEach(({ question_id, timestamp }) => {
    if (!ultimoIntento[question_id]) {
      ultimoIntento[question_id] = new Date(timestamp)
    }
  })

  const grupoPrioridadAlta = []
  const grupoPrioridadMedia = []
  const grupoPrioridadBaja = []

  preguntas.forEach(p => {
    const ultimo = ultimoIntento[p.id]
    if (!ultimo) {
      grupoPrioridadAlta.push(p)
    } else if (ultimo < hace5dias) {
      grupoPrioridadMedia.push(p)
    } else {
      grupoPrioridadBaja.push(p)
    }
  })

  const mezclar = (arr) => arr.sort(() => Math.random() - 0.5)
  mezclar(grupoPrioridadAlta)
  mezclar(grupoPrioridadMedia)
  mezclar(grupoPrioridadBaja)

  const pool = [...grupoPrioridadAlta, ...grupoPrioridadMedia, ...grupoPrioridadBaja]

  if (areas.length === 1) return pool.slice(0, totalPreguntas)

  const porArea = Math.floor(totalPreguntas / areas.length)
  const seleccionadas = []

  areas.forEach(area => {
    const deEstaArea = pool.filter(p => p.area === area)
    seleccionadas.push(...deEstaArea.slice(0, porArea))
  })

  const resto = totalPreguntas - seleccionadas.length
  if (resto > 0) {
    const ids = new Set(seleccionadas.map(p => p.id))
    const sobrantes = pool.filter(p => !ids.has(p.id))
    seleccionadas.push(...sobrantes.slice(0, resto))
  }

  return mezclar(seleccionadas).slice(0, totalPreguntas)
}