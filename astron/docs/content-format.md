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
| `constellations.json` | `id`, `name`, `mythNote`: a brief note about the myth. |
| `stars.json` | `id`, `name`, `greekLetter`: for example `α`; `factText`: astronomy text; `constellationId`: a constellation id. |
| `tales.json` | `id`, `title`, `subtitle`, `minutes`, `teaser`, `sourceNote`: identify the source or explain that it is original; `starId`: a star id. |
| `chapters.json` | `taleId`, `number`, `title`, `text`, `marginNotes`: an array of strings, or `[]`. The combination of taleId and number must be unique. |
| `units.json` | `id`, `title`, `summary`, `orderNo`: the unit’s position. |
| `cells.json` | `id`, `positionNo`: its position within the unit; `title`, `kind`, `minutes`, `unitId`. `kind` is `lesson`, `tale`, or `quiz`. Add `taleId` only for a tale cell. Positions within one unit must be unique. |
| `lessons.json` | `id`, `title`, `cards`, `cellId`: must point to a lesson cell. Optional `placeholder: true` keeps its temporary finish control. |
| `exercises.json` | `id`, `type`, `prompt`, `contentData`, `xpValue`, `cellId`, `glaux`, `hint`, `rightLine`, `missedLine`, `explanation`. Exercise types and data shapes are explained below. |
| `quests.json` | `id`, `kind`, `title`, `xpReward`. Exactly one each: `learn` with 20 XP, `story` with 15 XP, `read` with 10 XP. The visible name of `story` is Discover. |
| `articles.json` | `id`, `title`, `summary`, `body`, `readingMin`. |
| `unitArticles.json` | `unitId`, `articleId`: links an article to a unit. Each pair must be unique. |
| `glaux-lines.json` | `id`: a reaction pool name; `lines`: a nonempty array of approved lines. Loaded as `content.glauxLines`. All eighteen pools are required. |

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
than the temporary colours picture and note. The recap has its approved three items and no extra picture.
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
{ "id": "missed", "lines": ["Ooh, close. The sky likes to tease.", "Let me lend you a clue."] }
```

The required pool ids are `firstTryRight`, `rightAfterMisses`, `rightWithHint`,
`missed`, `showMe`, `sneeze`, `hunchBlue`, `hunchOrange`, `hunchRed`, `hunchSkip`,
`orderCallbackBlue`, `orderCallbackOther`, `dialRedEnd`, `gapFlagFew`, `gapFlagTen`,
`endingHunch`, `endingSkipped`, and `endingTease`. The dialRedEnd, gapFlagFew and
gapFlagTen pools now supply the live interactions. Future ending lines remain
stored for a later task; the existing completion ending is preserved.
Empty pools, missing pools, duplicate ids and unrecognised ids are rejected.

`reactGlaux` is pure: its event, content pools, previous memory and two random
numbers are explicit inputs. It returns mood, text and new memory without writes.
It excludes the previous selection from each pool when alternatives exist; a
single-line pool can repeat. The memory lasts across AGAIN for varied practice.

| Event | Mood | Speech box |
| --- | --- | --- |
| First-try right | cheering | Pool line, then exercise rightLine. |
| Right after misses | proud | Pool line, then exercise rightLine. |
| Right with a requested hint | proud | Pool line, then exercise rightLine. |
| Missed | gentle | Pool line, then exercise missedLine. |
| Hint | thinking | Exercise hint only. |
| SHOW ME | thinking | showMe pool line only. |
| Hunch | happy | Matching hunch pool line. |
| Red dial end or gap flag | happy | Matching interaction pool line. |

The two main feedback lines share one box. The order exercise adds its requested
third callback line underneath: blue uses orderCallbackBlue; red/orange replace
`{colour}` in orderCallbackOther; skipped has no callback. A selected sneeze gets
the separate short caption "Excuse me. Stardust." so no main line is dropped.

A right answer has a 20% sneeze draw unless the previous right answer sneezed.
Misses and hints cannot sneeze or reset that consecutive-right protection. Five
decorative gold stars drift for 1.2 seconds. Mood changes fade for 300 ms, and
cheering wings lift gently once. Reduced motion hides particles and stops all
animation, including the mood fade, while retaining the caption and feedback.

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
`lightStar` keeps the first lighting date and source. `recordAnswer` keeps the latest
result and increases attempts. Because the requested Answer table keeps only the
latest result, a later incorrect answer removes that exercise’s XP from the derived
total. Attempts do not multiply the reward.

The lesson player calls `saveLessonAnswer`, a transaction wrapper around
`recordAnswer`: misses increase saved attempts until the first correct result;
after that, the correct answer and its XP are preserved. `finishLesson` checks
prerequisites and saved answers, accepts SHOW ME only after two saved misses,
then calls `completeCell` with the number correct on the first saved attempt.
An already completed lesson makes neither wrapper write anything, even on a
later day. Practice scores appear only in that run's end card. Reloading an
unfinished lesson restarts its cards but retains saved attempts and earned XP.

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
