import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter} from "react-router";
import RoutesAll from './RoutesAll';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RoutesAll></RoutesAll>
    </BrowserRouter>
  </StrictMode>,
)
