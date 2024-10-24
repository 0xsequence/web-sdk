import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import { App } from './App'

console.log('VERSION:', process.env.PACKAGE_VERSION)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<App />)
