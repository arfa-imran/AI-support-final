import {useState,useEffect,useRef} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {useApp,STATUSES,L,useBase} from './store.jsx'
import {AuthLayout} from './layout.jsx'
import {PasswordInput,useToast} from './ui.jsx'
const Tag=({s})=><span className={'tag '+({Approved:'ok',Resolved:'ok',Delivered:'ok',Rejected:'x',Pending:'w',Open:'w','In progress':'w',Shipped:'w'}[s]||'')}>{s}</span>
const Empty=({t})=><p className="empty">{t}</p>
const Field=({l,...p})=><label className="f">{l}<input {...p}/></label>
export function Auth({mode}){
  const {login}=useApp(),nav=useNavigate(),reg=mode==='register',staff=mode==='staff'
  const [role,setRole]=useState(staff?'agent':'customer'),[email,setEmail]=useState(''),[pw,setPw]=useState(''),[pw2,setPw2]=useState(''),[err,setErr]=useState('')
  const go=e=>{e.preventDefault()
    if(pw.length<6)return setErr('Password must be at least 6 characters.')
    if(reg&&pw!==pw2)return setErr('Passwords do not match.')
    const r=staff?role:'customer';login(r,email);nav(r==='customer'?'/portal':'/'+r)}
  return <AuthLayout><form className="card" onSubmit={go}>
    <h1>{reg?'Create account':staff?'Staff log in':'Customer log in'}</h1>
    {staff&&<div className="seg" role="radiogroup" aria-label="I am a">{['agent','admin'].map(r=><button type="button" key={r} className={role===r?'on':''} onClick={()=>setRole(r)}>{r}</button>)}</div>}
    <Field l="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/>
    <PasswordInput label="Password" required value={pw} onChange={e=>setPw(e.target.value)}/>
    {reg&&<PasswordInput label="Confirm password" required value={pw2} onChange={e=>setPw2(e.target.value)}/>}
    {err&&<p className="err">{err}</p>}
    <button className="btn">{reg?'Create account':'Log in'}</button>
    <p className="mute">{reg?<>Have an account? <L to="/login">Log in</L></>:staff?<Link to="/portal">Go to the customer portal</Link>:<>No account? <Link to="/register">Register</Link> · <Link to="/portal">Continue as guest</Link></>}</p>
    <p className="mute">Demo mode: any email and a 6+ character password works.</p></form></AuthLayout>
}
export function Profile(){
  const {user,setUser}=useApp(),toast=useToast(),[p,setP]=useState(user),[ok,setOk]=useState(false)
  const set=k=>e=>setP({...p,[k]:e.target.value})
  return <form className="card narrow" onSubmit={e=>{e.preventDefault();setUser(p);setOk(true);toast('Profile saved','success')}}>
    <h1>My profile</h1><p className="mute">Role: <Tag s={user.role}/></p>
    <Field l="Name" value={p.name} onChange={set('name')}/><Field l="Email" value={p.email} readOnly/>
    <Field l="Phone" value={p.phone} onChange={set('phone')}/><Field l="Address" value={p.address} onChange={set('address')}/>
    <button className="btn">Save changes</button>{ok&&<p role="status" className="okmsg">Saved.</p>}</form>
}
export function Orders(){
  const {orders,addOrder,setStatus,user}=useApp(),[item,setItem]=useState(''),staff=user.role!=='customer'
  return <div className="card"><h1>Orders</h1>
    <form className="row" onSubmit={e=>{e.preventDefault();if(item.trim()){addOrder(item);setItem('')}}}><Field l="New order item" value={item} onChange={e=>setItem(e.target.value)}/><button className="btn">Add order</button></form>
    <div className="tw"><table><thead><tr><th>Order</th><th>Item</th><th>Status</th><th>Note</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><L to={'/orders/'+o.id}>{o.id}</L></td><td>{o.item}</td>
      <td>{staff?<select aria-label="Order status" value={o.status} onChange={e=>setStatus(o.id,e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>:<Tag s={o.status}/>}</td>
      <td>{o.delay?o.delay+' days late':o.status==='Delivered'?'Delivered '+o.ago+' days ago':'On time'}</td></tr>)}</tbody></table></div></div>
}
export function OrderDetail(){
  const {id}=useParams(),{orders}=useApp(),o=orders.find(x=>x.id===id)
  if(!o)return <Empty t="Order not found."/>
  const i=STATUSES.indexOf(o.status)
  return <div className="card narrow"><h1>{o.id}</h1><p>{o.item}</p><ol className="steps">{STATUSES.map((s,k)=><li key={s} className={k<=i?'on':''}>{s}</li>)}</ol>
    {o.delay>0&&<p className="err">This order is {o.delay} days late.</p>}<L to="/orders">Back to orders</L></div>
}
export function Refunds(){
  const {orders,refunds:allR,newRefund,setRefund,user,addLog,eligible}=useApp(),staff=user.role!=='customer'
  const [o,setO]=useState(orders[0].id),[why,setWhy]=useState('')
  const refunds=user.role==='customer'?allR.filter(r=>r.by===user.email):allR
  const [okE,whyE]=eligible(orders.find(x=>x.id===o))
  return <div className="stack"><form className="card" onSubmit={e=>{e.preventDefault();const r=newRefund(o,why||whyE,user.email);addLog('Refund requested',r.id);setWhy('')}}>
    <h1>Request a refund</h1><label className="f">Order<select value={o} onChange={e=>setO(e.target.value)}>{orders.map(x=><option key={x.id}>{x.id}</option>)}</select></label>
    <Field l="Reason" value={why} onChange={e=>setWhy(e.target.value)}/><p className={okE?'okmsg':'err'} role="status">{okE?'Eligible: ':'Not eligible: '}{whyE}</p><button className="btn" disabled={!okE}>Submit request</button></form>
    <div className="card"><h2>Refund requests</h2>{refunds.length?<div className="tw"><table><thead><tr><th>ID</th><th>Order</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>{refunds.map(r=><tr key={r.id}><td>{r.id}</td><td>{r.order}</td><td>{r.reason}</td><td><Tag s={r.status}/></td>
      <td>{staff&&r.status==='Pending'&&<><button className="btn sm" onClick={()=>setRefund(r.id,'Approved')}>Approve</button> <button className="btn sm alt" onClick={()=>setRefund(r.id,'Rejected')}>Reject</button></>}</td></tr>)}</tbody></table></div>:<Empty t="No refund requests yet."/>}</div></div>
}
export function Tickets(){
  const {tickets:all,newTicket,orders,user}=useApp(),nav=useNavigate(),b=useBase(),[s,setS]=useState(''),[o,setO]=useState('')
  const tickets=user.role==='customer'?all.filter(t=>t.by===user.email):all
  return <div className="stack"><form className="card" onSubmit={e=>{e.preventDefault();if(s.trim()){const k=newTicket(s,o,user.email);nav(b+'/tickets/'+k.id)}}}>
    <h1>Create a ticket</h1><Field l="What is the problem?" value={s} onChange={e=>setS(e.target.value)}/>
    <label className="f">Order (optional)<select value={o} onChange={e=>setO(e.target.value)}><option value="">None</option>{orders.map(x=><option key={x.id}>{x.id}</option>)}</select></label><button className="btn">Create ticket</button></form>
    <div className="card"><h2>Tickets</h2>{tickets.length?<div className="tw"><table><thead><tr><th>ID</th><th>Subject</th><th>Order</th><th>Assigned</th><th>Status</th></tr></thead><tbody>{tickets.map(t=><tr key={t.id}><td><L to={'/tickets/'+t.id}>{t.id}</L></td><td>{t.subject}</td><td>{t.order}</td><td>{t.assignee||'Nobody'}</td><td><Tag s={t.status}/></td></tr>)}</tbody></table></div>:<Empty t="No tickets yet."/>}</div></div>
}
export function TicketDetail(){
  const {id}=useParams(),{tickets,patchTicket,replyTicket,user,agents}=useApp(),t=tickets.find(x=>x.id===id),[txt,setTxt]=useState(''),staff=user.role!=='customer'
  if(!t)return <Empty t="Ticket not found."/>
  return <div className="card"><div className="row between"><div><h1>{t.id}</h1><p className="mute">Order: {t.order}</p></div>
    {staff?<div className="row"><label className="f">Assign<select value={t.assignee} onChange={e=>patchTicket(t.id,{assignee:e.target.value})}><option value="">Nobody</option>{agents.map(a=><option key={a.id}>{a.name}</option>)}</select></label>
    <label className="f">Status<select value={t.status} onChange={e=>patchTicket(t.id,{status:e.target.value})}>{['Open','In progress','Resolved'].map(s=><option key={s}>{s}</option>)}</select></label></div>:<Tag s={t.status}/>}</div>
    <div className="thread">{t.msgs.map((m,i)=><div key={i} className={'b '+(m.who==='customer'?'bot':'me')}>{m.text}</div>)}</div>
    <form className="row" onSubmit={e=>{e.preventDefault();if(txt.trim()){replyTicket(t.id,staff?'agent':'customer',txt);setTxt('')}}}><Field l="Reply" value={txt} onChange={e=>setTxt(e.target.value)}/><button className="btn">Send reply</button></form></div>
}
export function Chat(){
  const {msgs,busy,send,clearChat,convos,user}=useApp(),[t,setT]=useState(''),end=useRef()
  useEffect(()=>{end.current?.scrollIntoView({block:'end'})},[msgs,busy])
  return <div className="card chat"><div className="row between"><h1>Chat</h1><button className="btn sm alt" onClick={clearChat}>New chat</button></div>
    <div className="msgs" aria-live="polite">{msgs.map((m,i)=><div key={i} className={'b '+m.who}>{m.text}{m.who==='bot'&&m.intent&&<div className="mute" style={{fontSize:'.75rem',marginTop:4}}>Intent detected: {m.intent}</div>}{m.action&&<div className="act"><strong>{m.action.label}</strong><br/>{m.action.detail}</div>}</div>)}{busy&&<div className="b bot dots">Typing…</div>}<div ref={end}/></div>
    {convos.filter(c=>c.customer===user.name).map(c=><details key={c.id} className="mute"><summary>Past chat {c.id} · {c.t}</summary>{c.msgs.map((m,i)=><div key={i}>{m.who==='me'?'You':'AI'}: {m.text}</div>)}</details>)}
    <div className="chips">{['Where is ORD-1001?','Refund ORD-1001','Refund ORD-1004','Talk to a human'].map(q=><button key={q} className="chip" onClick={()=>send(q)}>{q}</button>)}</div>
    <form className="row" onSubmit={e=>{e.preventDefault();send(t);setT('')}}><input aria-label="Message" value={t} onChange={e=>setT(e.target.value)} placeholder="Type your message"/><button className="btn" disabled={busy}>Send</button></form></div>
}
export function Dashboard(){
  const {orders,refunds,tickets,log,setRefund}=useApp()
  const st=[[orders.length,'Orders'],[refunds.filter(r=>r.status==='Pending').length,'Pending refunds'],[tickets.filter(t=>t.status!=='Resolved').length,'Open tickets'],[log.length,'AI actions']]
  return <div className="stack"><div className="stats">{st.map(([n,l])=><div className="card" key={l}><div className="n">{n}</div>{l}</div>)}</div>
    <div className="card"><h2>Pending refunds</h2>{refunds.filter(r=>r.status==='Pending').map(r=><div className="row between line" key={r.id}><span>{r.id} · {r.order} · {r.reason}</span><span><button className="btn sm" onClick={()=>setRefund(r.id,'Approved')}>Approve</button> <button className="btn sm alt" onClick={()=>setRefund(r.id,'Rejected')}>Reject</button></span></div>)}{!refunds.some(r=>r.status==='Pending')&&<Empty t="Nothing waiting."/>}</div>
    <div className="card"><h2>Customer requests (tickets)</h2>{tickets.length?tickets.slice(-5).map(t=><div className="line" key={t.id}><L to={'/tickets/'+t.id}>{t.id}</L> · {t.subject} <Tag s={t.status}/></div>):<Empty t="No tickets yet."/>}</div>
    <div className="card"><h2>Recent AI actions</h2>{log.slice(0,5).map((a,i)=><div className="line" key={i}>{a.t} · {a.a} · {a.d}</div>)}{!log.length&&<Empty t="The agent hasn’t done anything yet."/>}</div></div>
}
export function AiLog(){
  const {log}=useApp(),[q,setQ]=useState(''),rows=log.filter(a=>(a.a+a.d).toLowerCase().includes(q.toLowerCase()))
  return <div className="card"><h1>AI action log</h1><Field l="Search" value={q} onChange={e=>setQ(e.target.value)}/>
    {rows.length?<div className="tw"><table><thead><tr><th>Time</th><th>Action</th><th>Details</th></tr></thead><tbody>{rows.map((a,i)=><tr key={i}><td>{a.t}</td><td>{a.a}</td><td>{a.d}</td></tr>)}</tbody></table></div>:<Empty t="No actions found."/>}</div>
}
