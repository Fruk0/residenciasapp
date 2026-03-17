const LETRA = ['A', 'B', 'C', 'D']
const OPCION_KEY = ['opcion_a', 'opcion_b', 'opcion_c', 'opcion_d']
const EXPLICACION_KEY = ['explicacion_a', 'explicacion_b', 'explicacion_c', 'explicacion_d']

export default function SimulacroResult({ preguntas, respuestas, onNuevoSimulacro, onRevisarErrores }) {
  const total = preguntas.length
  const correctas = respuestas.filter(r => r.esCorrecta).length
  const porcentaje = Math.round((correctas / total) * 100)

  const getColorScore = () => {
    if (porcentaje >= 80) return 'text-green-600'
    if (porcentaje >= 60) return 'text-yellow-600'
    return 'text-red-500'
  }

  const getColorBg = () => {
    if (porcentaje >= 80) return 'bg-green-50 border-green-200'
    if (porcentaje >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const porArea = {}
  preguntas.forEach((p, i) => {
    if (!porArea[p.area]) porArea[p.area] = { correctas: 0, total: 0 }
    porArea[p.area].total++
    if (respuestas[i]?.esCorrecta) porArea[p.area].correctas++
  })

  const errores = preguntas
    .map((p, i) => ({ pregunta: p, respuesta: respuestas[i] }))
    .filter(({ respuesta }) => !respuesta?.esCorrecta)

  const correctaIdx = (p) => ['a', 'b', 'c', 'd'].indexOf(p.respuesta_correcta.toLowerCase())
  const elegidaIdx = (r) => r?.respuestaDada != null ? r.respuestaDada : null

  const formatPregunta = (texto) => {
    const partes = texto.split('?')
    if (partes.length < 2) return { caso: null, pregunta: texto }
    const pregunta = partes[partes.length - 1].trim() === ''
      ? partes[partes.length - 2].trim() + '?'
      : partes[partes.length - 1].trim() + '?'
    const caso = texto.replace(pregunta, '').trim()
    return { caso, pregunta }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">

        <div className={`border rounded-2xl p-6 text-center mb-5 ${getColorBg()}`}>
          <p className={`text-6xl font-medium mb-2 ${getColorScore()}`}>{porcentaje}%</p>
          <p className="text-sm text-gray-600">{correctas} correctas de {total} preguntas</p>
          <p className="text-xs text-gray-400 mt-1">
            {porcentaje >= 80
              ? '¡Excelente! Estás por encima de la meta.'
              : porcentaje >= 60
              ? 'Buen intento. Seguí practicando.'
              : 'Hay que repasar. Vas a llegar.'}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
          <p className="text-sm font-medium text-gray-900 mb-4">Por especialidad</p>
          <div className="flex flex-col gap-3">
            {Object.entries(porArea).map(([area, { correctas: c, total: t }]) => {
              const pct = Math.round((c / t) * 100)
              const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              return (
                <div key={area}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-700">{area}</span>
                    <span className="text-xs font-medium text-gray-900">{pct}% — {c}/{t}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {errores.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <p className="text-sm font-medium text-gray-900 mb-4">
              Preguntas falladas ({errores.length})
            </p>
            <div className="flex flex-col gap-4">
              {errores.map(({ pregunta, respuesta }) => {
                const ci = correctaIdx(pregunta)
                const ei = elegidaIdx(respuesta)
                const { caso, pregunta: pText } = formatPregunta(pregunta.pregunta)

                return (
                  <div key={pregunta.id} className="border border-gray-100 rounded-xl overflow-hidden">

                    <div className="p-4 bg-white">
                      {caso && (
                        <p className="text-xs text-gray-500 leading-relaxed mb-2">
                          {caso}
                        </p>
                      )}
                      <p className="text-xs text-gray-900 font-medium leading-relaxed">
                        {pText}
                      </p>
                    </div>

                    {ei !== null && (
                      <div className="bg-red-50 border-t border-red-100 px-4 py-3">
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide mb-1.5">
                          Tu respuesta
                        </p>
                        <p className="text-xs font-medium text-red-700 mb-1.5">
                          {LETRA[ei]} — {pregunta[OPCION_KEY[ei]]}
                        </p>
                        <p className="text-xs text-red-600 leading-relaxed">
                          {pregunta[EXPLICACION_KEY[ei]]}
                        </p>
                      </div>
                    )}

                    <div className="bg-green-50 border-t border-green-100 px-4 py-3">
                      <p className="text-[10px] font-semibold text-green-500 uppercase tracking-wide mb-1.5">
                        Respuesta correcta
                      </p>
                      <p className="text-xs font-medium text-green-700 mb-1.5">
                        {LETRA[ci]} — {pregunta[OPCION_KEY[ci]]}
                      </p>
                      <p className="text-xs text-green-600 leading-relaxed">
                        {pregunta[EXPLICACION_KEY[ci]]}
                      </p>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pb-8">
          {errores.length > 0 && (
            <button
              onClick={() => onRevisarErrores(errores.map(e => e.pregunta))}
              className="w-full border border-black text-black rounded-xl py-3 text-sm font-medium hover:bg-black hover:text-white transition-colors"
            >
              Repasar errores ({errores.length})
            </button>
          )}
          <button
            onClick={onNuevoSimulacro}
            className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Nuevo simulacro
          </button>
        </div>

      </div>
    </div>
  )
}