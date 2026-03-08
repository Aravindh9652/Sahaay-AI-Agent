import React, {useState} from 'react'

export default function AIConsole(){
  const [q,setQ] = useState('')
  const [r,setR] = useState(null)
  const [loading,setLoading] = useState(false)

  async function run(){
    setLoading(true)
    try{
      const res = await fetch('/api/ai/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})})
      const data = await res.json()
      setR(data)
    }catch(e){
      setR({ error: String(e) })
    }
    setLoading(false)
  }

  return (
    <div>
      <textarea value={q} onChange={e=>setQ(e.target.value)} rows={6} style={{width:'100%'}} />
      <div style={{marginTop:8}}>
        <button onClick={run} disabled={loading || !q}>Run</button>
      </div>
      {r && <pre style={{marginTop:12,background:'#f2f2f2',padding:12}}>{JSON.stringify(r,null,2)}</pre>}
    </div>
  )
}
