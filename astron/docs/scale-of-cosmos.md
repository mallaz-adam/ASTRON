# Scale of the cosmos: teaching and understanding exam

27 October 2026. This implements the approved first-lesson draft and the request
for a full exam after individual lessons. The existing lesson ID `patterns` and
cell ID `orion-lesson` are preserved. The cell now estimates 18 minutes including
the exam, rather than the old five-minute placeholder.

## Content and navigation

`public/content/lesson-01.json` contains eight substantial teaching sections,
four diagnostic topics, the question-to-topic mapping and six primary sources.
`public/content/sample/exercises.json` holds the eight canonical questions,
their answer options/order and explanations. Each exercise has zero extra XP.
`lessons.json` links the reader and the same eight exercise IDs.

The lesson teaches our cosmic address, the Sun and its system, proportional
models, reading scientific images, interstellar gaps, the Milky Way and the
wider universe. Diagrams are code-drawn concept models, explicitly labelled
with their simplifications. They are not presented as photographs or maps of
observed positions. The user controls all diagram changes; there is no autoplay.

The teaching reader renders one section at a time in the normal document flow.
It has no inner scrolling viewport or scroll snapping. Previous/Continue and a
native contents selector provide navigation. Focus moves to the section heading
after intentional navigation. Text stays readable in ink with existing fonts.

The scale slider uses NASA source values: Sun diameter 1,400,000 km, Earth
diameter 12,800 km, mean Earth–Sun distance 149,600,000 km, Neptune–Sun distance
4,495,000,000 km, and the nearest star at about 265,000 au. A 10 cm model Sun
therefore gives Earth about 0.9 mm, a 10.7 m Earth gap, a 321 m Neptune gap and
a 2,832 km nearest-star gap. Teaching prose rounds these to 1 mm, 11 m, 320 m
and roughly 3,000 km. The doubling exam explicitly supplies its rounded model
figures; it assesses proportional reasoning rather than numerical recall.

Sources, researched for the draft on 27 October 2026:

- https://science.nasa.gov/solar-system/skywatching/night-sky-network/solar-system-galaxy-universe-whats-the-difference/
- https://science.nasa.gov/sun/facts/
- https://science.nasa.gov/resource/the-voyage-scale-model-solar-system/
- https://www.jpl.nasa.gov/edu/resources/lesson-plan/create-a-solar-system-scale-model-with-spreadsheets/
- https://science.nasa.gov/learn/basics-of-space-flight/chapter1-1/
- https://science.nasa.gov/universe/galaxies/

## Exam and progress

The untimed exam has one ordering task and seven reasoning choices. A learner
can revisit and change all answers before submission. It gives no correctness
feedback until all eight are submitted. Native buttons and radios work with
keyboard, mouse and touch; no dragging or long written response is required.

The report shows the current attempt's score, every selected/expected answer,
an explanation for each question, and two-question evidence for each topic.
Topics show Secure (two correct), Developing (one) or Revisit (zero), with a
link to the appropriate teaching section. Returning from review preserves the
report; Try the exam again starts fresh answers for practice.

The complete exam marks the cell complete. No new minimum pass threshold is
introduced. A future mastery gate needs a separate product decision. The first
completion retains its original score; replays provide current feedback while
preserving that original assessment and awarding no additional rewards.
The existing Learn quest can be earned once; no new star or exam XP is invented.
Submission checks canonical exercise IDs/options/order and saves the answers,
completion and reward atomically. Incomplete answers save none of these.

Normal course/Today navigation now starts at this real first lesson. Lesson 2
remains unavailable while unauthored; the authored path proceeds to lesson 3
after this exam. Older completions and IDs remain valid. Full developer tools
retain the eleven-cell model. Development progress still resets on a full page
load, using the separate working database described in development-preview.md.

## Performance work

The validated, immutable content load is shared for the whole document visit,
including concurrent React mounts. Failed loads can be retried. Publishing and
refreshing a new app version creates a new cache, so new content is not hidden.

Both lesson players are separate lazy-loaded chunks, with a loading state and
an error recovery button. Their JS and CSS remain in the PWA precache, along
with the new JSON, so offline loading does not depend on a live server.
The older lesson player's mandatory snap and forced stops were changed to
proximity snapping; its other interactions and art are unchanged.

Before this work, the entry JS was 501.81 kB (154.02 kB gzip) and its CSS was
60.95 kB. The final build produced entry JS of 470.22 kB (145.34 kB gzip)
and entry CSS of 50.06 kB while adding this lesson. Lesson-specific bundles load
separately. The build no longer reports the 500 kB chunk-size warning. These
are build-size measurements, not claims about frame rate on physical phones.

Browser checks used a normal first-visit journey. An intentionally mixed exam
produced 6/8, identifying the two relevant topics as Developing and the others
as Secure. Targeted review and return to results worked. Completion unlocked
lesson 3, whose hunch and heat dial still opened normally. At 390, 768 and
1280 px the report had no horizontal overflow. The reader and report contained
zero inner scroll areas. Physical iPhone/Safari and VoiceOver remain real-device
checks for testers.

Final validation: 438 tests in 47 files passed; TypeScript and the production
build passed without warnings. The PWA precaches 62 entries (1,319.11 KiB).
With the isolated preview server stopped and its port closed, a fresh browser
document completed the ordinary welcome and reached the new lesson, including
its lazy-loaded code and separate reader JSON, entirely from the offline cache.
Offline preferences/navigation also worked. With Reduce motion enabled, Glaux's
head reported no animation while the model slider still responded to ArrowRight.
The final model layout had no horizontal overflow at 390, 768 and 1280 px and
its native slider measured 44 px high. The preview server was restarted.
