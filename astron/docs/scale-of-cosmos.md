# Scale of the cosmos: teaching and optional practice

Updated 28 October 2026 to follow the confirmed chapter-level evaluation
structure. The current policy is in [learning-structure.md](learning-structure.md).
The original lesson ID `patterns` and cell ID `orion-lesson` are preserved.

## Content and navigation

`public/content/lesson-01.json` contains eight substantial teaching sections,
a question bank, two optional practice mappings and six primary sources.
`public/content/sample/exercises.json` holds the canonical questions, options,
answer keys and explanations. Each scale question has zero extra XP.

The lesson teaches our cosmic address, the Sun and its system, proportional
models, reading scientific images, interstellar gaps, the Milky Way and the
wider universe. Code-drawn diagrams explicitly describe their simplifications.
They are not presented as photographs or maps of observed positions. The
learner controls diagram changes, and Reduce motion stops Glaux's animation.

A short introduction opens the lesson before Step 1, naming its purpose and
inviting the learner to Continue. It is separate from the teaching-step count,
awards no progress or XP, and makes no completion write. Previous from the first
teaching step returns to it; Read again also begins with the introduction.
The introduction revision passes 451 tests and the production build. Browser
checks at 390, 768 and 1280 px found no horizontal overflow; keyboard Continue
opened Step 1 and Previous returned to the introduction with heading focus.

The eight teaching sections are paced across sixteen short steps. Each explanation
comes first, then its final paragraph and picture/activity have a separate step.
Every teaching paragraph is preserved exactly once, in authored order. The recap
does not repeat an unrelated diagram. Glaux speaks once per section.

There is no contents dropdown. One primary **Continue** moves forward; a quiet
Previous control allows review. The page uses normal document flow, without an
inner scroll viewport, snapping or timed advancement. Navigation focuses the
heading and returns to the top. A small progress bar shows the current step.
Sources remain available at the end rather than competing on every screen.

## Practice and completion

The model and galaxy sections each offer **Try this idea (optional)**.
A native radio choice and Explore the answer button reveal a kind response
and explanation. Practice is not scored, never blocks Continue, writes
no assessment answers and awards no extra XP.

`finishReadingLesson` completes the individual lesson and can meet the existing
Learn quest once. Concurrent clicks and later replays do not duplicate rewards
or rewrite an earlier completion. Storage failure rolls back the transaction.
Older scores and saved answers remain untouched even though the new reader no
longer requires an individual exam.

The eight-question scale bank and its pure grading helper remain authoring
material for future chapter work. Two bank questions provide the optional
practice. There is no full evaluation or diagnostic score after this lesson.
The chapter-wide evaluation is reserved for the end of How stars live and die
and stays marked Coming later while the chapter's other lessons are unwritten.

After the recap, Continue completes the reading. The brief completion screen's
Continue opens the next available authored lesson directly, once the real saved
completion is observed. Lesson 2 is still unavailable; the current authored path
proceeds to lesson 3. Replaying a completed lesson also permits this navigation.
If there is no next available content in the chapter, Continue returns to the path.
Development progress still resets on a full page load, using the separate
working database described in development-preview.md.

## Scientific model and sources

The slider uses NASA source values: Sun diameter 1,400,000 km, Earth diameter
12,800 km, mean Earth–Sun distance 149,600,000 km, Neptune–Sun distance
4,495,000,000 km, and nearest-star distance about 265,000 au. A 10 cm model Sun
gives Earth about 0.9 mm, a 10.7 m Earth gap, a 321 m Neptune gap and a 2,832 km
nearest-star gap. Teaching prose rounds these to 1 mm, 11 m, 320 m and roughly
3,000 km. Practice explicitly supplies rounded model figures when assessing
proportional reasoning rather than numerical recall.

Sources researched for the draft on 27 October 2026:

- https://science.nasa.gov/solar-system/skywatching/night-sky-network/solar-system-galaxy-universe-whats-the-difference/
- https://science.nasa.gov/sun/facts/
- https://science.nasa.gov/resource/the-voyage-scale-model-solar-system/
- https://www.jpl.nasa.gov/edu/resources/lesson-plan/create-a-solar-system-scale-model-with-spreadsheets/
- https://science.nasa.gov/learn/basics-of-space-flight/chapter1-1/
- https://science.nasa.gov/universe/galaxies/

## Performance and verification

The immutable content load is shared throughout a document visit, including
concurrent mounts. Failed loads can retry. Lesson players use separate lazy
chunks with loading/error recovery; their code and reader JSON are precached.
The older player uses proximity snapping instead of mandatory stops.

The preceding lesson milestone passed a cold-start offline journey, no
horizontal overflow at 390/768/1280 px, keyboard diagram controls and Reduce
motion. The reader had no inner scroll areas, and its slider was 44 px high.
Those checks describe the shared reader/diagrams, not a physical iPhone test.

The revised chapter-level flow passes automated completion/reward tests,
optional-practice validation, and accessible structure checks. The final
chapter evaluation is deliberately not enabled before its teaching exists.

The shorter-step revision passes 447 tests in 48 files and the production build.
Browser checks covered reading/exploration steps at 390, 768 and 1280 px without
horizontal overflow. Keyboard Continue/Previous worked, and completion opened
Why stars differ directly without submitting practice answers. The first reading
and its Continue fitted inside a 390-by-800 viewport. These are browser viewport
checks, not a physical iPhone test.
