import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'
import { useTheme } from '../hooks/useTheme'
import DarkModeToggle from '../components/DarkModeToggle'

export default function Profile() {
  const { d, setMeta: setMetaGlobal } = useTheme()
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [editNombre, setEditNombre] = useState(false)
  const [editMeta, setEditMeta] = useState(false)
  const [editFecha, setEditFecha] = useState(false)
  const [nombre, setNombre] = useState('')
  const [meta, setMeta] = useState(80)
  const [fecha, setFecha] = useState('')
  const [simulacros, setSimulacros] = useState([])
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
    const { data: intentos } = await supabase.from('attempts').select('modo, es_correcta, timestamp').eq('user_id', user.id).eq('modo','simulacro').order('timestamp',{ascending:false}).limit(50)
    if (userData) { setPerfil(userData); setNombre(userData.nombre||''); setMeta(userData.meta_aciertos||80); setFecha(userData.fecha_examen||'') }
    if (intentos) {
      const ag = {}
      intentos.forEach(({ timestamp, es_correcta }) => {
        const dia = timestamp.split('T')[0]
        if (!ag[dia]) ag[dia] = { correctas: 0, total: 0 }
        ag[dia].total++; if (es_correcta) ag[dia].correctas++
      })
      setSimulacros(Object.entries(ag).map(([fecha,{correctas,total}])=>({fecha,porcentaje:Math.round((correctas/total)*100),total})).slice(0,5))
    }
    setLoading(false)
  }

  const guardar = async (campos) => {
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('users').update(campos).eq('id', user.id)
    await cargar(); setGuardando(false)
  }

  const handleReset = async () => {
    if (!window.confirm('⚠️ Esto borra TODOS tus intentos y progreso. ¿Estás seguro?')) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('attempts').delete().eq('user_id', user.id)
    await supabase.from('simulacros').delete().eq('user_id', user.id)
    window.alert('Métricas reseteadas.')
    await cargar()
  }

  const diasExamen = () => {
    if (!perfil?.fecha_examen) return null
    const diff = Math.ceil((new Date(perfil.fecha_examen)-new Date())/86400000)
    return diff > 0 ? diff : null
  }

  const formatFechaDisplay = (s) => {
    if (!s) return ''
    const [y,m,day] = s.split('-')
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
    return `${parseInt(day)} de ${meses[parseInt(m)-1]}, ${y}`
  }

  const getColor = (pct) => pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444'
  const iniciales = (n) => n ? n.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2) : '?'

  if (loading) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:d.bg}}>
      <div style={{width:24,height:24,border:`2px solid ${d.text1}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    </div>
  )

  const dias = diasExamen()
  const card = {background:d.card, border:`1px solid ${d.border}`, borderRadius:18, padding:20, marginBottom:16}
  const label = {fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.1em', color:d.text3, margin:'0 0 12px'}
  const editLink = (fn) => ({fontSize:12, color:d.text3, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', onClick:fn})

  return (
    <div style={{minHeight:'100vh', background:d.bg, padding:'32px 16px', transition:'background 0.2s'}}>
      <div style={{maxWidth:520, margin:'0 auto'}}>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24}}>
          <button onClick={() => navigate('/')} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:d.text3,background:'none',border:'none',cursor:'pointer'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6"/></svg>
            Inicio
          </button>
          <h1 style={{fontSize:14, fontWeight:500, color:d.text1, margin:0}}>Perfil</h1>
          <DarkModeToggle />
        </div>

        <div style={card}>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <div style={{width:60, height:60, borderRadius:'50%', background:d.card2, border:`1px solid ${d.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              <span style={{fontSize:20, fontWeight:500, color:d.text2}}>{iniciales(perfil?.nombre)}</span>
            </div>
            <div style={{flex:1, minWidth:0}}>
              {editNombre ? (
                <div style={{display:'flex', gap:8}}>
                  <input value={nombre} onChange={e=>setNombre(e.target.value)} autoFocus style={{flex:1, background:d.card2, border:`1px solid ${d.border2}`, borderRadius:8, padding:'6px 10px', fontSize:13, color:d.text1, outline:'none'}}/>
                  <button onClick={async()=>{await guardar({meta_aciertos:meta});setMetaGlobal(meta);setEditMeta(false)}} disabled={guardando} style={{fontSize:12, background:d.btnBg, color:d.btnText, border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer'}}>{guardando?'...':'OK'}</button>
                </div>
              ) : (
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <p style={{fontSize:15, fontWeight:500, color:d.text1, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{perfil?.nombre||'Sin nombre'}</p>
                  <button onClick={()=>setEditNombre(true)} style={{fontSize:11, color:d.text3, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', flexShrink:0}}>Editar</button>
                </div>
              )}
              <p style={{fontSize:11, color:d.text3, margin:'4px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{perfil?.email}</p>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <p style={label}>Fecha del examen</p>
            <button onClick={()=>setEditFecha(!editFecha)} style={{fontSize:11, color:d.text3, background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>{editFecha?'Cancelar':'Editar'}</button>
          </div>
          {editFecha ? (
            <div style={{display:'flex', gap:8}}>
              <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{flex:1, background:d.card2, border:`1px solid ${d.border2}`, borderRadius:8, padding:'6px 10px', fontSize:13, color:d.text1, outline:'none'}}/>
              <button onClick={async()=>{await guardar({fecha_examen:fecha});setEditFecha(false)}} disabled={guardando} style={{fontSize:12, background:d.btnBg, color:d.btnText, border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer'}}>{guardando?'...':'OK'}</button>
            </div>
          ) : (
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <p style={{fontSize:13, fontWeight:500, color:d.text1, margin:0}}>{perfil?.fecha_examen?formatFechaDisplay(perfil.fecha_examen):'No configurada'}</p>
              {dias&&<span style={{fontSize:11, color:d.text2, background:d.card2, borderRadius:8, padding:'4px 10px'}}>{dias} días</span>}
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <p style={label}>Meta de aciertos</p>
            <button onClick={()=>setEditMeta(!editMeta)} style={{fontSize:11, color:d.text3, background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>{editMeta?'Cancelar':'Editar'}</button>
          </div>
          {editMeta ? (
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <input type="number" min="50" max="100" value={meta} onChange={e=>setMeta(parseInt(e.target.value))} style={{width:64, background:d.card2, border:`1px solid ${d.border2}`, borderRadius:8, padding:'6px 10px', fontSize:13, color:d.text1, outline:'none'}}/>
              <span style={{fontSize:13, color:d.text3}}>%</span>
              <button onClick={async()=>{await guardar({meta_aciertos:meta});setEditMeta(false)}} disabled={guardando} style={{fontSize:12, background:d.btnBg, color:d.btnText, border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer'}}>{guardando?'...':'OK'}</button>
            </div>
          ) : (
            <p style={{fontSize:13, fontWeight:500, color:d.text1, margin:0}}>{perfil?.meta_aciertos||80}%</p>
          )}
        </div>

        {simulacros.length > 0 && (
          <div style={card}>
            <p style={label}>Simulacros recientes</p>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {simulacros.map(({fecha,porcentaje,total},i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${d.border}`}}>
                  <div>
                    <p style={{fontSize:12, fontWeight:500, color:d.text1, margin:'0 0 2px'}}>{total} preguntas</p>
                    <p style={{fontSize:11, color:d.text3, margin:0}}>{fecha}</p>
                  </div>
                  <span style={{fontSize:14, fontWeight:500, color:getColor(porcentaje)}}>{porcentaje}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{marginBottom:8}}>
          <button onClick={handleReset} style={{width:'100%', border:'1px solid #fca5a5', color:'#ef4444', background:'transparent', borderRadius:14, padding:'12px 0', fontSize:13, cursor:'pointer'}}>Resetear métricas</button>
          <p style={{fontSize:10, color:d.text3, textAlign:'center', marginTop:6}}>Borra todo tu historial de práctica y simulacros.</p>
        </div>

        <button onClick={async()=>await supabase.auth.signOut()} style={{width:'100%', fontSize:12, color:d.text3, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', padding:'12px 0'}}>Cerrar sesión</button>
      </div>
    </div>
  )
}