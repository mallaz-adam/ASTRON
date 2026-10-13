# ASTRON

Task 1: a React + TypeScript design sheet, built with Vite.

## Run

Open PowerShell in this folder. Install packages once with `npm install`.
Run `npm start` to open Design check in your browser.
Press Ctrl+C in the terminal to stop it.

## Check

- `npm test` runs the contrast and progress component checks.
- `npm run build` checks TypeScript and creates the production app in `dist`.
- `npm run preview` opens the production app at http://localhost:4173.
- `git log -1 --oneline` shows the first commit.

## Offline and installation

The PWA service worker is enabled in the production build, not the development server.
Run the build and preview commands. Visit once online, wait a few seconds, and reload.
In browser developer tools, choose Application > Service Workers and confirm the worker is activated.
Choose Network > Offline, then reload: Design check should still appear.
Restore Network > No throttling when finished.
Use the browser's Install app action when available. On iPhone, use Share > Add to Home Screen.
A hosted phone installation needs HTTPS. localhost is suitable for desktop testing.

Google Fonts are the only external page resources. Their styles and files are cached when loaded;
Georgia is the fallback if fonts have not yet been cached. There are no accounts, analytics,
progress records, or API calls. Reduce motion affects this design sheet and is reset on reload.

## Folders

- `src/design`: CSS tokens, components, component styles, and tests.
- `src/pages`: the Design check page.
- `src/data`, `src/logic`, `public/content`, `public/art`: intentionally empty.

Git does not store empty folders. To recreate these four folders after a fresh clone in PowerShell:

```powershell
New-Item -ItemType Directory -Force src/data, src/logic, public/content, public/art
```

No database or learning rules are included yet. Dexie belongs to a later progress task.
Install icons live in `public/icons`; `public/art` remains empty.
To rebuild the PNG icons on Windows: `powershell -ExecutionPolicy Bypass -File scripts/create-icons.ps1`.

## Design references

- [Vite guide](https://vite.dev/guide/)
- [Vite PWA: offline caching](https://vite-pwa-org.netlify.app/guide/service-worker-precache)
- [Vite PWA: Google Fonts caching](https://vite-pwa-org.netlify.app/workbox/generate-sw.html)
- [Vitest configuration](https://vitest.dev/config/)
