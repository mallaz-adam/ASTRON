# Writing ASTRON content

Content lives in `public/content/sample` for now. Each file is a JSON array: `[ ... ]`.
Write field names exactly as shown below. Use double quotes for strings and commas
between rows. Do not put a comma after the last row. The loader names the file and
field when it finds a mistake. It also checks that linked ids exist.

An `id` is a short, stable name, such as `betelgeuse`. Keep it unchanged after
publishing: progress refers to these names. Ids must be unique within their file.
Order numbers start at 1. Minutes are positive whole numbers. XP is a whole number,
zero or greater. Fields are required unless described as optional or conditional.

## The thirteen files

| File | Fields and what they mean |
| --- | --- |
| `interests.json` | `id`: stable name; `label`: a readable interest name. |
| `constellations.json` | `id`, `name`, `mythNote`: a brief note about the myth, or an empty string when there is no myth. |
| `stars.json` | `id`, `name`, `greekLetter`: for example `α`, or an empty string when none applies; `factText`: astronomy text; `constellationId`: a constellation id. |
| `tales.json` | `id`, `title`, `subtitle`, `minutes`, `teaser`, `sourceNote`: identify the source or explain that it is original; `starId`: a star id. |
| `chapters.json` | `taleId`, `number`, `title`, `text`, `marginNotes`: an array of strings, or `[]`. The combination of taleId and number must be unique. |
| `units.json` | `id`, `title`, `summary`, `orderNo`: the unit’s position. |
| `cells.json` | `id`, `positionNo`: its position within the unit; `title`, `kind`, `minutes`, `unitId`. `kind` is `lesson`, `tale`, or `quiz`. Add `taleId` only for a tale cell. Positions within one unit must be unique. |
| `lessons.json` | `id`, `title`, `cards`, `cellId`: must point to a lesson cell. Optional `placeholder: true` keeps its temporary finish control. |
| `exercises.json` | `id`, `type`, `prompt`, `contentData`, `xpValue`, `cellId`, `glaux`, `hint`, `rightLine`, `missedLine`, `explanation`. Exercise types and data shapes are explained below. |
| `quests.json` | `id`, `kind`, `title`, `xpReward`. Exactly one each: `learn` with 20 XP, `story` with 15 XP, `read` with 10 XP. The visible name of `story` is Discover. |
| `articles.json` | `id`, `title`, `summary`, `body`, `readingMin`. |
| `unitArticles.json` | `unitId`, `articleId`: links an article to a unit. Each pair must be unique. |
| `glaux-lines.json` | `id`: a dialogue pool name; `lines`: a nonempty array of approved lines. Loaded as `content.glauxLines`. All twenty-seven pools are required. |

These files are read-only content. They are not copied into the progress database.
The loader freezes the loaded objects so pages cannot accidentally edit them.
`loadContent()` loads this sample folder. A later task can pass a different folder.
Unused authoring tables can use `[]`; the required quest rows and Glaux pools must remain present.

## Long text and Markdown

Articles, chapters, myths and star facts can store long text or Markdown in their
existing text fields. Lesson card copy is displayed as plain text, without Markdown rendering.

```json
{
  "id": "a-small-lesson",
  "title": "Begin with one star",
  "placeholder": true,
  "cards": [{ "kind": "say", "mood": "happy", "glaux": "Begin with one star." }],
  "cellId": "star-lesson"
}
```

`\n\n` makes a new paragraph. If you need quotation marks inside a string,
write `\"`. JSON does not allow comments inside the file.

## Lesson cards

`cards` is a nonempty array in display order. Every lesson cell has exactly one
lesson. Do not keep the old `body` field. These are the supported card shapes:

| Kind | Fields |
| --- | --- |
| `say` | `kind`, `mood`, `glaux`; optional `art`. |
| `idea` | `kind`, `mood`, `glaux`, `text`; optional `art`. |
| `hunch` | `kind`, `mood`, `glaux`: exactly two strings; `options`: three distinct `{id, text, colour}` rows for blue, orange and red; `skipLabel`; optional `art`. |
| `dial`, `mass`, `race`, `gap` | `kind`, `mood`, `glaux`, `text`. Task 8 draws their interactive SVG diagrams in code. |
| `exercise` | `kind`, `exerciseId`. The exercise must belong to this cell. |
| `recap` | `kind`, `mood`, `glaux`, `items`: exactly three strings; optional `art`. |

