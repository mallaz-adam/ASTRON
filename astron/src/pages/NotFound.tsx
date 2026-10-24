import { Page } from '../design/Page';
import { useEffect } from 'react';

export function NotFound() {
  useEffect(() => { document.title = 'not found · ASTRON'; }, []);
  return <Page skipLabel="not found"><main id="main-content" tabIndex={-1}><h1>not found</h1></main></Page>;
}
