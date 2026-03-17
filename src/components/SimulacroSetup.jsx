import { useState } from 'react'
import { useTemasActivos } from '../hooks/useTemasActivos'
import TemasActivos from './TemasActivos'

const OPCIONES_CANTIDAD = [10, 20, 30, 50]

export default function SimulacroSetup({ onIniciar, onVolver }) {
  const { temasActivos, loading, cargar } = useTemasActivos()
  const [areasSeleccionadas, setAreasSeleccionadas] = useState(null)
  const [cantidad, setCantidad] = useState(20)
  const [timerActivo, setTimerActivo] = useState(false)
  const [mostrarTemasActivos, setMostrarTemasActivos] = useState(false)

  const areas = areasSeleccionadas ?? temasActivos

  const handleCerrarTemas = async () => {
    await cargar()
    setAreasSeleccionadas(null)
    setMostrarTemasActivos(false)
  }

  const toggleArea = (area) => {
    const base = areasSeleccionadas ?? temasActivos
    const nuevas = base.includes(area)
      ? base.filter(a => a !== area)
      : [...base, area]
    setAreasSeleccionadas(nuevas)
  }

  const handleIniciar = () => {
    if (areas.length === 0) return
    onIniciar({ areas, cantidad, timerActivo, segundosPorPregunta: 90 })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-lg mx-auto">

          <button
            onClick={onVolver}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors mb-6"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
            </svg>
            Inicio
          </button>

          <h1 className="text-2xl font-medium text-gray-900 mb-1">Simulacro.</h1>
          <p className="text-sm text-gray-400 mb-8">Configurá tu examen personalizado.</p>

          <div className="flex flex-col gap-6">

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-900">Especialidades</p>
                <button
                  onClick={() => setMostrarTemasActivos(true)}
                  className="text-xs text-gray-400 underline underline-offset-4 hover:text-black transition-colors"
                >
                  Editar mis temas
                </button>
              </div>

              {temasActivos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400 mb-3">No tenés temas activos todavía.</p>
                  <button
                    onClick={() => setMostrarTemasActivos(true)}
                    className="text-sm text-black font-medium underline underline-offset-4"
                  >
                    Activar temas
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {temasActivos.map(area => {
                    const seleccionada = areas.includes(area)
                    return (
                      <button
                        key={area}
                        onClick={() => toggleArea(area)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors border ${
                          seleccionada
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {area}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-sm font-medium text-gray-900 mb-4">Cantidad de preguntas</p>
              <div className="grid grid-cols-4 gap-2">
                {OPCIONES_CANTIDAD.map(n => (
                  <button
                    key={n}
                    onClick={() => setCantidad(n)}
                    className={`py-3 rounded-xl text-sm font-medium transition-colors border ${
                      cantidad === n
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Timer</p>
                  <p className="text-xs text-gray-400 mt-0.5">1.5 minutos por pregunta</p>
                </div>
                <button
                  onClick={() => setTimerActivo(!timerActivo)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    timerActivo ? 'bg-black' : 'bg-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                    timerActivo ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-xs text-gray-400 text-center">
                {areas.length > 0
                  ? `${areas.length} especialidad${areas.length > 1 ? 'es' : ''} · ${cantidad} preguntas${timerActivo ? ` · ${Math.round(cantidad * 1.5)} min máx` : ''}`
                  : 'Seleccioná al menos una especialidad'
                }
              </p>
            </div>

            <button
              onClick={handleIniciar}
              disabled={areas.length === 0}
              className="w-full bg-black text-white rounded-xl py-3.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Iniciar simulacro
            </button>

          </div>
        </div>
      </div>

      {mostrarTemasActivos && (
        <TemasActivos onCerrar={handleCerrarTemas} />
      )}
    </>
  )
}