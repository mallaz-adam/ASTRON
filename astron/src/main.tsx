import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DesignCheck } from './pages/DesignCheck';
import { Dev } from './pages/Dev';
import './design/tokens.css';
import './design/components.css';

const isDevPage = window.location.pathname.replace(/\/$/, '').endsWith('/dev');
if (isDevPage) document.title = 'TEMPORARY · Rules check · ASTRON';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDevPage ? <Dev /> : <DesignCheck />}
  </StrictMode>,
);
