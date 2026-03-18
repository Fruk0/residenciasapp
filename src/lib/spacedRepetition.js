export function calcularPrioridad(intentos, preguntaId) {
  const historial = intentos
    .filter(i => i.question_id === preguntaId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (historial.length === 0) return { prioridad: 0, diasBloqueo: 0 }

  let consecutivasCorrectas = 0
  for (const i of historial) {
    if (i.es_correcta) consecutivasCorrectas++
    else break
  }

  const ultimaVez = new Date(historial[0].timestamp)
  const diasDesdeUltima = (Date.now() - ultimaVez) / 86400000

  if (!historial[0].es_correcta) return { prioridad: 1, diasBloqueo: 1, diasDesdeUltima }
  if (consecutivasCorrectas === 1) return { prioridad: 2, diasBloqueo: 2, diasDesdeUltima }
  if (consecutivasCorrectas === 2) return { prioridad: 3, diasBloqueo: 4, diasDesdeUltima }
  return { prioridad: 4, diasBloqueo: 7, diasDesdeUltima }
}

export function seleccionarPreguntas(todasPreguntas, intentos, cantidad) {
  const subtemas = [...new Set(todasPreguntas.map(p => p.subtema || 'General'))]
  const capPorSubtema = Math.ceil((cantidad / subtemas.length) * 1.5)

  const conPrioridad = todasPreguntas.map(p => {
    const { prioridad, diasBloqueo, diasDesdeUltima } = calcularPrioridad(intentos, p.id)
    const disponible = diasDesdeUltima === undefined || diasDesdeUltima >= diasBloqueo
    return { ...p, prioridad, disponible, diasDesdeUltima: diasDesdeUltima || 999 }
  })

  const disponibles = conPrioridad.filter(p => p.disponible).sort((a, b) => a.prioridad - b.prioridad)
  const bloqueadas = conPrioridad.filter(p => !p.disponible).sort((a, b) => b.diasDesdeUltima - a.diasDesdeUltima)

  const pool = [...disponibles, ...bloqueadas]

  const contadorPorSubtema = {}
  const seleccionadas = []

  for (const p of pool) {
    if (seleccionadas.length >= cantidad) break
    const key = p.subtema || 'General'
    if (!contadorPorSubtema[key]) contadorPorSubtema[key] = 0
    if (contadorPorSubtema[key] >= capPorSubtema) continue
    contadorPorSubtema[key]++
    seleccionadas.push(p)
  }

  const faciles = seleccionadas.filter(p => p.dificultad === 'facil').sort(() => Math.random() - 0.5)
  const medias = seleccionadas.filter(p => ['intermedio','medio'].includes(p.dificultad)).sort(() => Math.random() - 0.5)
  const dificiles = seleccionadas.filter(p => p.dificultad === 'dificil').sort(() => Math.random() - 0.5)
  const sinD = seleccionadas.filter(p => !['facil','intermedio','medio','dificil'].includes(p.dificultad)).sort(() => Math.random() - 0.5)

  const medio = [...medias, ...sinD]
  const mitad = Math.floor(medio.length / 2)
  return [...faciles.slice(0,3), ...medio.slice(0,mitad), ...dificiles, ...medio.slice(mitad), ...faciles.slice(3)]
}