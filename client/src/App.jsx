import {Routes,Route,Navigate} from 'react-router-dom'
import {useApp} from './store.jsx'
import {CustomerLayout,DashboardShell,home} from './layout.jsx'
import {Auth,Profile,Orders,OrderDetail,Refunds,Tickets,TicketDetail,Chat,AiLog} from './pages.jsx'
import {CustomerPortal,AgentDashboard,AdminDashboard,AgentsPage,ConversationsPage} from './dashboards.jsx'
function Guard({role}){
  const {user}=useApp()
  if(user.role===role)return role==='customer'?<CustomerLayout/>:<DashboardShell/>
  return <Navigate to={user.role==='customer'?'/staff/login':home(user.role)} replace/>
}
const shared=<><Route path="orders" element={<Orders/>}/><Route path="orders/:id" element={<OrderDetail/>}/><Route path="refunds" element={<Refunds/>}/><Route path="tickets" element={<Tickets/>}/><Route path="tickets/:id" element={<TicketDetail/>}/><Route path="profile" element={<Profile/>}/></>
const staff=<><Route path="conversations" element={<ConversationsPage/>}/><Route path="log" element={<AiLog/>}/></>
export default function App(){
  const {user}=useApp()
  return <Routes>
    <Route path="/" element={<Navigate to="/portal" replace/>}/>
    <Route path="/login" element={user.guest?<Auth mode="login"/>:<Navigate to={home(user.role)} replace/>}/>
    <Route path="/register" element={<Auth mode="register"/>}/>
    <Route path="/staff/login" element={user.role==='customer'?<Auth mode="staff"/>:<Navigate to={home(user.role)} replace/>}/>
    <Route path="/portal" element={<Guard role="customer"/>}><Route index element={<CustomerPortal/>}/><Route path="chat" element={<Chat/>}/>{shared}</Route>
    <Route path="/agent" element={<Guard role="agent"/>}><Route index element={<AgentDashboard/>}/>{shared}{staff}</Route>
    <Route path="/admin" element={<Guard role="admin"/>}><Route index element={<AdminDashboard/>}/>{shared}{staff}<Route path="agents" element={<AgentsPage/>}/></Route>
    <Route path="*" element={<Navigate to="/portal" replace/>}/>
  </Routes>
}
