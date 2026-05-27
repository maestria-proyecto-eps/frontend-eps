import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PostHogProvider } from 'posthog-js/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider
      apiKey="phc_AXDEFtjy4PbJpvwxB7CaZNpXK3ESZnuUoYK22Gs5BCPy"
      options={{ api_host: 'https://us.i.posthog.com' }}
    >
      <App />
    </PostHogProvider>
  </StrictMode>,
)