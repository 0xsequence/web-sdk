import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from './App'
import './index.css'

// @ts-ignore
console.log('VERSION:', __SEQUENCE_KIT_PACKAGE_VERSION__)
// @ts-ignore
console.log('DEBUG: ', __SEQUENCE_KIT_DEBUG__)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<App />)
