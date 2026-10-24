# ASTRON: publish the private test

These are reference instructions. In chat we will take them one step at a time.
Never send passwords, login codes, API tokens or other secrets in chat. Enter
them only on the provider's own sign-in page.

## Current state

The app is prepared locally. Publishing and the real phone checks below are
still pending. The chosen host is Cloudflare Pages, connected to GitHub.

The link will be **unlisted, not secret**: anyone who gets it can open it.
Noindex, robots.txt and the X-Robots-Tag ask search engines to leave it out;
they do not control access. Learner progress stays in that browser's IndexedDB.
The host receives ordinary requests for the website's files, but ASTRON adds
no analytics, accounts or progress upload.

## Connect Cloudflare Pages

1. In Cloudflare, click **Workers & Pages**.
2. Click **Create application**.
3. Choose **Pages**, then **Import an existing Git repository**. Choose the
   Git-connected Pages option, not direct upload, so later pushes publish.
4. If Cloudflare asks to connect GitHub, continue on GitHub's own page. Select
   only the **ASTRON** repository when that option is offered. Review and approve
   the requested repository access yourself; no token belongs in chat.
5. Select **mallaz-adam / ASTRON**, then **Begin setup** if shown.
6. Choose a project name such as `astron-test`; it must be available.
7. Enter these build settings. Expand **Root directory** if necessary.

| Setting | Exact value |
| --- | --- |
| Production branch | `master` |
| Framework preset | `Vite` (or `React (Vite)` if offered) |
| Root directory | `astron` |
| Build command | `npm run build` |
| Build output directory | `dist` |

`dist` is relative to the `astron` root above. Do not set `astron/dist` as well.
Node 24 is selected by the project's `.node-version`. No secret or app
environment variable is needed. This repository uses `master`, even where
Cloudflare's example uses `main`.

8. Review those values, then click **Save and Deploy**.
9. Wait for a successful deployment. Open the HTTPS `pages.dev` address shown
   by Cloudflare and copy that ordinary public address into chat for checking.
10. In the project's Git deployment settings, keep automatic production builds
    enabled for **master**. Later pushes to that branch should trigger deploys.

Official sources, read 24 October 2026:
[React deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/),
[dashboard setup](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/),
[Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/).
Dashboard wording can change; if your screen differs, tell us its labels.

Cloudflare's [built-in single-page routing](https://developers.cloudflare.com/pages/configuration/serving-pages/)
serves the app shell for deep links when there is no root `404.html`. Keep that
behaviour: React shows the normal `not found` screen for `/dev` and `/design`
in production, while both remain available with `npm start` locally.

## Check the published address on a computer

- Today opens over HTTPS and shows **Test version 0.1** at the bottom.
- Continue opens the course path and the real **Why stars differ** lesson.
  New testers start at cell 3 without XP or completions for cells 1 and 2.
- Direct `/learn` and `/cell/star-lesson` links load after a browser refresh.
- `/dev`, `/design`, and a temporary cell such as `/cell/orion-lesson` show
  **not found**. Local development keeps the original test pages.
- View page source: find `noindex`. Open `/robots.txt`: it disallows `/`.
- Use a disposable test run for **Erase my progress on this device**. Cancel
  its confirmation first, checking progress stays. Confirm only when you intend
  to erase progress on that device; other devices and the app files are unaffected.

## Check it on a phone

1. While online, open the HTTPS address in Safari on iPhone or Chrome on Android.
2. Open Continue, BEGIN lesson 3, choose a hunch and try its first interactive
   card. Allow a few seconds for offline files to finish downloading.
3. Install it:
   - iPhone: Safari **Share** (possibly inside the page menu), **Add to Home
     Screen**, enable **Open as Web App** if offered, then **Add**.
   - Android: Chrome's three-dot menu, **Install and create shortcut**, then
     **Install**. Some Chrome versions call this **Add to Home screen**.
4. Open the new **ASTRON** icon. Check the lapis and gold temporary icon and
   standalone view without the normal browser address bar. Visit the lesson
   once in the installed app too, because phone browsers may use separate storage.
5. Close the app. Turn on airplane mode and ensure Wi-Fi is off. Open ASTRON
   again from its icon. Today, fonts, owl and lesson 3 should still load, and the
   lesson's sliders and answers should work.
6. Turn airplane mode off. Progress should still be there on that installation.

Official phone guidance, read 24 October 2026:
[Apple](https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios),
[Google Chrome](https://support.google.com/chrome/answer/9658361?hl=en&co=GENIE.Platform%3DAndroid).
Installation details depend on the phone/browser version.

## Check a later update

Keep one installed copy open. After the next approved app change is pushed to
`master`, wait for Cloudflare's deployment to succeed. Return to that installed
copy while online. The app checks on return and every minute while visible.
**A new version is ready.** should appear, with **REFRESH**. Press it when ready;
the page reloads into the new version and saved progress remains. The first
installation must show no update bar. Offline visits keep using the installed
version until a new version can download.

## What is backed up

GitHub contains the committed source and history. The separate source ZIP can
restore files, and the Git bundle can restore files plus the repository history.
Neither includes node_modules, generated builds, secrets or learner progress.
Device progress belongs to its address and browser; clearing browser storage or
confirming erasure removes it. A new domain starts a separate local record.

The temporary icon source is `public/icons/test-icon.svg`. The 192, 512,
maskable 512 and Apple 180 PNGs were exported with the workspace's existing
Sharp runtime; no image dependency was added to the project. Fonts and licenses
are in `public/fonts`; they are served and precached from the same address.

## Local commands (only if needed)

Open PowerShell in the `astron` folder:

```powershell
npm test
npm run build
npm start
```

To inspect the production build instead of development, stop the running server
with Ctrl+C, then run `npm run preview`. To see the backup commits:

```powershell
git log -5 --oneline
```

You can also open the repository's
[GitHub commit history](https://github.com/mallaz-adam/ASTRON/commits/master/).
