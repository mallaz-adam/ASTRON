# Chapter 1 / Unit 3: Stars and the Milky Way

Implemented from the owner's 23-page review PDF, approved on 30 October 2026.
The PDF's production notes are authoring material, not instructions displayed
to learners. The source PDF is not copied into the repository.

## Learning flow

`public/content/stars-milky-way.json` holds an introduction, ten teaching steps,
a separate three-point recap, selected glossary definitions, two optional
practices and source links. It uses the existing lazy `visual-unit` reader.
The recap is an additional reading screen; it does not replace teaching Step 10.
Its Continue records completion through `finishReadingLesson`.

The teaching sequence is night sky, Sun as a star, apparent brightness,
stellar depth, our solar system, galaxy, the Milky Way's disk, our location,
the pale band, and photograph versus reconstruction. Unit 3 unlocks after
Unit 2; Unit 2's final Continue opens it directly. Completing Unit 3 shows
3 of 6 teaching units done. Unit 4 and the chapter's ten-question evaluation
remain forthcoming. No pass mark or new chapter-unlock policy is introduced.

Practice 1 appears after the galaxy explanation and uses native radio inputs.
Selecting an answer gives specific gentle/proud feedback and permits retry.
Practice 2 follows the two-view comparison and uses four labelled native
selects. Check the views keeps correct matches and puts guidance beside only
the remaining descriptions. Both practices can be skipped, have no timer or
score, and write no Answer records or additional XP. Existing quest, streak,
replay and temporary-progress rules are unchanged.

## Approved corrections

- Step 4 explicitly states that apparently close stars may be far apart in space.
- Step 2 uses 'bright circle' before the later definition of disk.
- The plain phrase 'How bright a star looks' opens the apparent-brightness
  definition. 'Long exposure' matches the visible lesson phrase exactly.
- NUL export characters, replacement glyphs and HTML formatting tags are
  rejected by the manuscript validator; text is authored cleanly in JSON.
- Every selected definition phrase must occur in its step, at most two per step.
- The three-point recap retains the photograph/model distinction.
- A long Unit 3 course title wraps onto three lines inside the phone hexagon.

## Pictures and controls

Six local WebP assets provide real ESO sky photography, an ESA/Solar Orbiter
visible-light Sun mosaic and ESA Gaia-informed galaxy reconstructions. Each
use displays the media type, original credit, source, licence link and a change
notice. They are not generated pictures. See the media README and provenance
JSON in `public/art/milky-way/`.

Original SVG diagrams illustrate brightness factors, two nearby looking
directions at different depths, a conceptual solar-system grouping and a
galaxy with a linked Sun/planet/moon inset. These are explicitly schematic;
points and separations do not claim measured positions. A grouping outline
is not a wall. Dashed sightlines are labelled as looking directions, not orbits.

Brightness controls compare the same star at two example distances, or two
stars at the same distance with different light output. A point/halo is not
a physical star-size comparison. The core distance/output explanation stays
visible. The location highlight surrounds the original ESA arrow tip; it does
not add or move a second solar-system marker. The panorama outline follows
the actual broad band and is labelled as an ASTRON teaching annotation.

There is no autoplay, 3D spin, canvas loop, extra package or remote media
request during reading. All controls are real buttons, radios or selects.
Definition Close/Escape focus behaviour and device/saved Reduce motion
support come from the shared reader. Phone stacks the paired galaxy images;
desktop shows them together with short readable headings and captions.

## Checks

From `astron`, run `npm.cmd test` and `npm.cmd run build`.
Tests cover manuscript validation, local media, viewpoint feedback, prerequisite
locks, unscored completion, duplicate rewards and the separate recap state.
The browser was used to check arrow keys/Enter, definition Escape, missed and
correct feedback, retained matches, all reading screens at 390/768/1280 pixels,
motion preference, chapter counts and the disabled forthcoming evaluation.
Final 30 October verification: **517 tests in 58 files pass**, TypeScript and
the production build succeed, and the production service worker precaches
95 files (2094.38 KiB, approximately 2.05 MiB). The shared reader remains a
lazy chunk; Unit 3 adds no dependencies or continuous animation work.

All twelve reading views (introduction, ten teaching steps and recap) were
checked at 390, 768 and 1280 pixels: no horizontal overflow, no missing pictures,
and the saved Reduce motion attribute was present throughout. Browser checks
confirmed definition Escape, native radio arrow-key retry, correct matches kept,
specific missed-match clues, original-location highlighting, band outlining,
the separate recap, 3-of-6 completion and a disabled forthcoming evaluation.

Offline check used a fresh production origin. After the first welcome loaded,
the preview server was stopped and the page reloaded. The expected temporary
progress reset showed the welcome again from cache. With the server still
stopped, the normal welcome and Units 1–3 worked; all new galaxy views and the
recap loaded, and Unit 3 completed with both practices skipped. No browser
console errors or warnings were observed. Physical iPhone/Safari and VoiceOver
testing remain real-device checks.
