import React from 'react'
import ReactDOM from 'react-dom/client'
import { WEB_SDK_VERSION } from '@0xsequence/react-connect'

import './index.css'
import { App } from './App'

// @ts-ignore
console.log('VERSION:', WEB_SDK_VERSION)
// @ts-ignore
console.log('DEV_GLOBAL: ', __WEB_SDK_DEV_GLOBAL__)
// @ts-ignore
console.log('DEV_SARDINE: ', __WEB_SDK_DEV_SARDINE__)
// @ts-ignore
console.log('DEV_TRANSAK: ', __WEB_SDK_DEV_TRANSAK__)
// @ts-ignore
console.log('DEV_SEQUENCE_APIS: ', __WEB_SDK_DEV_SEQUENCE_APIS__)
// @ts-ignore
console.log('DEV_SARDINE_PROJECT_ACCESS_KEY: ', __WEB_SDK_DEV_SARDINE_PROJECT_ACCESS_KEY__)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<App />)
