export default function DetailModal({ pregunta, onCerrar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCerrar}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto z-10">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Detalle extendido</p>
            <p className="text-xs text-gray-400 mt-0.5">{pregunta.area}{pregunta.subtema ? ` · ${pregunta.subtema}` : ''}</p>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="px-5 py-5">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
            {pregunta.detalle_extendido}
          </p>

          {pregunta.bibliografia && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Bibliografía
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {pregunta.bibliografia}
              </p>
            </div>
          )}

          {pregunta.anio_examen && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Fuente:</span>
              <span className="text-xs text-gray-500">Examen {pregunta.anio_examen}</span>
            </div>
          )}
        </div>

        <div className="px-5 pb-6">
          <button
            onClick={onCerrar}
            className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}