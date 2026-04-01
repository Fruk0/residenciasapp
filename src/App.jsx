import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import Home from './pages/Home'
import AreaSelector from './pages/AreaSelector'
import Onboarding from './pages/Onboarding'

async function checkBloqueado(userId) {
  const { data } = await supabase
    .from('users')
    .select('estado_cuenta')
    .eq('id', userId)
    .single()
  return data?.estado_cuenta === 'bloqueado'
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const bloqueado = await checkBloqueado(session.user.id)
        if (bloqueado) {
          await supabase.auth.signOut()
          setSession(null)
        } else {
          setSession(session)
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid black', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
        <Route path="/practice/modo/:modo" element={session ? <AreaSelector /> : <Navigate to="/login" />} />
        <Route path="/practice/modo/:modo/especialidad/:especialidad" element={session ? <SubtopicSelector /> : <Navigate to="/login" />} />
        <Route path="/practice/modo/:modo/especialidad/:especialidad/run" element={session ? <Practice /> : <Navigate to="/login" />} />
        <Route path="/simulacro" element={session ? <Simulacro /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={session ? <ProtectedAdmin><Admin /></ProtectedAdmin> : <Navigate to="/login" />} />
        <Route path="/onboarding" element={session ? <Onboarding /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}