The supported moods are `happy`, `thinking`, `proud`, `cheering`, `gentle`, and
`sleepy`, using the supplied owl SVGs. The current picture ids
are `lesson-03-hook`, `lesson-03-colours`, `lesson-03-fuel`, and `lesson-03-emblems`.
Art is imported from the matching supplied SVG, with its text description retained.
Adding another picture also requires registering its import in `LessonArt.tsx`
and its id in `lessonValidation.ts`. Unknown fields, moods, pictures, repeated
exercise references, missing exercises and cross-cell links produce diagnostics.

Why stars differ now has eight cards: hunch, dial, order exercise, mass, race,
choice exercise, gap, recap. The four interactive cards keep their approved copy
and count as done when shown. They now use live schematic SVG pictures rather
than the temporary colours picture and note. The recap keeps its approved three items;
confirming it draws the constellation ending described below.
Other lessons remain one-card placeholders.

Hunch option labels always name the colour; `colour` must be a six-digit hex value.
The hunch waits for a selection or skip before showing CONTINUE and unlocking the
next card. Choices can be revised before moving on. The value (`blue`, `orange`,
`red`, or `skipped`) stays only in lesson session memory: no Answer, XP, or database
write. Reload, Close, and AGAIN start without that hunch.

## Exercise data

The lesson player currently supports `order` and `choice`. The other shapes remain
valid authoring formats for future players. A lesson card cannot yet reference them.
Item ids must be unique. Choice, find, and order need at least two items.

**choice** — choose an option:

```json
{ "options": [{ "id": "a", "text": "Orion" }, { "id": "b", "text": "Lyra" }], "correctOptionId": "a" }
```

**connect** — connect each left text to its right text:

```json
{ "pairs": [{ "left": "Betelgeuse", "right": "Orion" }, { "left": "The Sun", "right": "Our nearest star" }] }
```

**order** — put every item id in the intended order:

```json
{ "items": [{ "id": "first", "text": "Look" }, { "id": "second", "text": "Notice" }], "correctOrder": ["first", "second"] }
```

**find** — identify an item:

```json
{ "items": [{ "id": "star", "text": "Star" }, { "id": "planet", "text": "Planet" }], "targetId": "star" }
```

**estimate** — a number within a range; tolerance is how far from the answer is accepted:

```json
{ "min": 0, "max": 10, "answer": 5, "tolerance": 1 }
```

Order item `text` is its visible label. Optional `colour` must be a six-digit hex
colour such as `#D9735A`; the label must also name the colour. Correct order must
contain every item id once. A choice's correct option must be among its options.

The full `Exercise` row wraps this data inside `contentData` and also contains
`id`, `type`, `prompt`, `xpValue`, `cellId`, and five nonempty feedback strings:
`glaux`, `hint`, `rightLine`, `missedLine`, `explanation`. See `exercises.json` for
complete rows. Feedback now uses the reaction pools below. HINT displays only the
exercise hint in Glaux's speech box and does not add an attempt. SHOW ME becomes
available after two misses, reveals the answer and explanation, and completes
the card without exercise XP. Missed order items stay in place; UNDO makes room
to revise the arrangement.

## Glaux reactions (Task 7)

`glaux-lines.json` contains array rows such as:

```json
{ "id": "missed", "lines": ["Let us look a little closer.", "There is another detail worth noticing."] }
```

The required pool ids are `firstTryRight`, `rightAfterMisses`, `rightWithHint`,
`missed`, `showMe`, `sneeze`, `hunchBlue`, `hunchOrange`, `hunchRed`, `hunchSkip`,
`orderCallbackBlue`, `orderCallbackOther`, `dialRedEnd`, `gapFlagFew`, `gapFlagTen`,
`endingHunch`, `endingSkipped`, and `endingTease`, plus the nine application pools
below. The dialRedEnd, gapFlagFew and
gapFlagTen pools supply the live interactions. The ending uses endingHunch or
endingSkipped followed by endingTease, with a proud mood.
Empty pools, missing pools, duplicate ids and unrecognised ids are rejected.

