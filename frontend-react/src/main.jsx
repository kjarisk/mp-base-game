import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// NOTE: StrictMode causes double execution of effects in development mode
// This can cause duplicate player creation. Temporarily disabled for game development.
// You can re-enable it by wrapping <App /> with <StrictMode>

createRoot(document.getElementById('root')).render(
  <App />
)
