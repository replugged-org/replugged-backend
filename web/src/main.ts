import { h, render, hydrate } from 'preact'
import App from './components/App'
import './main.css'

declare global {
  interface Window {
    HAS_TOKEN?: boolean
  }
}

function Wrapper () {
  return h(App, null)
}

if (import.meta.env.DEV) {
  render(h(Wrapper, null), document.querySelector('#app')!)
} else {
  hydrate(h(Wrapper, null), document.querySelector('#app')!)
}