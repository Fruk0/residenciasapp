import { useState } from 'react'
import DetailModal from './DetailModal'
import { formatArea, formatSubtema } from '../lib/formatArea'

const LETRA = ['A', 'B', 'C', 'D']
const OPCION_KEY = ['opcion_a', 'opcion_b', 'opcion_c', 'opcion_d']
const EXPLICACION_KEY = ['explicacion_a', 'explicacion_b', 'explicacion_c', 'explicacion_d']

const formatPregunta = (texto) => {
  if (!texto) return { caso: null, pregunta: texto }
  const idx = texto.lastIndexOf('?')
  if (idx === -1) return { caso: null, pregunta: texto }
  const inicio = texto.lastIndexOf('.', idx)
  if (inicio === -1 || inicio < texto.length * 0.5) {
    return { caso: null, pregunta: texto }
  }
  const caso = texto.substring(0, inicio + 1).trim()
  const pregunta = texto.substring(inicio + 1).trim()
  return { caso, pregunta }
}

export default function QuestionPlayer({
  pregunta,
  total,
  actual,
  onResponder,
  onSiguiente,
  mostrarArea = true,
  modoExamen = false
}) {
  const [seleccionada, setSeleccionada] = useState(null)
  const [respondida, setRespondida] = useState(false)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)

  const correctaIndex = LETRA.indexOf(pregunta.respuesta_correcta.toUpperCase())
  const progreso = Math.round((actual / total) * 100)
  const esCorrecta = seleccionada === correctaIndex
  const { caso, pregunta: pText } = formatPregunta(pregunta.pregunta)

  const handleSeleccionar = (index) => {
    if (respondida) return
    setSeleccionada(index)
    setRespondida(true)
    onResponder(index === correctaIndex, index)
  }

  const handleSiguiente = () => {
    setSeleccionada(null)
    setRespondida(false)
    setMostrarDetalle(false)
    onSiguiente()
  }

  const getOpcionStyle = (index) => {
    if (!respondida) {
      return 'border border-gray-200 hover:border-gray-400 cursor-pointer transition-colors'
    }
    if (modoExamen) {
      if (index === seleccionada) return 'border border-gray-400 bg-gray-50 cursor-default'
      return 'border border-gray-100 opacity-40 cursor-default'
    }
    if (index === correctaIndex) return 'border border-green-300 bg-green-50 cursor-default'
    if (index === seleccionada && index !== correctaIndex) return 'border border-red-300 bg-red-50 cursor-default'
    return 'border border-gray-100 opacity-40 cursor-default'
  }

  const getLetraStyle = (index) => {
    if (!respondida) return 'text-gray-400'
    if (modoExamen) {
      if (index === seleccionada) return 'text-gray-700'
      return 'text-gray-400'
    }
    if (index === correctaIndex) return 'text-green-600'
    if (index === seleccionada && index !== correctaIndex) return 'text-red-500'
    return 'text-gray-400'
  }

  const getTextoStyle = (index) => {
    if (!respondida) return 'text-gray-800'
    if (modoExamen) {
      if (index === seleccionada) return 'text-gray-800'
      return 'text-gray-500'
    }
    if (index === correctaIndex) return 'text-green-700'
    if (index === seleccionada && index !== correctaIndex) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

        {mostrarArea ? (
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-gray-400 truncate">{formatArea(pregunta.area)}</span>
              {pregunta.subtema && (
                <>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400 truncate">{formatSubtema(pregunta.subtema)}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs text-gray-400">{actual} / {total}</span>
              <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all duration-300"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-end gap-2.5">
            <span className="text-xs text-gray-400">{actual} / {total}</span>
            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-300"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-4">

          {caso ? (
            <>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                {caso}
              </p>
              <p className="text-sm font-medium text-gray-900 leading-relaxed mb-5">
                {pText}
              </p>
            </>
          ) : (
            <p className="text-sm font-medium text-gray-900 leading-relaxed mb-5">
              {pText}
            </p>
          )}

          <div className="flex flex-col gap-2.5 mb-4">
            {OPCION_KEY.map((key, index) => (
              <button
                key={index}
                onClick={() => handleSeleccionar(index)}
                className={`w-full text-left rounded-xl px-3.5 py-3 flex gap-3 items-start ${getOpcionStyle(index)}`}
              >
                <span className={`text-xs font-semibold min-w-[16px] mt-0.5 ${getLetraStyle(index)}`}>
                  {LETRA[index]}
                </span>
                <span className={`text-xs leading-relaxed ${getTextoStyle(index)}`}>
                  {pregunta[key]}
                </span>
              </button>
            ))}
          </div>

          {respondida && !modoExamen && (
            <div className={`rounded-xl overflow-hidden mb-3 ${esCorrecta ? 'border border-green-200' : 'border border-red-200'}`}>
              <div className={`px-3.5 py-3 ${esCorrecta ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-xs font-medium mb-1 ${esCorrecta ? 'text-green-700' : 'text-red-700'}`}>
                  {esCorrecta
                    ? `${LETRA[correctaIndex]} — ${pregunta[OPCION_KEY[correctaIndex]]}`
                    : `${LETRA[seleccionada]} — ${pregunta[OPCION_KEY[seleccionada]]}`
                  }
                </p>
                <p className={`text-xs leading-relaxed ${esCorrecta ? 'text-green-600' : 'text-red-600'}`}>
                  {esCorrecta
                    ? pregunta[EXPLICACION_KEY[correctaIndex]]
                    : pregunta[EXPLICACION_KEY[seleccionada]]
                  }
                </p>
              </div>
            </div>
          )}

          {respondida && !modoExamen && pregunta.detalle_extendido && (
            <button
              onClick={() => setMostrarDetalle(true)}
              className="w-full text-xs text-gray-400 underline underline-offset-4 hover:text-black transition-colors py-1 mb-2"
            >
              Ver detalle extendido
            </button>
          )}

          {respondida && (
            <button
              onClick={handleSiguiente}
              className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {modoExamen ? 'Siguiente' : 'Siguiente pregunta'}
            </button>
          )}

        </div>
      </div>

      {mostrarDetalle && (
        <DetailModal
          pregunta={pregunta}
          onCerrar={() => setMostrarDetalle(false)}
        />
      )}
    </>
  )
}