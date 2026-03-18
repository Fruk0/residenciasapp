import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatArea } from '../lib/formatArea'
import { useTheme } from '../hooks/useTheme'
import DarkModeToggle from '../components/DarkModeToggle'

export default function Dashboard() {
  const { d } = useTheme()
  const [perfil, setPerfil] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
    const { data: intentos } = await supabase.from('attempts').select('question_id, es_correcta, modo, timestamp').eq('user_id', user.id).order('timestamp', { ascending: false }).limit(5000)
    const { data: preguntas } = await supabase.from('questions').select('id, area').eq('estado', 'activo').limit(1000)
    setPerfil(userData)
    if (intentos && preguntas) {
      const areasPorId = {}
      preguntas.forEach(({ id, area }) => { areasPorId[id] = area })
      const total = intentos.length
      const correctasTotal = intentos.filter(i => i.es_correcta).length
      const pctGlobal = total > 0 ? Math.round((correctasTotal / total) * 100) : null
      const porArea = {}
      intentos.forEach(({ question_id, es_correcta }) => {
        const area = areasPorId[question_id]; if (!area) return
        if (!porArea[area]) porArea[area] = { correctas: 0, total: 0 }
        porArea[area].total++; if (es_correcta) porArea[area].correctas++
      })
      const hoy = new Date()
      const hace7 = new Date(hoy); hace7.setDate(hoy.getDate()-7)
      const hace14 = new Date(hoy); hace14.setDate(hoy.getDate()-14)
      const sem = intentos.filter(i => new Date(i.timestamp) >= hace7)
      const semAnt = intentos.filter(i => { const t=new Date(i.timestamp); return t>=hace14 && t<hace7 })
      const pctSem = sem.length > 0 ? Math.round((sem.filter(i=>i.es_correcta).length/sem.length)*100) : null
      const pctSemAnt = semAnt.length > 0 ? Math.round((semAnt.filter(i=>i.es_correcta).length/semAnt.length)*100) : null
      const comparativa = pctSem!==null && pctSemAnt!==null ? pctSem-pctSemAnt : null
      const dias = [...new Set(intentos.map(i=>i.timestamp.split('T')[0]))].sort().reverse()
      let racha = 0
      const todayStr = new Date().toISOString().split('T')[0]
      const ayerStr = new Date(Date.now()-86400000).toISOString().split('T')[0]
      if (dias[0]===todayStr||dias[0]===ayerStr) { racha=1; for(let i=1;i<dias.length;i++){const diff=(new Date(dias[i-1])-new Date(dias[i]))/86400000; if(diff===1)racha++; else break} }
      const grupos = {}
      intentos.forEach(({ timestamp, es_correcta, modo }) => {
        const key = `${timestamp.split('T')[0]}_${modo}`
        if (!grupos[key]) grupos[key] = { fecha: timestamp, modo, correctas: 0, total: 0 }
        grupos[key].total++; if (es_correcta) grupos[key].correctas++
      })
      const sesiones = Object.values(grupos).sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(({fecha,modo,correctas,total})=>({fecha,modo,porcentaje:Math.round((correctas/total)*100),total})).slice(0,5)
      setStats({ pctGlobal, total, correctasTotal, porArea, comparativa, racha, sesiones, meta: userData?.meta_aciertos||80 })
    }
    setLoading(false)
  }

  const getColor = (pct, meta) => pct >= meta ? '#22c55e' : pct >= meta*0.75 ? '#eab308' : '#ef4444'

  const formatFecha = (fechaStr) => {
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now()-86400000).toISOString().split('T')[0]
    const dia = fechaStr.split('T')[0]
    if (dia===hoy) return `Hoy, ${fechaStr.split('T')[1]?.slice(0,5)}`
    if (dia===ayer) return `Ayer, ${fechaStr.split('T')[1]?.slice(0,5)}`
    return dia.split('-').reverse().join('/')
  }

  const diasExamen = () => {
    if (!perfil?.fecha_examen) return null
    const diff = Math.ceil((new Date(perfil.fecha_examen)-new Date())/86400000)
    return diff > 0 ? diff : null
  }

  if (loading) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:d.bg}}>
      <div style={{width:24,height:24,border:`2px solid ${d.text1}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    </div>
  )

  const dias = diasExamen()

  return (
    <div style={{minHeight:'100vh', background:d.bg, padding:'32px 16px', transition:'background 0.2s'}}>
      <div style={{maxWidth:560, margin:'0 auto'}}>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24}}>
          <div>
            <h1 style={{fontSize:22, fontWeight:500, color:d.text1, margin:'0 0 4px'}}>Mi progreso.</h1>
            {dias && <p style={{fontSize:12, color:d.text3, margin:0}}>Examen en {dias} días</p>}
          </div>
          <div style={{display:'flex', gap:8}}>
            <DarkModeToggle />
            <button onClick={() => navigate('/')} style={{fontSize:12, color:d.text3, border:`1px solid ${d.border2}`, borderRadius:10, padding:'6px 14px', background:'transparent', cursor:'pointer'}}>Inicio</button>
          </div>
        </div>

        {stats?.pctGlobal !== null && stats?.pctGlobal !== undefined ? (
          <div style={{background:d.card, border:`1px solid ${d.border}`, borderRadius:18, padding:20, marginBottom:16}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div>
                <p style={{fontSize:11, color:d.text3, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 8px'}}>Aciertos globales</p>
                <p style={{fontSize:52, fontWeight:500, color:getColor(stats.pctGlobal,stats.meta), margin:'0 0 4px'}}>{stats.pctGlobal}%</p>
                <p style={{fontSize:11, color:d.text3, margin:0}}>meta: {stats.meta}% · {stats.total} respondidas</p>
              </div>
              <div style={{position:'relative', width:64, height:64}}>
                <svg viewBox="0 0 64 64" style={{width:64, height:64, transform:'rotate(-90deg)'}}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke={d.track} strokeWidth="5"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke={getColor(stats.pctGlobal,stats.meta)} strokeWidth="5"
                    strokeDasharray={`${2*Math.PI*26}`} strokeDashoffset={`${2*Math.PI*26*(1-stats.pctGlobal/100)}`} strokeLinecap="round"/>
                </svg>
                <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{fontSize:11, fontWeight:500, color:d.text1}}>{stats.pctGlobal}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{background:d.card, border:`1px solid ${d.border}`, borderRadius:18, padding:20, marginBottom:16, textAlign:'center'}}>
            <p style={{fontSize:13, color:d.text3, marginBottom:12}}>Todavía no respondiste ninguna pregunta.</p>
            <button onClick={() => navigate('/practice')} style={{fontSize:13, color:d.text1, background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>Empezar a practicar</button>
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16}}>
          {[
            {label:'respondidas', value:stats?.total||0, color:d.text1},
            {label:'días racha', value:stats?.racha||0, color:stats?.racha>0?'#22c55e':d.text1},
            {label:'vs sem. ant.', value:stats?.comparativa==null?'—':stats.comparativa>0?`+${stats.comparativa}%`:stats.comparativa===0?'=': `${stats.comparativa}%`, color:stats?.comparativa>0?'#22c55e':stats?.comparativa<0?'#ef4444':d.text1}
          ].map(({label,value,color})=>(
            <div key={label} style={{background:d.card, border:`1px solid ${d.border}`, borderRadius:14, padding:'14px 10px', textAlign:'center'}}>
              <p style={{fontSize:22, fontWeight:500, color, margin:'0 0 4px'}}>{value}</p>
              <p style={{fontSize:10, color:d.text3, margin:0}}>{label}</p>
            </div>
          ))}
        </div>

        {stats?.porArea && Object.keys(stats.porArea).length > 0 && (
          <div style={{background:d.card, border:`1px solid ${d.border}`, borderRadius:18, padding:20, marginBottom:16}}>
            <p style={{fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.1em', color:d.text3, margin:'0 0 16px'}}>Por especialidad</p>
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {Object.entries(stats.porArea).map(([area,{correctas,total}])=>({area,pct:Math.round((correctas/total)*100)})).sort((a,b)=>b.pct-a.pct).map(({area,pct})=>(
                <div key={area}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                    <span style={{fontSize:12, color:d.text2}}>{formatArea(area)}</span>
                    <span style={{fontSize:12, fontWeight:500, color:getColor(pct,stats.meta)}}>{pct}%</span>
                  </div>
                  <div style={{height:4, background:d.track, borderRadius:99, overflow:'hidden'}}>
                    <div style={{height:'100%', width:`${pct}%`, background:getColor(pct,stats.meta), borderRadius:99, transition:'width 0.5s'}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats?.sesiones?.length > 0 && (
          <div style={{background:d.card, border:`1px solid ${d.border}`, borderRadius:18, padding:20, marginBottom:16}}>
            <p style={{fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.1em', color:d.text3, margin:'0 0 12px'}}>Últimas sesiones</p>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {stats.sesiones.map(({fecha,modo,porcentaje,total},i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${d.border}` }}>
                  <div>
                    <p style={{fontSize:12, fontWeight:500, color:d.text1, margin:'0 0 2px'}}>{modo==='simulacro'?'Simulacro':'Práctica'} · {total} preguntas</p>
                    <p style={{fontSize:11, color:d.text3, margin:0}}>{formatFecha(fecha)}</p>
                  </div>
                  <span style={{fontSize:14, fontWeight:500, color:getColor(porcentaje,stats.meta)}}>{porcentaje}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => navigate('/')} style={{width:'100%', fontSize:12, color:d.text3, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', padding:'16px 0'}}>Volver al inicio</button>
      </div>
    </div>
  )
}