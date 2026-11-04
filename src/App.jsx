import {Routes,Route,Navigate} from 'react-router-dom'
import {useApp} from './store.jsx'
import {CustomerPortal,RoleDashboard,AgentsPage,ConversationsPage} from './dashboards.jsx'
import {DashboardShell,Soon} from './layout.jsx'
import {Auth,Profile,Orders,OrderDetail,Refunds,Tickets,TicketDetail,Chat,Dashboard,AiLog} from './pages.jsx'
const home=r=>r==='customer'?'/portal':'/dashboard'
function Guard({roles}){
  const {user}=useApp()
  if(!user)return <Navigate to="/login" replace/>
  if(roles&&!roles.includes(user.role))return <Navigate to={home(user.role)} replace/>
  return <DashboardShell/>
}
export default function App(){
  const {user}=useApp()
  return <Routes>
    <Route path="/login" element={user.guest?<Auth mode="login"/>:<Navigate to={home(user.role)}/>}/>
    <Route path="/register" element={<Auth mode="register"/>}/>
    <Route element={<Guard/>}>
      <Route path="/profile" element={<Profile/>}/><Route path="/orders" element={<Orders/>}/><Route path="/orders/:id" element={<OrderDetail/>}/>
      <Route path="/refunds" element={<Refunds/>}/><Route path="/tickets" element={<Tickets/>}/><Route path="/tickets/:id" element={<TicketDetail/>}/>
    </Route>
    <Route element={<Guard roles={['customer']}/>}><Route path="/portal" element={<CustomerPortal/>}/><Route path="/chat" element={<Chat/>}/></Route>
    <Route element={<Guard roles={['agent','admin']}/>}><Route path="/dashboard" element={<RoleDashboard/>}/><Route path="/log" element={<AiLog/>}/><Route path="/conversations" element={<ConversationsPage/>}/></Route>
    <Route element={<Guard roles={['admin']}/>}><Route path="/agents" element={<AgentsPage/>}/></Route>
    <Route path="/" element={<Navigate to="/portal" replace/>}/>
    <Route path="*" element={<Navigate to="/portal" replace/>}/>
  </Routes>
}
