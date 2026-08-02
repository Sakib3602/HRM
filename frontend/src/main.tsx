import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router";
import RoutesAll from './RoutesAll';
import { AuthProvider } from './Common/AUTH/AuthProvider';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RoutesAll></RoutesAll>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)