`reactGlaux` is pure: its event, content pools, previous memory and one random
line-selection value are explicit inputs. It returns mood, text and new memory without writes.
It excludes the previous selection from each pool when alternatives exist; a
single-line pool can repeat. The memory lasts across AGAIN for varied practice.

| Event | Mood | Speech box |
| --- | --- | --- |
| First-try right | proud | Pool line, then exercise rightLine. |
| Right after misses | proud | Pool line, then exercise rightLine. |
| Right with a requested hint | proud | Pool line, then exercise rightLine. |
| Missed | gentle | Pool line, then exercise missedLine. |
| Hint | thinking | Exercise hint only. |
| SHOW ME | thinking | showMe pool line only. |
| Hunch | happy | Matching hunch pool line. |
| Red dial end or gap flag | happy | Matching interaction pool line. |

Feedback shares one box with at most two short paragraphs. A remembered hunch
replaces the generic pool acknowledgement: blue uses orderCallbackBlue;
red/orange replace `{colour}` in orderCallbackOther; skipped has no callback.
The useful exercise feedback stays visible. The `sneeze` pool remains registered
for existing content compatibility but is not emitted. There is no random sneeze,
particle caption, routine wing cheer or automatic mood fade in this personality.
A deliberate response gets one small head movement over 1.2 seconds. Resting heads
stay still and natural eye blinks are twelve seconds apart. Reduce motion keeps
all words and stops every movement.

## Glaux across the application

The character direction is recorded in [glaux-character.md](glaux-character.md).
Application dialogue is also authored in `glaux-lines.json`. `glauxLine` reads
the first line of the requested pool and fills only explicitly supplied values.
Missing pools or values give a diagnostic instead of unfinished visible copy.

| Pool | Used when | Values |
| --- | --- | --- |
| `todayBegin` | Starting a streak | `{remaining}`, `{questWord}` |
| `todayContinue` | Keeping an existing streak | `{remaining}`, `{questWord}` |
| `todayKept` | Today's goal is met | None |
| `sunBegin` | The streak is zero | None |
| `sunGrowing` | Today's goal is met with a streak | `{days}` |
| `sunReturn` | The existing streak can be continued today | `{days}` |
| `pathBegin` | No cell in the unit is finished | None |
| `pathContinue` | Some cells are finished | None |
| `pathComplete` | All cells are finished | None |

Each screen has one brief Glaux message. Course-path guidance follows completion
progress, not the selected cell, so exploring cells does not trigger extra speech.
Messages have no timers or automatic pop-ups. Goal counts, XP, streak dates,
saved answers, star tints and completion rules are unchanged by this voice pass.

After a right order, discs move from their slots to the heat ladder in 600 ms.
Hotter is at the top (blue), cooler at the bottom (red). The ladder sits beside
the slots at desktop widths, underneath on smaller screens. A miss leaves its
placed discs alone and shows faint empty rungs, with the correct sequence pulsing
once as a clue. Reduced motion shows no clue pulse and places solved discs at
their final rungs immediately. Taller feedback cards can scroll vertically.

## Interactive diagrams (Task 8)

The lesson and exercise JSON are unchanged. The existing `dial`, `mass`, `race`
and `gap` kinds now select code-drawn SVGs. `ex-03-choice` uses the same three
option ids, words, correct answer and XP, with star-and-gauge pictures for A/B.
The diagrams add no database records, rewards, or lesson completion conditions.

All controls are native ranges or buttons. Sliders have associated labels,
word-based aria-valuetext and a visible live state. Arrow keys, Home and End
remain native slider actions; lesson navigation does not intercept input keys.
Slider positions are normalised internally; numeric slider values are not shown.
The drawings share the supplied red/orange/blue tints, a lapis plate and dotted
gold border. They are schematic comparisons, not measurements of real stars.

- Heat starts at orange. RGB interpolation blends red to orange to blue without
  changing the disc radius. Its halo grows slightly. Reaching red triggers the
  happy dialRedEnd line once per lesson session; moving back again does not
  replay it. AGAIN/reload starts a new session.
