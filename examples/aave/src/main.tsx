import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'

import { SequenceConnect } from '@0xsequence/connect'

import { config } from './config.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SequenceConnect config={config}>
      <App />
    </SequenceConnect>
  </StrictMode>
)
