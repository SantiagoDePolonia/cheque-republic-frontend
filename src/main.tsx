import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.tsx'
import './index.css'
import WagmiConfigWrapper from './components/WagmiConfigWrapper.tsx';

window.global ||= window;
global ||= window;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfigWrapper>
      <App />
    </WagmiConfigWrapper>
  </React.StrictMode>,
)