- Mass starts small and red. Its schematic radius varies from 16 to 40 drawing
  units, while the same colour blend turns it blue. Its note says "A picture,
  not to scale."
- Fuel time starts at zero and stays still until the learner moves the range or
  presses PLAY. The heavier gauge is 100 drawing units tall; the lighter is 60.
  Heavy fuel reaches zero at time .35. Light fuel is `1 - .55 * time`, leaving
  .45 at the end. The heavy star dims to a faint outline; the light star stays
  bright. These are teaching diagrams, not physical simulations.
- PLAY takes six seconds from start to end; PAUSE holds the current value. PLAY
  resumes from there, or restarts an ended race. Seeking pauses immediately.
  Leaving the card or hiding the browser tab also pauses it. No hidden race keeps
  running. Saved or device Reduce motion hides PLAY and prevents automatic time
  changes while leaving manual sliders usable.
- The picture exercise starts with full gauges. Each miss sets time to .25 and
  stops. A correct answer or SHOW ME starts a controllable replay, with its own
  PAUSE and time range. Reduced motion sets the end state immediately instead.
- Gap positions use `(log10(years) - 6) / 4` between one million and ten billion
  years. The five powers of ten are equally spaced. The three-million flag sits
  near .11928 of the line; the ten-billion flag is at the end. Entering a flag's
  .0125 neighbourhood shows its happy pool line once per visit. The flag labels
  are also buttons, so keyboard users can jump straight to them. Live values use
  approved tick/flag labels or the bounding interval, without extra year numbers.

`src/logic/lessonDiagrams.ts` contains the pure blend, radius, fuel, replay and
logarithmic-position rules. `useControlledRace` owns the cancellable animation
frame loop. `useReducedMotion` listens to the device preference as well as the
saved setting, so JavaScript playback obeys both. SVG geometry follows inputs
directly; it has no independent CSS animation or transition.

## The sample

