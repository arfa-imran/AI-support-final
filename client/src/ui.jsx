import {createContext,useContext,useEffect,useId,useRef,useState} from 'react'
import {Sun,Moon,Eye,EyeOff,Loader2,Inbox,AlertTriangle,X,CheckCircle2,Info} from 'lucide-react'
import s from './ui.module.css'
import {useTheme} from './theme.jsx'
export const cx=(...a)=>a.filter(Boolean).join(' ')
export const Button=({variant='primary',size='md',loading,icon:I,children,className,...p})=><button className={cx(s.btn,s[variant],s[size],className)} {...p} disabled={loading||p.disabled}>{loading?<Loader2 className={s.spin} size={16} aria-hidden="true"/>:I&&<I size={16} aria-hidden="true"/>}{children}</button>
export function Input({label,hint,error,className,...p}){
  const id=useId()
  return <div className={cx(s.field,className)}>{label&&<label htmlFor={id}>{label}</label>}<input id={id} className={cx(s.input,error&&s.bad)} aria-invalid={!!error} aria-describedby={error||hint?id+'h':undefined} {...p}/>{(error||hint)&&<span id={id+'h'} className={error?s.err:s.hint}>{error||hint}</span>}</div>
}
export function PasswordInput(p){
  const [show,setShow]=useState(false)
  return <div className={s.pw}><Input {...p} type={show?'text':'password'}/><button type="button" className={s.eye} onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
}
export const Card=({title,children,className,...p})=><section className={cx(s.card,className)} {...p}>{title&&<h2 className={s.cardTitle}>{title}</h2>}{children}</section>
export const Avatar=({name='?',size=32})=><span className={s.avatar} style={{width:size,height:size,fontSize:size*.4}} aria-hidden="true">{name.trim().slice(0,2).toUpperCase()}</span>
export const Badge=({tone='neutral',children})=><span className={cx(s.badge,s[tone])}>{children}</span>
export function Tooltip({text,children}){
  const id=useId()
  return <span className={s.tipwrap}><span aria-describedby={id}>{children}</span><span role="tooltip" id={id} className={s.tip}>{text}</span></span>
}
export function Dropdown({trigger,label,items}){
  const [open,setOpen]=useState(false),ref=useRef()
  useEffect(()=>{if(!open)return
    const d=e=>!ref.current?.contains(e.target)&&setOpen(false),k=e=>e.key==='Escape'&&setOpen(false)
    document.addEventListener('mousedown',d);document.addEventListener('keydown',k)
    return()=>{document.removeEventListener('mousedown',d);document.removeEventListener('keydown',k)}},[open])
  return <div className={s.dd} ref={ref}><button type="button" className={s.ddBtn} aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(!open)}>{trigger}</button>
    {open&&<div className={s.menu} role="menu">{items.map(i=><button key={i.label} role="menuitem" className={s.item} onClick={()=>{setOpen(false);i.onClick()}}>{i.icon&&<i.icon size={16} aria-hidden="true"/>}{i.label}</button>)}</div>}</div>
}
export function Modal({open,onClose,title,children,footer}){
  const ref=useRef()
  useEffect(()=>{if(!open)return;ref.current?.focus();const k=e=>e.key==='Escape'&&onClose();document.addEventListener('keydown',k);return()=>document.removeEventListener('keydown',k)},[open,onClose])
  if(!open)return null
  return <div className={s.scrim} onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={s.modal} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
    <div className={s.mhead}><h2>{title}</h2><button className={s.x} onClick={onClose} aria-label="Close"><X size={18}/></button></div><div>{children}</div>{footer&&<div className={s.mfoot}>{footer}</div>}</div></div>
}
const T=createContext()
export const useToast=()=>useContext(T)
export function ToastProvider({children}){
  const [list,setList]=useState([])
  const push=(text,tone='info')=>{const id=Date.now()+Math.random();setList(l=>[...l,{id,text,tone}]);setTimeout(()=>setList(l=>l.filter(x=>x.id!==id)),4000)}
  return <T.Provider value={push}>{children}<div className={s.toasts} role="status" aria-live="polite">{list.map(t=><div key={t.id} className={cx(s.toast,s[t.tone])}>{t.tone==='success'?<CheckCircle2 size={18}/>:t.tone==='danger'?<AlertTriangle size={18}/>:<Info size={18}/>}{t.text}</div>)}</div></T.Provider>
}
export const Loading=({text='Loading'})=><div className={s.load} role="status"><Loader2 className={s.spin} size={20} aria-hidden="true"/>{text}</div>
export const EmptyState=({icon:I=Inbox,title,text,action})=><div className={s.empty}><I size={32} aria-hidden="true"/><strong>{title}</strong>{text&&<p>{text}</p>}{action}</div>
export const ErrorState=({title='Something went wrong',text,onRetry})=><div className={cx(s.empty,s.errBox)} role="alert"><AlertTriangle size={32} aria-hidden="true"/><strong>{title}</strong>{text&&<p>{text}</p>}{onRetry&&<Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>
export function ThemeToggle(){
  const {theme,toggle}=useTheme()
  return <button type="button" className={s.theme} onClick={toggle} aria-label={theme==='dark'?'Switch to light theme':'Switch to dark theme'} aria-pressed={theme==='dark'}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
}
export const PageHeader=({title,subtitle,actions})=><div className={s.ph}><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{actions&&<div className={s.acts}>{actions}</div>}</div>
