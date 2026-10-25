# Orion: the first complete journey

Implemented 25 October 2026. Local review build; no hosting deployment is
performed by this milestone.

## The route through the app

A genuinely new device enters /welcome. The cover uses the approved unframed
telescope painting, followed by the complete four-chapter Orion manuscript.
The learner lights Betelgeuse, tries the belt activity, sees the star in My sky,
chooses interests and a daily goal, then reaches Today.

Existing learners with real saved learning records keep their usual Today.
An unfinished first journey resumes even after the star has been earned.
Default learner/day rows alone do not count as a previous learning experience.

Stories (/stories), the course's Orion cell and welcome use the same tale ID,
orion-shoulder, and the same orion-tale completion. Revisit through Stories or
the course; no prerequisite lessons are fabricated. The normal course screens
offer authored content in development as well as production. The underlying
full eleven-cell model remains available to developer tools and its tests.

## Saved data and rewards

Database version3 preserves all eight existing tables. The learners record
gains optional welcome and taleVisit fields. Older records need no invented
values and retain their goals, freeze balances, saved star tints and progress.

welcome: startedOn, optional completedOn.
taleVisit: taleId, stage, chapter, readThrough, optional beltOutcome.
Stages: story, star, activity, sky, preferences; cover is a presentation route.
Belt outcomes: independent or assisted. No answer attempt log is introduced.

Each chapter transition saves a checkpoint. Lighting the star is the atomic
boundary for the real tale completion, its existing daily quests and lightStar.
If any part fails, collection and rewards roll back together. Save confirmation
appears only after storage has confirmed it.

The existing completeCell rule is preserved: a tale counts as Learn and
Discover, giving20 and15 daily XP. The picture activity adds no XP.
An existing star or same-day quest cannot be duplicated; intentional rereading
on a later day can satisfy that day's quests under the existing service rules.

Selecting a group alone saves no answer or reward. A miss leaves the star intact.
Show Me is available immediately; after the explanation, Continue is available.
The taught group is visibly selected after help. Reload preserves the result.

Interests and the daily goal are written after the first experience. Finishing
setup is idempotent. Navigation waits until the progress subscription observes
completion, preventing the old welcome snapshot from redirecting back to setup.
Changing today's goal keeps earlier days' original goal snapshots.

## Art and the scientific chart

The approved cover and hunter images are shipped locally as compressed WebP.
The owner-supplied hunter already contains chart lines; it is not treated as
a precise scientific overlay. Show/Hide the Hunter switches between that
illustration and a separate chart. A destructive extraction of the baked lines
was rejected because it damaged the original artwork.

The chart is SVG drawn from seven sourced ICRS/J2000 positions in
public/content/orion.json, through a gnomonic projection centred on the belt.
North is up and east is left. Marker size/colour is illustrative; this is not
a photometric plot, a live sky view or a visibility promise.

Positions were checked against CDS/SIMBAD on25 October2026:
- Betelgeuse: https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Betelgeuse&output.format=ASCII
- Bellatrix: https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=bellatrix
- Rigel: https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Rigel&output.format=ASCII
- Alnitak: https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Alnitak&output.format=ASCII
- Alnilam: https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Alnilam&output.format=ASCII
- Mintaka: https://simbad.cds.unistra.fr/simbad/sim-id?Ident=HD+36486&output.format=ASCII
- Saiph: https://aladin.cds.unistra.fr/simbad-thumbnails/thumbnails5.html
  (CDS's NAME SAIPH entry,05 47 45.3889,-09 40 10.577).

The tale follows the agreed original retelling of the scorpion account in
Pseudo-Hyginus, Astronomica2.26. NASA's Orion and Betelgeuse guides ground the
short fact and the connected original article. Clickable external sources are
available, with source notes still readable offline.

See orion-assets.md for dimensions, provenance and the approved edit history.

## Controls and accessibility

The full prose is rendered as connected paragraphs, not injected HTML.
Optional discoveries use labelled native details controls. The belt activity
uses native radio choices and large labels so Arrow keys, Tab, Space and Enter
work without overlapping tiny star targets. Shape/selection state and words
communicate the chosen group. Pattern descriptions provide the nonvisual route.

Glaux gives the chosen pattern a specific clue and a quietly proud response
after recognition. Help teaches the same pattern and permits finishing.

A public Reduce motion switch is available throughout the journey, plus Profile
preferences after welcome. Saved and system motion preferences suppress the
existing owl animations. No diagram movement or countdown is required to learn.
The goal page uses the shared motion control to avoid conflicting duplicate
switches. Heading focus moves with chapters and preference steps.

## Connected destinations

My sky (/sky) shows the actual saved stars, their facts and available tale/lesson
connections. Existing hunch tints are retained and named.
Scientific articles (/articles) offers the sourced Betelgeuse colour article.
The existing sample article ID and its saved reads remain intact.
Read uses markArticleRead, preserving10 daily XP and the existing all-three
bonus. Its visible saved state expires at local midnight so a reader left open
can still count a new day's reading.

The Profile button opens /settings for goal/motion preferences and the existing
confirmed erase tool. Timeline remains unavailable. No account, analytics,
progress upload, app server or new runtime library was added.

## Offline and installation

The existing PWA manifest and refresh-on-update behaviour remain in place.
WebP joins the existing precache patterns so cover variants, hunter, story JSON,
article, SVG art and local fonts are cached with the shell. A new content or
asset revision is picked up through the existing update prompt.

Production /dev and /design remain ordinary not-found routes. Development
keeps those tools. Browser validation includes ordinary phone/tablet/desktop
widths; it is not a claim of physical iPhone or VoiceOver testing.

## Run and check

From the astron folder:
- npm install (only when dependencies have not already been installed)
- npm start
- npm test
- npm run build
- npm run preview (to inspect the production service worker)

Try a fresh browser origin to see welcome without erasing real progress.
Read through Orion, reload in the middle, light the star, choose a group,
use a hint or Show Me, then finish setup. Today should show the tale's Learn
and Discover records. Read the connected article to complete Read.

Revisit Orion through Stories and the course. My sky should still have one
Betelgeuse. Try the existing Why stars differ lesson: its separate clue and
tint remain supported. Confirm the public motion control stops the owl.
Test offline only after the production service worker is active and its
first-visit cache has finished.
