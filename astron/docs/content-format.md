# Writing ASTRON content

Content lives in `public/content/sample` for now. Each file is a JSON array: `[ ... ]`.
Write field names exactly as shown below. Use double quotes for strings and commas
between rows. Do not put a comma after the last row. The loader names the file and
field when it finds a mistake. It also checks that linked ids exist.

An `id` is a short, stable name, such as `betelgeuse`. Keep it unchanged after
publishing: progress refers to these names. Ids must be unique within their file.
Order numbers start at 1. Minutes are positive whole numbers. XP is a whole number,
zero or greater. Every field below is required, except the conditional `taleId`.

## The twelve files

| File | Fields and what they mean |
| --- | --- |
| `interests.json` | `id`: stable name; `label`: a readable interest name. |
| `constellations.json` | `id`, `name`, `mythNote`: a brief note about the myth. |
| `stars.json` | `id`, `name`, `greekLetter`: for example `α`; `factText`: astronomy text; `constellationId`: a constellation id. |
| `tales.json` | `id`, `title`, `subtitle`, `minutes`, `teaser`, `sourceNote`: identify the source or explain that it is original; `starId`: a star id. |
| `chapters.json` | `taleId`, `number`, `title`, `text`, `marginNotes`: an array of strings, or `[]`. The combination of taleId and number must be unique. |
| `units.json` | `id`, `title`, `summary`, `orderNo`: the unit’s position. |
| `cells.json` | `id`, `positionNo`: its position within the unit; `title`, `kind`, `minutes`, `unitId`. `kind` is `lesson`, `tale`, or `quiz`. Add `taleId` only for a tale cell. Positions within one unit must be unique. |
| `lessons.json` | `id`, `title`, `body`, `cellId`: must point to a lesson cell. |
| `exercises.json` | `id`, `type`, `prompt`, `contentData`, `xpValue`, `cellId`. Exercise types and data shapes are explained below. |
| `quests.json` | `id`, `kind`, `title`, `xpReward`. Exactly one each: `learn` with 20 XP, `story` with 15 XP, `read` with 10 XP. The visible name of `story` is Discover. |
| `articles.json` | `id`, `title`, `summary`, `body`, `readingMin`. |
| `unitArticles.json` | `unitId`, `articleId`: links an article to a unit. Each pair must be unique. |

These files are read-only content. They are not copied into the progress database.
The loader freezes the loaded objects so pages cannot accidentally edit them.
`loadContent()` loads this sample folder. A later task can pass a different folder.
Even if a table has no rows, keep its file and write `[]`.

## Long text and Markdown

Write Markdown inside `text`, `body`, `mythNote`, or `factText`. Markdown is stored
as text here; Task 2 does not display or render lessons. A future screen will do that.

```json
{
  "id": "a-small-lesson",
  "title": "Begin with one star",
  "body": "A **star** is a place to begin.\n\nTake your time. *Look slowly.*",
  "cellId": "star-lesson"
}
```

`\n\n` makes a new paragraph. If you need quotation marks inside a string,
write `\"`. JSON does not allow comments inside the file.

## Exercise data

These describe the authoring format only. No exercise screen or grading engine
has been built. Item ids must be unique. Choice, find, and order need at least two items.

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

The full `Exercise` row wraps this data inside `contentData` and also contains
`id`, `type`, `prompt`, `xpValue`, and `cellId`. See `exercises.json` for complete rows.

## The sample

There is one unit, `How stars live and die`, with eleven cells: eight lessons,
two tales, and a final quiz. The eight lesson bodies are short placeholders. The
two existing quiz exercises keep their authoring format; no lesson player has
been built. The Orion tale keeps its two chapters. The Pleiades sample adds one
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
real screens; `/cell/:id` remains a clearly labelled temporary completion page.

## Course path (Task 5)

`/learn` reads this unit's cells in `positionNo` order. Existing ids stay stable:
`orion-lesson` is cell 1, `star-lesson` is cell 3, `orion-tale` is cell 4, and
`orion-quiz` is cell 11. Existing saved completions are preserved.

The eleven positions are Scale of the cosmos; Light and distance; Why stars
differ; Orion; Birth of a star; The long middle; The Pleiades; Giants and dwarfs;
When stars explode; What is left; Unit quiz. Lessons and the quiz take five
minutes; tales take six. All lesson bodies remain plain strings for now.

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

This step adds no lesson cards, exercise player, or Task 6 artwork.
