import {createContext,useContext,useEffect,useRef,useState} from 'react'
import {Link} from 'react-router-dom'
const C=createContext()
export const useApp=()=>useContext(C)
export const useBase=()=>{const {user}=useApp();return user.role==='customer'?'/portal':'/'+user.role}
export const L=({to,...p})=>{const b=useBase();return <Link to={b+to} {...p}/>}
const now=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
const seed=[{id:'ORD-1001',item:'Wireless headphones',status:'Shipped',delay:5,ago:0},{id:'ORD-1002',item:'Laptop stand',status:'Delivered',delay:0,ago:2},{id:'ORD-1003',item:'Phone case',status:'Processing',delay:0,ago:0},{id:'ORD-1004',item:'Mechanical keyboard',status:'Delivered',delay:0,ago:30}]
export const STATUSES=['Processing','Shipped','Delivered']
const GUEST={role:'customer',email:'alex@demo.com',name:'Alex',phone:'',address:'',guest:true}

// Shared demo data is saved in localStorage and synced between browser tabs.
// The logged-in user is saved per tab (sessionStorage), so two tabs can be two different people.
function useShared(key,init){
  const k='sa:'+key,first=useRef(true)
  const [v,setV]=useState(()=>{try{const x=localStorage.getItem(k);return x?JSON.parse(x):init}catch{return init}})
  useEffect(()=>{if(first.current){first.current=false;return};try{localStorage.setItem(k,JSON.stringify(v))}catch{}},[v])
  useEffect(()=>{const h=e=>{if(e.key===k&&e.newValue){try{setV(JSON.parse(e.newValue))}catch{}}};window.addEventListener('storage',h);return()=>window.removeEventListener('storage',h)},[])
  return [v,setV]
}
export const resetDemo=()=>{try{Object.keys(localStorage).filter(x=>x.startsWith('sa:')).forEach(x=>localStorage.removeItem(x));sessionStorage.clear()}catch{};location.assign('/')}
export function Provider({children}){
  const [user,setUser]=useState(()=>{try{const x=sessionStorage.getItem('sa:user');return x?JSON.parse(x):GUEST}catch{return GUEST}})
  useEffect(()=>{try{sessionStorage.setItem('sa:user',JSON.stringify(user))}catch{}},[user])
  const [orders,setOrders]=useShared('orders',seed)
  const [refunds,setRefunds]=useShared('refunds',[])
  const [tickets,setTickets]=useShared('tickets',[])
  const [log,setLog]=useShared('log',[])
  const [msgs,setMsgs]=useShared('msgs',[{who:'bot',text:'Hi, I can check an order, start a refund or raise a ticket. What do you need?'}])
  const [busy,setBusy]=useState(false)
  const [pending,setPending]=useState(null)
  const meta={intent:'General question'}
  const [requests,setRequests]=useShared('requests',[])
  const [convos,setConvos]=useShared('convos',[
    {id:'C-1',customer:'Sam',t:'09:12',sample:true,msgs:[{who:'bot',text:'Hi, how can I help?'},{who:'me',text:'Where is ORD-1003?'},{who:'bot',text:'Phone case (ORD-1003) is processing.',intent:'Order status'}]},
    {id:'C-2',customer:'Lina',t:'08:40',sample:true,msgs:[{who:'bot',text:'Hi, how can I help?'},{who:'me',text:'My order is delayed, I want a refund'},{who:'bot',text:'Done. Your refund is waiting for staff approval.',intent:'Refund request',action:{label:'Refund created: RF-9',detail:'ORD-1001 · It is 5 days late.'}}]}])
  const newChat=()=>{if(msgs.length>1)setConvos(c=>[{id:'C-'+(c.length+1),customer:user.name,t:now(),msgs},...c]);setMsgs(msgs.slice(0,1))}
  const [agents,setAgents]=useShared('agents',[{id:1,name:'Maya Khan',email:'maya@support.com',status:'Active'},{id:2,name:'Omar Ali',email:'omar@support.com',status:'Active'},{id:3,name:'Sara Noor',email:'sara@support.com',status:'Away'}])
  const addAgent=(name,email)=>setAgents(a=>[...a,{id:a.length+1,name,email,status:'Active'}])
  const toggleAgent=id=>setAgents(a=>a.map(x=>x.id===id?{...x,status:x.status==='Active'?'Away':'Active'}:x))
  const addLog=(a,d)=>setLog(l=>[{t:now(),a,d},...l])
  const login=(role,email)=>setUser({role,email,name:email.split('@')[0]||'User',phone:'',address:''})
  const addOrder=item=>setOrders(o=>[...o,{id:'ORD-'+(1001+o.length),item,status:'Processing',delay:0,ago:0}])
  const setStatus=(id,status)=>setOrders(o=>o.map(x=>x.id===id?{...x,status,delay:status==='Shipped'?x.delay:0}:x))
  const eligible=o=>{
    if(refunds.some(r=>r.order===o.id))return[false,'A refund was already requested for this order.']
    if(o.status==='Shipped'&&o.delay>=3)return[true,'It is '+o.delay+' days late.']
    if(o.status==='Delivered'&&o.ago<=7)return[true,'Delivered '+o.ago+' day(s) ago, inside the 7-day window.']
    if(o.status==='Delivered')return[false,'Delivered '+o.ago+' days ago, outside the 7-day window.']
    return[false,'The order is still on time, so no refund applies yet.']
  }
  const newRefund=(order,reason,by)=>{const r={id:'RF-'+(refunds.length+1),order,reason,by,status:'Pending'};setRefunds(x=>[...x,r]);return r}
  const setRefund=(id,status)=>{setRefunds(r=>r.map(x=>x.id===id?{...x,status}:x));addLog(status+' refund',id)}
  const newTicket=(subject,order,by)=>{const k={id:'TK-'+(tickets.length+1),order:order||'None',subject,by,status:'Open',assignee:'',msgs:[{who:'customer',text:subject}]};setTickets(t=>[...t,k]);return k}
  const patchTicket=(id,p)=>setTickets(t=>t.map(x=>x.id===id?{...x,...p}:x))
  const replyTicket=(id,who,text)=>setTickets(t=>t.map(x=>x.id===id?{...x,msgs:[...x.msgs,{who,text}]}:x))
  const think=text=>{
    const m=text.match(/ord-?(\d{4})/i),id=m?'ORD-'+m[1]:null,l=text.toLowerCase()
    let it=/refund|money back|return/.test(l)?'refund':/ticket|complain|human|agent|support/.test(l)?'ticket':(/where|status|track|order/.test(l)||id)?'status':'other'
    if(id&&pending&&!/refund|ticket|where|status|track/.test(l))it=pending
    setPending(null);meta.intent={status:'Order status',refund:'Refund request',ticket:'Support ticket',other:'General question'}[it]
    const o=orders.find(x=>x.id===id)
    if(it==='status'||it==='refund'){
      if(!id){setPending(it);return{text:'Sure. What is your order number? For example, ORD-1001.'}}
      if(!o)return{text:'I can’t find '+id+'.'}
    }
    if(it==='status'){addLog('Checked order',o.id);return{text:o.item+' ('+o.id+') is '+o.status.toLowerCase()+(o.delay?' and '+o.delay+' days late.':'.')}}
    if(it==='refund'){
      const [ok,why]=eligible(o)
      if(!ok)return{text:'I can’t refund '+o.id+'. '+why}
      const r=newRefund(o.id,why,user.email);addLog('Created refund',r.id+' for '+o.id)
      return{text:'Done. Your refund is waiting for staff approval.',action:{label:'Refund created: '+r.id,detail:o.id+' · '+why}}
    }
    if(it==='ticket'){const k=newTicket(text,id,user.email);addLog('Created ticket',k.id);return{text:'I passed this to the support team.',action:{label:'Ticket created: '+k.id,detail:'Status: Open'}}}
    return{text:'I can check an order, start a refund, or raise a ticket.'}
  }
  const send=text=>{
    if(!text.trim()||busy)return
    setMsgs(m=>[...m,{who:'me',text}]);setBusy(true)
    setTimeout(()=>{const r=think(text);setRequests(q=>[{id:q.length+1,text,intent:meta.intent,t:now(),customer:user.name},...q]);setMsgs(m=>[...m,{who:'bot',intent:meta.intent,...r}]);setBusy(false)},700)
  }
  const v={convos,requests,eligible,agents,addAgent,toggleAgent,user,setUser,login,logout:()=>setUser(GUEST),orders,addOrder,setStatus,refunds,newRefund,setRefund,tickets,newTicket,patchTicket,replyTicket,log,addLog,msgs,busy,send,clearChat:newChat}
  return <C.Provider value={v}>{children}</C.Provider>
}
