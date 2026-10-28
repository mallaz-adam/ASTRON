# ASTRON

**A living star atlas for learning about the sky.**

ASTRON connects astronomy lessons, Greek stories and scientific articles in a
calm, illustrated web app. Glaux, a wise and mysterious owl, guides the learner
with short, useful lines. The visual style combines parchment, ink, old atlas
illustrations and carefully labelled scientific diagrams.

[Open the development preview](https://astron-8aq.pages.dev/start)

ASTRON is actively being developed. The preview is unlisted, not password
protected: anyone with the link can open it.

## Important: progress is temporary for now

The current development version starts a fresh journey when you refresh or
fully reopen the app. Stars, XP, quests and streaks work during a visit so we
can test their behaviour. The app also has a **Start from the beginning** link.

Temporary working records use a separate browser database. Earlier permanent
progress is left untouched. Refreshing another preview tab at the same address
also resets the shared temporary records. The offline app cache is kept.

There are no accounts, analytics or progress uploads. GitHub backs up the code
and content; it does not back up learners' browser progress.

See [development preview behaviour](astron/docs/development-preview.md) for the
technical details and the future setting that restores permanent saving.

## What works today

- A first-visit welcome followed by the illustrated Orion story and belt activity.
- Five destinations: **Today, Learn, Stories, Articles and My sky**.
- Today’s quests, sun, streak and freeze views.
- The authored **Scale of the cosmos** and **Why stars differ** lessons, with guided practice.
- Interactive cosmic-address views, scale models, star colours, mass and fuel comparisons.
- A sourced Betelgeuse article with a real ALMA cover, category and reading time.
- Collectible stars in My sky and gold discovery cues for unopened details.
- Phone and desktop layouts, keyboard controls and saved/device Reduce motion support.
- An installable PWA that caches the app, authored content, art and local fonts.

The course contains eleven planned cells. Only authored content is offered in
the normal preview path; unfinished lessons remain unavailable. The optional
developer tools retain the complete course model.

## Chapters, lessons and evaluation

The learning goal is a connected explanation, guided exploration and useful
feedback. Scientific diagrams state their simplifications, and sources are
available inside the lesson or reader.

Use these terms consistently:

| Term | Example | What happens there |
| --- | --- | --- |
| Chapter | **How stars live and die** | A complete collection of related lessons, stories and a final evaluation. |
| Lesson | **Scale of the cosmos** | Connected teaching, interactive exploration, optional practice and a recap. |
| Part | **Shrink the Sun** | One section inside a lesson. |
| Chapter evaluation | The end of **How stars live and die** | One full evaluation connecting ideas from the whole chapter. |

**Full evaluations belong at the end of chapters, not after every individual
lesson or part.** Smaller practice moments help learners explore an idea and
understand the explanation. They are not separate exams.

Scale of the cosmos contains eight teaching parts and two optional, unscored
practices. Its eight parts unfold across sixteen short reading/exploration steps,
with **Continue** leading through the recap and on to the next authored lesson.
There is no contents dropdown. The course path marks
the full chapter evaluation as **Coming later**, because several lessons are
still unwritten. Its complete question set and pass-mark rules will be decided
when that chapter's teaching is ready.

See [the learning structure](astron/docs/learning-structure.md).

## Run the project on your computer

The app lives in the **astron** folder inside this repository. Use **Node.js 24**,
as recorded in `astron/.node-version`, with npm.

Open a terminal in the repository folder and run:

```powershell
cd astron
npm.cmd ci
npm.cmd start
```

These commands are for Windows PowerShell; on macOS or Linux, use `npm` in
place of `npm.cmd`. `npm ci` installs the versions recorded in the lockfile. You normally need to
repeat it only after dependencies change. `npm start` opens the local app in
your browser. Keep that terminal running; press **Ctrl+C** to stop the server.
Use the address printed in the terminal if the usual port is already occupied.

## Commands

Run these from the `astron` folder:

| Command | Purpose |
| --- | --- |
| `npm start` | Open the development app. |
| `npm test` | Run the automated tests once. |
| `npm run test:watch` | Keep tests running while editing. |
| `npm run build` | Check TypeScript and create the production files in `dist`. |
| `npm run preview` | Open the built production app locally. Build it first. |

The latest chapter/lesson update passed **441 tests in 47 files** and the
production build. The preceding lesson milestone also passed responsive
browser checks and an offline cold-start check. These are
recorded results, not a substitute for rerunning checks after future changes.
Physical iPhone/Safari and VoiceOver checks remain part of tester feedback.

## Try it on an iPhone

1. Open [the preview](https://astron-8aq.pages.dev/start) in Safari.
2. Tap **REFRESH** if the app offers a new version.
3. Complete the welcome, then open **Learn** and the current lesson.
4. Use Safari’s Share menu and **Add to Home Screen** to install it.
5. After a successful online visit, test opening it in airplane mode.

The development server does not install the production service worker. Use the
HTTPS preview, or a local production build, when checking offline loading.
Development progress still resets on a full page load, including while offline.

## Project structure

```text
ASTRON/
├── README.md                 Project overview
└── astron/
    ├── public/
    │   ├── content/          Author-written JSON and lesson/story content
    │   ├── art/              SVG, WebP and credited astronomy imagery
    │   └── fonts/            Locally hosted fonts and their licences
    ├── src/
    │   ├── design/           Tokens, reusable controls, art and motion
    │   ├── pages/            Screens, readers and lesson players
    │   ├── logic/            Pure learning, exam, streak and quest rules
    │   ├── data/             Content validation, database and services
    │   └── hooks/            Shared progress, clock and layout hooks
    └── docs/                 Content, character and implementation guides
```

## Technology and design

React, TypeScript and Vite provide the app. React Router handles navigation.
Dexie manages IndexedDB working records, Vitest checks the rules, and
vite-plugin-pwa builds the offline application.

Content is kept in plain files. Glaux and scientific diagrams use SVG and CSS;
the current lessons add no WebGL or animation framework. Cinzel provides labels
and IM Fell English provides headings and reading text, with serif fallbacks.
Gold is decorative; readable text uses ink colours.

Performance checks accompany new features: normal document scrolling where
possible, correctly sized art, shared immutable content loads, deferred lesson
code and reduced-motion support. Mobile and desktop use the same learning rules.

## Publishing and backup

The current Cloudflare Pages project builds automatically from GitHub’s
**master** branch using:

| Setting | Value |
| --- | --- |
| Repository | [mallaz-adam/ASTRON](https://github.com/mallaz-adam/ASTRON) |
| Project root | `astron` |
| Build command | `npm run build` |
| Output directory | `dist` |

The public address serves the real app. `/dev` and `/design` work locally in
development and show `not found` in production. Search indexing is discouraged
with noindex and robots rules; these do not restrict access to the link.

Use the repository’s existing Git workflow and check the active branch before
pushing. Never force-push to publish an ordinary update. A new production
service worker offers **REFRESH** when its files are ready.

## Guides and credits

- [Content format and validation](astron/docs/content-format.md)
- [Learning structure and chapter evaluations](astron/docs/learning-structure.md)
- [Scale of the cosmos: teaching, practice and performance](astron/docs/scale-of-cosmos.md)
- [Glaux’s personality](astron/docs/glaux-character.md)
- [Orion journey](astron/docs/orion-journey.md)
- [Discovery cues](astron/docs/discovery-cues.md)
- [Welcome, navigation and article image credit](astron/docs/welcome-and-articles.md)
- [Orion artwork provenance and limitations](astron/docs/orion-assets.md)
- [Phone reading checks](astron/docs/phone-reading.md)
- [Hosting and phone testing](astron/docs/private-test.md)

Scientific observations, illustrative artwork and schematic diagrams have
different purposes. Keep their descriptions and credits with the assets.
Do not assume all artwork in the repository has the same reuse licence.
