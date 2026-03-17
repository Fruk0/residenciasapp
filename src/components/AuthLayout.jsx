export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-sm" />
          </div>
          <span className="text-base font-medium text-black">ResidenciasApp</span>
        </div>

        {children}

      </div>
    </div>
  )
}