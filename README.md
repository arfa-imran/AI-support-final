# AI Support Agent: React frontend (mock data)

    npm install
    npm run dev      # http://localhost:5173

## Three separate areas
- Customer portal (no login needed): http://localhost:5173/portal  (optional customer login at /login, register at /register)
- Agent dashboard: /agent   (staff login at /staff/login, choose Agent)
- Admin dashboard: /admin   (staff login at /staff/login, choose Admin)

Demo login: any email and a 6+ character password.

## Using two tabs
Open the customer portal in one tab and the staff login in another. Tickets, refunds, orders, chats and agents
are saved in the browser and sync between tabs. Each tab keeps its own logged-in user.
Use "Reset demo data" in the account menu to start fresh.

Data lives in src/store.jsx. Replace its functions with fetch() calls to the backend API when it is ready.
Deploy on Vercel: root folder = this folder, framework Vite (vercel.json handles page refreshes).

## Separate screens
- Customer portal (/portal): My orders (cards with tracking), Refunds (request form and progress), Help and support (tickets as a conversation), My account.
- Agent and admin dashboards (/agent, /admin): Orders table with status updates, Refund review queue, Tickets table with assign and status, ticket detail with a side panel, Conversations, AI action log. Admin also has Agents.
