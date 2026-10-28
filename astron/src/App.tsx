import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ProgressProvider } from './hooks/useProgress';
import { Today } from './pages/Today';
import { YourSun } from './pages/YourSun';
import { CoursePath } from './pages/CoursePath';
import { Cell } from './pages/Cell';
import { Page } from './design/Page';
import { NotFound } from './pages/NotFound';
import { UpdateNotice } from './pwa/UpdateNotice';
import { FirstVisitGate } from './pages/FirstVisitGate';
import { TaleExperience } from './pages/tales/TaleExperience';
import { Stories } from './pages/Stories';
import { MySky } from './pages/MySky';
import { Articles, ArticleReader } from './pages/Articles';
import { Settings } from './pages/Settings';
import { StartupIntro } from './design/StartupIntro';
import { Welcome } from './pages/Welcome';

// Developer tools and their imports are absent from the production entry bundle.
const DesignCheck = import.meta.env.DEV ? lazy(() => import('./pages/DesignCheck').then(module => ({ default: module.DesignCheck }))) : null;
const Dev = import.meta.env.DEV ? lazy(() => import('./pages/Dev').then(module => ({ default: module.Dev }))) : null;
const openingTools = <Page skipLabel="Skip to page"><main id="main-content" aria-busy="true"><h1>Opening the atlas…</h1></main></Page>;

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
    if (['/welcome', '/guide', '/start'].includes(location.pathname)) document.title = 'Welcome · ASTRON';
    if (location.pathname.startsWith('/stories')) document.title = 'Stories · ASTRON';
    if (location.pathname === '/sky') document.title = 'My sky · ASTRON';
    if (location.pathname.startsWith('/articles')) document.title = 'Articles · ASTRON';
    if (location.pathname === '/settings') document.title = 'Your preferences · ASTRON';
  }, [location.pathname, development]);
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/guide" element={<Welcome review />} />
      <Route path="/start" element={<Welcome />} />
      <Route element={<FirstVisitGate />}>
        <Route path="/" element={<Today />} />
        <Route path="/sun" element={<YourSun />} />
        <Route path="/learn" element={<CoursePath />} />
        <Route path="/cell/:id" element={<Cell />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:id" element={<TaleExperience />} />
        <Route path="/sky" element={<MySky />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:id" element={<ArticleReader />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      {development && DesignCheck && <Route path="/design" element={<Suspense fallback={openingTools}><DesignCheck /></Suspense>} />}
      {development && Dev && <Route path="/dev" element={<Suspense fallback={openingTools}><Dev /></Suspense>} />}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function App() {
  return <ProgressProvider><BrowserRouter><StartupIntro><AppRoutes /><UpdateNotice /></StartupIntro></BrowserRouter></ProgressProvider>;
}
