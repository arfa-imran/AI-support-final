import {useEffect,useState} from 'react'
import {Link,NavLink,Outlet,useLocation,useNavigate} from 'react-router-dom'
import {Home,LayoutDashboard,ShoppingBag,RotateCcw,LifeBuoy,MessageSquare,ScrollText,User,Users,Menu,X,PanelLeftClose,PanelLeftOpen,LogOut,ChevronDown} from 'lucide-react'
import s from './layout.module.css'
import {useApp,resetDemo} from './store.jsx'
import {Avatar,Dropdown,ThemeToggle,Tooltip,EmptyState,PageHeader,Button,useToast,cx} from './ui.jsx'
export const Brand=({to='/'})=><Link to={to} className={s.brand}><svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" className={s.mk}/><path d="M9 12.5A3.5 3.5 0 0112.5 9h7a3.5 3.5 0 013.5 3.5v4a3.5 3.5 0 01-3.5 3.5H16l-4 3v-3a3.5 3.5 0 01-3-3.5z" className={s.mkp}/><circle cx="21.5" cy="21.5" r="3" className={s.mkd}/></svg><span>Support Agent</span></Link>
export function AuthLayout({children}){
  const {pathname}=useLocation()
  return <div className={s.auth}><header className={s.authTop}><Brand to="/login"/><div className={s.right}><ThemeToggle/><Link to="/portal"><Button variant="secondary" size="sm" tabIndex={-1}>Customer portal</Button></Link></div></header><main className={cx(s.authMain,'authmain')}>{children}</main></div>
}
export const home=r=>r==='customer'?'/portal':'/'+r
const nav=role=>{const b=home(role);return role==='customer'?[[b,'Home',Home],[b+'/chat','Chat',MessageSquare],[b+'/orders','Orders',ShoppingBag],[b+'/refunds','Refunds',RotateCcw],[b+'/tickets','Support Tickets',LifeBuoy],[b+'/profile','Profile',User]]
 :[[b,'Dashboard',LayoutDashboard],[b+'/orders','Orders',ShoppingBag],[b+'/refunds','Refunds',RotateCcw],[b+'/tickets','Support Tickets',LifeBuoy],[b+'/conversations','Conversations',MessageSquare],[b+'/log','AI Action Log',ScrollText],...(role==='admin'?[[b+'/agents','Agents',Users]]:[]),[b+'/profile','Profile',User]]}
export function DashboardShell(){
  const {user,logout}=useApp(),toast=useToast(),go=useNavigate(),{pathname}=useLocation()
  const [open,setOpen]=useState(false),[min,setMin]=useState(false),items=nav(user.role)
  useEffect(()=>setOpen(false),[pathname])
  useEffect(()=>{const k=e=>e.key==='Escape'&&setOpen(false);document.addEventListener('keydown',k);return()=>document.removeEventListener('keydown',k)},[])
  const crumbs=pathname.split('/').filter(Boolean).slice(1)
  const label=p=>(items.find(i=>i[0].endsWith('/'+p))||[])[1]||p
  return <div className={cx(s.shell,min&&s.min)}><a href="#main" className={s.skip}>Skip to content</a>
    <aside className={cx(s.side,open&&s.open)} aria-label="Primary"><div className={s.sideTop}><Brand to={items[0][0]}/><button className={cx(s.icon,s.mobile)} onClick={()=>setOpen(false)} aria-label="Close menu"><X size={20}/></button></div>
      <nav className={s.nav}>{items.map(([to,name,I])=><NavLink key={to} to={to} end={to===home(user.role)} className={({isActive})=>cx(s.link,isActive&&s.on)}><Tooltip text={name}><I size={20} aria-hidden="true"/></Tooltip><span className={s.lbl}>{name}</span></NavLink>)}</nav>
      <button className={cx(s.collapse,s.desk)} onClick={()=>setMin(!min)} aria-label={min?'Expand sidebar':'Collapse sidebar'}>{min?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}<span className={s.lbl}>Collapse</span></button></aside>
    {open&&<div className={s.drawerScrim} onClick={()=>setOpen(false)}/>}
    <div className={s.col}><header className={s.top}><button className={cx(s.icon,s.mobile)} onClick={()=>setOpen(true)} aria-label="Open menu" aria-expanded={open}><Menu size={20}/></button>
      <nav aria-label="Breadcrumb" className={s.crumbs}><ol><li>{user.role==='admin'?'Admin':'Agent'} workspace</li>{crumbs.map((c,i)=><li key={i} aria-current={i===crumbs.length-1?'page':undefined}>{label(c)}</li>)}</ol></nav>
      <div className={s.right}><ThemeToggle/><Dropdown label="Account menu" trigger={<><Avatar name={user.name}/><span className={s.uname}>{user.name}</span><ChevronDown size={16} aria-hidden="true"/></>} items={[{label:'Profile',icon:User,onClick:()=>go(home(user.role)+'/profile')},...(user.guest?[{label:'Log in',icon:LogOut,onClick:()=>go('/login')},{label:'Create account',icon:User,onClick:()=>go('/register')},{label:'Staff login',icon:Users,onClick:()=>go('/staff/login')},{label:'Reset demo data',icon:RotateCcw,onClick:resetDemo}]:[{label:'Log out',icon:LogOut,onClick:()=>{logout();go('/portal');toast('You have been logged out','info')}},{label:'Reset demo data',icon:RotateCcw,onClick:resetDemo}])]}/></div></header>
      <main id="main" className={s.main}><div key={pathname} className={s.page}><Outlet/></div></main></div></div>
}
export const Soon=({title})=><><PageHeader title={title} subtitle="This module is planned for a later task."/><EmptyState title="Coming soon" text="The layout and navigation are ready. The page content will be added next."/></>

export function CustomerLayout(){
  const {user,logout}=useApp(),toast=useToast(),go=useNavigate(),{pathname}=useLocation()
  const items=nav('customer').filter(i=>!i[0].endsWith('/profile'))
  const menu=user.guest?[{label:'Log in',icon:LogOut,onClick:()=>go('/login')},{label:'Create account',icon:User,onClick:()=>go('/register')},{label:'Staff login',icon:Users,onClick:()=>go('/staff/login')},{label:'Reset demo data',icon:RotateCcw,onClick:resetDemo}]
   :[{label:'Profile',icon:User,onClick:()=>go('/portal/profile')},{label:'Log out',icon:LogOut,onClick:()=>{logout();go('/portal');toast('You have been logged out','info')}},{label:'Reset demo data',icon:RotateCcw,onClick:resetDemo}]
  return <div className={s.cwrap}><a href="#main" className={s.skip}>Skip to content</a>
    <header className={s.cTop}><div className={s.cBar}><Brand to="/portal"/>
      <nav aria-label="Customer portal" className={s.cNav}>{items.map(([to,name])=><NavLink key={to} to={to} end={to==='/portal'} className={({isActive})=>cx(s.cLink,isActive&&s.cOn)}>{name}</NavLink>)}</nav>
      <div className={s.right}><ThemeToggle/><Dropdown label="Account menu" trigger={<><Avatar name={user.name}/><span className={s.uname}>{user.name}</span><ChevronDown size={16} aria-hidden="true"/></>} items={menu}/></div></div></header>
    <main id="main" className={s.cMain}><div key={pathname} className={s.page}><Outlet/></div></main></div>
}
