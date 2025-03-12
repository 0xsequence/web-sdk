import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import { App } from './App'

// @ts-ignore
console.log('VERSION:', __SEQUENCE_KIT_PACKAGE_VERSION__)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<App />)
