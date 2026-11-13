import {Routes,Route,Navigate} from 'react-router-dom'
import {useApp} from './store.jsx'
import {CustomerLayout,DashboardShell,home} from './layout.jsx'
import {Auth,Chat,AiLog} from './pages.jsx'
import {MyOrders,MyOrderDetail,MyRefunds,MyTickets,MyTicketDetail,MyAccount} from './customer.jsx'
import {StaffOrders,StaffOrderDetail,StaffRefunds,StaffTickets,StaffTicketDetail,StaffProfile} from './staff.jsx'
import {CustomerPortal,AgentDashboard,AdminDashboard,AgentsPage,ConversationsPage} from './dashboards.jsx'
function Guard({role}){
  const {user}=useApp()
  if(user.role===role)return role==='customer'?<CustomerLayout/>:<DashboardShell/>
  return <Navigate to={user.role==='customer'?'/staff/login':home(user.role)} replace/>
}
const cust=<><Route path="chat" element={<Chat/>}/><Route path="orders" element={<MyOrders/>}/><Route path="orders/:id" element={<MyOrderDetail/>}/><Route path="refunds" element={<MyRefunds/>}/><Route path="tickets" element={<MyTickets/>}/><Route path="tickets/:id" element={<MyTicketDetail/>}/><Route path="profile" element={<MyAccount/>}/></>
const staff=<><Route path="orders" element={<StaffOrders/>}/><Route path="orders/:id" element={<StaffOrderDetail/>}/><Route path="refunds" element={<StaffRefunds/>}/><Route path="tickets" element={<StaffTickets/>}/><Route path="tickets/:id" element={<StaffTicketDetail/>}/><Route path="profile" element={<StaffProfile/>}/><Route path="conversations" element={<ConversationsPage/>}/><Route path="log" element={<AiLog/>}/></>
export default function App(){
  const {user}=useApp()
  return <Routes>
    <Route path="/" element={<Navigate to="/portal" replace/>}/>
    <Route path="/login" element={user.guest?<Auth mode="login"/>:<Navigate to={home(user.role)} replace/>}/>
    <Route path="/register" element={<Auth mode="register"/>}/>
    <Route path="/staff/login" element={user.role==='customer'?<Auth mode="staff"/>:<Navigate to={home(user.role)} replace/>}/>
    <Route path="/portal" element={<Guard role="customer"/>}><Route index element={<CustomerPortal/>}/>{cust}</Route>
    <Route path="/agent" element={<Guard role="agent"/>}><Route index element={<AgentDashboard/>}/>{staff}</Route>
    <Route path="/admin" element={<Guard role="admin"/>}><Route index element={<AdminDashboard/>}/>{staff}<Route path="agents" element={<AgentsPage/>}/></Route>
    <Route path="*" element={<Navigate to="/portal" replace/>}/>
  </Routes>
}
