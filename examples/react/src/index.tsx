import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import { App } from './App'

// @ts-ignore
console.log('VERSION:', __SEQUENCE_WEB_SDK_PACKAGE_VERSION__)
// @ts-ignore
console.log('DEBUG: ', __SEQUENCE_WEB_SDK_IS_DEV__)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<App />)
