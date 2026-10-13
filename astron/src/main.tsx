import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DesignCheck } from './pages/DesignCheck';
import './design/tokens.css';
import './design/components.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesignCheck />
  </StrictMode>,
);
