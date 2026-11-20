import {useState} from 'react'
import {Link,useNavigate,useParams,useSearchParams} from 'react-router-dom'
import {RotateCcw,LifeBuoy,MessageSquare} from 'lucide-react'
import s from './screens.module.css'
import {useApp,STATUSES} from './store.jsx'
import {Card,Badge,Button,Input,EmptyState,PageHeader,useToast,cx} from './ui.jsx'
const tone=t=>({Approved:'success',Resolved:'success',Delivered:'success',Rejected:'danger',Pending:'warning',Open:'warning','In progress':'info',Shipped:'info',Processing:'neutral'}[t]||'neutral')
const note=o=>o.delay>0?o.delay+' days late':o.status==='Delivered'?'Delivered '+o.ago+' days ago':'On time'
const Track=({status})=>{const i=STATUSES.indexOf(status);return <div className={s.track}>{STATUSES.map((x,k)=><span key={x} className={cx(s.tstep,k<=i&&s.on)}>{k<=i?'✓ ':''}{x}</span>)}</div>}
const Select=({label,children,...p})=><label className="f">{label}<select {...p}>{children}</select></label>

export function MyOrders(){
  const {orders,addOrder}=useApp(),toast=useToast(),[item,setItem]=useState('')
  return <><PageHeader title="My orders" subtitle="Track your purchases and get help with any of them."/>
    <div className={s.cards}>{orders.map(o=><div className={s.ocard} key={o.id}>
      <div className={s.ohead}><div><strong>{o.item}</strong><div className={o.delay>0?s.late:s.muted}>{o.id} · {note(o)}</div></div><Badge tone={tone(o.status)}>{o.status}</Badge></div>
      <Track status={o.status}/>
      <div className={s.actions}><Link className={s.linkBtn} to={'/portal/orders/'+o.id}>Track order</Link><Link className={s.linkBtn} to={'/portal/refunds?order='+o.id}>Request refund</Link><Link className={s.linkBtn} to={'/portal/tickets?order='+o.id}>Get help</Link></div></div>)}</div>
    <Card title="Place a new order (demo)"><form className={s.row} onSubmit={e=>{e.preventDefault();if(item.trim()){addOrder(item);toast('Order placed','success');setItem('')}}}><Input label="What did you order?" value={item} onChange={e=>setItem(e.target.value)} style={{minWidth:240}}/><Button>Place order</Button></form></Card></>
}
export function MyOrderDetail(){
  const {id}=useParams(),{orders,eligible,send}=useApp(),nav=useNavigate(),o=orders.find(x=>x.id===id)
  if(!o)return <EmptyState title="Order not found" action={<Link className={s.linkBtn} to="/portal/orders">Back to my orders</Link>}/>
  const [ok,why]=eligible(o)
  return <><PageHeader title={o.item} subtitle={o.id}/><div className={s.stack}>
    <Card title="Order progress"><Track status={o.status}/><p className={o.delay>0?s.late:s.muted}>{note(o)}</p></Card>
    <Card title="Need something?"><p className={ok?s.ok:s.muted}>{ok?'You can request a refund: '+why:'Refund: '+why}</p>
      <div className={s.actions}>{ok&&<Link className={cx(s.linkBtn,s.main)} to={'/portal/refunds?order='+o.id}>Request refund</Link>}
        <button className={s.linkBtn} onClick={()=>{send('Where is '+o.id+'?');nav('/portal/chat')}}>Ask the AI about this order</button>
        <Link className={s.linkBtn} to={'/portal/tickets?order='+o.id}>Contact support</Link></div></Card></div></>
}
export function MyRefunds(){
  const {orders,refunds,newRefund,eligible,addLog,user}=useApp(),toast=useToast(),[sp]=useSearchParams()
  const [o,setO]=useState(sp.get('order')||orders[0].id),[why,setWhy]=useState('')
  const ord=orders.find(x=>x.id===o)||orders[0],[ok,reason]=eligible(ord),mine=refunds.filter(r=>r.by===user.email)
  return <><PageHeader title="Refunds" subtitle="Ask for a refund and follow its progress."/><div className={s.stack}>
    <Card title="Request a refund"><form className={s.form} onSubmit={e=>{e.preventDefault();const r=newRefund(o,why||reason,user.email);addLog('Refund requested',r.id);toast('Refund '+r.id+' requested','success');setWhy('')}}>
      <Select label="Which order?" value={o} onChange={e=>setO(e.target.value)}>{orders.map(x=><option key={x.id} value={x.id}>{x.id} · {x.item}</option>)}</Select>
      <p role="status" className={ok?s.ok:s.bad}>{ok?'Good news, this order qualifies. ':'This order doesn’t qualify yet. '}{reason}</p>
      <Input label="Tell us what went wrong (optional)" value={why} onChange={e=>setWhy(e.target.value)}/><div><Button disabled={!ok}>Request refund</Button></div></form></Card>
    <Card title="My refund requests">{mine.length?mine.map(r=>{const done=r.status!=='Pending';return <div className={s.ocard} key={r.id} style={{marginBottom:12}}>
      <div className={s.ohead}><div><strong>{r.id}</strong><div className={s.muted}>Order {r.order}</div></div><Badge tone={tone(r.status)}>{r.status}</Badge></div>
      <div className={s.track}><span className={cx(s.tstep,s.on)}>✓ Submitted</span><span className={cx(s.tstep,s.on)}>✓ Under review</span><span className={cx(s.tstep,done&&s.on)}>{done?'✓ '+r.status:'Waiting for decision'}</span></div></div>}):<EmptyState icon={RotateCcw} title="No refund requests yet" text="When you request one, you can follow it here."/>}</Card></div></>
}
export function MyTickets(){
  const {tickets,newTicket,orders,user}=useApp(),nav=useNavigate(),toast=useToast(),[sp]=useSearchParams()
  const [t,setT]=useState(''),[o,setO]=useState(sp.get('order')||''),mine=tickets.filter(x=>x.by===user.email)
  return <><PageHeader title="Help & support" subtitle="Tell us the problem and our team will reply here." actions={<Link className={s.linkBtn} to="/portal/chat"><MessageSquare size={16}/>&nbsp;Chat with AI</Link>}/><div className={s.stack}>
    <Card title="Contact support"><form className={s.form} onSubmit={e=>{e.preventDefault();if(t.trim()){const k=newTicket(t,o,user.email);toast(k.id+' sent to support','success');nav('/portal/tickets/'+k.id)}}}>
      <Input label="What is the problem?" value={t} onChange={e=>setT(e.target.value)}/>
      <Select label="Related order (optional)" value={o} onChange={e=>setO(e.target.value)}><option value="">None</option>{orders.map(x=><option key={x.id} value={x.id}>{x.id} · {x.item}</option>)}</Select><div><Button>Send to support</Button></div></form></Card>
    <Card title="My tickets">{mine.length?mine.map(k=><div className={s.line} key={k.id}><div><Link to={'/portal/tickets/'+k.id}><strong>{k.id}</strong></Link> · {k.subject}<div className={s.muted}>{k.assignee?'Handled by '+k.assignee:'Waiting for an agent'} · {k.msgs.length} message(s)</div></div><Badge tone={tone(k.status)}>{k.status}</Badge></div>):<EmptyState icon={LifeBuoy} title="No tickets yet" text="Contact support above and your conversation will appear here."/>}</Card></div></>
}
export function MyTicketDetail(){
  const {id}=useParams(),{tickets,replyTicket,patchTicket,user}=useApp(),k=tickets.find(x=>x.id===id&&x.by===user.email),[txt,setTxt]=useState('')
  if(!k)return <EmptyState title="Ticket not found" action={<Link className={s.linkBtn} to="/portal/tickets">Back to help</Link>}/>
  return <><PageHeader title={k.subject} subtitle={k.id+' · '+(k.assignee?'Handled by '+k.assignee:'Waiting for an agent')} actions={<Badge tone={tone(k.status)}>{k.status}</Badge>}/>
    <Card title="Conversation with support"><div className={s.thread}>{k.msgs.map((m,i)=><div key={i} className={cx(s.bub,m.who==='customer'?s.mine:s.theirs)}><div className={s.who}>{m.who==='customer'?'You':'Support team'}</div>{m.text}</div>)}</div>
      {k.status==='Resolved'?<div className={s.actions}><span className={s.ok}>This ticket is resolved.</span><Button variant="secondary" onClick={()=>patchTicket(k.id,{status:'Open'})}>Reopen</Button></div>
      :<form className={s.row} onSubmit={e=>{e.preventDefault();if(txt.trim()){replyTicket(k.id,'customer',txt);setTxt('')}}}><Input label="Reply" value={txt} onChange={e=>setTxt(e.target.value)} style={{minWidth:240}}/><Button>Send reply</Button></form>}</Card></>
}
export function MyAccount(){
  const {user,setUser,orders,refunds,tickets}=useApp(),toast=useToast(),[p,setP]=useState(user),set=k=>e=>setP({...p,[k]:e.target.value})
  const mine=tickets.filter(x=>x.by===user.email).length,mr=refunds.filter(x=>x.by===user.email).length
  return <><PageHeader title="My account" subtitle="Your details and delivery information."/><div className={s.stack}>
    <Card title="Details"><form className={s.form} onSubmit={e=>{e.preventDefault();setUser(p);toast('Details saved','success')}}>
      <Input label="Name" value={p.name} onChange={set('name')}/><Input label="Email" value={p.email} readOnly/><Input label="Phone" value={p.phone} onChange={set('phone')}/><Input label="Delivery address" value={p.address} onChange={set('address')}/><div><Button>Save details</Button></div></form></Card>
    <Card title="Your activity"><p className={s.muted}>{orders.length} orders · {mr} refund requests · {mine} support tickets</p></Card></div></>
}
