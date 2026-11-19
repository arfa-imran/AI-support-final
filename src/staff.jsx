import {useState} from 'react'
import {useParams} from 'react-router-dom'
import s from './screens.module.css'
import {useApp,STATUSES,L} from './store.jsx'
import {Card,Badge,Button,Input,Modal,EmptyState,PageHeader,useToast,cx} from './ui.jsx'
const tone=t=>({Approved:'success',Resolved:'success',Delivered:'success',Rejected:'danger',Pending:'warning',Open:'warning','In progress':'info',Shipped:'info',Processing:'neutral'}[t]||'neutral')
const note=o=>o.delay>0?o.delay+' days late':o.status==='Delivered'?'Delivered '+o.ago+' days ago':'On time'
const Sel=({label,children,...p})=><select aria-label={label} className={s.inl} {...p}>{children}</select>
const Tbl=({head,children})=><div className={s.tw}><table><thead><tr>{head.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>

export function StaffOrders(){
  const {orders,addOrder,setStatus}=useApp(),toast=useToast(),[q,setQ]=useState(''),[st,setSt]=useState('All'),[open,setOpen]=useState(false),[item,setItem]=useState('')
  const rows=orders.filter(o=>(st==='All'||o.status===st)&&(o.id+o.item).toLowerCase().includes(q.toLowerCase()))
  return <><PageHeader title="Orders" subtitle={orders.length+' orders in the system'} actions={<Button onClick={()=>setOpen(true)}>Add order</Button>}/>
    <Card><div className={s.toolbar}><input aria-label="Search orders" placeholder="Search orders" value={q} onChange={e=>setQ(e.target.value)}/><select aria-label="Filter by status" value={st} onChange={e=>setSt(e.target.value)}><option>All</option>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></div>
      {rows.length?<Tbl head={['Order','Item','Status','Note','']}>{rows.map(o=><tr key={o.id}><td><strong>{o.id}</strong></td><td>{o.item}</td><td><Sel label="Order status" value={o.status} onChange={e=>{setStatus(o.id,e.target.value);toast(o.id+' set to '+e.target.value,'success')}}>{STATUSES.map(x=><option key={x}>{x}</option>)}</Sel></td><td>{note(o)}</td><td><L to={'/orders/'+o.id}>Details</L></td></tr>)}</Tbl>:<EmptyState title="No matching orders"/>}</Card>
    <Modal open={open} onClose={()=>setOpen(false)} title="Add order" footer={<><Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={()=>{if(item.trim()){addOrder(item);toast('Order added','success');setItem('');setOpen(false)}}}>Add order</Button></>}><Input label="Item" value={item} onChange={e=>setItem(e.target.value)}/></Modal></>
}
export function StaffOrderDetail(){
  const {id}=useParams(),{orders,refunds,tickets,setStatus}=useApp(),o=orders.find(x=>x.id===id)
  if(!o)return <EmptyState title="Order not found"/>
  const rf=refunds.filter(r=>r.order===id),tk=tickets.filter(t=>t.order===id)
  return <><PageHeader title={o.id} subtitle={o.item}/><div className={s.split}>
    <Card title="Order"><dl className={s.kv}><dt>Status</dt><dd><Sel label="Order status" value={o.status} onChange={e=>setStatus(o.id,e.target.value)}>{STATUSES.map(x=><option key={x}>{x}</option>)}</Sel></dd><dt>Delivery</dt><dd>{note(o)}</dd></dl></Card>
    <div className={s.stack}><Card title="Refunds for this order">{rf.length?rf.map(r=><div className={s.line} key={r.id}><span>{r.id} · {r.reason}</span><Badge tone={tone(r.status)}>{r.status}</Badge></div>):<p className={s.muted}>None</p>}</Card>
      <Card title="Tickets for this order">{tk.length?tk.map(t=><div className={s.line} key={t.id}><L to={'/tickets/'+t.id}>{t.id} · {t.subject}</L><Badge tone={tone(t.status)}>{t.status}</Badge></div>):<p className={s.muted}>None</p>}</Card></div></div></>
}
export function StaffRefunds(){
  const {refunds,setRefund}=useApp(),toast=useToast(),[f,setF]=useState('Pending'),tabs=['Pending','Approved','Rejected','All']
  const rows=refunds.filter(r=>f==='All'||r.status===f),n=t=>t==='All'?refunds.length:refunds.filter(r=>r.status===t).length
  return <><PageHeader title="Refund requests" subtitle="Review requests created by customers and the AI agent."/>
    <Card><div className={s.toolbar} role="group" aria-label="Filter refunds">{tabs.map(t=><button key={t} className={cx(s.fchip,f===t&&s.sel)} aria-pressed={f===t} onClick={()=>setF(t)}>{t} ({n(t)})</button>)}</div>
      {rows.length?<Tbl head={['ID','Order','Customer','Reason','Status','']}>{rows.map(r=><tr key={r.id}><td><strong>{r.id}</strong></td><td><L to={'/orders/'+r.order}>{r.order}</L></td><td>{r.by}</td><td>{r.reason}</td><td><Badge tone={tone(r.status)}>{r.status}</Badge></td>
        <td>{r.status==='Pending'&&<span className={s.actions}><Button size="sm" onClick={()=>{setRefund(r.id,'Approved');toast(r.id+' approved','success')}}>Approve</Button><Button size="sm" variant="danger" onClick={()=>{setRefund(r.id,'Rejected');toast(r.id+' rejected','info')}}>Reject</Button></span>}</td></tr>)}</Tbl>:<EmptyState title={'No '+f.toLowerCase()+' refunds'} text="Nothing to review in this list."/>}</Card></>
}
export function StaffTickets(){
  const {tickets,patchTicket,agents}=useApp(),[q,setQ]=useState(''),[st,setSt]=useState('All'),[as,setAs]=useState('All')
  const rows=tickets.filter(t=>(st==='All'||t.status===st)&&(as==='All'||(as==='Unassigned'?!t.assignee:t.assignee===as))&&(t.id+t.subject+t.by).toLowerCase().includes(q.toLowerCase()))
  return <><PageHeader title="Support tickets" subtitle={tickets.filter(t=>t.status!=='Resolved').length+' open'}/>
    <Card><div className={s.toolbar}><input aria-label="Search tickets" placeholder="Search tickets" value={q} onChange={e=>setQ(e.target.value)}/><select aria-label="Filter by status" value={st} onChange={e=>setSt(e.target.value)}><option>All</option><option>Open</option><option>In progress</option><option>Resolved</option></select><select aria-label="Filter by agent" value={as} onChange={e=>setAs(e.target.value)}><option>All</option><option>Unassigned</option>{agents.map(a=><option key={a.id}>{a.name}</option>)}</select></div>
      {rows.length?<Tbl head={['ID','Subject','Customer','Order','Assigned to','Status']}>{rows.map(t=><tr key={t.id}><td><L to={'/tickets/'+t.id}><strong>{t.id}</strong></L></td><td>{t.subject}</td><td>{t.by}</td><td>{t.order}</td>
        <td><Sel label={'Assign '+t.id} value={t.assignee} onChange={e=>patchTicket(t.id,{assignee:e.target.value})}><option value="">Unassigned</option>{agents.map(a=><option key={a.id}>{a.name}</option>)}</Sel></td>
        <td><Sel label={'Status of '+t.id} value={t.status} onChange={e=>patchTicket(t.id,{status:e.target.value})}>{['Open','In progress','Resolved'].map(x=><option key={x}>{x}</option>)}</Sel></td></tr>)}</Tbl>:<EmptyState title="No tickets found" text="Tickets from customers and the AI agent show up here."/>}</Card></>
}
export function StaffTicketDetail(){
  const {id}=useParams(),{tickets,patchTicket,replyTicket,agents}=useApp(),t=tickets.find(x=>x.id===id),[txt,setTxt]=useState('')
  if(!t)return <EmptyState title="Ticket not found"/>
  return <><PageHeader title={t.id+' · '+t.subject} actions={<Badge tone={tone(t.status)}>{t.status}</Badge>}/><div className={s.split}>
    <Card title="Conversation"><div className={s.thread}>{t.msgs.map((m,i)=><div key={i} className={cx(s.bub,m.who==='agent'?s.mine:s.theirs)}><div className={s.who}>{m.who==='agent'?'Support team':'Customer'}</div>{m.text}</div>)}</div>
      <form className={s.row} onSubmit={e=>{e.preventDefault();if(txt.trim()){replyTicket(t.id,'agent',txt);if(t.status==='Open')patchTicket(t.id,{status:'In progress'});setTxt('')}}}><Input label="Reply" value={txt} onChange={e=>setTxt(e.target.value)} style={{minWidth:240}}/><Button>Send reply</Button></form></Card>
    <Card title="Ticket details"><dl className={s.kv}><dt>Customer</dt><dd>{t.by}</dd><dt>Order</dt><dd>{t.order==='None'?'None':<L to={'/orders/'+t.order}>{t.order}</L>}</dd>
      <dt><label htmlFor="as">Assign</label></dt><dd><select id="as" aria-label="Assign" className={s.inl} value={t.assignee} onChange={e=>patchTicket(t.id,{assignee:e.target.value})}><option value="">Unassigned</option>{agents.map(a=><option key={a.id}>{a.name}</option>)}</select></dd>
      <dt><label htmlFor="st">Status</label></dt><dd><select id="st" aria-label="Status" className={s.inl} value={t.status} onChange={e=>patchTicket(t.id,{status:e.target.value})}>{['Open','In progress','Resolved'].map(x=><option key={x}>{x}</option>)}</select></dd></dl>
      <div><Button variant="secondary" onClick={()=>patchTicket(t.id,{status:'Resolved'})}>Mark resolved</Button></div></Card></div></>
}
export function StaffProfile(){
  const {user,setUser}=useApp(),toast=useToast(),[p,setP]=useState(user)
  return <><PageHeader title="Profile" subtitle={user.role==='admin'?'Administrator account':'Support agent account'}/><Card><form className={s.form} onSubmit={e=>{e.preventDefault();setUser(p);toast('Profile saved','success')}}>
    <Input label="Name" value={p.name} onChange={e=>setP({...p,name:e.target.value})}/><Input label="Email" value={p.email} readOnly/><Input label="Role" value={user.role} readOnly/><div><Button>Save</Button></div></form></Card></>
}
