import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { db } from './data/db';
import { prepareProgress } from './data/prepareProgress';
import { temporaryProgress } from './data/progressMode';
import './design/fonts.css';
import './design/tokens.css';
import './design/components.css';

const root = createRoot(document.getElementById('root')!);
void prepareProgress(db, temporaryProgress).then(() => {
  root.render(<StrictMode><App /></StrictMode>);
}).catch(() => {
  root.render(<main className="atlas-page"><h1>The atlas could not open.</h1><p>Please try again.</p><button className="atlas-button atlas-button--primary" type="button" onClick={() => window.location.reload()}>Try again</button></main>);
});
