import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTemasActivos } from '../hooks/useTemasActivos'
import { formatArea } from '../lib/formatArea'

export default function TemasActivos({ onCerrar }) {
  const [todasAreas, setTodasAreas] = useState([])
  const [loadingAreas, setLoadingAreas] = useState(true)
  const { temasActivos, loading, toggle } = useTemasActivos()

  useEffect(() => {
    cargarAreas()
  }, [])

  const cargarAreas = async () => {
    const { data } = await supabase
      .from('questions')
      .select('area')
      .eq('estado', 'activo')
      .limit(1000)

    if (data) {
      const unicas = [...new Set(data.map(d => d.area))].sort()
      setTodasAreas(unicas)
    }
    setLoadingAreas(false)
  }

  if (loading || loadingAreas) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />
        <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-8 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto z-10">

        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Mis temas activos</p>
            <p className="text-xs text-gray-400 mt-0.5">Tildá los temas que ya estudiaste</p>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black text-sm"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 mb-4">
            {temasActivos.length} de {todasAreas.length} temas activos
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {todasAreas.map(area => {
              const activo = temasActivos.includes(area)
              return (
                <button
                  key={formatArea(area)}
                  onClick={() => toggle(area)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors border ${
                    activo
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {formatArea(area)}
                </button>
              )
            })}
          </div>

          <button
            onClick={onCerrar}
            className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}