# AI Support Agent: React frontend (mock data)

    npm install
    npm run dev      # http://localhost:5173
    npm run build    # production build in dist/

Demo login: any email, a 6+ character password, and pick Customer, Agent or Admin.
Data is kept in memory in src/store.jsx. Replace its functions with fetch() calls to Jawad's API when the backend is ready.
Deploy on Vercel: import the repo, set the root folder to client, framework Vite (vercel.json handles page refreshes).

## Design system (Task 1)
- Tokens and both themes: src/styles.css (CSS variables, [data-theme=dark])
- Theme toggle and persistence: src/theme.jsx (localStorage key "sa-theme", no flash via script in index.html)
- Reusable components: src/ui.jsx with src/ui.module.css
- Layouts: src/layout.jsx (AuthLayout, DashboardShell, Soon placeholder)
