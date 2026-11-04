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
- The Pleiades: seven illustrated scenes, two optional discoveries, a real-sky
  ending and an Alcyone star in My sky.
- Five destinations: **Today, Learn, Stories, Articles and My sky**.
- Today’s quests, sun, streak and freeze views.
- Chapter 1, **Our place in space**, has four playable units: **Earth, the Sun and the Moon**, **Our solar system**, **Stars and the Milky Way** and **Galaxies and the universe**, with illustrated steps, tappable definitions and dedicated practice.
- The authored **Scale of the cosmos** and **Why stars differ** lessons, with guided practice.
- Interactive cosmic-address views, scale models, star colours, mass and fuel comparisons.
- A sourced Betelgeuse article with a real ALMA cover, category and reading time.
- Collectible stars in My sky and gold discovery cues for unopened details.
- Phone and desktop layouts, keyboard controls and saved/device Reduce motion support.
- Clearer first actions and reachable phone reading controls; Sources stay quieter than discoveries.
- An installable PWA that caches the app, authored content, art and local fonts.

The beginner chapter has six planned units and a final ten-question evaluation.
Units 1–4 are playable; the two remaining units are visibly marked as being prepared.
The earlier eleven-cell **How stars live and die** chapter remains available through
the chapter links for development testing. This is not a chapter-exam unlock: the
passing threshold and retry policy are still to be decided.
Only authored content is offered in the normal preview path. Developer tools
retain the complete course model.

### Try the new first unit locally

Run `npm start` inside `astron`, complete the welcome, then choose **Learn**,
**Our place in space**, **Earth, the Sun and the Moon**, and **Begin**.
The lesson starts with an introduction. Continue moves through one idea at a time;
Previous returns to the preceding step. Underlined words reveal a definition and
example; Escape closes it and returns keyboard focus. Pictures, sources and credits
are available at the bottom. Practice has its own steps: attempt the question,
read the feedback, then Continue. Practice is ungraded.

The three NASA pictures are stored locally as small WebP files. The painted-style
orbit, light and lamp diagrams are original SVG drawn in code. Everything needed
for this unit is included in the offline app cache. No new libraries were added.
See [the unit's implementation notes](astron/docs/earth-sun-moon.md).

Finishing Unit 1 unlocks **Our solar system**, with Continue opening it directly.
Unit 2 combines local NASA observations, labelled atlas diagrams, a visible
inner-planet order reference and a family-sorting practice. Pluto's classification
detail stays optional. Its practices have no score or extra XP. See
[Unit 2 implementation and checks](astron/docs/our-solar-system.md).

Finishing Unit 2 unlocks **Stars and the Milky Way**. Unit 3 has ten teaching
steps and a separate recap, real sky photographs, clearly labelled galaxy
reconstructions, and diagrams explaining brightness and stellar depth.
Its two practices use radio buttons and labelled selectors; correct
viewpoint matches are kept. See [Unit 3 notes](astron/docs/stars-milky-way.md).

Finishing Unit 3 unlocks **Galaxies and the universe**, with evidence practice
and labelled views of other galaxies. See [Unit 4 notes](astron/docs/galaxies-universe.md).

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
practices. A short introduction leads into sixteen reading/exploration steps,
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

The Orion and Today review update on 4 November 2026 passed **592 tests in
67 files** and the production build. It adds clearer story characters, a scorpion
illustration, picture choices for the belt and clearer daily-activity rules.
The earlier lesson update added nearby diagram feedback, picture-based matching
and continuous unit progress; the reading update added article sections and
persistent phone tabs. See the linked review notes for browser testing limits.
Main destinations and readers were checked at 320, 390, 768 and 1280 px.
These are recorded results, not a substitute for rerunning checks after future changes.
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

- [Platform and learning roadmap](astron/docs/platform-roadmap.md)
- [Content format and validation](astron/docs/content-format.md)
- [Learning structure and chapter evaluations](astron/docs/learning-structure.md)
- [Scale of the cosmos: teaching, practice and performance](astron/docs/scale-of-cosmos.md)
- [Glaux’s personality](astron/docs/glaux-character.md)
- [Orion journey](astron/docs/orion-journey.md)
- [The Pleiades story](astron/docs/pleiades-story.md)
- [Reading and navigation improvements](astron/docs/experience-polish.md)
- [First lesson review response](astron/docs/reviewer-response.md)
- [Orion and Today follow-up](astron/docs/orion-today-review.md)
- [Discovery cues](astron/docs/discovery-cues.md)
- [Welcome, navigation and article image credit](astron/docs/welcome-and-articles.md)
- [Orion artwork provenance and limitations](astron/docs/orion-assets.md)
- [Phone reading checks](astron/docs/phone-reading.md)
- [Reading clarity and performance refinements](astron/docs/reading-polish.md)
- [Hosting and phone testing](astron/docs/private-test.md)

Scientific observations, illustrative artwork and schematic diagrams have
different purposes. Keep their descriptions and credits with the assets.
Do not assume all artwork in the repository has the same reuse licence.
