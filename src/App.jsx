import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Register from './pages/Register'
import Practice from './pages/Practice'
import TopicSelector from './pages/TopicSelector'
import SubtopicSelector from './pages/SubtopicSelector'
import Simulacro from './pages/Simulacro'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import ProtectedAdmin from './components/ProtectedAdmin'
import Landing from './pages/Landing'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{width:'24px', height:'24px', border:'2px solid black', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite'}} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Home session={session} /> : <Landing />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!session ? <Register /> : <Navigate to="/" />} />
        <Route path="/practice" element={session ? <TopicSelector /> : <Navigate to="/login" />} />
        <Route path="/practice/area/:area" element={session ? <SubtopicSelector /> : <Navigate to="/login" />} />
        <Route path="/practice/area/:area/all" element={session ? <Practice modo="area" /> : <Navigate to="/login" />} />
        <Route path="/practice/area/:area/subtema/:subtema" element={session ? <Practice modo="subtema" /> : <Navigate to="/login" />} />
        <Route path="/simulacro" element={session ? <Simulacro /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={session ? <ProtectedAdmin><Admin /></ProtectedAdmin> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

function Home({ session }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mx-auto mb-6">
          <div className="w-4 h-4 border-2 border-white rounded-sm" />
        </div>
        <p className="text-lg font-medium text-gray-900 mb-1">ResidenciasApp</p>
        <p className="text-sm text-gray-400 mb-8">Hola, {session.user.email}</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button onClick={() => navigate('/dashboard')} className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors">Mi progreso</button>
          <button onClick={() => navigate('/practice')} className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors">Practicar por tema</button>
          <button onClick={() => navigate('/simulacro')} className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors">Simulacro personalizado</button>
          <button onClick={() => navigate('/profile')} className="w-full border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:border-gray-400 transition-colors">Mi perfil</button>
          <button onClick={handleLogout} className="text-sm text-gray-400 underline underline-offset-4 hover:text-black transition-colors">Cerrar sesión</button>
        </div>
      </div>
    </div>
  )
}