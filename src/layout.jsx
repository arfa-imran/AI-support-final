import {useEffect,useState} from 'react'
import {Link,NavLink,Outlet,useLocation,useNavigate} from 'react-router-dom'
import {Home,LayoutDashboard,ShoppingBag,RotateCcw,LifeBuoy,MessageSquare,ScrollText,User,Users,Menu,X,PanelLeftClose,PanelLeftOpen,LogOut,ChevronDown} from 'lucide-react'
import s from './layout.module.css'
import {useApp} from './store.jsx'
import {Avatar,Dropdown,ThemeToggle,Tooltip,EmptyState,PageHeader,Button,useToast,cx} from './ui.jsx'
export const Brand=({to='/'})=><Link to={to} className={s.brand}><svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" className={s.mk}/><path d="M9 12.5A3.5 3.5 0 0112.5 9h7a3.5 3.5 0 013.5 3.5v4a3.5 3.5 0 01-3.5 3.5H16l-4 3v-3a3.5 3.5 0 01-3-3.5z" className={s.mkp}/><circle cx="21.5" cy="21.5" r="3" className={s.mkd}/></svg><span>Support Agent</span></Link>
export function AuthLayout({children}){
  const {pathname}=useLocation()
  return <div className={s.auth}><header className={s.authTop}><Brand to="/login"/><div className={s.right}><ThemeToggle/><Link to="/portal"><Button variant="secondary" size="sm" tabIndex={-1}>Customer portal</Button></Link></div></header><main className={cx(s.authMain,'authmain')}>{children}</main></div>
}
const nav=role=>role==='customer'?[['/portal','Home',Home],['/chat','Chat',MessageSquare],['/orders','Orders',ShoppingBag],['/refunds','Refunds',RotateCcw],['/tickets','Support Tickets',LifeBuoy],['/profile','Profile',User]]
 :[['/dashboard','Dashboard',LayoutDashboard],['/orders','Orders',ShoppingBag],['/refunds','Refunds',RotateCcw],['/tickets','Support Tickets',LifeBuoy],['/conversations','Conversations',MessageSquare],['/log','AI Action Log',ScrollText],...(role==='admin'?[['/agents','Agents',Users]]:[]),['/profile','Profile',User]]
export function DashboardShell(){
  const {user,logout}=useApp(),toast=useToast(),go=useNavigate(),{pathname}=useLocation()
  const [open,setOpen]=useState(false),[min,setMin]=useState(false),items=nav(user.role)
  useEffect(()=>setOpen(false),[pathname])
  useEffect(()=>{const k=e=>e.key==='Escape'&&setOpen(false);document.addEventListener('keydown',k);return()=>document.removeEventListener('keydown',k)},[])
  const crumbs=pathname.split('/').filter(Boolean)
  const label=p=>(items.find(i=>i[0]==='/'+p)||[])[1]||p
  return <div className={cx(s.shell,min&&s.min)}><a href="#main" className={s.skip}>Skip to content</a>
    <aside className={cx(s.side,open&&s.open)} aria-label="Primary"><div className={s.sideTop}><Brand to={items[0][0]}/><button className={cx(s.icon,s.mobile)} onClick={()=>setOpen(false)} aria-label="Close menu"><X size={20}/></button></div>
      <nav className={s.nav}>{items.map(([to,name,I])=><NavLink key={to} to={to} className={({isActive})=>cx(s.link,isActive&&s.on)}><Tooltip text={name}><I size={20} aria-hidden="true"/></Tooltip><span className={s.lbl}>{name}</span></NavLink>)}</nav>
      <button className={cx(s.collapse,s.desk)} onClick={()=>setMin(!min)} aria-label={min?'Expand sidebar':'Collapse sidebar'}>{min?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}<span className={s.lbl}>Collapse</span></button></aside>
    {open&&<div className={s.drawerScrim} onClick={()=>setOpen(false)}/>}
    <div className={s.col}><header className={s.top}><button className={cx(s.icon,s.mobile)} onClick={()=>setOpen(true)} aria-label="Open menu" aria-expanded={open}><Menu size={20}/></button>
      <nav aria-label="Breadcrumb" className={s.crumbs}><ol><li>Support Agent</li>{crumbs.map((c,i)=><li key={i} aria-current={i===crumbs.length-1?'page':undefined}>{label(c)}</li>)}</ol></nav>
      <div className={s.right}><ThemeToggle/><Dropdown label="Account menu" trigger={<><Avatar name={user.name}/><span className={s.uname}>{user.name}</span><ChevronDown size={16} aria-hidden="true"/></>} items={[{label:'Profile',icon:User,onClick:()=>go('/profile')},...(user.guest?[{label:'Log in',icon:LogOut,onClick:()=>go('/login')},{label:'Create account',icon:User,onClick:()=>go('/register')}]:[{label:'Log out',icon:LogOut,onClick:()=>{logout();go('/portal');toast('You have been logged out','info')}}])]}/></div></header>
      <main id="main" className={s.main}><div key={pathname} className={s.page}><Outlet/></div></main></div></div>
}
export const Soon=({title})=><><PageHeader title={title} subtitle="This module is planned for a later task."/><EmptyState title="Coming soon" text="The layout and navigation are ready. The page content will be added next."/></>
