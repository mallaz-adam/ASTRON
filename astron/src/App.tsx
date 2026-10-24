import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ProgressProvider } from './hooks/useProgress';
import { Today } from './pages/Today';
import { YourSun } from './pages/YourSun';
import { CoursePath } from './pages/CoursePath';
import { Cell } from './pages/Cell';
import { DesignCheck } from './pages/DesignCheck';
import { Dev } from './pages/Dev';
import { NotFound } from './pages/NotFound';
import { UpdateNotice } from './pwa/UpdateNotice';

export function AppRoutes({ development = import.meta.env.DEV }: { development?: boolean }) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = !development && ['/dev', '/design'].includes(location.pathname) ? 'not found · ASTRON'
      : location.pathname === '/dev' ? 'TEMPORARY · Rules check · ASTRON'
      : location.pathname === '/design' ? 'Design check · ASTRON'
      : location.pathname === '/sun' ? 'Your sun · ASTRON' : 'Today · ASTRON';
    if (location.pathname === '/learn') document.title = 'Course path · ASTRON';
    if (location.pathname.startsWith('/cell/')) document.title = 'Cell · ASTRON';
  }, [location.pathname, development]);
  return (
    <Routes>
      <Route path="/" element={<Today />} />
      <Route path="/sun" element={<YourSun />} />
      <Route path="/learn" element={<CoursePath />} />
      <Route path="/cell/:id" element={<Cell />} />
      {development && <Route path="/design" element={<DesignCheck />} />}
      {development && <Route path="/dev" element={<Dev />} />}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function App() {
  return <ProgressProvider><BrowserRouter><AppRoutes /><UpdateNotice /></BrowserRouter></ProgressProvider>;
}
