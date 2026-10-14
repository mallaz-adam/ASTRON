import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProgressProvider } from './hooks/useProgress';
import { Today } from './pages/Today';
import { YourSun } from './pages/YourSun';
import { DesignCheck } from './pages/DesignCheck';
import { Dev } from './pages/Dev';

function AppRoutes() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = location.pathname === '/dev' ? 'TEMPORARY · Rules check · ASTRON'
      : location.pathname === '/design' ? 'Design check · ASTRON'
      : location.pathname === '/sun' ? 'Your sun · ASTRON' : 'Today · ASTRON';
  }, [location.pathname]);
  return (
    <Routes>
      <Route path="/" element={<Today />} />
      <Route path="/sun" element={<YourSun />} />
      <Route path="/design" element={<DesignCheck />} />
      <Route path="/dev" element={<Dev />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return <ProgressProvider><BrowserRouter><AppRoutes /></BrowserRouter></ProgressProvider>;
}
