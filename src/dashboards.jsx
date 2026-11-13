import {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {Package,RotateCcw,LifeBuoy,MessageSquare,Send,ShoppingBag,Inbox,Bot,Users,Plus,CheckCircle2} from 'lucide-react'
import s from './dash.module.css'
import {useApp,STATUSES,L} from './store.jsx'
import {Card,Badge,Button,Avatar,Input,Modal,EmptyState,PageHeader,useToast} from './ui.jsx'
import {AreaChart,Donut,Bars} from './charts.jsx'
const tone=t=>({Approved:'success',Resolved:'success',Delivered:'success',Active:'success',Rejected:'danger',Pending:'warning',Open:'warning',Away:'neutral','In progress':'info',Shipped:'info',Processing:'neutral'}[t]||'neutral')
const Kpi=({icon:I,n,l})=><div className={s.kpi}><i><I size={18} aria-hidden="true"/></i><b>{n}</b><span>{l}</span></div>
const byStatus=t=>['Open','In progress','Resolved'].map(x=>({label:x,value:t.filter(k=>k.status===x).length}))
const Activity=({log,n=5})=>log.length?log.slice(0,n).map((a,i)=><div className={s.row} key={i}><span>{a.a} <span className={s.muted}>· {a.d}</span></span><span className={s.muted}>{a.t}</span></div>):<EmptyState icon={Bot} title="No AI activity yet" text="Actions the AI agent takes will show up here."/>

function OrdersCard(){
  const {orders}=useApp()
  return <Card title="Orders">{orders.slice(0,4).map(o=><div className={s.row} key={o.id}><div><L to={'/orders/'+o.id}><strong>{o.id}</strong></L> {o.item}<div className={s.muted}>{o.delay?o.delay+' days late':o.status==='Delivered'?'Delivered '+o.ago+' days ago':'On time'}</div></div><Badge tone={tone(o.status)}>{o.status}</Badge></div>)}<L to="/orders">View all orders</L></Card>
}
function RequestsCard(){
  const {requests}=useApp()
  return <Card title="Customer requests">{requests.length?requests.slice(0,5).map(r=><div className={s.row} key={r.id}><span>{r.text}<div className={s.muted}>{r.customer} · {r.t}</div></span><Badge tone="info">{r.intent}</Badge></div>):<EmptyState icon={MessageSquare} title="No customer requests yet" text="Messages customers send to the AI agent show up here."/>}<L to="/conversations">View conversations</L></Card>
}
export function ConversationsPage(){
  const {convos,msgs}=useApp(),all=[{id:'Live',customer:'Customer (current chat)',t:'now',msgs},...convos],[sel,setSel]=useState('Live'),c=all.find(x=>x.id===sel)||all[0]
  return <><PageHeader title="Conversations" subtitle="Every customer chat with the AI agent."/>
    <div className={`${s.grid} ${s.g2}`}><Card title={c.id+' · '+c.customer}><div className="thread">{c.msgs.map((m,i)=><div key={i} className={'b '+(m.who==='me'?'me':'bot')}>{m.text}{m.who==='bot'&&m.intent&&<div className="mute" style={{fontSize:'.75rem',marginTop:4}}>Intent detected: {m.intent}</div>}{m.action&&<div className="act"><strong>{m.action.label}</strong><br/>{m.action.detail}</div>}</div>)}</div></Card>
      <Card title="All conversations">{all.map(x=><button key={x.id} className={s.convo+(x.id===c.id?' '+s.convoOn:'')} onClick={()=>setSel(x.id)}><span>{x.id} · {x.customer}</span><span className={s.muted}>{x.sample?'sample · ':''}{x.t}</span></button>)}</Card></div></>
}
export function CustomerPortal(){
  const {user,orders,refunds,tickets,log,send}=useApp(),nav=useNavigate(),[q,setQ]=useState('')
  const h=new Date().getHours(),hi=h<12?'Good morning':h<18?'Good afternoon':'Good evening',late=orders.filter(o=>o.delay>=3)
  const tiles=[['/portal/orders','Track an order',Package],['/portal/refunds','Request a refund',RotateCcw],['/portal/tickets','Raise a ticket',LifeBuoy],['/portal/chat','Chat with AI',MessageSquare]]
  return <>
    <section className={s.hero}><div><p className={s.eyebrow}>Customer portal</p><h1>{hi}, {user.name}</h1><p>Track orders, get refunds and talk to support, all in one place.</p></div>
      <form className={s.ask} onSubmit={e=>{e.preventDefault();if(q.trim()){send(q);nav('/portal/chat')}}}><label htmlFor="ask" className={s.sr}>Ask the AI agent</label><input id="ask" value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask anything, e.g. Where is ORD-1001?"/><button aria-label="Send to AI agent"><Send size={20}/></button></form></section>
    <div className={s.tiles}>{tiles.map(([to,l,I])=><Link key={to} to={to} className={s.tile}><i><I size={20} aria-hidden="true"/></i>{l}</Link>)}</div>
    <div className={s.kpis}><Kpi icon={ShoppingBag} n={orders.filter(o=>o.status!=='Delivered').length} l="Active orders"/><Kpi icon={RotateCcw} n={refunds.filter(r=>r.status==='Pending').length} l="Refunds in review"/><Kpi icon={LifeBuoy} n={tickets.filter(t=>t.status!=='Resolved').length} l="Open tickets"/></div>
    <div className={`${s.grid} ${s.g2}`}>
      <Card title="Your orders">{orders.slice(0,4).map(o=>{const i=STATUSES.indexOf(o.status);return <div className={s.row} key={o.id}><div><L to={'/orders/'+o.id}><strong>{o.item}</strong></L><div className={s.muted}>{o.id}{o.delay>0&&' · '+o.delay+' days late'}</div></div><Badge tone={tone(o.status)}>{o.status}</Badge>
        <div className={s.steps}>{STATUSES.map((x,k)=><span key={x} className={`${s.step} ${k<=i?s.on:''}`}>{k<=i?'✓ ':''}{x}</span>)}</div></div>})}</Card>
      <div className={s.stack}>
        <Card title="Needs your attention">{late.length?late.map(o=><div className={s.row} key={o.id}><span>{o.item} is {o.delay} days late</span><L to="/refunds"><Button size="sm" variant="secondary" tabIndex={-1}>Request refund</Button></L></div>):<EmptyState icon={CheckCircle2} title="All clear" text="No late orders right now."/>}</Card>
        <Card title="Recent activity"><Activity log={log} n={4}/></Card></div></div></>
}

export function AgentDashboard(){
  const {user,tickets,refunds,log,setRefund,patchTicket}=useApp(),toast=useToast()
  const open=tickets.filter(t=>t.status!=='Resolved'),pend=refunds.filter(r=>r.status==='Pending')
  return <><PageHeader title={'Welcome back, '+user.name} subtitle="Your support queue for today."/>
    <div className={s.kpis}><Kpi icon={LifeBuoy} n={open.length} l="Open tickets"/><Kpi icon={RotateCcw} n={pend.length} l="Refunds to review"/><Kpi icon={CheckCircle2} n={tickets.length-open.length} l="Resolved tickets"/><Kpi icon={Bot} n={log.length} l="AI actions"/></div>
    <div className={`${s.grid} ${s.g2}`}><div className={s.stack}>
      <Card title="Ticket queue">{open.length?open.map(t=><div className={s.row} key={t.id}><div><L to={'/tickets/'+t.id}><strong>{t.id}</strong></L> <span>{t.subject}</span><div className={s.muted}>Order: {t.order}</div></div><span className={s.inline}><Badge tone={tone(t.status)}>{t.status}</Badge><Button size="sm" variant="secondary" onClick={()=>{patchTicket(t.id,{status:'Resolved'});toast(t.id+' resolved','success')}}>Resolve</Button></span></div>):<EmptyState icon={Inbox} title="Queue is empty" text="New tickets from customers and the AI agent appear here."/>}</Card>
      <Card title="Refunds to review">{pend.length?pend.map(r=><div className={s.row} key={r.id}><span><strong>{r.id}</strong> · {r.order}<div className={s.muted}>{r.reason}</div></span><span className={s.inline}><Button size="sm" onClick={()=>{setRefund(r.id,'Approved');toast(r.id+' approved','success')}}>Approve</Button><Button size="sm" variant="danger" onClick={()=>setRefund(r.id,'Rejected')}>Reject</Button></span></div>):<EmptyState icon={CheckCircle2} title="Nothing waiting" text="Pending refunds show up here."/>}</Card></div>
      <div className={s.stack}><Card title="Tickets by status"><Donut parts={byStatus(tickets)}/></Card><Card title="Recent AI actions"><Activity log={log} n={5}/></Card></div></div><div className={`${s.grid} ${s.g2}`} style={{marginTop:16}}><OrdersCard/><RequestsCard/></div></>
}

export function AgentsPage(){
  const {agents,addAgent,toggleAgent,tickets}=useApp(),toast=useToast(),[open,setOpen]=useState(false),[n,setN]=useState(''),[e,setE]=useState('')
  const save=()=>{if(!n.trim()||!/\S+@\S+\.\S+/.test(e))return toast('Enter a name and a valid email','danger');addAgent(n,e);toast(n+' added','success');setN('');setE('');setOpen(false)}
  return <><PageHeader title="Agents" subtitle="Manage your support team." actions={<Button icon={Plus} onClick={()=>setOpen(true)}>Add agent</Button>}/>
    <Card><div className={s.tw}><table><thead><tr><th>Agent</th><th>Email</th><th>Status</th><th><span className={s.sr}>Actions</span></th></tr></thead><tbody>{agents.map(a=><tr key={a.id}><td><span className={s.inline}><Avatar name={a.name}/>{a.name}</span></td><td>{a.email}</td><td><Badge tone={tone(a.status)}>{a.status}</Badge></td><td><Button size="sm" variant="secondary" onClick={()=>toggleAgent(a.id)}>{a.status==='Active'?'Set away':'Set active'}</Button></td></tr>)}</tbody></table></div>
      <p className={s.muted}>Open tickets overall: {tickets.filter(t=>t.status!=='Resolved').length}</p></Card>
    <Modal open={open} onClose={()=>setOpen(false)} title="Add support agent" footer={<><Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={save}>Add agent</Button></>}><div className={s.stack}><Input label="Full name" value={n} onChange={x=>setN(x.target.value)}/><Input label="Email" type="email" value={e} onChange={x=>setE(x.target.value)}/></div></Modal></>
}

export function AdminDashboard(){
  const {orders,refunds,tickets,log,agents}=useApp()
  const types=Object.entries(log.reduce((m,a)=>(m[a.a]=(m[a.a]||0)+1,m),{})).map(([label,value])=>({label,value}))
  return <><PageHeader title="Admin overview" subtitle="Everything happening across your support platform."/>
    <div className={s.kpis}><Kpi icon={ShoppingBag} n={orders.length} l="Orders"/><Kpi icon={RotateCcw} n={refunds.filter(r=>r.status==='Pending').length} l="Pending refunds"/><Kpi icon={LifeBuoy} n={tickets.filter(t=>t.status!=='Resolved').length} l="Open tickets"/><Kpi icon={Users} n={agents.filter(a=>a.status==='Active').length} l="Active agents"/></div>
    <div className={`${s.grid} ${s.g2}`}>
      <Card title="Customer requests, last 7 days"><AreaChart data={[14,22,18,27,31,19,24]} labels={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']}/><p className={s.muted}>Sample data for the demo.</p></Card>
      <Card title="Tickets by status"><Donut parts={byStatus(tickets)}/></Card></div>
    <div className={`${s.grid} ${s.g2}`} style={{marginTop:16}}>
      <Card title="AI actions by type">{types.length?<Bars items={types}/>:<EmptyState icon={Bot} title="No AI actions yet" text="Chat as a customer to generate some."/>}</Card>
      <Card title="Recent AI activity"><Activity log={log} n={5}/></Card></div>
    <div className={`${s.grid} ${s.g2}`} style={{marginTop:16}}><OrdersCard/><RequestsCard/></div><div style={{marginTop:16}}><AgentsPage/></div></>
}
export function RoleDashboard(){const {user}=useApp();return user.role==='admin'?<AdminDashboard/>:<AgentDashboard/>}
