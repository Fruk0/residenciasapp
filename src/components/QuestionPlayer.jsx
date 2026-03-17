import { useState } from 'react'
import DetailModal from './DetailModal'

const LETRA = ['A', 'B', 'C', 'D']
const OPCION_KEY = ['opcion_a', 'opcion_b', 'opcion_c', 'opcion_d']
const EXPLICACION_KEY = ['explicacion_a', 'explicacion_b', 'explicacion_c', 'explicacion_d']

export default function QuestionPlayer({ pregunta, total, actual, onResponder, onSiguiente }) {
  const [seleccionada, setSeleccionada] = useState(null)
  const [respondida, setRespondida] = useState(false)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)

  const correctaIndex = LETRA.indexOf(pregunta.respuesta_correcta.toUpperCase())

  const handleSeleccionar = (index) => {
    if (respondida) return
    setSeleccionada(index)
    setRespondida(true)
    const esCorrecta = index === correctaIndex
    onResponder(esCorrecta)
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
    if (index === correctaIndex) {
      return 'border border-green-300 bg-green-50 cursor-default'
    }
    if (index === seleccionada && index !== correctaIndex) {
      return 'border border-red-300 bg-red-50 cursor-default'
    }
    return 'border border-gray-100 opacity-40 cursor-default'
  }

  const getLetraStyle = (index) => {
    if (!respondida) return 'text-gray-400'
    if (index === correctaIndex) return 'text-green-600'
    if (index === seleccionada && index !== correctaIndex) return 'text-red-500'
    return 'text-gray-400'
  }

  const getTextoStyle = (index) => {
    if (!respondida) return 'text-gray-800'
    if (index === correctaIndex) return 'text-green-700'
    if (index === seleccionada && index !== correctaIndex) return 'text-red-600'
    return 'text-gray-600'
  }

  const progreso = Math.round((actual / total) * 100)
  const esCorrecta = seleccionada === correctaIndex

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-gray-400 truncate">{pregunta.area}</span>
            {pregunta.subtema && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 truncate">{pregunta.subtema}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs text-gray-400">{actual} / {total}</span>
            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-300"
                style={{ width: progreso + '%' }}
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm font-medium text-gray-900 leading-relaxed mb-5">
            {pregunta.pregunta}
          </p>

          <div className="flex flex-col gap-2.5 mb-4">
            {OPCION_KEY.map((key, index) => (
              <button
                key={index}
                onClick={() => handleSeleccionar(index)}
                className={'w-full text-left rounded-xl px-3.5 py-3 flex gap-3 items-start ' + getOpcionStyle(index)}
              >
                <span className={'text-xs font-semibold min-w-[16px] mt-0.5 ' + getLetraStyle(index)}>
                  {LETRA[index]}
                </span>
                <span className={'text-xs leading-relaxed ' + getTextoStyle(index)}>
                  {pregunta[key]}
                </span>
              </button>
            ))}
          </div>

          {respondida && (
            <div className={'rounded-xl px-3.5 py-3 mb-3 ' + (esCorrecta ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')}>
              <p className={'text-[10px] font-semibold uppercase tracking-wide mb-1 ' + (esCorrecta ? 'text-green-600' : 'text-red-500')}>
                {esCorrecta ? 'Por que ' + LETRA[correctaIndex] + ' es correcta' : 'Por que ' + LETRA[seleccionada] + ' es incorrecta'}
              </p>
              <p className={'text-xs leading-relaxed ' + (esCorrecta ? 'text-green-800' : 'text-red-700')}>
                {esCorrecta
                  ? pregunta[EXPLICACION_KEY[correctaIndex]]
                  : pregunta[EXPLICACION_KEY[seleccionada]]
                }
              </p>
            </div>
          )}

          {respondida && (
            <div className="flex flex-col gap-2">
              {pregunta.detalle_extendido && (
                <button
                  onClick={() => setMostrarDetalle(true)}
                  className="w-full text-xs text-gray-400 underline underline-offset-4 hover:text-black transition-colors py-1"
                >
                  Ver detalle extendido
                </button>
              )}
              <button
                onClick={handleSiguiente}
                className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Siguiente pregunta
              </button>
            </div>
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