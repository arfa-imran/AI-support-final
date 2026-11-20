import {useState,useEffect,useRef} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {useApp} from './store.jsx'
import {AuthLayout} from './layout.jsx'
import {PasswordInput,Card,PageHeader,EmptyState} from './ui.jsx'
import {ScrollText} from 'lucide-react'
const Field=({l,...p})=><label className="f">{l}<input {...p}/></label>

export function Auth({mode}){
  const {login}=useApp(),nav=useNavigate(),reg=mode==='register',staff=mode==='staff'
  const [role,setRole]=useState('agent'),[email,setEmail]=useState(''),[pw,setPw]=useState(''),[pw2,setPw2]=useState(''),[err,setErr]=useState('')
  const edit=set=>e=>{set(e.target.value);setErr('')}
  const go=e=>{e.preventDefault()
    if(pw.length<6)return setErr('Password must be at least 6 characters.')
    if(reg&&pw!==pw2)return setErr('Passwords do not match.')
    const r=staff?role:'customer';login(r,email);nav(r==='customer'?'/portal':'/'+r)}
  return <AuthLayout><form className="card" onSubmit={go} noValidate={false}>
    <h1>{reg?'Create account':staff?'Staff log in':'Customer log in'}</h1>
    {staff&&<div className="seg" role="radiogroup" aria-label="I am a">{['agent','admin'].map(r=><button type="button" key={r} role="radio" aria-checked={role===r} className={role===r?'on':''} onClick={()=>setRole(r)}>{r}</button>)}</div>}
    <Field l="Email" type="email" required autoComplete="email" value={email} onChange={edit(setEmail)}/>
    <PasswordInput label="Password" required autoComplete={reg?'new-password':'current-password'} value={pw} onChange={edit(setPw)}/>
    {reg&&<PasswordInput label="Confirm password" required autoComplete="new-password" value={pw2} onChange={edit(setPw2)}/>}
    <p className="err" role="alert" hidden={!err}>{err}</p>
    <button className="btn">{reg?'Create account':'Log in'}</button>
    <p className="mute">{reg?<>Have an account? <Link to="/login">Log in</Link></>:staff?<Link to="/portal">Go to the customer portal</Link>:<>No account? <Link to="/register">Register</Link> · <Link to="/portal">Continue as guest</Link></>}</p>
    <p className="mute">Demo mode: any email and a 6+ character password works.</p></form></AuthLayout>
}

export function Chat(){
  const {msgs,busy,send,clearChat,convos,user}=useApp(),[t,setT]=useState(''),box=useRef()
  // scroll only the message list, never the whole page
  useEffect(()=>{const el=box.current;if(el)el.scrollTop=el.scrollHeight},[msgs,busy])
  const past=convos.filter(c=>c.customer===user.name)
  return <div className="card chat"><div className="row between"><h1>Chat</h1><button type="button" className="btn sm alt" onClick={clearChat} disabled={msgs.length<=1}>New chat</button></div>
    <div className="msgs" ref={box} role="log" aria-live="polite" aria-label="Conversation with the AI agent">{msgs.map((m,i)=><div key={i} className={'b '+m.who}>{m.text}{m.who==='bot'&&m.intent&&<div className="mute">Intent detected: {m.intent}</div>}{m.action&&<div className="act"><strong>{m.action.label}</strong><br/>{m.action.detail}</div>}</div>)}{busy&&<div className="b bot dots">Typing…</div>}</div>
    {past.map(c=><details key={c.id} className="mute"><summary>Past chat {c.id} · {c.t}</summary>{c.msgs.map((m,i)=><div key={i}>{m.who==='me'?'You':'AI'}: {m.text}</div>)}</details>)}
    <div className="chips">{['Where is ORD-1001?','Refund ORD-1001','Refund ORD-1004','Talk to a human'].map(q=><button type="button" key={q} className="chip" disabled={busy} onClick={()=>send(q)}>{q}</button>)}</div>
    <form className="row chatform" onSubmit={e=>{e.preventDefault();if(!t.trim()||busy)return;send(t);setT('')}}><input aria-label="Message" value={t} onChange={e=>setT(e.target.value)} placeholder="Type your message" autoComplete="off"/><button className="btn" disabled={busy||!t.trim()}>Send</button></form></div>
}

export function AiLog(){
  const {log}=useApp(),[q,setQ]=useState(''),rows=log.filter(a=>(a.a+' '+a.d).toLowerCase().includes(q.toLowerCase()))
  return <><PageHeader title="AI action log" subtitle="Everything the AI agent has done on behalf of customers."/>
    <Card><div className="stack"><Field l="Search" placeholder="Search actions" value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:320}}/>
    {rows.length?<div className="tw"><table><thead><tr><th>Time</th><th>Action</th><th>Details</th></tr></thead><tbody>{rows.map((a,i)=><tr key={i}><td>{a.t}</td><td>{a.a}</td><td>{a.d}</td></tr>)}</tbody></table></div>
    :<EmptyState icon={ScrollText} title={log.length?'No matching actions':'No AI actions yet'} text={log.length?'Try a different search.':'Actions the AI agent takes will show up here.'}/>}</div></Card></>
}
