import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router";
import RoutesAll from './RoutesAll';
import { AuthProvider } from './Common/AUTH/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <RoutesAll></RoutesAll>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)