There is one unit, `How stars live and die`, with eleven cells: eight lessons,
two tales, and a final quiz. Why stars differ is the eight-card lesson with two
10 XP exercises. The other seven lessons have short placeholder cards. The two
existing quiz exercises retain their data and have placeholder feedback lines.
The Orion tale keeps its two chapters. The Pleiades sample adds one
placeholder chapter, Alcyone, and a Pleiades group in the existing constellation
table. Its descriptive fields and Greek-letter field are marked as placeholders.
There are still three daily quests and one article.
The tale is an original fictional vignette, not an ancient text.
The astronomy source is [NASA’s Betelgeuse article](https://science.nasa.gov/universe/what-is-betelgeuse-inside-the-strange-volatile-star/).

## Progress and the rules

Progress lives only in this browser’s IndexedDB database, `astron-progress`.
Nothing is uploaded. There are eight tables:

| Table | Unique key |
| --- | --- |
| Learner | `id` |
| LearnerInterest | `learnerId + interestId` |
| ActivityDay | `learnerId + dayDate` |
| QuestDone | `learnerId + dayDate + questId` |
| Completion | `learnerId + cellId` |
| Answer | `learnerId + exerciseId` |
| LitStar | `learnerId + starId` |
| ArticleRead | `learnerId + articleId` |

As approved, ActivityDay also stores `dailyGoal`. Changing the goal changes today
and future days; earlier days keep their original goal. New learners start at goal 2
with one freeze. There is no stored streak or stored total XP.

Database version 2 adds optional `LitStar.tint`: `blue`, `orange`, `red`, or `gold`.
The unique key and indexes stay the same. Upgrading preserves every existing row;
old stars can keep the field absent. Exports include tint when it was saved.
`checkStarTint` rejects unsupported keys before a write. `hunchTint` maps a colour
hunch to its key and a skipped or absent hunch to `gold`.

- `localDate(now)` uses the device’s local date, not the UTC date.
- `questsDoneOn(records, dayDate)` returns the number of different quests that day.
- `sunStage(count)` returns 0, 1, 2, or 3; `goalMet(count, dailyGoal)` checks the goal.
- `dayKept(day)` needs a day with `questsDone`, `dailyGoal`, and `freezeUsed`.
- `computeStreak(today, days, dailyGoal)` counts from today if kept, otherwise yesterday.
  Each day’s saved goal takes priority; the last argument is a fallback for older input.
- `streakStage(days)` returns `none`, `dawn`, `morning`, `noon`, or `corona`.
- `totalXp(completions, quests, answers, exercises)` sums first cell rewards, daily
  quest rewards, the latest correct exercise results, and 10 XP per three-quest day.
- `closePastDays(lastDay, today, days, dailyGoal, freezesLeft)` closes lastDay and
  every day before today, using available freezes on missed days oldest first.
  It returns the closed days and remaining freezes. It never reads a real clock.

Pass one learner’s records to rules that calculate progress. `toRuleDays` combines
ActivityDay and QuestDone into the input for streak rules. Timestamps such as
`doneOn` are ISO strings; `dayDate` is always the local `YYYY-MM-DD` day.

## Saving and exporting

Service functions receive the database, content when needed, learner id, and an
explicit `now` date. Related writes run in one transaction. Repeated calls or
simultaneous clicks cannot award the same daily quest twice.

`completeCell` records a cell only once. Repeating it can meet a later day’s Learn
quest, but cannot award another first-completion reward. A tale cell also meets Discover.
Separate cell XP defaults to zero, as approved. If passed explicitly, it must not
include exercise or daily quest rewards; those are counted separately.

`markArticleRead` keeps the first reading date and meets Read once per day.
`lightStar(database, content, learnerId, starId, how, now, tint?)` keeps the first
lighting date, source and optional tint. Omitting tint remains supported. Concurrent
or repeated calls keep the first row, including its original tint. `recordAnswer` keeps the latest
result and increases attempts. Because the requested Answer table keeps only the
latest result, a later incorrect answer removes that exercise’s XP from the derived
total. Attempts do not multiply the reward.

The lesson player calls `saveLessonAnswer`, a transaction wrapper around
`recordAnswer`: misses increase saved attempts until the first correct result;
after that, the correct answer and its XP are preserved. `finishLesson` checks
prerequisites and saved answers, accepts SHOW ME only after two saved misses,
then calls `completeCell` with the number correct on the first saved attempt.
An already completed lesson never rewrites assessment, XP or quest records, even
on a later day. A Task 9 replay may add the missing clue star for a learner who
finished before this feature; further replays leave it unchanged. Reloading an
unfinished lesson restarts its cards but retains saved attempts and earned XP.

## The constellation ending (Task 9)

The sample constellation `clues` is named `Clues`, with `mythNote: ""`.
Its star `star-clue-03` is named `The first clue`, has no Greek letter, and uses
`Blue stars are hotter than red stars.` as its fact text.

Viewing the recap does not complete the lesson. Its CONTINUE confirms the three
clues. `finishLesson` accepts the current hunch as its optional final argument,
checks the saved exercises, then calls `completeCell` and `lightStar` with
`how: 'lesson'` in one transaction. A failed star write rolls back completion and
the Learn reward, so the learner can retry safely. Scores remain saved for progress
but the ending no longer displays a grade.

Three small stars sit beside the three recap items. The three gold edges draw
in sequence over 1.5 seconds, then the stars merge over one second into a star
below the list. A ResizeObserver keeps the drawing aligned when text wraps or
the screen changes size. The new star uses blue `#A9C4EE`, orange `#E9B173`,
red `#D9735A`, or pale gold `#F0D9A8` after a skipped hunch.
The caption is `Added to your sky`. A proud Glaux uses the `endingHunch` or
`endingSkipped` pool, followed by `endingTease`, with one slow happy blink.
The Learn quest line is shown only when this completion earned it.

Saved or device Reduce motion shows the final picture immediately and stops
the blink. Disabling Reduce motion afterwards does not replay the merge. Buttons
remain available throughout. AGAIN clears the current hunch and animation;
the saved star retains its first tint and date. The temporary `/dev` page lists
saved stars by name, id, source and optional tint, so persistence can be checked
without editing storage. XP, streak and quest rules are unchanged.

`exportProgress` returns JSON containing only the eight progress tables. The temporary
page’s Export progress button downloads it as `astron-progress.json`.
`eraseProgress` clears all eight tables. Content stays untouched.

## Trying the temporary page

Run `npm start`, then open `/dev` at the printed address. It is clearly TEMPORARY.
The pretend clock belongs only to this page and resets to your real local date on
reload. Saved daily records, XP, completions, and answers remain in IndexedDB.
An unfinished today keeps yesterday’s streak visible as “at risk”. After another
midnight, that unfinished day breaks the streak unless a freeze protected it.

Browser storage is separate for each address: localhost:5173 and localhost:4173
have separate progress. Use the same address when checking reload persistence.
The PWA build caches the sample JSON as well as the page, so the loader works offline.
The supplied static SVGs live in `public/art`. Today, Your sun and Course path are
real screens. `/cell/star-lesson` is the real lesson player; other cells retain
their clearly labelled temporary completion pages.

## Course path (Task 5)

`/learn` reads this unit's cells in `positionNo` order. Existing ids stay stable:
`orion-lesson` is cell 1, `star-lesson` is cell 3, `orion-tale` is cell 4, and
`orion-quiz` is cell 11. Existing saved completions are preserved.

The eleven positions are Scale of the cosmos; Light and distance; Why stars
differ; Orion; Birth of a star; The long middle; The Pleiades; Giants and dwarfs;
When stars explode; What is left; Unit quiz. Lessons and the quiz take five
minutes; tales take six. Lessons now use the card format documented above.

`buildCoursePath(content, progress, learnerId, unitId?)` is pure. A matching
completion makes a cell done. The first unfinished cell is current, and the
remaining unfinished cells are locked. Only this learner's completions count;
duplicates and unrelated cells cannot increase the unit count. All done means
there is no current cell, so Today's Continue link is hidden. The map still allows
selecting and revisiting completed cells with AGAIN.

Locked map cells can be selected to read their details, but BEGIN is disabled.
Directly opening a locked `/cell/:id` also leaves the temporary finish button
disabled. `completePathCell` rechecks prerequisites inside a database transaction
before calling the existing `completeCell` service. For tales, the same transaction
calls `lightStar` with the tale's linked star. This meets Learn and Discover and
lights the star once, without multiplying completion or daily quest XP.

The honeycomb geometry is code-drawn SVG, with eleven native HTML buttons over
its hexagons. Focus draws a visible SVG outline around the corresponding button.
The middle row runs right to left. Details stay below the map below 1024 px and
move to its right on desktop. The current cell's two-second pulse obeys both
saved Reduce motion and the device preference.

The Task 6 player uses this same prerequisite model and the supplied third art pack.

## Production test edition (Task 10)

`buildCoursePath(content, progress, learnerId?, unitId?, testRelease?)` defaults
to the production build flag. In the online test it includes only cells linked
to lessons whose `placeholder` is false. The sample therefore starts at cell 3,
`star-lesson`. The completion and answer services validate against that same
playable path, without writing prerequisite completions or awarding their XP.
Development retains the full eleven-cell prerequisite path. Existing records
and the database schema remain unchanged.

After the sole authored lesson is complete, Today's Continue link still offers
it for practice. Placeholder cell routes are unavailable in production. JSON,
Markdown, SVG, local fonts and the application shell are precached on first
installation; publishing changed content changes the service worker revision.
The update bar asks for REFRESH before activating a waiting version.

## Orion first journey (25 October 2026)

This section supersedes the Task 10 list of available readers. Authored tale
cells with a local `reader` JSON path are now playable alongside authored
lessons. Normal course/Today/cell screens use that authored-content path in
both development and production; developer tools can still use the full model.

`Tale.reader` is optional and must point to a local `/content/*.json` file.
The original tale ID and star link remain stable. `Chapter` may additionally
contain `glaux` text and `presentation`: `hunter`, `landscape`, `chart` or
`guided-chart`. Text is plain paragraphs and is never inserted as HTML.
`Article.sourceNote` is optional and adds source notes to the scientific reader.

`public/content/orion.json` holds the authored welcome/ending lines, fact,
activity prompt, hint, specific responses, candidate patterns and sources.
Its chart contains unique star IDs, finite ICRS/J2000 degree coordinates and
connections between known IDs. The belt group must contain Alnitak, Alnilam
and Mintaka. Invalid fields, unsafe source schemes and broken chart links
are rejected before rendering. The supplied hunter drawing is illustrative;
scientific coordinates remain a separate layer of content.

Version 3 keeps the eight progress tables and adds optional `welcome` and
`taleVisit` data on `Learner`. Old progress is retained. Star/tale collection
uses the existing reward services atomically; assistance adds no XP and
cannot remove a star. Goal changes preserve past-day goal snapshots.
See `orion-journey.md` for the exact checkpoints and navigation behaviour.
WebP artwork is now included in the offline cache alongside JSON/fonts/SVG.

## Optional detail cues (26 October 2026)

`Learner.exploredDetails` is an optional array of stable detail IDs, stored only
on the device. Missing data means the details have not been opened. Opening an
expandable note or its sources removes its decorative gold glow immediately;
closing it or returning to the page does not reset that cue. This records an
opening, not proof that the learner has read or understood the text.

IDs identify the tale/chapter, tale sources, activity pattern descriptions or
article sources. The existing eight tables and version 3 indexes are unchanged;
the optional field needs no schema/index migration. Existing exports include it,
and Erase my progress removes it. No XP, quests, daily records or completions are
awarded by opening a detail. Reduced motion keeps a still marker instead of the
fading circle. Gold remains decorative; labels are written in ink.

## Welcome and article presentation (27 October 2026)

For the current development edition, progress is temporary and each full page
load starts fresh. The earlier persistence descriptions apply to the future
persistent build. See `development-preview.md` for the separate working database,
preservation of older saved records, and the release flag that restores saving.

`Learner.welcome.introductionSeenOn` is an optional ISO timestamp. New learners
see one short introduction before Orion. Acknowledging it updates only the
learner record and awards no XP, quests, stars or completions. Older learners
with a saved tale visit resume their existing journey. `/guide` shows the same
explanation without modifying progress; it is linked from Your preferences.
No database table or index change is needed for this optional field.

Articles may add `category` and `cover`; older articles remain valid without
either. A cover has `src`, `alt`, `caption`, `credit`, `source`, `license` and
`licenseUrl`. `src` must be a local `/art/` image path without path traversal.
Text fields must be nonempty; source and licence links must use HTTPS.
The cover is displayed in the library and reader with its credit and licence.
JPG and JPEG images are precached alongside the existing offline assets.

The Betelgeuse article uses category `Stars` and the real ALMA observation
documented in `welcome-and-articles.md`. Its caption explains that the mapped
colours represent invisible light, rather than the star's visible colour.

## Reading lessons and chapter evaluations (28 October 2026)

A chapter is the collection stored as a `Unit`; a lesson is a learning `Cell`,
and a part is a section within a lesson. Full evaluations belong at the end
of chapters. See `learning-structure.md` for the confirmed product structure.

`Lesson.reader` names a local `/content/*.json` teaching file. Its sections
have unique IDs, titles, short Glaux lines, paragraph arrays and a supported
diagram key. The `questions` and `topics` arrays retain a canonical question
bank and topic-to-review mappings for authoring. They do not require an exam
at the end of the individual lesson.

`practice` maps a section ID to one choice exercise ID from that bank. It may
contain at most one optional practice per section. Referenced sections and
exercises must exist; practice choices must belong to this lesson. Sources
have titles and HTTPS URLs. Invalid paths, IDs and diagram keys are rejected.

The first reader is `/content/lesson-01.json`, linked to `patterns` /
`orion-lesson`. Two optional practices reveal explanations without scores,
answer records or extra XP. `finishReadingLesson` completes the lesson through
the existing Learn quest rules. Replays preserve earlier completions and
answers and do not duplicate rewards.

The chapter evaluation remains Coming later while the rest of the chapter is
being written. `orion-quiz` at position 11 is reserved for that final evaluation.
The scale-only bank is not presented as a comprehensive chapter assessment.
Temporary development progress remains in effect; lesson 2 is still unbuilt.
