import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import {ThemeProvider} from './theme.jsx'
import {ToastProvider} from './ui.jsx'
import {Provider} from './store.jsx'
import App from './App.jsx'
import './styles.css'
createRoot(document.getElementById('root')).render(<BrowserRouter><ThemeProvider><ToastProvider><Provider><App/></Provider></ToastProvider></ThemeProvider></BrowserRouter>)
