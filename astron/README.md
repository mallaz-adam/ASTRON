# ASTRON

A calm learning app about the sky, built with React, TypeScript, and Vite.
Today is the first real screen. Progress is kept on the device with Dexie / IndexedDB.
There are no accounts, analytics, or progress uploads.

## Open the app

Open PowerShell in this folder. Packages are already installed; on a fresh clone,
run `npm install` once. Run `npm start` to open Today in your browser.
Press Ctrl+C in the terminal to stop the server.

| Address | Page |
| --- | --- |
| `/` | Today: phone layout, or a wider two-column layout on a computer. |
| `/sun` | Your sun: streak dial, stage progress, longest streak and ready freezes. |
| `/learn` | Course path: eleven cells in a honeycomb, with selected-cell details. |
| `/cell/:id` | Six-card player for Why stars differ; temporary completion page for other cells. |
| `/design` | Design check, including the saved Reduce motion switch. |
| `/dev` | Temporary quest controls and a pretend date. |

Today uses the real device clock and closes passed days at local midnight. Its
clock checks also notice a changed time zone and refresh when you return to the app.
The pretend clock belongs only to `/dev` and resets on leaving or reloading it.
Both layouts use the same progress and rules. Dexie observes changes in another
tab at the same browser address, so Today updates when `/dev` saves a quest.

## Check the work

```powershell
npm test
npm test -- src/logic
npm run build
git log -3 --oneline
```

See [the test coverage table](docs/test-coverage.md) for the twelve Task 2 cases
and the new clock, Today, and saved-setting tests.

New learners start with goal 2 and **one freeze**. A day keeps its saved daily goal.
Past kept days and freezes determine the streak; it is never stored as a total.
Existing freeze balances remain saved. No way to earn more freezes has been built.
Use `/dev` > Erase progress when you intentionally want to test a fresh learner.

On `/dev`, do Learn, then open Today: the sun should reach stage 1.
Do Discover too: stage 2, the goal-met line, and a checked circle for today.
All three daily rewards add up to 45 XP; the separate full-day bonus is 10 XP.
The Today meter shows quest rewards only, out of 45.

The Reduce motion switch at `/design` is saved in the learner record. It stops
motion on all pages, including the sun and Glaux. The device's reduced-motion
preference also stops every animation.

## Offline and installation

Run `npm run build`, then `npm run preview`. Visit the app once online, wait a few
seconds, and reload. The production build caches the page, content JSON, and SVGs.
Turn off the connection and reload to check cached loading. The development
server does not install a service worker.

Use the browser's Install app action when available. On iPhone, use Share > Add to
Home Screen. Phone hosting needs HTTPS; localhost is suitable for desktop testing.
Later hosting must serve index.html for `/learn`, `/cell/:id`, `/sun`, `/design`
and `/dev` as well as `/`.

Google Fonts are the only external page resources. They are cached after loading;
Georgia is the fallback if they have not yet been cached. Browser storage is separate
for each address, including different ports: use the same address to check persistence.

## Content and art

- [Content-format guide](docs/content-format.md): fields, links, Markdown, and exercises.
- `public/content/sample`: the small Orion and Betelgeuse example.
- `public/art`: the supplied static SVGs and their README; CSS adds the motion.
- `src/design`: shared tokens and components.
- `src/logic`: pure rules and Today's screen model.
- `src/data`: content checks, progress database, and services.

Why stars differ has a real lesson player. Tale-reading, profile, timeline and journal screens are still future work.
The future navigation tabs are visibly disabled. Profile is a keyboard-accessible
placeholder with no action.

## Your sun and Task 4 checks

Click the Today streak card (accessible name: See your sun) to open `/sun`.
Back to Today returns to the main screen. At 1024 px and wider, the wordmark,
tabs and Profile form a top bar. Smaller screens keep the tabs at the bottom.
Your sun uses one column below 1024 px and a dial/details pair above it.

Numerical streak and XP values use Cinzel lining figures. The dial number also
uses Cinzel, approved because IM Fell English's zero retains its old-style shape.
Headings and sentences retain IM Fell English.

On `/dev`, enter 0, 5, 13, 30 or 100 in the number field, then press Create a test
history. This replaces the local learner's day and quest history with exactly N
kept calendar days ending yesterday, and an unfinished today. It anchors to the
real device date and resets the pretend date to match. Other progress, preferences
and freeze balances remain saved; this feature neither spends nor refills freezes.
Erase progress removes generated history too. It is a test bench, not a feature
for earning progress.

The dial uses the same kept-day rules as Today's week row, including each day's
saved goal and freezes. No setting, resting or new-day states have been built.
The new pure-rule, history-service and accessible-view tests are included in
`npm test`. Check both screens at 390, 768 and 1280 px; on `/design`, Reduce motion
stops the dial glow, today's kept-ray pulse, tier drawings and Glaux.

## Course path and Task 5 checks

Today has a Continue link naming the current cell. It opens `/learn`; the Learn
tab still opens Today. The first unfinished cell is selected when Course path
opens. Click or use Tab and Enter on any hexagon to inspect it. A locked cell
shows the prerequisite message and a disabled BEGIN button.

BEGIN opens `/cell/:id`. Placeholder cells have Mark as finished (test), which saves through
the existing completion service and returns to the path. The next cell opens,
and Today shows Learn done. Finish cell 4, Orion, to meet Discover too and light
Betelgeuse. The Pleiades links to Alcyone. AGAIN revisits completed cells without
adding a second completion or repeat daily XP.

Saved progress is preserved, so an existing browser may already show completed
cells. To check from cell 1, use a fresh local address/port or intentionally use
Erase progress on `/dev`. Progress is separate between ports. The path count and
current cell survive reloads. When all eleven cells are done, the last cell can
still be selected and revisited; Today has no unfinished cell to Continue.

Check `/learn` at 390, 768 and 1280 px. Phone and tablet have details below the map;
desktop has them on the right. Reduce motion at `/design` stops the current-cell
pulse. Cell 3 now opens the real lesson player; the remaining cells keep their temporary controls.

## Lesson player and Task 6 checks

On a fresh learner, finish cells 1 and 2 with their temporary controls, then BEGIN
cell 3, Why stars differ. Six cards appear in order, with inline pictures and Glaux.
CONTINUE and Up/Down move between available cards; unfinished exercises keep the
following card hidden. Choice options use native radio buttons, including arrow keys.

Place Red star, Orange star, then Blue star and CHECK. In the second exercise,
choose A, The heavier star. Each first correct exercise earns 10 XP once. With the
daily Learn reward, the fresh learner's total is 40 XP. After two misses, SHOW ME
reveals the answer without exercise XP. Finishing the recap saves the first-try
score, meets Learn, and opens cell 4. BACK TO THE PATH returns to the honeycomb.

AGAIN restarts the cards for practice. Practice cannot change the saved completion,
answers, or XP, even on another day. Its end card reports that practice run's score.
Saved attempts from an unfinished first run survive reloading, so reloading cannot
turn a retry into a first try. Existing progress is preserved.

Check at 390, 768 and 1280 px: the scrolling column stays at most 640 px wide,
pictures keep their proportions, and controls remain usable with Tab and Enter.
The saved Reduce motion switch and the device preference stop Glaux's animations
and replace smooth card navigation with immediate movement. All lesson JSON and
inline art are included in the production offline cache. No new library was added.
