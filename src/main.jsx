import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const originalConsoleError = console.error
console.error = (...args) => {
  const msg = args[0]?.toString?.() || ''
  if (
    msg.includes('ResizeObserver loop limit exceeded') ||
    msg.includes('ResizeObserver loop completed') ||
    msg.includes('Warning: Each child in a list should have a unique')
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
